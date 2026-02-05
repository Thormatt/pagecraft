"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { generateSlug, isValidSlug } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PromptMessage } from "@/types";

interface DeployButtonProps {
  html: string;
  messages: PromptMessage[];
  disabled?: boolean;
}

export function DeployButton({ html, messages, disabled }: DeployButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    setOpen(true);
    setError("");
    if (!slug) {
      setSlug(generateSlug(title || "page"));
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug("page")) {
      setSlug(generateSlug(value || "page"));
    }
  };

  const handleDeploy = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!isValidSlug(slug)) {
      setError("Slug must be 3-64 characters, lowercase letters, numbers, and hyphens only");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          description: description.trim() || null,
          html_content: html,
          prompt_history: messages,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to deploy");
        setLoading(false);
        return;
      }

      const page = await response.json();
      setOpen(false);
      router.push(`/pages/${page.id}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} disabled={disabled || !html}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
        </svg>
        Deploy
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Deploy your page</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My awesome page"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-awesome-page"
              />
              <p className="text-xs text-muted-foreground">
                Your page will be available at /p/{slug || "..."}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of your page"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={loading}>
            {loading ? "Deploying..." : "Deploy"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
