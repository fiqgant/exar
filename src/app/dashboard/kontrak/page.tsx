import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { PAYMENT_STATUS, daysUntil, formatDate, rupiah } from "@/lib/format";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileSignature } from "lucide-react";

export default async function KontrakPage() {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client)
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;

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
  const expiringSoon =
    remaining !== null && remaining <= 30 && remaining >= 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          ● Kontrak
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#2d2d2d]">
          Kontrak
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Detail kerja sama, masa berlaku, dan perpanjangan.
        </p>
      </div>

      {expiringSoon && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-amber-500 bg-amber-50 p-4 shadow-[4px_4px_0_#f59e0b]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">
              Kontrak Anda berakhir dalam{" "}
              <span className="text-amber-900 underline decoration-amber-600 underline-offset-2">
                {remaining} hari
              </span>
              . Perpanjang sekarang!
            </p>
          </div>
          <a
            href="#perpanjang"
            className="rounded-lg border-2 border-amber-700 bg-amber-500 px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0_#92400e] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#92400e] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Perpanjang →
          </a>
        </div>
      )}

      {active ? (
        <div className="nb-card overflow-hidden">
          <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSignature className="size-5 text-white/70" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    Paket Aktif
                  </p>
                  <h2 className="text-lg font-black text-white">
                    {active.packageName}
                  </h2>
                </div>
              </div>
              <span
                className={`rounded-lg border-2 border-current px-3 py-1 text-xs font-black ${PAYMENT_STATUS[active.paymentStatus].className}`}
              >
                {PAYMENT_STATUS[active.paymentStatus].label}
              </span>
            </div>
          </div>
          <div className="p-6">
            <p className="mb-5 text-sm text-muted-foreground">
              {active.services}
            </p>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Tanggal Mulai", value: formatDate(active.startDate) },
                {
                  label: "Tanggal Berakhir",
                  value: formatDate(active.endDate),
                },
                {
                  label: "Sisa Masa",
                  value:
                    remaining !== null && remaining > 0
                      ? `${remaining} hari`
                      : "Berakhir",
                },
                { label: "Nilai Kontrak", value: rupiah(active.value) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border-2 border-[#2d2d2d] bg-[#f5f4f0] p-3 shadow-[2px_2px_0_#2d2d2d]"
                >
                  <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 font-black text-[#2d2d2d]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <div className="nb-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada kontrak aktif.
          </p>
        </div>
      )}

      {contracts.length > 1 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#2d2d2d]">
            <span className="block h-4 w-1 rounded-sm bg-primary" />
            Riwayat Kerja Sama
          </h2>
          <div className="nb-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] text-left text-[10px] font-black uppercase tracking-widest text-white/70">
                  <th className="px-5 py-3">Paket</th>
                  <th className="px-5 py-3">Periode</th>
                  <th className="px-5 py-3">Nilai</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b-2 border-[#2d2d2d]/10 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#f5f4f0]"}`}
                  >
                    <td className="px-5 py-3 font-bold text-[#2d2d2d]">
                      {c.packageName}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {formatDate(c.startDate)} – {formatDate(c.endDate)}
                    </td>
                    <td className="px-5 py-3 font-black text-primary">
                      {rupiah(c.value)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-md border border-current px-2.5 py-1 text-[10px] font-black ${PAYMENT_STATUS[c.paymentStatus].className}`}
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

      <div id="perpanjang" className="scroll-mt-24">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#2d2d2d]">
          <span className="block h-4 w-1 rounded-sm bg-emerald-500" />
          Pilihan Paket Perpanjangan
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col rounded-xl border-2 p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                pkg.recommended
                  ? "border-primary bg-primary/5 shadow-[4px_4px_0_#b42424] hover:shadow-[6px_6px_0_#b42424]"
                  : "border-[#2d2d2d] bg-white shadow-[4px_4px_0_#2d2d2d] hover:shadow-[6px_6px_0_#2d2d2d]"
              }`}
            >
              {pkg.recommended && (
                <span className="mb-3 w-fit rounded-md border-2 border-primary bg-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  ★ Rekomendasi
                </span>
              )}
              <h3 className="text-lg font-black text-[#2d2d2d]">{pkg.name}</h3>
              <p className="mt-1 text-2xl font-black text-primary">
                {rupiah(pkg.price)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pkg.videoReelsCount} Reels · {pkg.feedsDesignCount} Feeds ·{" "}
                {pkg.produksiVisit}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                {pkg.managementInstagram && (
                  <span className="rounded bg-pink-100 px-1.5 py-0.5 font-black text-pink-700">
                    IG
                  </span>
                )}
                {pkg.managementTiktok && (
                  <span className="rounded bg-black/10 px-1.5 py-0.5 font-black">
                    TT
                  </span>
                )}
                {pkg.managementFacebook && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-black text-blue-700">
                    FB
                  </span>
                )}
                {pkg.freeFotoProduk && (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                )}
              </div>
              <a
                href={`mailto:hello@exarproject.id?subject=Perpanjangan%20Kontrak%20${encodeURIComponent(pkg.name)}`}
                className={`mt-4 rounded-lg border-2 px-4 py-2.5 text-center text-sm font-black transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  pkg.recommended
                    ? "border-primary bg-primary text-white shadow-[2px_2px_0_#8f1c1c] hover:bg-primary/90"
                    : "border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] hover:bg-[#f5f4f0]"
                }`}
              >
                Pilih Paket →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
