import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  CONTENT_STATUS,
  daysUntil,
  formatDate,
  rupiah,
} from "@/lib/format";

export default async function DashboardHome() {
  const session = await getCurrentClient();
  const client = session?.client;

  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Selamat datang di EXAR</h1>
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
    .slice(0, 4);

  const revisions = contents
    .filter((c) => c.status === "REVISION")
    .slice(0, 4);

  const stats = [
    { label: "Konten Aktif", value: activeContent, icon: Layers },
    { label: "Menunggu Review", value: pendingApproval, icon: Clock },
    { label: "Revisi Berjalan", value: revisionCount, icon: RotateCcw },
    {
      label: "Sisa Hari Kontrak",
      value: remaining !== null ? (remaining > 0 ? `${remaining}h` : "Berakhir") : "—",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, {client.businessName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan aktivitas konten Anda bulan ini.
          </p>
        </div>
        <Button render={<Link href="/dashboard/strategi" />}>
          <Sparkles className="size-4" /> Generate Strategi AI
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <stat.icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {contract && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              Kontrak Aktif · {contract.packageName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Berakhir {formatDate(contract.endDate)}
              {remaining !== null &&
                ` · ${remaining > 0 ? `${remaining} hari lagi` : "sudah berakhir"}`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {contract.services}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/kontrak" />}
          >
            Lihat Kontrak
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Jadwal Konten Mendatang</h2>
            <Link
              href="/dashboard/kalender"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Kalender <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Belum ada konten terjadwal.
              </p>
            )}
            {upcoming.map((item) => {
              const status = CONTENT_STATUS[item.status];
              return (
                <Link
                  key={item.id}
                  href={`/dashboard/konten/${item.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <span
                    className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-bold text-white"
                    style={{ backgroundColor: item.imageUrl ? undefined : item.previewColor }}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      new Date(item.scheduledAt).getDate()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {formatDate(item.scheduledAt)} · {item.platform}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Perlu Revisi</h2>
            <Link
              href="/dashboard/konten?status=REVISION"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Semua <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {revisions.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/konten/${item.id}`}
                className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:border-amber-500/40"
              >
                <RotateCcw className="size-4 shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.platform}
                  </span>
                </span>
              </Link>
            ))}
            {revisions.length === 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <CheckCircle className="size-4 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-700">
                  Tidak ada konten yang perlu direvisi.
                </p>
              </div>
            )}
          </div>

          {contract && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Nilai Kontrak
              </p>
              <p className="mt-1 text-xl font-extrabold text-primary">
                {rupiah(contract.value)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {contract.packageName}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
