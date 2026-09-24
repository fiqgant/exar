import { CircleAlert, CircleCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUserAccount } from "./actions";
import { UserTable } from "./user-table";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [users, me, allClients, { error, success }] = await Promise.all([
    prisma.profile.findMany({ orderBy: { createdAt: "asc" } }),
    getCurrentProfile(),
    prisma.client.findMany({
      select: { id: true, businessName: true, profileId: true },
      orderBy: { businessName: "asc" },
    }),
    searchParams,
  ]);

  const usersWithClients = users.map((u) => {
    const linkedClient = allClients.find((c) => c.profileId === u.id);
    return {
      ...u,
      clientId: linkedClient?.id ?? null,
      businessName: linkedClient?.businessName ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola akun pengguna, edit kredensial/password, tautkan ke bisnis klien, atau ubah role.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-700">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <span>User baru berhasil dibuat dan langsung aktif.</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buat User Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createUserAccount}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" name="email" type="email" placeholder="user@contoh.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                placeholder="Min. 6 karakter"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <select
                id="new-role"
                name="role"
                defaultValue="CLIENT"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-client">Tautkan Bisnis (Opsional)</Label>
              <select
                id="new-client"
                name="clientId"
                defaultValue="none"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="none">— Tidak ditautkan —</option>
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} {c.profileId ? "(Sudah ada akun)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">Buat Akun</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UserTable
        users={usersWithClients}
        clients={allClients}
        currentUserId={me?.id}
      />
    </div>
  );
}
