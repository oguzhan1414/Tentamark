"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./DashboardSidebar";

export default function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-line bg-surface px-4 py-2.5 lg:hidden print:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors ${
              active ? "border-ink bg-ink text-bg" : "border-line bg-bg text-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
