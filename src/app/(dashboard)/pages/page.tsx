"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/dashboard/page-card";
import type { Page } from "@/types";

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch pages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username ?? null);
      }
    } catch {
      // Profile fetch is non-critical
    }
  }, []);

  useEffect(() => {
    fetchPages();
    fetchProfile();
  }, [fetchPages, fetchProfile]);

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your generated pages
          </p>
        </div>
        <Link href="/generate">
          <Button>
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
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New Page
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No pages yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Create your first page to get started. Use the generator to build pages with AI.
          </p>
          <Link href="/generate">
            <Button>Create Your First Page</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}
