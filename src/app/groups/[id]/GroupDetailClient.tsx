"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ShareSummaryDialog } from "@/components/ShareSummaryDialog";
import type { Expense, Member, MemberBalance, Transfer } from "@/lib/types";
import { Share2, Receipt } from "lucide-react";

type GroupDetailClientProps = {
  groupId: string;
  groupName: string;
  currency: string;
  members: Member[];
  expenses: Expense[];
  balances: MemberBalance[];
  transfers: Transfer[];
};

export function GroupDetailClient({ groupId, groupName, currency, members, expenses, balances, transfers }: GroupDetailClientProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Receipt className="h-5 w-5 text-primary" />
          Expenses
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            Add expense
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <ExpenseList expenses={expenses} members={members} currency={currency} />
      </div>
      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} groupId={groupId} members={members} onSuccess={() => router.refresh()} />
      <ShareSummaryDialog open={shareOpen} onOpenChange={setShareOpen} groupName={groupName} currency={currency} balances={balances} transfers={transfers} />
    </>
  );
}
