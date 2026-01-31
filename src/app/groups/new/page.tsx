import Link from "next/link";
import { Header } from "@/components/Header";
import { CreateGroupForm } from "@/components/CreateGroupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewGroupPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-md px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create group</h1>
            <p className="text-sm text-muted-foreground">Set up a new expense group</p>
          </div>
        </div>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Group details</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateGroupForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
