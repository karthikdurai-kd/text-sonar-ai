import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/api";
import { Document } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Auto-refresh if there are documents being processed
  useEffect(() => {
    const hasProcessing = documents.some(
      (doc) => doc.status === "PENDING" || doc.status === "PROCESSING"
    );

    if (!hasProcessing) return;

    const interval = setInterval(() => {
      loadDocuments(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  useEffect(() => {
    loadDocuments();
  }, []);

  return { documents, loading, error, refreshing, refetch: loadDocuments };
}
