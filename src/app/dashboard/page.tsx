import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  CONTENT_STATUS,
  LEAD_STATUS,
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

  const [contents, leads, contract] = await Promise.all([
    prisma.content.findMany({
      where: { clientId: client.id },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.lead.findMany({ where: { clientId: client.id } }),
    prisma.contract.findFirst({
      where: { clientId: client.id, isActive: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const activeContent = contents.filter(
    (c) => c.status === "APPROVED" || c.status === "SCHEDULED",
  ).length;
  const pendingApproval = contents.filter((c) => c.status === "DRAFT").length;
  const converted = leads.filter((l) => l.status === "CONVERTED").length;
  const conversionRate =
    leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;
  const remaining = contract ? daysUntil(contract.endDate) : null;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  const upcoming = contents
    .filter((c) => c.scheduledAt.getTime() >= cutoff.getTime())
    .slice(0, 4);

  const stats = [
    { label: "Konten Aktif", value: activeContent, icon: Layers },
    { label: "Total Leads", value: leads.length, icon: Users },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp },
    { label: "Konten Menunggu", value: pendingApproval, icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, {client.businessName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan performa dan aktivitas konten Anda bulan ini.
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
            <h2 className="font-semibold">Leads Terbaru</h2>
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Semua <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {leads.slice(0, 4).map((lead) => {
              const status = LEAD_STATUS[lead.status];
              return (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{lead.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {lead.interest}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {rupiah(lead.potentialValue)}
                  </p>
                </div>
              );
            })}
            {leads.length === 0 && (
              <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Belum ada leads.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
