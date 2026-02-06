"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { PromptMessage } from "@/types";

interface SaveDraftButtonProps {
  html: string;
  messages: PromptMessage[];
  brandId?: string | null;
  disabled?: boolean;
  onDraftSaved?: (draftId: string) => void;
}

export function SaveDraftButton({
  html,
  messages,
  brandId,
  disabled,
  onDraftSaved,
}: SaveDraftButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = async () => {
    if (!html) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftId || undefined,
          title: extractTitle(html) || "Untitled Draft",
          html_content: html,
          prompt_history: messages,
          brand_id: brandId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftId(data.draft.id);
        setLastSaved(new Date());
        setShowSaved(true);
        onDraftSaved?.(data.draft.id);

        // Hide "Saved" indicator after 2 seconds
        setTimeout(() => setShowSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Extract title from HTML (look for h1 or title tag)
  const extractTitle = (htmlContent: string): string => {
    const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].trim().slice(0, 100);

    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim().slice(0, 100);

    // Use first user message as fallback
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 100);
    }

    return "Untitled Draft";
  };

  return (
    <Button
      variant="outline"
      onClick={handleSave}
      disabled={disabled || isSaving || !html}
    >
      {isSaving ? (
        <>
          <svg
            className="h-4 w-4 animate-spin mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
          Saving...
        </>
      ) : showSaved ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 text-green-500"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {draftId ? "Update Draft" : "Save Draft"}
        </>
      )}
    </Button>
  );
}
