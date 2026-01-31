import { NextRequest } from "next/server";
import { getAuthUser, json, err401, err404, err400, err500 } from "@/lib/api-helpers";
import { rateLimit, getClientId } from "@/lib/rate-limit";
import { getExpensesForPeriod, computeBalances, computeSettleUpTransfers, roundTransfers } from "@/lib/calculations";
import { shortSettleSummary, detailedSettleSummary } from "@/lib/formatters";
import type { Expense, Member } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthUser();
    if (!user) return err401("Sign in required");

    const id = `settle:${getClientId(request)}`;
    const { ok, retryAfter } = rateLimit(id);
    if (!ok) {
      return json(
        { error: "Too many requests", retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
      );
    }

    const { id: groupId } = await params;

    const { data: group, error: gErr } = await supabase
      .from("groups")
      .select("id, name, currency, last_settled_at")
      .eq("id", groupId)
      .eq("user_id", user.id)
      .single();

    if (gErr || !group) return err404("Group not found");

    const { data: members } = await supabase.from("members").select("*").eq("group_id", groupId);
    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("group_id", groupId);

    const mems = (members ?? []) as Member[];
    const exps = (expenses ?? []) as Expense[];
    const periodExpenses = getExpensesForPeriod(exps, group.last_settled_at);
    const balances = computeBalances(mems, periodExpenses);
    const rawTransfers = computeSettleUpTransfers(balances);
    const transfers = roundTransfers(rawTransfers);

    const shortSummary = shortSettleSummary(transfers, group.currency);
    const detailedSummary = detailedSettleSummary(
      balances,
      transfers,
      group.currency,
      group.name
    );

    const now = new Date().toISOString();

    const { error: sErr } = await supabase.from("settlements").insert({
      group_id: groupId,
      settled_at: now,
      short_summary_text: shortSummary,
      detailed_summary_text: detailedSummary,
    });
    if (sErr) throw sErr;

    const { error: uErr } = await supabase
      .from("groups")
      .update({ last_settled_at: now, updated_at: now })
      .eq("id", groupId);
    if (uErr) throw uErr;

    return json({ settled_at: now });
  } catch (e) {
    if (e instanceof Response) return e;
    return err500(e instanceof Error ? e.message : "Failed to settle");
  }
}
