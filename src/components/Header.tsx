import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { SetupBanner } from "@/components/SetupBanner";
import { Wallet, Cloud, LogOut } from "lucide-react";

export async function Header() {
  let user: { id: string; app_metadata?: { provider?: string } } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase init/auth failed (e.g. missing env vars on Vercel)
  }
  const isAuthenticated = !!user && user.app_metadata?.provider !== "anonymous";

  return (
    <>
      <SetupBanner />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </span>
            Expense Splitter
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Cloud className="h-3 w-3" />
                Backup enabled
              </span>
            )}
            {!user && (
              <Button size="sm" asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
            )}
            {user && (
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Sign out
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
