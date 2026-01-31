"use client";

import { AlertTriangle } from "lucide-react";

export function SetupBanner() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const needsSetup = !url || !key || url.includes("YOUR_PROJECT") || key.includes("YOUR_ANON");

  if (!needsSetup) return null;

  return (
    <div className="flex items-center gap-3 border-b border-amber-200/60 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/95 dark:text-amber-100">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <p>
        <strong>Setup required:</strong> Copy <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">.env.local.example</code> to{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900">.env.local</code> and add your Supabase credentials. Run the migration, then enable Anonymous auth.
      </p>
    </div>
  );
}
