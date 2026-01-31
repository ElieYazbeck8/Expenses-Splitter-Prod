import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { GroupCard } from "@/components/GroupCard";
import { createClient } from "@/lib/supabase/server";
import { Plus, Users } from "lucide-react";

export default async function GroupsPage() {
  let groups: { id: string; name: string; currency: string }[] = [];
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("groups").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      groups = (data ?? []) as { id: string; name: string; currency: string }[];
    }
  } catch {
    groups = [];
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your expense groups</p>
          </div>
          <Button asChild size="lg" className="shadow-sm">
            <Link href="/groups/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create group
            </Link>
          </Button>
        </div>
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">No groups yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Create a group to start splitting expenses with friends, trips, or roommates.</p>
            <Button asChild className="mt-6">
              <Link href="/groups/new" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create your first group
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <GroupCard key={g.id} id={g.id} name={g.name} currency={g.currency} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
