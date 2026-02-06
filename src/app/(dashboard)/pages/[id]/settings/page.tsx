"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { isValidSlug } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Page, Profile } from "@/types/database";

export default function PageSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [pageRes, profileRes] = await Promise.all([
        fetch(`/api/pages/${id}`),
        fetch("/api/profile"),
      ]);

      if (!pageRes.ok) {
        router.push("/dashboard");
        return;
      }

      const pageData: Page = await pageRes.json();
      setPage(pageData);
      setTitle(pageData.title);
      setSlug(pageData.slug);
      setDescription(pageData.description ?? "");
      setIsPublished(pageData.is_published);

      if (profileRes.ok) {
        const profileData: Profile = await profileRes.json();
        setProfile(profileData);
      }

      setLoading(false);
    }
    loadData();
  }, [id, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!isValidSlug(slug)) {
      setError("Invalid slug format");
      return;
    }

    setSaving(true);
    setError("");

    const response = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug,
        description: description.trim() || null,
        is_published: isPublished,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    const updated = await response.json();
    setPage(updated);
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Page Settings</h1>
        <Button variant="outline" onClick={() => router.push(`/pages/${id}`)}>
          Back to Editor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            />
            {profile?.username ? (
              <p className="text-xs text-muted-foreground">
                Available at <span className="font-mono">/p/{profile.username}/{slug}</span>
              </p>
            ) : (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs">
                <p className="text-amber-800 font-medium">Username not set</p>
                <p className="text-amber-700 mt-0.5">
                  Set a username in{" "}
                  <Link href="/settings" className="underline hover:no-underline">
                    Settings
                  </Link>{" "}
                  for professional URLs
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-ring after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm font-medium">
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{page?.view_count ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total views</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Deleting this page is permanent. All data including view analytics will be lost.
          </p>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete Page
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete page"
        description={`Are you sure you want to delete "${page?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
