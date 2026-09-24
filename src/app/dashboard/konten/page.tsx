import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import {
  CONTENT_STATUS,
  CONTENT_TYPE_LABEL,
  PLATFORM_LABEL,
  formatDate,
} from "@/lib/format";

const TABS = [
  { key: "ALL", label: "Semua" },
  { key: "DRAFT", label: "Draft" },
  { key: "SCHEDULED", label: "Waiting Approval" },
  { key: "REVISION", label: "Revision" },
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
  if (!client) {
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;
  }

  const { status = "ALL" } = await searchParams;

  const [all, filtered] = await Promise.all([
    prisma.content.findMany({ where: { clientId: client.id } }),
    prisma.content.findMany({
      where: {
        clientId: client.id,
        ...(status !== "ALL" ? { status: status as never } : {}),
      },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tinjau, setujui, atau minta revisi untuk setiap konten.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count =
            tab.key === "ALL"
              ? all.length
              : all.filter((c) => c.status === tab.key).length;
          const active = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/dashboard/konten?status=${tab.key}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Tidak ada konten pada kategori ini.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const meta = CONTENT_STATUS[item.status];
            return (
              <Link
                key={item.id}
                href={`/dashboard/konten/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className="relative flex h-36 items-center justify-center overflow-hidden bg-muted"
                  style={{ backgroundColor: item.imageUrl ? undefined : item.previewColor }}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.videoUrl ? (
                    <div className="flex h-full w-full items-center justify-center bg-black/90 text-white">
                      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm">
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                        <span>Video Preview</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-dots text-white/40 opacity-60" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                    {CONTENT_TYPE_LABEL[item.type]} ·{" "}
                    {PLATFORM_LABEL[item.platform]}
                  </span>

                  {item.videoUrl && item.imageUrl && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md flex items-center gap-1">
                      ▶ Video
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(item.scheduledAt)}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 font-medium">{item.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.caption}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
