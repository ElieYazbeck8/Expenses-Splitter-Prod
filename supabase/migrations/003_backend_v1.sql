-- Expense Splitter V1 Backend Schema
-- Run after 001_initial_schema.sql
-- Adds owner-based RLS (user_id = owner) and performance indexes

-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all for groups" ON groups;
DROP POLICY IF EXISTS "Allow all for members" ON members;
DROP POLICY IF EXISTS "Allow all for expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all for settlements" ON settlements;

-- Groups: only owner (user_id) can CRUD
CREATE POLICY "owner_groups" ON groups
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Members: owner can CRUD via group ownership
CREATE POLICY "owner_members" ON members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = members.group_id AND g.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = members.group_id AND g.user_id = auth.uid())
  );

-- Expenses: owner can CRUD via group ownership
CREATE POLICY "owner_expenses" ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = expenses.group_id AND g.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = expenses.group_id AND g.user_id = auth.uid())
  );

-- Settlements: owner can CRUD via group ownership
CREATE POLICY "owner_settlements" ON settlements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = settlements.group_id AND g.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = settlements.group_id AND g.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_groups_user ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_created ON expenses(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_group_date ON expenses(group_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_group_settled ON settlements(group_id, settled_at DESC);
