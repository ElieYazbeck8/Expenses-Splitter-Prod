"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembersInput } from "@/components/MembersInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGroup } from "@/app/actions";
import { toast } from "sonner";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "CAD", "AUD", "JPY", "INR"];

export function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [memberNames, setMemberNames] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (memberNames.length < 2) {
      toast.error("Add at least 2 members");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("currency", currency);
      formData.set("memberNames", memberNames.join(","));
      const id = await createGroup(formData);
      toast.success("Group created");
      router.push(`/groups/${id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create group";
      toast.error(msg, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Group name</Label>
        <Input id="name" required placeholder="e.g. Trip to Dubai, Roommates" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
      </div>
      <div className="space-y-2">
        <Label>Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <MembersInput value={memberNames} onChange={setMemberNames} />
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? "Creating…" : "Create group"}
      </Button>
    </form>
  );
}
