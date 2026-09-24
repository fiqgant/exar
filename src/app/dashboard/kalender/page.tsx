import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import {
  CONTENT_STATUS,
  CONTENT_TYPE_LABEL,
  PLATFORM_LABEL,
} from "@/lib/format";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client) {
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;
  }

  const { m } = await searchParams;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split("-").map(Number);
    year = y;
    month = mo - 1;
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const contents = await prisma.content.findMany({
    where: {
      clientId: client.id,
      scheduledAt: { gte: monthStart, lte: new Date(year, month + 1, 1) },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const byDay = new Map<number, typeof contents>();
  for (const c of contents) {
    const d = new Date(c.scheduledAt).getDate();
    byDay.set(d, [...(byDay.get(d) ?? []), c]);
  }

  // Grid starts on Monday.
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(monthStart);

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kalender Konten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jadwal publikasi & status konten Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/kalender?m=${fmt(prev)}`}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            ← Sebelumnya
          </Link>
          <span className="min-w-40 text-center text-sm font-semibold">
            {monthLabel}
          </span>
          <Link
            href={`/dashboard/kalender?m=${fmt(next)}`}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Berikutnya →
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/60">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const items = day ? (byDay.get(day) ?? []) : [];
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear();
            return (
              <div
                key={i}
                className={`min-h-28 border-r border-b border-border p-2 last:border-r-0 ${
                  day ? "" : "bg-secondary/30"
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-primary text-white"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {items.slice(0, 3).map((item) => {
                        const status = CONTENT_STATUS[item.status];
                        return (
                          <Link
                            key={item.id}
                            href={`/dashboard/konten/${item.id}`}
                            className="block rounded-md px-1.5 py-1 text-[10px] leading-tight font-medium text-white"
                            style={{ backgroundColor: item.previewColor }}
                            title={`${item.title} · ${PLATFORM_LABEL[item.platform]} · ${status.label}`}
                          >
                            <span className="line-clamp-1">{item.title}</span>
                          </Link>
                        );
                      })}
                      {items.length > 3 && (
                        <p className="px-1 text-[10px] text-muted-foreground">
                          +{items.length - 3} konten lagi
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-4">
        {Object.entries(CONTENT_STATUS).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-2 text-xs">
            <span className={`size-2.5 rounded-full ${meta.className}`} />
            {meta.label}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          Jenis konten: {Object.values(CONTENT_TYPE_LABEL).join(" · ")}
        </span>
      </div>
    </div>
  );
}
