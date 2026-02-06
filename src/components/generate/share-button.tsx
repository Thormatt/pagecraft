"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  pageUrl: string;
  pageTitle: string;
  pageId: string;
}

export function ShareButton({ pageUrl, pageTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${pageUrl}`
    : pageUrl;

  const embedCode = `<iframe src="${fullUrl}" width="100%" height="600" frameborder="0" title="${pageTitle}"></iframe>`;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const copyToClipboard = async (text: string, type: "link" | "embed") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out ${pageTitle}`);
    const url = encodeURIComponent(fullUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(fullUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setShowMenu(!showMenu)}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-50 w-80 rounded-md border border-border bg-background p-4 shadow-md space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Share Link</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={fullUrl}
                readOnly
                className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(fullUrl, "link")}
              >
                {copied === "link" ? (
                  <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Embed Code</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={embedCode}
                readOnly
                className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono truncate"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(embedCode, "embed")}
              >
                {copied === "embed" ? (
                  <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16,18 22,12 16,6" />
                    <polyline points="8,6 2,12 8,18" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Share on Social</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnTwitter}
                className="flex-1 gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnLinkedIn}
                className="flex-1 gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
