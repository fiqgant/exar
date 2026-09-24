import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { CONTENT_STATUS, daysUntil, formatDate, rupiah } from "@/lib/format";

export default async function DashboardHome() {
  const session = await getCurrentClient();
  const client = session?.client;

  if (!client) {
    return (
      <div className="nb-card p-10 text-center">
        <Zap className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 text-xl font-black">Selamat datang di EXAR</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Workspace Anda belum terhubung. Tim EXAR akan segera menyiapkannya.
        </p>
      </div>
    );
  }

  const [contents, contract] = await Promise.all([
    prisma.content.findMany({
      where: { clientId: client.id },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.contract.findFirst({
      where: { clientId: client.id, isActive: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const activeContent = contents.filter(
    (c) => c.status === "APPROVED" || c.status === "SCHEDULED",
  ).length;
  const pendingApproval = contents.filter((c) => c.status === "DRAFT").length;
  const revisionCount = contents.filter((c) => c.status === "REVISION").length;
  const remaining = contract ? daysUntil(contract.endDate) : null;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  const upcoming = contents
    .filter((c) => c.scheduledAt.getTime() >= cutoff.getTime())
    .slice(0, 5);

  const revisions = contents
    .filter((c) => c.status === "REVISION")
    .slice(0, 4);

  const stats = [
    { label: "Konten Aktif", value: activeContent, icon: Layers, accent: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Menunggu Review", value: pendingApproval, icon: Clock3, accent: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    { label: "Revisi Berjalan", value: revisionCount, icon: RotateCcw, accent: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
    {
      label: "Sisa Hari Kontrak",
      value: remaining !== null ? (remaining > 0 ? `${remaining}` : "Habis") : "\u2014",
      icon: CalendarDays,
      accent: "bg-primary",
      text: "text-primary",
      bg: "bg-primary/5",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            \u25cf Client Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#2d2d2d]">
            Halo, {client.businessName}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan aktivitas konten Anda bulan ini.
          </p>
        </div>
        <Link
          href="/dashboard/strategi"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#2d2d2d] bg-primary px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#2d2d2d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Sparkles className="size-4" /> Generate Strategi AI
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="nb-card overflow-hidden">
            <div className={`h-1.5 w-full ${stat.accent}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]/50">
                  {stat.label}
                </p>
                <div className={`rounded-lg p-1.5 ${stat.bg}`}>
                  <stat.icon className={`size-3.5 ${stat.text}`} />
                </div>
              </div>
              <p className={`mt-3 text-4xl font-black ${stat.text}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contract banner */}
      {contract && (
        <div className="overflow-hidden rounded-xl border-2 border-[#2d2d2d] bg-primary shadow-[4px_4px_0_#2d2d2d]">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                \u25cf Kontrak Aktif
              </p>
              <h2 className="mt-1 text-xl font-black text-white">{contract.packageName}</h2>
              <p className="mt-0.5 text-sm text-white/75">{contract.services}</p>
              <p className="mt-1 text-xs font-semibold text-white/55">
                Berakhir {formatDate(contract.endDate)}
                {remaining !== null &&
                  ` \u00b7 ${remaining > 0 ? `${remaining} hari lagi` : "sudah berakhir"}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-2xl font-black text-white">{rupiah(contract.value)}</p>
              <Link
                href="/dashboard/kontrak"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-white px-4 py-2 text-xs font-black text-primary shadow-[2px_2px_0_rgba(255,255,255,0.4)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(255,255,255,0.4)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Lihat Detail <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Two column */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#2d2d2d]">
              <span className="block h-4 w-1 rounded-sm bg-primary" />
              Jadwal Mendatang
            </h2>
            <Link
              href="/dashboard/kalender"
              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-primary hover:underline underline-offset-2"
            >
              Kalender <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <div className="nb-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Belum ada konten terjadwal.</p>
              </div>
            )}
            {upcoming.map((item) => {
              const status = CONTENT_STATUS[item.status];
              return (
                <Link
                  key={item.id}
                  href={`/dashboard/konten/${item.id}`}
                  className="nb-card flex items-center gap-4 p-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2d2d2d]"
                >
                  <span
                    className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-[#2d2d2d] text-sm font-black text-white"
                    style={{ backgroundColor: item.imageUrl ? undefined : item.previewColor }}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      new Date(item.scheduledAt).getDate()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-[#2d2d2d]">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {formatDate(item.scheduledAt)} \u00b7 {item.platform}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-md border border-current px-2.5 py-1 text-[11px] font-black ${status.className}`}>
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Revisions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#2d2d2d]">
              <span className="block h-4 w-1 rounded-sm bg-amber-500" />
              Perlu Revisi
            </h2>
            <Link
              href="/dashboard/konten?status=REVISION"
              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-amber-600 hover:underline underline-offset-2"
            >
              Semua <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {revisions.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/konten/${item.id}`}
                className="flex items-center gap-3 rounded-xl border-2 border-amber-500 bg-amber-50 p-4 shadow-[3px_3px_0_#f59e0b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#f59e0b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <RotateCcw className="size-4 shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#2d2d2d]">{item.title}</span>
                  <span className="text-xs font-semibold text-amber-700">{item.platform}</span>
                </span>
              </Link>
            ))}
            {revisions.length === 0 && (
              <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 shadow-[3px_3px_0_#10b981]">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                <p className="text-sm font-bold text-emerald-800">Semua konten aman!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
