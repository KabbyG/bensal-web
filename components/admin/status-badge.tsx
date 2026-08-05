import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  NEW: "border-transparent bg-blue-100 text-blue-700",
  READ: "border-transparent bg-slate-100 text-slate-700",
  REPLIED: "border-transparent bg-green-100 text-green-700",
  ARCHIVED: "border-transparent bg-slate-100 text-slate-500",
  PENDING: "border-transparent bg-amber-100 text-amber-700",
  REVIEWED: "border-transparent bg-blue-100 text-blue-700",
  SHORTLISTED: "border-transparent bg-purple-100 text-purple-700",
  REJECTED: "border-transparent bg-red-100 text-red-700",
  HIRED: "border-transparent bg-green-100 text-green-700",
  DRAFT: "border-transparent bg-slate-100 text-slate-600",
  PUBLISHED: "border-transparent bg-green-100 text-green-700",
  ONGOING: "border-transparent bg-blue-100 text-blue-700",
  COMPLETED: "border-transparent bg-green-100 text-green-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn(STATUS_STYLES[status])}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}
