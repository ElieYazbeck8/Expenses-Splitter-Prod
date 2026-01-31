#!/usr/bin/env node
/**
 * Interactive setup for .env.local
 * Run: node scripts/setup-env.js
 *
 * Get values from Supabase Dashboard:
 * - Project Settings > API: Project URL
 * - API Keys: Copy the Publishable key (sb_publishable_...)
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\n--- Supabase .env.local Setup ---\n");

  const url = await ask(
    "Paste your Supabase Project URL (e.g. https://xxxxx.supabase.co): "
  );
  const key = await ask(
    "Paste your Publishable key (sb_publishable_...): "
  );

  rl.close();

  const urlTrimmed = (url || "").trim();
  const keyTrimmed = (key || "").trim();

  if (!urlTrimmed || !keyTrimmed) {
    console.error("\nBoth values are required. Exiting.");
    process.exit(1);
  }

  const content = `# Supabase (from setup script)
NEXT_PUBLIC_SUPABASE_URL=${urlTrimmed}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${keyTrimmed}

# For OAuth: add redirect URL http://localhost:3000/auth/callback
`;

  const envPath = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(envPath, content, "utf8");
  console.log("\nDone! .env.local has been created.");
  console.log("Restart your dev server (npm run dev) if it's running.\n");
}

main().catch(console.error);
