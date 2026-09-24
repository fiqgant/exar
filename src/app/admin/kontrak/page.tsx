import { prisma } from "@/lib/prisma";
import { daysUntil, rupiah } from "@/lib/format";
import { ContractList } from "./contract-list";

export default async function AdminKontrakPage() {
  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true },
    take: 200,
  });

  const totalValue = contracts
    .filter((c) => c.isActive)
    .reduce((sum, c) => sum + c.value, 0);
  const expiring = contracts.filter((c) => {
    const d = daysUntil(c.endDate);
    return d >= 0 && d <= 30 && c.isActive;
  });
  const pendingVerification = contracts.filter((c) => !c.isActive && !!c.paymentProofUrl);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Kontrak</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Total nilai aktif: <strong>{rupiah(totalValue)}</strong>
          {expiring.length > 0 && ` · ${expiring.length} segera berakhir`}
          {pendingVerification.length > 0 && ` · ${pendingVerification.length} menunggu verifikasi bukti transfer`}
        </p>
      </div>

      <ContractList contracts={contracts} />
    </div>
  );
}
