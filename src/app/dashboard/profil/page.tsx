import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "./actions";

export default async function ProfilPage() {
  const session = await getCurrentClient();
  const client = session?.client;
  if (!client) {
    return <p className="text-muted-foreground">Workspace belum tersedia.</p>;
  }

  const contract = await prisma.contract.findFirst({
    where: { clientId: client.id, isActive: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data bisnis dan informasi akun Anda.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form
            action={updateProfile}
            className="space-y-5 rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-semibold">Data Bisnis</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nama Bisnis</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={client.businessName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Jenis Bisnis</Label>
                <Input
                  id="businessType"
                  name="businessType"
                  defaultValue={client.businessType}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nama Kontak</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  defaultValue={client.contactName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={client.phone ?? ""}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client.email ?? ""}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={client.address ?? ""}
                />
              </div>
            </div>
            <Button type="submit">Simpan Perubahan</Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">Informasi Akun</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Email login</dt>
                <dd className="font-medium">{session.profile?.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Peran</dt>
                <dd className="font-medium">
                  {session.profile?.role === "ADMIN" ? "Admin" : "Client"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Paket aktif</dt>
                <dd className="font-medium">
                  {contract?.packageName ?? "Belum ada"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
