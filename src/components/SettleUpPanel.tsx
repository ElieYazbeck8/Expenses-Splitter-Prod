"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Transfer, MemberBalance } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { settleTransfer, settleGroup } from "@/app/actions";
import { shortSettleSummary, detailedSettleSummary } from "@/lib/formatters";
import { toast } from "sonner";
import { CheckCircle2, Check } from "lucide-react";

type SettleUpPanelProps = {
  groupId: string;
  groupName: string;
  currency: string;
  transfers: Transfer[];
  balances: MemberBalance[];
  onSuccess: () => void;
};

export function SettleUpPanel({ groupId, groupName, currency, transfers, balances, onSuccess }: SettleUpPanelProps) {
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const shortSummary = shortSettleSummary(transfers, currency);
  const detailedSummary = detailedSettleSummary(balances, transfers, currency, groupName);

  function transferKey(t: Transfer) {
    return `${t.fromMemberId}-${t.toMemberId}-${t.amount}`;
  }

  async function handleSettleOne(t: Transfer) {
    setLoadingId(transferKey(t));
    try {
      await settleTransfer(groupId, t.fromMemberId, t.toMemberId, t.amount);
      toast.success(`${t.fromName} paid ${t.toName}`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as paid");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSettleAll() {
    if (transfers.length === 0) {
      toast.info("Nothing to settle");
      return;
    }
    setLoadingAll(true);
    try {
      await settleGroup(groupId, shortSummary, detailedSummary, transfers.map((t) => ({
        fromMemberId: t.fromMemberId,
        toMemberId: t.toMemberId,
        amount: t.amount,
      })));
      toast.success("All settled up");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to settle");
    } finally {
      setLoadingAll(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500" />
            <p className="font-medium">All balanced</p>
            <p className="text-sm text-muted-foreground">No transfers needed right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2">
              {transfers.map((t, i) => (
                <li
                  key={transferKey(t)}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-muted/20 px-4 py-3"
                >
                  <span className="flex flex-1 items-center text-sm">
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                      {t.fromName}
                    </span>
                    <span className="mx-2 text-muted-foreground">pays</span>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {t.toName}
                    </span>
                    <span className="ml-2 font-semibold tabular-nums text-primary">{formatCurrency(t.amount, currency)}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSettleOne(t)}
                    disabled={!!loadingId || !!loadingAll}
                  >
                    {loadingId === transferKey(t) ? (
                      "…"
                    ) : (
                      <>
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Mark paid
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              onClick={handleSettleAll}
              disabled={loadingAll || transfers.length === 0}
              size="lg"
              className="w-full"
              variant="secondary"
            >
              {loadingAll ? "Settling…" : `Mark all ${transfers.length} as settled`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
