import { prisma } from "@/lib/prisma";
import { CreateContentForm } from "./create-content-form";
import { ContentList } from "./content-list";

export default async function AdminKontenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const [clients, contents] = await Promise.all([
    prisma.client.findMany({ orderBy: { businessName: "asc" } }),
    prisma.content.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { scheduledAt: "desc" },
      include: { client: true },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Konten</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat konten dan kirim ke klien untuk approval.
        </p>
      </div>

      <CreateContentForm clients={clients} />

      <ContentList contents={contents} clients={clients} />
    </div>
  );
}
