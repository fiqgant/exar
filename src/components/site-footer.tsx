import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle } from "lucide-react";
import { ExarLogo } from "@/components/exar-logo";

const COLUMNS = [
  {
    title: "Layanan",
    links: [
      { href: "/#layanan", label: "Social Media Management" },
      { href: "/#layanan", label: "Content Creation" },
      { href: "/#layanan", label: "Photography" },
      { href: "/#layanan", label: "Videography" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { href: "/#portofolio", label: "Portofolio" },
      { href: "/#paket", label: "Paket Layanan" },
      { href: "/#strategi", label: "AI Strategy Generator" },
      { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
    ],
  },
];

import { createWhatsAppUrl, type SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings";

export function SiteFooter({ settings = DEFAULT_SITE_SETTINGS }: { settings?: SiteSettings }) {
  const waUrl = createWhatsAppUrl(
    settings.whatsapp,
    "Halo Tim EXAR Project, saya ingin konsultasi mengenai layanan digital marketing."
  );

  return (
    <footer className="border-t border-white/10 bg-[#242424] text-white">
      <div className="container-x grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <ExarLogo tone="light" withWordmark />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            Partner strategi digital untuk bisnis Anda. Kami menggabungkan
            strategi, konten, dan data agar setiap langkah pemasaran terukur dan
            transparan.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold tracking-[0.14em] text-white/50 uppercase">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} EXAR Project. Seluruh hak cipta
            dilindungi.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="size-3.5" /> {settings.email}
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="size-3.5" /> {settings.whatsapp}
            </a>
            {settings.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {settings.address}
              </span>
            )}
            {settings.instagram && (
              <a
                href={settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-pink-400 transition-colors"
              >
                <Camera className="size-3.5" /> Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
