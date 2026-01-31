import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  currency: z.string().min(1).max(10),
  memberNames: z.array(z.string().min(1)).min(2, "At least 2 members required"),
});

export const addExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paidByMemberId: z.string().uuid(),
  title: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type AddExpenseInput = z.infer<typeof addExpenseSchema>;
