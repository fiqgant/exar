import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import {
  CONTENT_STATUS,
  CONTENT_TYPE_LABEL,
  PLATFORM_LABEL,
  formatDate,
  isYouTubeUrl,
  getYouTubeThumbnailUrl,
} from "@/lib/format";

const TABS = [
  { key: "ALL", label: "Semua" },
  { key: "DRAFT", label: "Draft" },
  { key: "SCHEDULED", label: "Review" },
  { key: "REVISION", label: "Revisi" },
  { key: "APPROVED", label: "Approved" },
  { key: "PUBLISHED", label: "Published" },
] as const;

export default async function KontenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client) return <p className="text-muted-foreground">Workspace belum tersedia.</p>;

  const { status = "ALL" } = await searchParams;

  const [all, filtered] = await Promise.all([
    prisma.content.findMany({ where: { clientId: client.id } }),
    prisma.content.findMany({
      where: { clientId: client.id, ...(status !== "ALL" ? { status: status as never } : {}) },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">\u25cf Content</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#2d2d2d]">Content Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tinjau, setujui, atau minta revisi untuk setiap konten.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count = tab.key === "ALL" ? all.length : all.filter((c) => c.status === tab.key).length;
          const active = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/dashboard/konten?status=${tab.key}`}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-black transition-all ${
                active
                  ? "border-[#2d2d2d] bg-[#2d2d2d] text-white shadow-[3px_3px_0_#b42424]"
                  : "border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#2d2d2d]"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs ${active ? "text-white/70" : "text-muted-foreground"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Tidak ada konten pada kategori ini.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const meta = CONTENT_STATUS[item.status];
            return (
              <Link
                key={item.id}
                href={`/dashboard/konten/${item.id}`}
                className="group nb-card overflow-hidden hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2d2d2d]"
              >
                <div
                  className="relative flex h-40 items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor:
                      item.imageUrl || (item.videoUrl && isYouTubeUrl(item.videoUrl))
                        ? undefined
                        : item.previewColor,
                  }}
                >
                  {item.imageUrl || (item.videoUrl && isYouTubeUrl(item.videoUrl)) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl || getYouTubeThumbnailUrl(item.videoUrl)!}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.videoUrl ? (
                    <div className="flex h-full w-full items-center justify-center bg-black/90 text-white">
                      <span className="rounded-lg border-2 border-white/30 bg-white/10 px-3 py-1 text-xs font-black backdrop-blur-sm">\u25b6 Video</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-dots text-white/40 opacity-60" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 rounded-md border border-white/30 bg-black/60 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-md">
                    {CONTENT_TYPE_LABEL[item.type]} \u00b7 {PLATFORM_LABEL[item.platform]}
                  </span>
                  {item.videoUrl && isYouTubeUrl(item.videoUrl) && (
                    <span className="absolute top-2.5 right-2.5 rounded-md border border-red-500/50 bg-red-600/90 px-2 py-0.5 text-[10px] font-black text-white">
                      \u25b6 YouTube
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md border border-current px-2 py-0.5 text-[10px] font-black ${meta.className}`}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{formatDate(item.scheduledAt)}</span>
                  </div>
                  <h3 className="line-clamp-2 font-bold text-[#2d2d2d]">{item.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.caption}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
