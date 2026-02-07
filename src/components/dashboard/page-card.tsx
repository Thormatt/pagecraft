"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import type { Page } from "@/types";

interface PageCardProps {
  page: Page;
  username: string | null;
}

export function PageCard({ page, username }: PageCardProps) {
  const [copied, setCopied] = useState(false);

  const pageUrl = username
    ? `/p/${username}/${page.slug}`
    : `/p/${page.slug}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${pageUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <iframe
          srcDoc={page.html_content}
          sandbox=""
          className="h-full w-full scale-50 origin-top-left pointer-events-none"
          style={{ width: "200%", height: "200%" }}
          title={page.title}
          tabIndex={-1}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{page.title}</h3>
            {page.description && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {page.description}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 text-xs font-medium ${
              page.is_published
                ? "status-dot status-dot-live text-green-700 dark:text-green-300"
                : "status-dot status-dot-draft text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {page.is_published ? "Live" : "Draft"}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(page.created_at)}</span>
          <span>{formatNumber(page.view_count)} views</span>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            {copied ? "Copied!" : "Copy URL"}
          </Button>
          <Link href={`/pages/${page.id}`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Link href={`/pages/${page.id}/settings`}>
            <Button variant="ghost" size="sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
