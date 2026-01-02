import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Document } from "@/types";

interface ChatHeaderProps {
  document: Document;
}

export function ChatHeader({ document }: ChatHeaderProps) {
  return (
    <div className="bg-card border-b p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.originalName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {document.totalPages} pages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
