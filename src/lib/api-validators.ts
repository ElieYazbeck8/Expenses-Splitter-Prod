/**
 * Zod schemas for API request validation
 */

import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: string): boolean {
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export const createGroupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be 2–50 characters")
      .max(50, "Name must be 2–50 characters")
      .transform((s) => s.trim()),
    currency: z
      .string()
      .min(3, "Currency must be 3–5 characters")
      .max(5, "Currency must be 3–5 characters")
      .transform((s) => s.trim().toUpperCase()),
    members: z
      .array(z.string().min(1).max(100).transform((s) => s.trim()))
      .min(2, "At least 2 members required")
      .max(20, "Maximum 20 members"),
  })
  .refine(
    (data) => {
      const unique = new Set(data.members.filter(Boolean));
      return unique.size === data.members.filter(Boolean).length;
    },
    { message: "Member names must be unique" }
  )
  .transform((data) => ({
    ...data,
    members: [...new Set(data.members.filter(Boolean))],
  }));

export const addExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paid_by_member_id: z.string().uuid("Invalid member ID"),
  title: z.string().max(80).optional().nullable(),
  notes: z.string().max(240).optional().nullable(),
  expense_date: z
    .string()
    .regex(DATE_REGEX, "Date must be YYYY-MM-DD")
    .refine(isValidDate, "Invalid date")
    .optional()
    .default(() => new Date().toISOString().slice(0, 10)),
});

