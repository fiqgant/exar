import { prisma } from "@/lib/prisma";
import { PackageManager } from "./package-manager";

export default async function AdminPaketPage() {
  const packages = await prisma.package.findMany({ orderBy: { order: "asc" } });

  return <PackageManager packages={packages} />;
}

