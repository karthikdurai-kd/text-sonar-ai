"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/api";
import { PageContainer } from "@/components/common/PageContainer";
import { FileUploadForm } from "@/components/features/upload/FileUploadForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadDocument(file);
      router.push("/documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContainer maxWidth="2xl">
      <h1 className="text-3xl font-bold mb-6">Upload PDF</h1>
      <FileUploadForm onUpload={handleUpload} isUploading={uploading} />
      <div className="mt-4">
        <Button variant="ghost" asChild>
          <Link href="/">← Back to Home</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
