"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExarLogo } from "@/components/exar-logo";

const NAV = [
  { href: "/#layanan", label: "Layanan" },
  { href: "/#paket", label: "Paket" },
  { href: "/#portofolio", label: "Portofolio" },
  { href: "/#strategi", label: "AI Strategy" },
  { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
];

export type SiteHeaderProfile = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
} | null;

export function SiteHeader({ profile }: { profile?: SiteHeaderProfile }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const destination = profile?.role === "ADMIN" ? "/admin" : "/dashboard";
  const destinationLabel = profile?.role === "ADMIN" ? "Admin Panel" : "Dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300",
        scrolled &&
          "border-border bg-background/85 shadow-[0_1px_20px_-8px_rgba(0,0,0,0.18)] backdrop-blur-xl",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="EXAR Project" className="shrink-0">
          <ExarLogo withWordmark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {profile ? (
          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">
              {profile.role === "ADMIN" ? (
                <ShieldCheck className="size-3.5 text-primary shrink-0" />
              ) : (
                <User className="size-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="max-w-[150px] truncate text-foreground font-medium">
                {profile.email}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              render={<Link href={destination}>{destinationLabel}</Link>}
            />
          </div>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Masuk
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              Daftar Gratis
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu"
          aria-expanded={open}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-x flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            {profile ? (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <p className="px-3 text-xs text-muted-foreground truncate">
                  Masuk sebagai:{" "}
                  <strong className="text-foreground">{profile.email}</strong>{" "}
                  ({profile.role === "ADMIN" ? "Admin" : "Client"})
                </p>
                <Button
                  className="w-full bg-primary text-primary-foreground"
                  render={
                    <Link href={destination} onClick={() => setOpen(false)}>
                      Buka {destinationLabel}
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <Button
                  className="w-full"
                  render={
                    <Link href="/register" onClick={() => setOpen(false)}>
                      Daftar Gratis
                    </Link>
                  }
                />
                <Button
                  variant="ghost"
                  className="w-full"
                  render={
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Sudah punya akun? Masuk
                    </Link>
                  }
                />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
