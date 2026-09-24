export const preferredRegion = "sin1"; // Run near Supabase SG

import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { getCurrentClient } from "@/lib/auth";
import { ExarLogo } from "@/components/exar-logo";
import { DashboardNav, type NavIconName } from "@/components/dashboard-nav";
import { signOut } from "./actions";

const NAV_ITEMS: { href: string; label: string; icon: NavIconName }[] = [
  { href: "/dashboard", label: "Beranda", icon: "dashboard" },
  { href: "/dashboard/strategi", label: "AI Strategy", icon: "strategy" },
  { href: "/dashboard/kalender", label: "Kalender", icon: "calendar" },
  { href: "/dashboard/konten", label: "Konten", icon: "content" },
  { href: "/dashboard/kontrak", label: "Kontrak", icon: "contract" },
  { href: "/dashboard/profil", label: "Profil", icon: "profile" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentClient();
  if (!session?.profile) {
    redirect("/login");
  }
  if (session.profile.role === "ADMIN") {
    redirect("/admin");
  }

  const businessName = session.client?.businessName ?? "Klien EXAR";
  const initials = businessName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f5f4f0]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-[#2d2d2d] bg-[#1e1e1e] lg:flex">
        <div className="border-b-2 border-white/10 px-5 py-5">
          <Link href="/dashboard" className="block">
            <ExarLogo tone="light" />
          </Link>
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-primary/50 bg-primary/20 text-[11px] font-black text-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white/90">{businessName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">Client</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[9px] font-black tracking-[0.2em] text-white/25 uppercase">Menu</p>
          <DashboardNav items={NAV_ITEMS} variant="client" />
        </div>

        <div className="border-t-2 border-white/10 px-3 py-4 space-y-1.5">
          <Link
            href="/?view=landing"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/40 transition-colors hover:bg-white/5 hover:text-white/65"
          >
            <ExternalLink className="size-3.5" /> Lihat situs publik
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/55 transition-all hover:bg-white/10 hover:text-white/80"
            >
              <LogOut className="size-3.5" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b-2 border-[#2d2d2d] bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard">
            <ExarLogo />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1.5 text-xs font-black shadow-[2px_2px_0_#2d2d2d] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <LogOut className="size-3.5" /> Keluar
            </button>
          </form>
        </header>

        {/* Mobile nav */}
        <div className="border-b-2 border-[#2d2d2d] bg-[#1e1e1e] px-2 py-1.5 lg:hidden">
          <DashboardNav items={NAV_ITEMS} variant="client" horizontal />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
