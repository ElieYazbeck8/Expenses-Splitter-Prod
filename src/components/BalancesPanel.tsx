import type { MemberBalance } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, CheckCircle } from "lucide-react";

type BalancesPanelProps = { balances: MemberBalance[]; currency: string };

export function BalancesPanel({ balances, currency }: BalancesPanelProps) {
  if (balances.length === 0) return <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">No balances yet.</p>;

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {balances.map((b) => {
          const isPositive = b.balance > 0;
          const isZero = b.balance === 0;
          return (
            <div key={b.memberId} className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{b.memberName}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.totalPaid > 0 ? (
                      <>Paid {formatCurrency(b.totalPaid, currency)} for expenses</>
                    ) : (
                      <>Share: {formatCurrency(b.shareOwed, currency)} each</>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold tabular-nums ${
                      isPositive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : isZero
                          ? "bg-muted text-muted-foreground"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {isPositive ? <ArrowUpCircle className="h-4 w-4" /> : isZero ? <CheckCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                    {b.balance >= 0 ? "+" : ""}
                    {formatCurrency(b.balance, currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isPositive ? "owed" : isZero ? "settled" : "owes"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
