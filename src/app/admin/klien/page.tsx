import { prisma } from "@/lib/prisma";
import { CreateClientForm } from "./create-client-form";
import { ClientTable } from "./client-table";

export default async function AdminKlienPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contracts: { where: { isActive: true }, take: 1 },
      _count: { select: { contents: true, leads: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Klien</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tambah dan kelola seluruh klien EXAR.
        </p>
      </div>

      <CreateClientForm />

      <ClientTable clients={clients} />
    </div>
  );
}
