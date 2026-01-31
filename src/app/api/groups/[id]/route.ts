import { NextRequest } from "next/server";
import { getAuthUser, json, err401, err404, err500 } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await getAuthUser();
    if (!user) return err401("Sign in required");

    const { id } = await params;

    const { data: group, error: gErr } = await supabase
      .from("groups")
      .select("id, name, currency, last_settled_at, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (gErr || !group) return err404("Group not found");

    const [membersRes, expensesRes, settlementsRes] = await Promise.all([
      supabase.from("members").select("*").eq("group_id", id),
      supabase.from("expenses").select("*").eq("group_id", id).order("expense_date", { ascending: false }),
      supabase.from("settlements").select("id, settled_at, short_summary_text").eq("group_id", id).order("settled_at", { ascending: false }),
    ]);

    return json({
      group,
      members: membersRes.data ?? [],
      expenses: expensesRes.data ?? [],
      settlements: settlementsRes.data ?? [],
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return err500(e instanceof Error ? e.message : "Failed to fetch group");
  }
}
