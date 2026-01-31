"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

type MembersInputProps = { value: string[]; onChange: (members: string[]) => void };

export function MembersInput({ value, onChange }: MembersInputProps) {
  const [input, setInput] = useState("");

  const add = () => {
    const name = input.trim();
    if (name && !value.includes(name)) {
      onChange([...value, name]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label>Members (at least 2)</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              {m}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== m))} className="rounded-full p-0.5 transition-colors hover:bg-primary/20">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
