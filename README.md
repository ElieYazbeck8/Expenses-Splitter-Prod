# Expense Splitter

Ultra-simple expense splitter for trips and recurring groups.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations via Dashboard > SQL Editor (in order):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_settled_payments.sql` (for partial settlement)
3. Enable **Anonymous** sign-in: Authentication > Providers > Anonymous
4. (Optional) Enable **Email** for email/password sign in: Authentication > Providers > Email
   - Add redirect URL: `http://localhost:3000/auth/callback`
   - To skip email verification: disable "Confirm email" in Email provider settings
5. (Optional) Enable **Google**, **GitHub**, or **Apple**: Authentication > Providers
6. Add redirect URL: `http://localhost:3000/auth/callback` (Authentication > URL Configuration)
7. Copy **Project URL** and **anon key** from Settings > API

### 2. Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase URL and anon key.

### 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000
