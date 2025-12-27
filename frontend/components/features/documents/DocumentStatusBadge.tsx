import { Badge } from "@/components/ui/badge";
import { Document } from "@/types";

interface DocumentStatusBadgeProps {
  status: Document["status"];
}

const statusColors: Record<Document["status"], string> = {
  COMPLETED: "bg-green-500",
  PROCESSING: "bg-yellow-500",
  PENDING: "bg-gray-500",
  FAILED: "bg-red-500",
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <Badge className={statusColors[status]} variant="secondary">
      {status}
    </Badge>
  );
}
