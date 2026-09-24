import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { getCurrentClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ExarLogo } from "@/components/exar-logo";
import { DashboardNav, type NavIconName } from "@/components/dashboard-nav";
import { signOut } from "./actions";

const NAV_ITEMS: { href: string; label: string; icon: NavIconName }[] = [
  { href: "/dashboard", label: "Beranda", icon: "dashboard" },
  { href: "/dashboard/strategi", label: "AI Strategy", icon: "strategy" },
  { href: "/dashboard/kalender", label: "Kalender Konten", icon: "calendar" },
  { href: "/dashboard/konten", label: "Content Management", icon: "content" },
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

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-[#242424] px-4 py-6 lg:flex">
        <div>
          <div className="mb-8 px-2">
            <Link href="/dashboard">
              <ExarLogo tone="light" />
            </Link>
            <p className="mt-2 pl-1 text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
              Client Dashboard
            </p>
          </div>
          <DashboardNav items={NAV_ITEMS} />
        </div>

        <div className="space-y-3 px-2">
          <Link
            href="/?view=landing"
            className="flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white"
          >
            <ExternalLink className="size-3.5" /> Lihat situs publik
          </Link>
          <div className="rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-[11px] text-white/40">Bisnis</p>
            <p className="truncate text-xs font-medium text-white/85">
              {businessName}
            </p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full bg-white/10 text-white hover:bg-white/20"
            >
              <LogOut className="size-4" />
              Keluar
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
          <Link href="/dashboard">
            <ExarLogo />
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" /> Keluar
            </Button>
          </form>
        </header>
        <div className="lg:hidden">
          <div className="border-b border-border bg-[#242424] px-3 py-2">
            <DashboardNav items={NAV_ITEMS} />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
