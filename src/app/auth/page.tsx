import { Header } from "@/components/Header";
import { AuthForm } from "@/components/AuthForm";
import { Wallet } from "lucide-react";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wallet className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Expense Splitter</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in or create an account to save your groups.
            </p>
          </div>
          <AuthForm next={params.next} />
        </div>
      </main>
    </div>
  );
}
