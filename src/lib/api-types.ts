/**
 * API request/response types for Expense Splitter V1
 */

export type Group = {
  id: string;
  user_id: string | null;
  name: string;
  currency: string;
  created_at: string;
  updated_at: string;
  last_settled_at: string | null;
};

export type Member = {
  id: string;
  group_id: string;
  name: string;
  created_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  amount: number;
  paid_by_member_id: string;
  title: string | null;
  notes: string | null;
  expense_date: string;
  created_at: string;
};

export type Settlement = {
  id: string;
  group_id: string;
  settled_at: string;
  short_summary_text: string | null;
  detailed_summary_text: string | null;
};

// --- Request payloads ---

export type CreateGroupBody = {
  name: string;
  currency: string;
  members: string[];
};

export type AddExpenseBody = {
  amount: number;
  paid_by_member_id: string;
  title?: string | null;
  notes?: string | null;
  expense_date?: string;
};

export type SettleBody = {
  short_summary_text: string;
  detailed_summary_text: string;
};

// --- Response shapes ---

export type ApiError = {
  error: string;
  code?: "VALIDATION" | "UNAUTHENTICATED" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL";
};

export type GroupsResponse = {
  groups: Pick<Group, "id" | "name" | "currency" | "created_at">[];
};

export type GroupResponse = {
  group: Pick<Group, "id" | "name" | "currency" | "last_settled_at" | "created_at">;
  members: Member[];
  expenses: Expense[];
  settlements: Pick<Settlement, "id" | "settled_at" | "short_summary_text">[];
};

export type CreateGroupResponse = {
  id: string;
};
