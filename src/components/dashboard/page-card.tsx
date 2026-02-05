"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import type { Page } from "@/types";

interface PageCardProps {
  page: Page;
}

export function PageCard({ page }: PageCardProps) {
  const [copied, setCopied] = useState(false);

  const pageUrl = `/p/${page.slug}`;

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
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              page.is_published
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
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
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
