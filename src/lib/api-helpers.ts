/**
 * API helpers: auth, response shapes, errors
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError } from "./api-types";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return { user, supabase };
}

export function json<T>(data: T, statusOrInit: number | ResponseInit = 200) {
  const init = typeof statusOrInit === "number" ? { status: statusOrInit } : statusOrInit;
  return NextResponse.json(data, init);
}

export function apiError(
  message: string,
  code: ApiError["code"] = "INTERNAL",
  status: number
) {
  return NextResponse.json(
    { error: message, code } satisfies ApiError,
    { status }
  );
}

export function err400(message: string) {
  return apiError(message, "VALIDATION", 400);
}

export function err401(message = "Unauthorized") {
  return apiError(message, "UNAUTHENTICATED", 401);
}

export function err403(message = "Forbidden") {
  return apiError(message, "UNAUTHORIZED", 403);
}

export function err404(message = "Not found") {
  return apiError(message, "NOT_FOUND", 404);
}

export function err500(message = "Internal server error") {
  return apiError(message, "INTERNAL", 500);
}
