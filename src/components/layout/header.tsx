import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function Header() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      {SITE_NAME}
    </Link>
  );
}
