"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { isValidSlug } from "@/lib/utils";
import { EXPIRATION_PRESETS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Page, Profile } from "@/types/database";

type PageResponse = Omit<Page, "page_password"> & { has_password: boolean };

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs > 0;

  const minutes = Math.round(absDiff / 60000);
  const hours = Math.round(absDiff / 3600000);
  const days = Math.round(absDiff / 86400000);

  let label: string;
  if (minutes < 1) label = "less than a minute";
  else if (minutes < 60) label = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) label = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else label = `${days} day${days !== 1 ? "s" : ""}`;

  return isFuture ? `in ${label}` : `${label} ago`;
}

export default function PageSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<PageResponse | null>(null);
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
  const [hasPassword, setHasPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expirationSaving, setExpirationSaving] = useState(false);
  const [expirationMessage, setExpirationMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

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

      const pageData: PageResponse = await pageRes.json();
      setPage(pageData);
      setTitle(pageData.title);
      setSlug(pageData.slug);
      setDescription(pageData.description ?? "");
      setIsPublished(pageData.is_published);
      setHasPassword(pageData.has_password);
      setExpiresAt(pageData.expires_at);

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

  const handleSetPassword = async () => {
    if (!newPassword.trim()) {
      setPasswordError("Password cannot be empty");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess("");

    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_password: newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPasswordError(data.error || "Failed to set password");
    } else {
      const updated: PageResponse = await res.json();
      setPage(updated);
      setHasPassword(true);
      setNewPassword("");
      setPasswordSuccess(hasPassword ? "Password updated" : "Password set");
    }
    setPasswordSaving(false);
  };

  const handleRemovePassword = async () => {
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess("");

    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_password: null }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPasswordError(data.error || "Failed to remove password");
    } else {
      const updated: PageResponse = await res.json();
      setPage(updated);
      setHasPassword(false);
      setNewPassword("");
      setPasswordSuccess("Password removed — page is now public");
    }
    setPasswordSaving(false);
  };

  const handleSetExpiration = async (seconds: number) => {
    setExpirationSaving(true);
    setExpirationMessage(null);

    const newExpiresAt = new Date(Date.now() + seconds * 1000).toISOString();
    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expires_at: newExpiresAt }),
    });

    if (!res.ok) {
      const data = await res.json();
      setExpirationMessage({ type: "error", text: data.error || "Failed to set expiration" });
    } else {
      const updated: PageResponse = await res.json();
      setPage(updated);
      setExpiresAt(updated.expires_at);
      setExpirationMessage({ type: "success", text: "Expiration set" });
    }
    setExpirationSaving(false);
  };

  const handleRemoveExpiration = async () => {
    setExpirationSaving(true);
    setExpirationMessage(null);

    const res = await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expires_at: null }),
    });

    if (!res.ok) {
      const data = await res.json();
      setExpirationMessage({ type: "error", text: data.error || "Failed to remove expiration" });
    } else {
      const updated: PageResponse = await res.json();
      setPage(updated);
      setExpiresAt(null);
      setExpirationMessage({ type: "success", text: "Expiration removed — page will not expire" });
    }
    setExpirationSaving(false);
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
          <CardTitle>Password Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPassword && (
            <p className="text-sm text-muted-foreground">
              This page is currently <span className="font-medium text-foreground">password protected</span>.
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {hasPassword ? "Change password" : "Set a password"}
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                maxLength={128}
              />
              <Button onClick={handleSetPassword} disabled={passwordSaving}>
                {passwordSaving ? "Saving..." : hasPassword ? "Update" : "Set"}
              </Button>
            </div>
          </div>
          {hasPassword && (
            <Button
              variant="outline"
              onClick={handleRemovePassword}
              disabled={passwordSaving}
            >
              Remove Password
            </Button>
          )}
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600">{passwordSuccess}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Expiration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expiresAt && (
            <p className="text-sm">
              {new Date(expiresAt) > new Date() ? (
                <span className="text-muted-foreground">
                  Expires{" "}
                  <span className="font-medium text-foreground">
                    {formatRelativeTime(new Date(expiresAt))}
                  </span>
                </span>
              ) : (
                <span className="text-amber-600 font-medium">
                  Expired {formatRelativeTime(new Date(expiresAt))}
                </span>
              )}
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {expiresAt ? "Change expiration" : "Set expiration"}
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPIRATION_PRESETS.map((preset) => (
                <Button
                  key={preset.seconds}
                  variant="outline"
                  size="sm"
                  disabled={expirationSaving}
                  onClick={() => handleSetExpiration(preset.seconds)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          {expiresAt && (
            <Button
              variant="outline"
              onClick={handleRemoveExpiration}
              disabled={expirationSaving}
            >
              Remove Expiration
            </Button>
          )}
          {expirationMessage && (
            <p className={`text-sm ${expirationMessage.type === "error" ? "text-destructive" : "text-green-600"}`}>
              {expirationMessage.text}
            </p>
          )}
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
