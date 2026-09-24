"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Images,
  KeyRound,
  CalendarDays,
  Layers,
  Users,
  FileSignature,
  UserRound,
  Sparkles,
  Building2,
  UserCog,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icon *names* (serializable strings) are passed from server components; the
 * actual lucide components are resolved here in the client bundle.
 */
const ICONS = {
  dashboard: LayoutDashboard,
  package: Package,
  terms: FileText,
  portfolio: Images,
  ai: KeyRound,
  calendar: CalendarDays,
  content: Layers,
  leads: Users,
  contract: FileSignature,
  profile: UserRound,
  strategy: Sparkles,
  clients: Building2,
  users: UserCog,
  settings: Settings,
} as const;

export type NavIconName = keyof typeof ICONS;

export function DashboardNav({
  items,
}: {
  items: { href: string; label: string; icon: NavIconName }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        const isRoot = href === "/dashboard" || href === "/admin";
        const active =
          pathname === href || (!isRoot && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white",
              active && "bg-primary text-white hover:bg-primary",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
