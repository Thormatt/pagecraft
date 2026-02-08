import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { PageList } from "@/components/dashboard/page-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Page } from "@/types";

export default async function PagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: pages }, { data: profile }] = await Promise.all([
    supabase
      .from("pages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single(),
  ]);

  const allPages = (pages ?? []) as Page[];
  const totalViews = allPages.reduce((sum, p) => sum + p.view_count, 0);
  const publishedCount = allPages.filter((p) => p.is_published).length;
  const username = (profile as { username: string | null } | null)?.username ?? null;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <Link href="/generate">
          <Button>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Page
          </Button>
        </Link>
      </div>
      <StatsBar
        totalPages={allPages.length}
        totalViews={totalViews}
        publishedPages={publishedCount}
      />
      <PageList pages={allPages} username={username} />
    </div>
  );
}
