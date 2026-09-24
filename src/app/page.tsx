import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Camera,
  Clapperboard,
  Handshake,
  Layers,
  Megaphone,
  PenTool,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  MessageCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";
import { createWhatsAppUrl } from "@/lib/settings";
import { getSiteSettings } from "@/lib/settings.server";
import { StrategyLocked } from "@/components/strategy-locked";
import { Button } from "@/components/ui/button";
import { ExarLogo } from "@/components/exar-logo";
import { Reveal } from "@/components/reveal";
import { PackageGrid } from "@/components/package-grid";
import { PortfolioGallery } from "@/components/portfolio-gallery";
import { StrategyGenerator } from "@/components/strategy-generator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SERVICES = [
  {
    icon: Share2,
    title: "Social Media Management",
    description:
      "Perencanaan, penjadwalan, hingga community management di Instagram, TikTok, dan Facebook.",
  },
  {
    icon: PenTool,
    title: "Content Creation",
    description:
      "Feeds design dan copywriting yang selaras dengan karakter brand Anda.",
  },
  {
    icon: Camera,
    title: "Photography",
    description:
      "Foto produk dan lifestyle yang membuat bisnis Anda tampil profesional.",
  },
  {
    icon: Clapperboard,
    title: "Videography",
    description:
      "Video Reels 30–70 detik yang menarik perhatian dan mendorong konversi.",
  },
];

const TEAM = [
  "Direktur",
  "Admin Media Sosial",
  "Desainer Grafis",
  "Pembuat Konten",
  "Videografer",
  "Editor Video",
];

const PROCESS = [
  {
    icon: Megaphone,
    step: "Show",
    title: "Kenali Bisnis Anda",
    description: "Kami mempelajari produk, audiens, dan tujuan bisnis Anda.",
  },
  {
    icon: TrendingUp,
    step: "Analyze",
    title: "Susun Strategi",
    description: "Riset & analisis menjadi rencana konten yang terukur.",
  },
  {
    icon: Users,
    step: "Collaborate",
    title: "Produksi Bersama",
    description: "Tim EXAR memproduksi konten sesuai kalender bersama.",
  },
  {
    icon: Layers,
    step: "Approve",
    title: "Review & Setujui",
    description: "Anda menyetujui setiap konten lewat dashboard transparan.",
  },
  {
    icon: TrendingUp,
    step: "Grow",
    title: "Pantau Pertumbuhan",
    description: "Laporan performa bulanan untuk keputusan berikutnya.",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const profile = await getCurrentProfile();

  if (profile && params.view !== "landing") {
    if (profile.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  const [packages, portfolios, settings] = await Promise.all([
    prisma.package.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.portfolio.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    getSiteSettings(),
  ]);

  const heroWaUrl = createWhatsAppUrl(
    settings.whatsapp,
    "Halo Tim EXAR Project, saya ingin konsultasi gratis mengenai kebutuhan strategi digital bisnis saya."
  );

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#242424] text-white">
          <div className="absolute inset-0 bg-dots text-white/25 opacity-40" />
          <div
            className="absolute -top-40 -right-40 size-[42rem] rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #b42424 0%, transparent 70%)",
            }}
          />
          <div className="container-x relative grid gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-white/80 uppercase">
                <Sparkles className="size-3.5 text-primary" />
                Digital Growth Partner
              </span>

              <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Partner strategi digital untuk{" "}
                <span className="text-primary">bisnis Anda</span>.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                EXAR Project menggabungkan strategi, konten, dan data agar
                setiap langkah pemasaran Anda terukur — dari produksi konten
                sampai laporan performa, transparan dalam satu platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2 cursor-pointer shadow-lg"
                  render={
                    <a href={heroWaUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-4" />
                      Konsultasi Gratis via WA
                    </a>
                  }
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  render={<a href="#paket">Lihat Paket</a>}
                />
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {[
                  { value: "4+", label: "Kategori Layanan" },
                  { value: "3", label: "Pilihan Paket" },
                  { value: "6", label: "Tim Profesional" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-3xl font-extrabold text-white">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-xs tracking-wide text-white/60 uppercase">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="animate-fade-in lg:justify-self-end">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
                <ExarLogo tone="light" className="scale-[2.4] py-8" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-[0.28em] text-white uppercase">
                    Eternal Xpression
                  </p>
                  <p className="text-xs tracking-[0.28em] text-white/60 uppercase">
                    of Art & Reality
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-white/60">
                  Show → Analyze → Collaborate → Approve → Grow
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Layanan */}
        <section id="layanan" className="container-x py-20 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Layanan Kami</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Satu tim untuk seluruh kebutuhan digital Anda
            </h2>
            <p className="mt-4 text-muted-foreground">
              Kami menangani strategi sampai eksekusi, sehingga Anda bisa fokus
              mengembangkan bisnis.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <service.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Tim */}
        <section className="border-y border-border bg-secondary">
          <div className="container-x grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <span className="eyebrow">Termasuk Tim Kami</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Semua paket sudah termasuk tim profesional
              </h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Tanpa biaya tersembunyi. Setiap paket didukung oleh tim lengkap
                EXAR yang bekerja khusus untuk bisnis Anda.
              </p>
              <Button
                className="mt-7"
                render={<a href="#paket">Lihat Detail Paket</a>}
              />
            </Reveal>

            <Reveal delay={120}>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEAM.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      ✓
                    </span>
                    <span className="text-sm font-medium">{role}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Paket */}
        <section id="paket" className="container-x py-20 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Penawaran Paket</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Pilih paket sesuai kebutuhan bisnis
            </h2>
            <p className="mt-4 text-muted-foreground">
              Semua paket termasuk kalender konten bulanan, laporan performa,
              dan community management.
            </p>
          </Reveal>

          <div className="mt-16">
            <PackageGrid packages={packages} settings={settings} />
          </div>
        </section>

        {/* Portofolio */}
        <section
          id="portofolio"
          className="border-y border-border bg-secondary py-20 lg:py-28"
        >
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Portofolio</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Hasil kerja yang berbicara
              </h2>
              <p className="mt-4 text-muted-foreground">
                Sebagian pekerjaan kami bersama klien di berbagai industri.
              </p>
            </Reveal>

            <div className="mt-14">
              <PortfolioGallery items={portfolios} />
            </div>
          </div>
        </section>

        {/* AI Strategy Generator */}
        <section id="strategi" className="container-x py-20 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">AI Strategy Generator</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Dapatkan rekomendasi strategi dalam hitungan detik
            </h2>
            <p className="mt-4 text-muted-foreground">
              Isi informasi bisnis Anda, dan sistem akan menyusun rekomendasi
              awal content strategy, social media strategy, ide konten, hingga
              channel yang tepat.
            </p>
          </Reveal>

          <div className="mt-14">
            {profile ? (
              <StrategyGenerator whatsappNumber={settings.whatsapp} />
            ) : (
              <StrategyLocked />
            )}
          </div>
        </section>

        {/* Proses Kerja */}
        <section className="border-y border-border bg-secondary py-20 lg:py-28">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Cara Kami Bekerja</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Proses kerja yang transparan
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {PROCESS.map((item, i) => (
                <Reveal key={item.step} delay={i * 70}>
                  <div className="relative flex h-full flex-col rounded-2xl border border-border bg-background p-6">
                    <span className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
                      {item.step}
                    </span>
                    <item.icon className="mt-4 size-5 text-primary" />
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / Kontak */}
        <section id="kontak" className="container-x py-20 lg:py-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-[#242424] px-6 py-16 text-center text-white sm:px-16">
              <div className="absolute inset-0 bg-dots text-white/25 opacity-40" />
              <div
                className="absolute -bottom-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, #b42424 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <ExarLogo tone="light" className="mx-auto mb-6" />
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Siap tumbuh bersama EXAR?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-white/70">
                  Ceritakan kebutuhan bisnis Anda. Tim kami akan membantu
                  menyusun strategi yang tepat — tanpa biaya untuk sesi
                  konsultasi pertama.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a
                    href={createWhatsAppUrl(
                      settings.whatsapp,
                      "Halo Tim EXAR, saya tertarik untuk kerja sama dan ingin konsultasi lebih lanjut mengenai layanan EXAR Project."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 cursor-pointer"
                  >
                    <MessageCircle className="size-4" />
                    Hubungi via WhatsApp
                  </a>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    render={
                      <a href={`mailto:${settings.email}`}>Kirim Email</a>
                    }
                  />
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    render={
                      <Link
                        href={
                          profile
                            ? profile.role === "ADMIN"
                              ? "/admin"
                              : "/dashboard"
                            : "/login"
                        }
                      >
                        {profile
                          ? profile.role === "ADMIN"
                            ? "Buka Admin Panel"
                            : "Buka Dashboard"
                          : "Masuk ke Dashboard"}
                      </Link>
                    }
                  />
                </div>
                <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/50">
                  <Handshake className="size-3.5" /> Respon cepat di hari kerja,
                  konsultasi tanpa komitmen.
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
