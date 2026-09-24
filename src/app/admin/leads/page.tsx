import { prisma } from "@/lib/prisma";
import { LeadList } from "./lead-list";

export default async function AdminLeadsPage() {
  const [clients, leads] = await Promise.all([
    prisma.client.findMany({
      orderBy: { businessName: "asc" },
      select: { id: true, businessName: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
      take: 200,
    }),
  ]);

  return <LeadList leads={leads} clients={clients} />;
}

