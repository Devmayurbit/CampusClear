import { Badge } from "@/components/ui/badge";
import type { ClearanceStatus, NoDuesStatus } from "@/types";

interface StatusBadgeProps {
  status: ClearanceStatus | NoDuesStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return (
    <Badge variant={statusVariants[status] || "secondary"} className={className}>
      {statusLabels[status] || status}
    </Badge>
  );
}

interface ClearanceBadgeProps {
  status: ClearanceStatus;
  label: string;
}

export function ClearanceBadge({ status, label }: ClearanceBadgeProps) {
  const statusVariants: Record<ClearanceStatus, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant={statusVariants[status]}>
        {status}
      </Badge>
    </div>
  );
}
