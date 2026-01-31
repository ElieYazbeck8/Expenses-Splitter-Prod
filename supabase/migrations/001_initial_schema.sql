-- Run via Supabase Dashboard > SQL Editor
-- Replace keys in .env.local

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_settled_at timestamptz
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(group_id, name)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  amount numeric not null check (amount > 0),
  paid_by_member_id uuid not null references members(id) on delete restrict,
  title text,
  notes text,
  expense_date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  settled_at timestamptz not null default now(),
  short_summary_text text,
  detailed_summary_text text
);

alter table groups enable row level security;
alter table members enable row level security;
alter table expenses enable row level security;
alter table settlements enable row level security;

create policy "Allow all for groups" on groups for all using (true) with check (true);
create policy "Allow all for members" on members for all using (true) with check (true);
create policy "Allow all for expenses" on expenses for all using (true) with check (true);
create policy "Allow all for settlements" on settlements for all using (true) with check (true);
