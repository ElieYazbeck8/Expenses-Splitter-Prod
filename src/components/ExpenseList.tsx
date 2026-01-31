import type { Expense, Member } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { Receipt, Banknote } from "lucide-react";

type ExpenseListProps = { expenses: Expense[]; members: Member[]; currency: string };

export function ExpenseList({ expenses, members, currency }: ExpenseListProps) {
  const nameById = new Map(members.map((m) => [m.id, m.name]));
  const memberCount = members.length;

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <Receipt className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No expenses yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {expenses.map((e) => {
        const payerName = nameById.get(e.paid_by_member_id) ?? "?";
        const perPerson = memberCount > 0 ? e.amount / memberCount : e.amount;
        const othersOwe = memberCount > 1 ? `${formatCurrency(perPerson, currency)} each (${memberCount} people)` : formatCurrency(e.amount, currency);
        return (
          <li
            key={e.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <Banknote className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <span className="font-medium">{e.title || "Expense"}</span>
                <p className="truncate text-xs text-muted-foreground">
                  {e.expense_date} · <span className="font-medium text-emerald-700 dark:text-emerald-300">{payerName} paid</span>
                </p>
                {memberCount > 1 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Others owe {othersOwe}
                  </p>
                )}
              </div>
            </div>
            <span className="shrink-0 font-medium tabular-nums">{formatCurrency(e.amount, currency)}</span>
          </li>
        );
      })}
    </ul>
  );
}
