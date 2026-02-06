"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface UploadedDocument {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
}

interface FileUploadProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
}

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".xlsx",
  ".xls",
  ".csv",
  ".txt",
  ".md",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(contentType: string): string {
  switch (contentType) {
    case "pdf":
      return "📄";
    case "docx":
      return "📝";
    case "xlsx":
    case "csv":
      return "📊";
    default:
      return "📃";
  }
}

export function FileUpload({ documents, onDocumentsChange }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setError(null);

      const newDocs: UploadedDocument[] = [];

      for (const file of Array.from(files)) {
        // Validate file extension
        const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          setError(`Unsupported file type: ${ext}`);
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File too large: ${file.name} (max 10MB)`);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/content/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Upload failed");
          }

          const data = await res.json();
          newDocs.push(data.document);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : `Failed to upload ${file.name}`
          );
        }
      }

      if (newDocs.length > 0) {
        onDocumentsChange([...documents, ...newDocs]);
      }

      setIsUploading(false);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [documents, onDocumentsChange]
  );

  const handleRemove = useCallback(
    async (docId: string) => {
      try {
        await fetch(`/api/content/${docId}`, { method: "DELETE" });
        onDocumentsChange(documents.filter((d) => d.id !== docId));
      } catch (err) {
        console.error("Failed to delete document:", err);
      }
    },
    [documents, onDocumentsChange]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(",")}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Upload files"
      >
        {isUploading ? (
          <svg
            className="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span className="ml-1">Attach</span>
          </>
        )}
      </Button>

      {/* Document chips */}
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-1.5 h-8 px-2 bg-muted rounded-md text-xs"
        >
          <span>{getFileIcon(doc.content_type)}</span>
          <span className="max-w-[100px] truncate" title={doc.filename}>
            {doc.filename}
          </span>
          <span className="text-muted-foreground">
            ({formatFileSize(doc.file_size)})
          </span>
          <button
            onClick={() => handleRemove(doc.id)}
            className="ml-1 text-muted-foreground hover:text-foreground"
            title="Remove"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ))}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
