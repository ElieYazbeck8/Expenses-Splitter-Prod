"use client";

import { AlertTriangle } from "lucide-react";

export function SetupBanner() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const key = anonKey || publishableKey;
  const needsSetup =
    !url ||
    !key ||
    url.includes("YOUR_PROJECT") ||
    key.includes("YOUR_ANON") ||
    key.includes("YOUR_KEY");

  if (!needsSetup) return null;

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return (
    <div className="flex items-center gap-3 border-b border-amber-200/60 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/95 dark:text-amber-100">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <p>
        <strong>Setup required:</strong>{" "}
        {isLocalhost ? (
          <>Copy <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">.env.local.example</code> to <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">.env.local</code> and add your Supabase credentials.</>
        ) : (
          <>Add env vars in Vercel: Project → Settings → Environment Variables. Add <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">NEXT_PUBLIC_SITE_URL</code> (your Vercel URL, e.g. https://your-app.vercel.app), then redeploy.</>
        )}
        {" "}Run migrations in Supabase SQL Editor. Enable Email auth in Supabase → Authentication → Providers.
      </p>
    </div>
  );
}
