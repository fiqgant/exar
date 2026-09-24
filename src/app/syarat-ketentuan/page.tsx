import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function SyaratKetentuanPage() {
  const terms = await prisma.termsCondition.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 text-2xl font-bold">Syarat dan Ketentuan</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Semua syarat dan ketentuan dapat berubah sewaktu-waktu.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          {terms.map((term) => (
            <li key={term.id}>{term.content}</li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
