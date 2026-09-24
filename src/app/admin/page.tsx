import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  FileSignature,
  Layers,
  RotateCcw,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { daysUntil, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ContractWithClient = Prisma.ContractGetPayload<{
  include: { client: true };
}>;

export default async function AdminRingkasanPage() {
  let clientCount = 0;
  let activeContracts = 0;
  let pendingApproval = 0;
  let revisions = 0;
  let leadCount = 0;
  let contracts: ContractWithClient[] = [];

  try {
    const res = await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.contract.count({ where: { isActive: true } }),
      prisma.content.count({ where: { status: "DRAFT" } }),
      prisma.content.count({ where: { status: "REVISION" } }),
      prisma.lead.count(),
      prisma.contract.findMany({
        where: { isActive: true },
        include: { client: true },
        orderBy: { endDate: "asc" },
      }),
    ]);
    clientCount = res[0];
    activeContracts = res[1];
    pendingApproval = res[2];
    revisions = res[3];
    leadCount = res[4];
    contracts = res[5] as typeof contracts;
  } catch (error) {
    console.error("Error fetching admin ringkasan:", error);
  }

  const expiring = contracts.filter((c) => {
    const d = daysUntil(c.endDate);
    return d >= 0 && d <= 30;
  });

  const stats = [
    { label: "Total Client", value: clientCount, icon: Building2 },
    { label: "Active Contract", value: activeContracts, icon: FileSignature },
    { label: "Content Pending Approval", value: pendingApproval, icon: Layers },
    { label: "Revision", value: revisions, icon: RotateCcw },
    { label: "Total Leads", value: leadCount, icon: Users },
    { label: "Contract Expiring", value: expiring.length, icon: CalendarClock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ringkasan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau seluruh aktivitas klien EXAR dari satu tempat.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Kontrak Akan Berakhir</h2>
            <Link
              href="/admin/kontrak"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Semua <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {expiring.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada kontrak yang berakhir dalam 30 hari.
            </p>
          ) : (
            <ul className="space-y-3">
              {expiring.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {c.client.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.packageName} · berakhir {formatDate(c.endDate)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    {daysUntil(c.endDate)} hari
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="font-semibold">Perlu Tindakan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Konten yang menunggu approval atau permintaan revisi dari klien.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/konten?status=DRAFT"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:border-primary/40"
            >
              {pendingApproval} menunggu approval
            </Link>
            <Link
              href="/admin/konten?status=REVISION"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:border-primary/40"
            >
              {revisions} perlu revisi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
