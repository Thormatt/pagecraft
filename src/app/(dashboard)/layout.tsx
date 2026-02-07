import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 glass-panel">
        <div className="flex h-16 items-center justify-between px-8">
          <Header />
          <UserMenu email={user.email ?? ""} />
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto app-surface">{children}</main>
      </div>
    </div>
  );
}
