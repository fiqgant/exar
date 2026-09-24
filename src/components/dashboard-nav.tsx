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
  variant = "default",
  horizontal = false,
}: {
  items: { href: string; label: string; icon: NavIconName }[];
  variant?: "default" | "client";
  horizontal?: boolean;
}) {
  const pathname = usePathname();

  if (horizontal) {
    return (
      <nav className="flex flex-row gap-1 overflow-x-auto pb-0.5">
        {items.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const isRoot = href === "/dashboard" || href === "/admin";
          const active = pathname === href || (!isRoot && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] font-bold transition-all",
                active
                  ? "bg-primary text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        const isRoot = href === "/dashboard" || href === "/admin";
        const active = pathname === href || (!isRoot && pathname.startsWith(href));

        if (variant === "client") {
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-100",
                active
                  ? "border-2 border-white/15 bg-primary text-white shadow-[2px_2px_0_rgba(255,255,255,0.08)]"
                  : "border-2 border-transparent text-white/60 hover:bg-white/8 hover:text-white/90",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        }

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
