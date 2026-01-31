import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight, Users } from "lucide-react";

type GroupCardProps = { id: string; name: string; currency: string };

export function GroupCard({ id, name, currency }: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <span className="font-semibold">{name}</span>
              <p className="text-sm text-muted-foreground">{currency}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardHeader>
        <CardContent className="pb-5 pt-0" />
      </Card>
    </Link>
  );
}
