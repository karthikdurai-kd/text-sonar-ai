"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { PageContainer } from "@/components/common/PageContainer";
import { DocumentList } from "@/components/features/documents/DocumentList";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Upload, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Navigation } from "@/components/common/navigation";

export default function DocumentsPage() {
  const { documents, loading, error, refreshing } = useDocuments();

  if (loading) {
    return (
      <>
        <Navigation />
        <PageContainer>
          <h1 className="text-3xl font-bold mb-6">Documents</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="ghost" asChild>
              <Link href="/">←</Link>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Documents</h1>
              {refreshing && (
                <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>
          <Button asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </Link>
          </Button>
        </div>

        {error && <ErrorAlert message={error} className="mb-4" />}

        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents uploaded yet"
            action={{ label: "Upload Your First PDF", href: "/upload" }}
          />
        ) : (
          <DocumentList documents={documents} />
        )}
      </PageContainer>
    </>
  );
}
