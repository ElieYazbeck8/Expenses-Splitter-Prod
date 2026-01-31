"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createGroupSchema, addExpenseSchema } from "@/lib/validators";
import type { AddExpenseInput } from "@/lib/validators";

export async function ensureAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return { user, supabase };
  const { data: { session }, error } = await supabase.auth.signInAnonymously();
  if (error) {
    if (error.message?.includes("Anonymous sign-ins are disabled")) {
      throw new Error("Enable Anonymous auth in Supabase Dashboard > Authentication > Providers");
    }
    throw new Error(`Auth failed: ${error.message}`);
  }
  return { user: session?.user ?? null, supabase };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUpWithEmail(email: string, password: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${baseUrl}/auth/callback` },
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already registered") || msg.includes("already exists")) {
      throw new Error("An account with this email already exists. Try signing in instead.");
    }
    if (msg.includes("password") || msg.includes("6 characters")) {
      throw new Error("Password must be at least 6 characters.");
    }
    if (msg.includes("email") && msg.includes("disabled")) {
      throw new Error("Email sign up is disabled. Enable it in Supabase Dashboard > Authentication > Providers > Email.");
    }
    throw new Error(error.message);
  }
  return { needsConfirmation: !!data.user && !data.session };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createGroup(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    currency: formData.get("currency") as string,
    memberNames: (formData.get("memberNames") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
  };
  const parsed = createGroupSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");

  const { supabase, user } = await ensureAuth();
  const { data: group, error: gErr } = await supabase
    .from("groups")
    .insert({
      name: parsed.data.name,
      currency: parsed.data.currency,
      user_id: user?.id ?? null,
    })
    .select("id")
    .single();
  if (gErr) {
    if (gErr.code === "42P01" || gErr.message?.includes("does not exist")) {
      throw new Error("Run the SQL migration in Supabase Dashboard > SQL Editor (see supabase/migrations/001_initial_schema.sql)");
    }
    if (gErr.message?.includes("Invalid API key") || gErr.message?.includes("JWT")) {
      throw new Error("Invalid Supabase keys. Check .env.local has correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    throw new Error(gErr.message);
  }

  if (parsed.data.memberNames.length > 0) {
    await supabase.from("members").insert(
      parsed.data.memberNames.map((name) => ({ group_id: group.id, name }))
    );
  }
  return group.id;
}

export async function addExpense(groupId: string, input: AddExpenseInput) {
  const parsed = addExpenseSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");

  const { supabase } = await ensureAuth();
  const { error } = await supabase.from("expenses").insert({
    group_id: groupId,
    amount: parsed.data.amount,
    paid_by_member_id: parsed.data.paidByMemberId,
    title: parsed.data.title ?? null,
    notes: parsed.data.notes ?? null,
    expense_date: parsed.data.expenseDate,
  });
  if (error) throw new Error(error.message);
}

export async function settleTransfer(
  groupId: string,
  fromMemberId: string,
  toMemberId: string,
  amount: number
) {
  if (amount <= 0) throw new Error("Invalid amount");
  const { supabase } = await ensureAuth();
  const { error } = await supabase.from("settled_payments").insert({
    group_id: groupId,
    from_member_id: fromMemberId,
    to_member_id: toMemberId,
    amount,
  });
  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 002_settled_payments.sql in Supabase");
    }
    throw new Error(error.message);
  }
}

export async function settleGroup(
  groupId: string,
  shortSummary: string,
  detailedSummary: string,
  transfers: { fromMemberId: string; toMemberId: string; amount: number }[]
) {
  const { supabase } = await ensureAuth();

  if (transfers.length > 0) {
    const { error: pErr } = await supabase.from("settled_payments").insert(
      transfers.map((t) => ({
        group_id: groupId,
        from_member_id: t.fromMemberId,
        to_member_id: t.toMemberId,
        amount: t.amount,
      }))
    );
    if (pErr) {
      if (pErr.code === "42P01") {
        throw new Error("Run migration 002_settled_payments.sql in Supabase");
      }
      throw new Error(pErr.message);
    }
  }

  const { error: sErr } = await supabase.from("settlements").insert({
    group_id: groupId,
    short_summary_text: shortSummary,
    detailed_summary_text: detailedSummary,
  });
  if (sErr) throw new Error(sErr.message);

  const { error: uErr } = await supabase
    .from("groups")
    .update({ last_settled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", groupId);
  if (uErr) throw new Error(uErr.message);
}
