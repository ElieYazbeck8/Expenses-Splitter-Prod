import { NextRequest } from "next/server";
import { getAuthUser, json, err401, err400, err500 } from "@/lib/api-helpers";
import { rateLimit, getClientId } from "@/lib/rate-limit";
import { createGroupSchema } from "@/lib/api-validators";

export async function GET() {
  try {
    const { user, supabase } = await getAuthUser();
    if (!user) return err401("Sign in required");

    const { data: groups, error } = await supabase
      .from("groups")
      .select("id, name, currency, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return json({ groups: groups ?? [] });
  } catch (e) {
    if (e instanceof Response) return e;
    return err500(e instanceof Error ? e.message : "Failed to fetch groups");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthUser();
    if (!user) return err401("Sign in required");

    const id = `groups:${getClientId(request)}`;
    const { ok, retryAfter } = rateLimit(id);
    if (!ok) {
      return json(
        { error: "Too many requests", retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
      );
    }

    const body = await request.json();
    const parsed = createGroupSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Validation failed";
      return err400(msg);
    }

    const { data: group, error: gErr } = await supabase
      .from("groups")
      .insert({
        name: parsed.data.name,
        currency: parsed.data.currency,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (gErr) throw gErr;

    if (parsed.data.members.length > 0) {
      await supabase.from("members").insert(
        parsed.data.members.map((name) => ({ group_id: group.id, name }))
      );
    }

    return json({ id: group.id }, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    return err500(e instanceof Error ? e.message : "Failed to create group");
  }
}
