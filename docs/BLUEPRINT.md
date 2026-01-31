# Expense Splitter – Product Blueprint

## Product Goal

Ultra-simple expense splitter for trips and recurring groups. Equal-split only. Balances, settle-up, WhatsApp-ready sharing. Cloud backup required.

## Domain

- **Group**: name, currency, members (by name)
- **Expense**: amount, paid_by, title, notes, date
- **Settlement**: marks period reset; balances computed after last settled
- **Transfer**: from → to, amount (settle-up output)

## Data Model

- `groups`: id, name, currency, created_at, updated_at, last_settled_at, user_id
- `members`: id, group_id, name, created_at
- `expenses`: id, group_id, amount, paid_by_member_id, title, notes, expense_date, created_at
- `settlements`: id, group_id, settled_at, short_summary_text, detailed_summary_text

## Core Rules

1. Equal split only (all members per expense)
2. Balances: `total_paid - (sum_expenses / member_count)`
3. Settle-up: greedy minimal transfers (debtors → creditors)
4. Round only for display; full precision in calculations
5. Period: expenses after `last_settled_at` (or all if null)

## Constraints

- Next.js App Router, TypeScript, Tailwind, Shadcn UI
- Supabase for DB and auth (Google, GitHub, or anonymous)
- Server actions for mutations; Zod for validation
