import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS, daysUntil, formatDate, rupiah } from "@/lib/format";

export default async function KontrakPage() {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client) {
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;
  }

  const contracts = await prisma.contract.findMany({
    where: { clientId: client.id },
    orderBy: { startDate: "desc" },
  });
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const active = contracts.find((c) => c.isActive) ?? contracts[0];
  const remaining = active ? daysUntil(active.endDate) : null;
  const expiringSoon = remaining !== null && remaining <= 30 && remaining >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kontrak</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Detail kerja sama, masa berlaku, dan perpanjangan.
        </p>
      </div>

      {expiringSoon && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-700">
            Kontrak Anda akan berakhir dalam <strong>{remaining} hari</strong>.
            Perpanjang sekarang untuk menjaga konsistensi konten.
          </p>
          <Button
            size="sm"
            render={<a href="#perpanjang">Perpanjang Kontrak</a>}
          />
        </div>
      )}

      {active ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Paket Aktif
              </p>
              <h2 className="mt-1 text-xl font-bold">{active.packageName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {active.services}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${PAYMENT_STATUS[active.paymentStatus].className}`}
            >
              {PAYMENT_STATUS[active.paymentStatus].label}
            </span>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Tanggal Mulai</dt>
              <dd className="mt-1 font-medium">
                {formatDate(active.startDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Tanggal Berakhir
              </dt>
              <dd className="mt-1 font-medium">{formatDate(active.endDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sisa Masa</dt>
              <dd className="mt-1 font-medium">
                {remaining !== null && remaining > 0
                  ? `${remaining} hari`
                  : "Berakhir"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Nilai Kontrak</dt>
              <dd className="mt-1 font-semibold text-primary">
                {rupiah(active.value)}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Belum ada kontrak aktif.
        </p>
      )}

      {/* Riwayat */}
      {contracts.length > 1 && (
        <div>
          <h2 className="mb-4 font-semibold">Riwayat Kerja Sama</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Paket</th>
                  <th className="px-4 py-3 font-semibold">Periode</th>
                  <th className="px-4 py-3 font-semibold">Nilai</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{c.packageName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(c.startDate)} – {formatDate(c.endDate)}
                    </td>
                    <td className="px-4 py-3">{rupiah(c.value)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PAYMENT_STATUS[c.paymentStatus].className}`}
                      >
                        {PAYMENT_STATUS[c.paymentStatus].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Perpanjangan */}
      <div id="perpanjang" className="scroll-mt-24">
        <h2 className="mb-4 font-semibold">Pilihan Paket Perpanjangan</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col rounded-2xl border p-5 ${
                pkg.recommended
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {pkg.recommended && (
                <span className="mb-2 w-fit rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                  Rekomendasi
                </span>
              )}
              <h3 className="font-semibold">{pkg.name}</h3>
              <p className="mt-1 text-2xl font-extrabold text-primary">
                {rupiah(pkg.price)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pkg.videoReelsCount} Reels · {pkg.feedsDesignCount} Feeds ·{" "}
                {pkg.produksiVisit}
              </p>
              <Button
                className="mt-4 w-full"
                variant={pkg.recommended ? "default" : "outline"}
                render={
                  <a
                    href={`mailto:hello@exarproject.id?subject=Perpanjangan%20Kontrak%20${encodeURIComponent(pkg.name)}`}
                  >
                    Konfirmasi Perpanjangan
                  </a>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
