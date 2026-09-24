import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { ContentApproval } from "@/components/content-approval";
import { ContentMediaPreview } from "@/components/content-media-preview";
import {
  CONTENT_STATUS,
  PLATFORM_LABEL,
  formatDate,
  formatDateTime,
} from "@/lib/format";

export default async function ContentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client) notFound();

  const { id } = await params;
  const content = await prisma.content.findFirst({
    where: { id, clientId: client.id },
    include: { revisions: { orderBy: { createdAt: "desc" } } },
  });

  if (!content) notFound();

  const meta = CONTENT_STATUS[content.status];
  const canDecide =
    content.status === "DRAFT" ||
    content.status === "SCHEDULED" ||
    content.status === "REVISION";

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/konten"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Kembali ke Content Management
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ContentMediaPreview
            imageUrl={content.imageUrl}
            videoUrl={content.videoUrl}
            previewColor={content.previewColor}
            type={content.type}
            title={content.title}
          />

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
              >
                {meta.label}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                {PLATFORM_LABEL[content.platform]}
              </span>
              <span className="text-xs text-muted-foreground">
                Jadwal: {formatDate(content.scheduledAt)}
              </span>
            </div>

            <h1 className="mt-4 text-xl font-bold">{content.title}</h1>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-muted-foreground">Caption</dt>
                <dd className="mt-1 whitespace-pre-wrap">{content.caption}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Hashtag</dt>
                <dd className="mt-1 text-primary">{content.hashtags || "-"}</dd>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    Content Objective
                  </dt>
                  <dd className="mt-1">{content.objective || "-"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    Strategi Konten
                  </dt>
                  <dd className="mt-1">{content.strategy || "-"}</dd>
                </div>
              </div>
            </dl>

            {content.rejectReason && (
              <div className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
                <span className="font-semibold">Alasan penolakan: </span>
                {content.rejectReason}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">Keputusan Anda</h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">
              Setujui, minta revisi, atau tolak konten ini.
            </p>
            {canDecide ? (
              <ContentApproval contentId={content.id} status={meta.label} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Konten berstatus <strong>{meta.label}</strong> — tidak ada aksi
                yang diperlukan.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Clock className="size-4 text-primary" /> Riwayat Revisi
            </h2>
            {content.revisions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada riwayat.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {content.revisions.map((rev) => (
                  <li
                    key={rev.id}
                    className="relative border-l border-border pl-4"
                  >
                    <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-primary" />
                    <p className="text-xs font-semibold text-primary">
                      {rev.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(rev.createdAt)} · {rev.actor}
                    </p>
                    {rev.note && <p className="mt-1 text-sm">{rev.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
