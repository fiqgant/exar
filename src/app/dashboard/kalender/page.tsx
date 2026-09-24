import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  if (!client)
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;

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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            ● Kalender
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#2d2d2d]">
            Kalender Konten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jadwal publikasi &amp; status konten Anda.
          </p>
        </div>
        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/kalender?m=${fmt(prev)}`}
            className="flex size-9 items-center justify-center rounded-lg border-2 border-[#2d2d2d] bg-white shadow-[2px_2px_0_#2d2d2d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="min-w-44 rounded-lg border-2 border-[#2d2d2d] bg-white px-4 py-2 text-center text-sm font-black text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d]">
            {monthLabel}
          </span>
          <Link
            href={`/dashboard/kalender?m=${fmt(next)}`}
            className="flex size-9 items-center justify-center rounded-lg border-2 border-[#2d2d2d] bg-white shadow-[2px_2px_0_#2d2d2d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="nb-card overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b-2 border-[#2d2d2d] bg-[#2d2d2d]">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] text-white/60"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
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
                className={`min-h-24 border-r-2 border-b-2 border-[#2d2d2d]/10 p-1.5 ${
                  i % 7 === 6 ? "border-r-0" : ""
                } ${day ? "bg-white" : "bg-[#f5f4f0]"}`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-md text-xs font-black ${
                        isToday
                          ? "border-2 border-[#2d2d2d] bg-primary text-white shadow-[1px_1px_0_#2d2d2d]"
                          : "text-[#2d2d2d]/60"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {items.slice(0, 3).map((item) => {
                        const st = CONTENT_STATUS[item.status];
                        return (
                          <Link
                            key={item.id}
                            href={`/dashboard/konten/${item.id}`}
                            className="group/ev block overflow-hidden rounded border-2 border-black/25 px-1.5 py-0.5 text-[9px] font-black leading-tight text-white shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition-all hover:opacity-90 hover:shadow-none"
                            style={{ backgroundColor: st.color }}
                            title={`${item.title} · ${PLATFORM_LABEL[item.platform]} · ${st.label}`}
                          >
                            <span className="line-clamp-1">{item.title}</span>
                          </Link>
                        );
                      })}
                      {items.length > 3 && (
                        <p className="px-1 text-[9px] font-black text-muted-foreground">
                          +{items.length - 3}
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

      {/* Legend */}
      <div className="nb-card overflow-hidden">
        <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-4 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
            Legenda Status
          </p>
        </div>
        <div className="flex flex-wrap gap-3 p-4">
          {Object.entries(CONTENT_STATUS).map(([key, meta]) => (
            <span
              key={key}
              className="flex items-center gap-2 rounded-lg border-2 border-[#2d2d2d] bg-[#f5f4f0] px-3 py-1.5 text-xs font-black text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d]"
            >
              <span
                className="size-3 shrink-0 rounded-sm border-2 border-[#2d2d2d]"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}
            </span>
          ))}
        <span className="ml-auto self-center text-[10px] font-semibold text-muted-foreground">
          {Object.values(CONTENT_TYPE_LABEL).join(" · ")}
        </span>
        </div>
      </div>
    </div>
  );
}
