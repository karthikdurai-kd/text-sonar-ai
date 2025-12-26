"use client";

import { useEffect, useState } from "react";
import { getDocuments, Document } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FileText, Upload, RefreshCw } from "lucide-react";

export default function DocumentsPage() {
  // ** State **
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ** Handlers **
  const loadDocuments = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const docs = await getDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err: any) {
      if (!silent) {
        setError("Failed to load documents");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ** Helpers **
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "PROCESSING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // ** Effects **
  useEffect(() => {
    loadDocuments();
  }, []);

  // Auto-refresh if there are documents being processed
  useEffect(() => {
    const hasProcessing = documents.some(
      (doc) => doc.status === "PENDING" || doc.status === "PROCESSING"
    );

    if (!hasProcessing) {
      return; // No need to poll if nothing is processing
    }

    // Poll every 3 seconds
    const interval = setInterval(() => {
      loadDocuments(true);
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [documents]);

  // ** Render **
  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
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
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Documents</h1>
            {refreshing && (
              <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
            )}
          </div>
          <Button asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {documents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No documents uploaded yet</p>
              <Button asChild>
                <Link href="/upload">Upload Your First PDF</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {doc.originalName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {doc.totalPages > 0
                          ? `${doc.totalPages} pages • ${doc.totalChunks} chunks`
                          : "Processing..."}
                      </CardDescription>
                    </div>
                    <Badge
                      className={getStatusColor(doc.status)}
                      variant="secondary"
                    >
                      {doc.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    {doc.status === "COMPLETED" && (
                      <Button asChild>
                        <Link href={`/chat/${doc.id}`}>Start Chat</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
