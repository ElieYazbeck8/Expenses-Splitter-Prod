import type { Expense, Member, Transfer, MemberBalance, SettledPayment } from "./types";

export function getExpensesForPeriod(
  expenses: Expense[],
  lastSettledAt: string | null
): Expense[] {
  if (!lastSettledAt) return expenses;
  const cutoff = lastSettledAt.split("T")[0];
  return expenses.filter((e) => e.expense_date >= cutoff);
}

export function computeBalances(
  members: Member[],
  periodExpenses: Expense[]
): MemberBalance[] {
  const memberCount = members.length;
  if (memberCount === 0) return [];

  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = totalExpenses / memberCount;

  const paidByMember = new Map<string, number>();
  for (const m of members) paidByMember.set(m.id, 0);
  for (const e of periodExpenses) {
    paidByMember.set(
      e.paid_by_member_id,
      (paidByMember.get(e.paid_by_member_id) ?? 0) + e.amount
    );
  }

  return members.map((m) => {
    const totalPaid = paidByMember.get(m.id) ?? 0;
    return {
      memberId: m.id,
      memberName: m.name,
      balance: totalPaid - perPerson,
      totalPaid,
      shareOwed: perPerson,
    };
  });
}

export function applySettledPayments(
  balances: MemberBalance[],
  settledPayments: SettledPayment[],
  lastSettledAt: string | null
): MemberBalance[] {
  if (settledPayments.length === 0) return balances;
  const cutoff = lastSettledAt ? new Date(lastSettledAt).getTime() : 0;
  const adjusted = new Map(balances.map((b) => [b.memberId, { ...b }]));
  for (const p of settledPayments) {
    const settledTime = new Date(p.settled_at).getTime();
    if (settledTime <= cutoff) continue;
    const from = adjusted.get(p.from_member_id);
    const to = adjusted.get(p.to_member_id);
    if (from) {
      from.balance += p.amount;
    }
    if (to) {
      to.balance -= p.amount;
    }
  }
  return Array.from(adjusted.values());
}

export function computeSettleUpTransfers(balances: MemberBalance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const debtors = balances
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance);

  const transfers: Transfer[] = [];
  const cBal = new Map(creditors.map((c) => [c.memberId, c.balance]));
  const dBal = new Map(debtors.map((d) => [d.memberId, d.balance]));
  const cName = new Map(creditors.map((c) => [c.memberId, c.memberName]));
  const dName = new Map(debtors.map((d) => [d.memberId, d.memberName]));

  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const cB = cBal.get(creditor.memberId) ?? 0;
    const dB = dBal.get(debtor.memberId) ?? 0;
    const pay = Math.min(cB, Math.abs(dB));
    if (pay <= 0) break;

    transfers.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      fromName: dName.get(debtor.memberId) ?? debtor.memberName,
      toName: cName.get(creditor.memberId) ?? creditor.memberName,
      amount: pay,
    });

    cBal.set(creditor.memberId, cB - pay);
    dBal.set(debtor.memberId, dB + pay);
    if ((cBal.get(creditor.memberId) ?? 0) <= 0) ci++;
    if ((dBal.get(debtor.memberId) ?? 0) >= 0) di++;
  }

  return transfers;
}

export function roundTransfers(transfers: Transfer[]): Transfer[] {
  if (transfers.length === 0) return [];
  const rounded = transfers.map((t) => ({ ...t, amount: Math.round(t.amount * 100) / 100 }));
  const rawSum = transfers.reduce((s, t) => s + t.amount, 0);
  const roundedSum = rounded.reduce((s, t) => s + t.amount, 0);
  const diff = rawSum - roundedSum;
  if (Math.abs(diff) > 0.001 && rounded.length > 0) {
    const last = rounded[rounded.length - 1];
    last.amount = Math.round((last.amount + diff) * 100) / 100;
  }
  return rounded;
}
