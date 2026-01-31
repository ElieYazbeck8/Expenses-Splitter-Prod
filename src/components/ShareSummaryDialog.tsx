"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shortSettleSummary, detailedSettleSummary } from "@/lib/formatters";
import type { Transfer, MemberBalance } from "@/lib/types";
import { toast } from "sonner";

type ShareSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  currency: string;
  balances: MemberBalance[];
  transfers: Transfer[];
};

export function ShareSummaryDialog({ open, onOpenChange, groupName, currency, balances, transfers }: ShareSummaryDialogProps) {
  const [format, setFormat] = useState<"short" | "detailed">("short");

  const shortText = shortSettleSummary(transfers, currency);
  const detailedText = detailedSettleSummary(balances, transfers, currency, groupName);
  const text = format === "short" ? shortText : detailedText;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${groupName} - Expense Summary`, text });
        toast.success("Shared");
      } catch (err) {
        if ((err as Error).name !== "AbortError") copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function handleDownload() {
    const blob = new Blob([detailedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${groupName.replace(/\s+/g, "-")}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Share summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={format === "short" ? "default" : "outline"} size="sm" onClick={() => setFormat("short")}>
              Short
            </Button>
            <Button type="button" variant={format === "detailed" ? "default" : "outline"} size="sm" onClick={() => setFormat("detailed")}>
              Detailed
            </Button>
          </div>
          <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed">{text}</pre>
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline">
              Copy text
            </Button>
            <Button onClick={handleShare}>Share</Button>
            <Button onClick={handleDownload} variant="secondary">
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
