import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { LEAD_STATUS, formatDate, rupiah } from "@/lib/format";

const STAGES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "CONVERTED",
] as const;

export default async function LeadsPage() {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client) {
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;
  }

  const leads = await prisma.lead.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  const total = leads.length;
  const converted = leads.filter((l) => l.status === "CONVERTED").length;
  const followUp = leads.filter((l) => l.status === "FOLLOW_UP").length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  const stats = [
    { label: "Total Leads", value: total },
    { label: "Leads Baru", value: newLeads },
    { label: "Sedang Follow Up", value: followUp },
    { label: "Converted", value: converted },
    { label: "Conversion Rate", value: `${conversionRate}%` },
  ];

  const stageCount = (stage: string) =>
    leads.filter((l) => l.status === stage).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calon pelanggan yang berasal dari aktivitas digital Anda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {s.label}
            </p>
            <p className="mt-1.5 text-2xl font-extrabold text-primary">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Pipeline Leads</h2>
        <div className="grid gap-3 sm:grid-cols-5">
          {STAGES.map((stage, i) => {
            const meta = LEAD_STATUS[stage];
            const count = stageCount(stage);
            return (
              <div key={stage} className="relative">
                <div className="rounded-xl border border-border bg-secondary/50 p-3 text-center">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {meta.label}
                  </p>
                  <p className="mt-1 text-xl font-bold">{count}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <span className="absolute top-1/2 -right-2.5 hidden -translate-y-1/2 text-muted-foreground sm:block">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left">
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Sumber</th>
                <th className="px-4 py-3 font-semibold">Minat</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Potensi</th>
                <th className="px-4 py-3 font-semibold">Masuk</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const meta = LEAD_STATUS[lead.status];
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{lead.name}</p>
                      {lead.followUp && (
                        <p className="text-xs text-muted-foreground">
                          {lead.followUp}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.source}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.interest}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {rupiah(lead.potentialValue)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Belum ada leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
