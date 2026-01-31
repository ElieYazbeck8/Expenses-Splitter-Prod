export type Group = {
  id: string;
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

export type Transfer = {
  fromMemberId: string;
  toMemberId: string;
  fromName: string;
  toName: string;
  amount: number;
};

export type SettledPayment = {
  id: string;
  group_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  settled_at: string;
};

export type MemberBalance = {
  memberId: string;
  memberName: string;
  balance: number;
  totalPaid: number;
  shareOwed: number;
};
