"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/types/database";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUsername(data.username || "");
        setDisplayName(data.display_name || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameError(null);
      setUsernameAvailable(null);
      return;
    }

    // Validate format
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      setUsernameAvailable(null);
      return;
    }
    if (username.length > 30) {
      setUsernameError("Username must be 30 characters or less");
      setUsernameAvailable(null);
      return;
    }
    if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(username) && username.length > 2) {
      setUsernameError("Lowercase letters, numbers, hyphens, and underscores only");
      setUsernameAvailable(null);
      return;
    }

    setUsernameError(null);
    setIsCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setUsernameAvailable(data.available);
          if (!data.available) {
            setUsernameError("Username is already taken");
          }
        }
      } catch (err) {
        console.error("Failed to check username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, profile?.username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(value);
    setSaveSuccess(false);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (usernameError) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || undefined,
          display_name: displayName || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSaveSuccess(true);
      } else {
        const error = await res.json();
        if (error.error === "Username already taken") {
          setUsernameError("Username is already taken");
        }
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    username !== (profile?.username || "") ||
    displayName !== (profile?.display_name || "");

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-1">Account Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your profile and username for public page URLs
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Username
                </label>
                <div className="relative">
                  <Input
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="thor20"
                    error={usernameError || undefined}
                    className="pr-10"
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    </div>
                  )}
                  {!isCheckingUsername && usernameAvailable === true && username !== profile?.username && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Your pages will be available at <span className="font-mono">/p/{username || "username"}/page-slug</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  placeholder="Thor Matthiasson"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Optional. Shown on your public profile.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || !!usernameError}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            {saveSuccess && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
