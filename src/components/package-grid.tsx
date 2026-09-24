"use client";

import { useState } from "react";
import { Check, CircleX, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { OrderPackageDialog } from "@/components/order-package-dialog";
import type { SiteSettings } from "@/lib/settings";

export type PackageItem = {
  id: string;
  name: string;
  price: number;
  recommended: boolean;
  freeFotoProduk: boolean;
  managementInstagram: boolean;
  managementTiktok: boolean;
  managementFacebook: boolean;
  videoReelsCount: number;
  feedsDesignCount: number;
  produksiVisit: string;
  professionalTallent: boolean;
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Feature({
  included,
  label,
  value,
}: {
  included: boolean;
  label: string;
  value?: string | number;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-white/15 pb-3 text-sm">
      <span className="flex items-center gap-2.5">
        {included ? (
          <Check className="size-4 shrink-0 text-white" strokeWidth={3} />
        ) : (
          <CircleX
            className="size-4 shrink-0 text-white/50"
            strokeWidth={2.5}
          />
        )}
        <span className={cn(!included && "text-white/50")}>{label}</span>
      </span>
      {value !== undefined && (
        <span className="shrink-0 font-semibold text-white">{value}</span>
      )}
    </li>
  );
}

export function PackageGrid({
  packages,
  settings,
}: {
  packages: PackageItem[];
  settings?: SiteSettings;
}) {
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);

  if (packages.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Paket belum tersedia. Silakan hubungi kami untuk penawaran khusus.
      </p>
    );
  }

  return (
    <>
      <div className="grid items-start gap-6 md:grid-cols-3">
        {packages.map((pkg, index) => (
          <Reveal key={pkg.id} delay={index * 90} className="h-full">
            <div
              className={cn(
                "relative flex h-full flex-col rounded-3xl bg-primary p-7 text-white shadow-xl shadow-primary/10 transition-transform duration-300 hover:-translate-y-1.5",
                pkg.recommended && "ring-2 ring-white md:-mt-6 md:pb-9",
              )}
            >
              {pkg.recommended && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold tracking-wide text-primary uppercase shadow-sm">
                  <Sparkles className="size-3.5" /> Rekomendasi
                </span>
              )}

              <h3 className="text-2xl font-bold">{pkg.name}</h3>
              <p className="mt-1 text-xs font-medium tracking-wide text-white/70 uppercase">
                Social Media Management
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                <Feature included={pkg.freeFotoProduk} label="Free Foto Produk" />
                <Feature
                  included={pkg.managementInstagram}
                  label="Management Instagram"
                />
                <Feature
                  included={pkg.managementTiktok}
                  label="Management TikTok"
                />
                <Feature
                  included={pkg.managementFacebook}
                  label="Management Facebook"
                />
                <Feature
                  included
                  label="Video Reels 30–70 Detik"
                  value={`${pkg.videoReelsCount} Reels`}
                />
                <Feature
                  included
                  label="Feeds Design"
                  value={`${pkg.feedsDesignCount} Design`}
                />
                <Feature included label="Produksi" value={pkg.produksiVisit} />
                <Feature included label="Monthly Content Calendar" />
                <Feature included label="Monthly Performance Report" />
                <Feature included label="Community Management" />
                <Feature
                  included={pkg.professionalTallent}
                  label="Professional Talent Included"
                />
              </ul>

              <div className="mt-7">
                <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
                  Mulai dari
                </p>
                <p className="text-3xl font-extrabold tracking-tight">
                  {rupiah(pkg.price)}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedPkg(pkg)}
                  className="mt-5 w-full bg-white text-primary hover:bg-white/90 gap-1.5 font-semibold cursor-pointer"
                >
                  Pilih Paket Ini
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <OrderPackageDialog
        pkg={selectedPkg}
        open={!!selectedPkg}
        onOpenChange={(open) => !open && setSelectedPkg(null)}
        settings={settings}
      />
    </>
  );
}
