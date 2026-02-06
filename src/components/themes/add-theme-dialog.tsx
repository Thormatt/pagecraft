"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BrandProfile } from "@/types/database";

interface AddThemeDialogProps {
  open: boolean;
  onClose: () => void;
  onThemeCreated: (theme: BrandProfile) => void;
}

type ExtractState = "idle" | "extracting" | "preview";

interface ExtractedData {
  name: string;
  colors: string[];
  fonts: string[];
  screenshot: string | null;
}

export function AddThemeDialog({
  open,
  onClose,
  onThemeCreated,
}: AddThemeDialogProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<ExtractState>("idle");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleExtract = async () => {
    if (!url.trim()) return;

    setState("extracting");
    setError(null);

    try {
      const res = await fetch("/api/brands/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name: name || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract brand");
      }

      const data = await res.json();
      onThemeCreated(data.brand);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
      setState("idle");
    }
  };

  const handleClose = () => {
    setUrl("");
    setName("");
    setState("idle");
    setExtractedData(null);
    setError(null);
    onClose();
  };

  const getDomainName = (inputUrl: string) => {
    try {
      const hostname = new URL(inputUrl).hostname;
      return hostname.replace(/^www\./, "").split(".")[0];
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Add Theme</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a website URL to extract its colors, fonts, and layout.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Website URL
              </label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (!name && e.target.value) {
                    const domain = getDomainName(e.target.value);
                    if (domain) {
                      setName(domain.charAt(0).toUpperCase() + domain.slice(1));
                    }
                  }
                }}
                disabled={state === "extracting"}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Name
              </label>
              <Input
                placeholder="Brand name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={state === "extracting"}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {state === "extracting" && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              <div>
                <p className="text-sm font-medium">Extracting brand assets...</p>
                <p className="text-xs text-muted-foreground">
                  This may take a few seconds
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleExtract}
              disabled={!url.trim() || state === "extracting"}
            >
              {state === "extracting" ? "Extracting..." : "Extract & Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
