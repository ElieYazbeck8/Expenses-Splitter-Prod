"use client";

import { useRouter } from "next/navigation";
import { SettleUpPanel } from "@/components/SettleUpPanel";
import type { MemberBalance, Transfer } from "@/lib/types";

type SettleUpWrapperProps = {
  groupId: string;
  groupName: string;
  currency: string;
  transfers: Transfer[];
  balances: MemberBalance[];
};

export function SettleUpWrapper(props: SettleUpWrapperProps) {
  const router = useRouter();
  return <SettleUpPanel {...props} onSuccess={() => router.refresh()} />;
}
