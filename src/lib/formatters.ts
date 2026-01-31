import type { Transfer, MemberBalance } from "./types";

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function shortSettleSummary(transfers: Transfer[], currency: string): string {
  if (transfers.length === 0) return "All settled.";
  return transfers
    .map((t) => `${t.fromName} pays ${t.toName} ${formatCurrency(t.amount, currency)}`)
    .join("\n");
}

export function detailedSettleSummary(
  balances: MemberBalance[],
  transfers: Transfer[],
  currency: string,
  groupName: string
): string {
  const lines: string[] = [`📊 ${groupName} - Expense Summary`, ""];
  lines.push("Balances:");
  for (const b of balances) {
    const sign = b.balance >= 0 ? "+" : "";
    const paidText = b.totalPaid > 0 ? `paid ${formatCurrency(b.totalPaid, currency)}` : "hasn't paid";
    lines.push(`  ${b.memberName}: ${sign}${formatCurrency(b.balance, currency)} (${paidText}, share ${formatCurrency(b.shareOwed, currency)} each)`);
  }
  lines.push("");
  lines.push("Settle up:");
  if (transfers.length === 0) {
    lines.push("  All settled.");
  } else {
    for (const t of transfers) {
      lines.push(`  ${t.fromName} pays ${t.toName} ${formatCurrency(t.amount, currency)}`);
    }
  }
  return lines.join("\n");
}
