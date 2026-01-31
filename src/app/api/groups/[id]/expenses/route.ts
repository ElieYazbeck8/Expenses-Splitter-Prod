import { NextRequest } from "next/server";
import { getAuthUser, json, err401, err404, err400, err500 } from "@/lib/api-helpers";
import { rateLimit, getClientId } from "@/lib/rate-limit";
import { addExpenseSchema } from "@/lib/api-validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthUser();
    if (!user) return err401("Sign in required");

    const id = `expenses:${getClientId(request)}`;
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
      .select("id")
      .eq("id", groupId)
      .eq("user_id", user.id)
      .single();

    if (gErr || !group) return err404("Group not found");

    const body = await request.json();
    const parsed = addExpenseSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Validation failed";
      return err400(msg);
    }

    const { data: members } = await supabase
      .from("members")
      .select("id")
      .eq("group_id", groupId);
    const memberIds = new Set((members ?? []).map((m) => m.id));
    if (!memberIds.has(parsed.data.paid_by_member_id)) {
      return err400("paid_by_member_id must belong to the group");
    }

    const { data: expense, error: eErr } = await supabase
      .from("expenses")
      .insert({
        group_id: groupId,
        amount: parsed.data.amount,
        paid_by_member_id: parsed.data.paid_by_member_id,
        title: parsed.data.title ?? null,
        notes: parsed.data.notes ?? null,
        expense_date: parsed.data.expense_date,
      })
      .select("id")
      .single();

    if (eErr) throw eErr;
    return json({ id: expense.id }, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    return err500(e instanceof Error ? e.message : "Failed to add expense");
  }
}
