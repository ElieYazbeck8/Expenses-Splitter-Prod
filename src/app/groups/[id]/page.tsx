import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getExpensesForPeriod, computeBalances, applySettledPayments, computeSettleUpTransfers, roundTransfers } from "@/lib/calculations";
import { Header } from "@/components/Header";
import { BalancesPanel } from "@/components/BalancesPanel";
import { SettleUpWrapper } from "./SettleUpWrapper";
import { GroupDetailClient } from "./GroupDetailClient";
import { ArrowLeft, Scale, Receipt, CheckCircle } from "lucide-react";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase.from("groups").select("*").eq("id", id).single();
  if (!group) notFound();

  const { data: members } = await supabase.from("members").select("*").eq("group_id", id);
  const { data: expenses } = await supabase.from("expenses").select("*").eq("group_id", id).order("expense_date", { ascending: false });
  const { data: settledPayments, error: paymentsErr } = await supabase
    .from("settled_payments")
    .select("*")
    .eq("group_id", id);

  const mems = members ?? [];
  const exps = expenses ?? [];
  const payments = paymentsErr ? [] : (settledPayments ?? []);
  const periodExpenses = getExpensesForPeriod(exps, group.last_settled_at);
  const rawBalances = computeBalances(mems, periodExpenses);
  const balances = applySettledPayments(rawBalances, payments, group.last_settled_at);
  const rawTransfers = computeSettleUpTransfers(balances);
  const transfers = roundTransfers(rawTransfers);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-sm text-muted-foreground">{group.currency}</p>
          </div>
        </div>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Scale className="h-5 w-5 text-primary" />
              Balances
            </h2>
            <BalancesPanel balances={balances} currency={group.currency} />
          </section>
          <section>
            <GroupDetailClient groupId={id} groupName={group.name} currency={group.currency} members={mems} expenses={exps} balances={balances} transfers={transfers} />
          </section>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-5 w-5 text-primary" />
              Settle up
            </h2>
            <SettleUpWrapper groupId={id} groupName={group.name} currency={group.currency} transfers={transfers} balances={balances} />
          </section>
        </div>
      </main>
    </div>
  );
}
