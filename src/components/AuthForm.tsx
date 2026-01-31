"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signInWithEmail, signUpWithEmail } from "@/app/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Tab = "signin" | "signup";

type AuthFormProps = { next?: string };

export function AuthForm({ next }: AuthFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter email and password");
      return;
    }
    if (tab === "signup" && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (tab === "signin") {
        await signInWithEmail(email.trim(), password);
        toast.success("Signed in");
        router.push(next || "/");
        router.refresh();
      } else {
        const result = await signUpWithEmail(email.trim(), password);
        if (result?.needsConfirmation) {
          setSignUpSuccess(email.trim());
        } else {
          toast.success("Account created");
          router.push(next || "/");
          router.refresh();
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (signUpSuccess) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
            <p className="font-medium text-emerald-800 dark:text-emerald-200">Check your email</p>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
              We sent a confirmation link to <strong>{signUpSuccess}</strong>.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setSignUpSuccess(null);
              setTab("signin");
            }}
          >
            Sign in
          </Button>
          <button
            type="button"
            onClick={() => setSignUpSuccess(null)}
            className="w-full text-center text-sm text-muted-foreground underline hover:text-foreground"
          >
            Use a different email
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="pt-6">
        <div className="mb-6 flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "signin" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === "signup" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              disabled={loading}
              minLength={tab === "signup" ? 6 : undefined}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tab === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
