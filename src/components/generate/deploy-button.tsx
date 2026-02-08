"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ShareButton } from "@/components/generate/share-button";
import { generateSlug, isValidSlug } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PromptMessage } from "@/types";
import type { Profile } from "@/types/database";

interface DeployedPage {
  id: string;
  title: string;
  slug: string;
  url: string;
}

interface DeployButtonProps {
  html: string;
  messages: PromptMessage[];
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DeployButton({
  html,
  messages,
  disabled,
  variant = "default",
  size = "sm",
  className,
}: DeployButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [deployedPage, setDeployedPage] = useState<DeployedPage | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const extractTitle = (htmlContent: string): string => {
    const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].trim().slice(0, 100);

    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim().slice(0, 100);

    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage) return firstUserMessage.content.slice(0, 100);

    return "";
  };

  const handleOpen = () => {
    setOpen(true);
    setError("");
    setDeployedPage(null);
    setSlugEdited(false);
    fetchProfile();
    const extracted = extractTitle(html);
    setTitle(extracted);
    setSlug(generateSlug(extracted || "page"));
  };

  const handleClose = () => {
    setOpen(false);
    if (deployedPage) {
      router.push(`/pages/${deployedPage.id}`);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setError("");
    if (!slugEdited) {
      setSlug(generateSlug(value || "page"));
    }
  };

  const handleDeploy = async () => {
    if (!profile?.username) {
      setError("A username is required to deploy. Set one in Settings.");
      return;
    }
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
      const pageUrl = `/p/${profile.username}/${slug}`;

      setDeployedPage({
        id: page.id,
        title: title.trim(),
        slug,
        url: pageUrl,
      });
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpen}
        disabled={disabled || !html}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
        </svg>
        Deploy
      </Button>
      <Dialog open={open} onClose={handleClose} className="w-[480px] max-w-[90vw]">
        {deployedPage ? (
          <>
            <DialogHeader>
              <DialogTitle>
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Page deployed!
                </span>
              </DialogTitle>
            </DialogHeader>
            <DialogContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your page <strong>{deployedPage.title}</strong> is now live.
                </p>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">Public URL</p>
                  <p className="font-mono text-sm break-all">{deployedPage.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ShareButton
                    pageUrl={deployedPage.url}
                    pageTitle={deployedPage.title}
                    pageId={deployedPage.id}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(deployedPage.url, "_blank")}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open
                  </Button>
                </div>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button onClick={handleClose}>
                Go to Page Details
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Deploy your page</DialogTitle>
            </DialogHeader>
            <DialogContent>
              {profileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : !profile?.username ? (
                <div className="flex flex-col items-center text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Username required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set a username to create your public page URL.
                    </p>
                  </div>
                  <Link href="/settings" onClick={() => setOpen(false)}>
                    <Button>Go to Settings</Button>
                  </Link>
                </div>
              ) : (
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
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                        setSlugEdited(true);
                        setError("");
                      }}
                      placeholder="my-awesome-page"
                    />
                    <p className="text-xs text-muted-foreground">
                      Available at <span className="font-mono">/p/{profile.username}/{slug || "..."}</span>
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
              )}
            </DialogContent>
            {!profileLoading && profile?.username && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeploy} disabled={loading}>
                  {loading ? "Deploying..." : "Deploy"}
                </Button>
              </DialogFooter>
            )}
            {!profileLoading && !profile?.username && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}
