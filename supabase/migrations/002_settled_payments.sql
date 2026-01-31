-- Partial settlement: record individual payments (e.g. Noura paid Tina 25)
-- Only payments with settled_at > group.last_settled_at reduce current period balances

create table if not exists settled_payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_member_id uuid not null references members(id) on delete restrict,
  to_member_id uuid not null references members(id) on delete restrict,
  amount numeric not null check (amount > 0),
  settled_at timestamptz not null default now()
);

alter table settled_payments enable row level security;
create policy "Allow all for settled_payments" on settled_payments for all using (true) with check (true);
