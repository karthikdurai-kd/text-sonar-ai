import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileInput } from "./FileInput";
import { ErrorAlert } from "@/components/common/ErrorAlert";

interface FileUploadFormProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export function FileUploadForm({ onUpload, isUploading }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        setFile(null);
        return;
      }
      setError(null);
    }
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setError(null);
    try {
      await onUpload(file);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Select a PDF file to upload and process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileInput
          id="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {file && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm">
              <strong>Selected:</strong> {file.name} (
              {(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        <Button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload PDF"}
        </Button>
      </CardContent>
    </Card>
  );
}
