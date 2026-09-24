import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ExarLogo } from "@/components/exar-logo";
import { DashboardNav, type NavIconName } from "@/components/dashboard-nav";
import { signOut } from "./actions";

// Icon *names* (not components) are passed to the client nav, since icon
// components cannot be serialized across the server/client boundary.
const NAV_ITEMS: { href: string; label: string; icon: NavIconName }[] = [
  { href: "/admin", label: "Ringkasan", icon: "dashboard" },
  { href: "/admin/klien", label: "Klien", icon: "clients" },
  { href: "/admin/konten", label: "Konten", icon: "content" },
  { href: "/admin/leads", label: "Leads", icon: "leads" },
  { href: "/admin/kontrak", label: "Kontrak", icon: "contract" },
  { href: "/admin/paket", label: "Paket", icon: "package" },
  { href: "/admin/portofolio", label: "Portofolio", icon: "portfolio" },
  {
    href: "/admin/syarat-ketentuan",
    label: "Syarat & Ketentuan",
    icon: "terms",
  },
  { href: "/admin/users", label: "Users & Roles", icon: "users" },
  { href: "/admin/ai-settings", label: "AI Settings", icon: "ai" },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between bg-[#242424] px-4 py-6">
        <div>
          <div className="mb-8 px-2">
            <Link href="/admin">
              <ExarLogo tone="light" />
            </Link>
            <p className="mt-2 pl-1 text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
              Admin Panel
            </p>
          </div>
          <DashboardNav items={NAV_ITEMS} />
        </div>

        <div className="space-y-3 px-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white"
          >
            <ExternalLink className="size-3.5" /> Lihat situs publik
          </Link>
          <div className="rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-[11px] text-white/40">Masuk sebagai</p>
            <p className="truncate text-xs font-medium text-white/85">
              {profile.email}
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

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
