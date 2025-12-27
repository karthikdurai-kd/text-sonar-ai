import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Document } from "@/types";
import { DocumentStatusBadge } from "./DocumentStatusBadge";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.originalName}
            </CardTitle>
            <CardDescription className="mt-1">
              {document.totalPages > 0
                ? `${document.totalPages} pages`
                : "Processing..."}
            </CardDescription>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Uploaded: {new Date(document.createdAt).toLocaleDateString()}
          </p>
          {document.status === "COMPLETED" && (
            <Button asChild>
              <Link href={`/chat/${document.id}`}>Start Chat</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
