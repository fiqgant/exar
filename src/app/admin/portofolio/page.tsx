import { prisma } from "@/lib/prisma";
import { CreatePortfolioForm } from "./create-portfolio-form";
import { PortfolioList } from "./portfolio-list";

export default async function AdminPortofolioPage() {
  const items = await prisma.portfolio.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portofolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola portofolio dan hasil karya EXAR yang tampil di halaman publik.
        </p>
      </div>

      <CreatePortfolioForm />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Daftar Portofolio ({items.length})
          </h2>
        </div>
        <PortfolioList items={items} />
      </div>
    </div>
  );
}
