"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import { updateClient, deleteClient, toggleClientActive } from "./actions";

export type ClientItem = {
  id: string;
  businessName: string;
  businessType: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  contracts: { packageName: string }[];
  _count: { contents: number; leads: number };
};

export function ClientTable({ clients }: { clients: ClientItem[] }) {
  const [search, setSearch] = useState("");
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientItem | null>(null);

  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();

  const filtered = clients.filter((c) =>
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.businessType.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;

    const formData = new FormData(e.currentTarget);
    startUpdateTransition(async () => {
      const res = await updateClient(editingClient.id, formData);
      if (res.success) {
        toast.success("Data klien berhasil diperbarui");
        setEditingClient(null);
      } else {
        toast.error(res.error || "Gagal memperbarui klien");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingClient) return;

    startDeleteTransition(async () => {
      const res = await deleteClient(deletingClient.id);
      if (res.success) {
        toast.success("Klien berhasil dihapus");
        setDeletingClient(null);
      } else {
        toast.error(res.error || "Gagal menghapus klien");
      }
    });
  };

  const handleToggleActive = (c: ClientItem) => {
    startToggleTransition(async () => {
      const res = await toggleClientActive(c.id, !c.isActive);
      if (res.success) {
        toast.success(`Klien "${c.businessName}" ${c.isActive ? "dinonaktifkan" : "diaktifkan"}`);
      } else {
        toast.error(res.error || "Gagal mengubah status");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bisnis, kontak, atau email..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Bisnis</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Paket Aktif</th>
                <th className="px-4 py-3 font-semibold">Konten</th>
                <th className="px-4 py-3 font-semibold">Leads</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.businessName}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.businessType} · sejak {formatDate(c.createdAt)}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p>{c.contactName}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.email ?? c.phone ?? "-"}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {c.contracts[0]?.packageName ?? "—"}
                  </td>

                  <td className="px-4 py-3">{c._count.contents}</td>
                  <td className="px-4 py-3">{c._count.leads}</td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      disabled={isToggling}
                      title="Klik untuk mengubah status"
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-80 ${
                        c.isActive
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingClient(c)}
                        className="h-7 px-2 text-xs"
                        title="Edit Klien"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingClient(c)}
                        className="h-7 px-2 text-xs"
                        title="Hapus Klien"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    {clients.length === 0 ? "Belum ada klien terdaftar." : "Tidak ada klien yang cocok dengan pencarian."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Client Modal */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Klien</DialogTitle>
            <DialogDescription>
              Ubah data bisnis dan kontak untuk {editingClient?.businessName}.
            </DialogDescription>
          </DialogHeader>

          {editingClient && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="client-businessName">Nama Bisnis</Label>
                  <Input
                    id="client-businessName"
                    name="businessName"
                    defaultValue={editingClient.businessName}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="client-businessType">Jenis Bisnis</Label>
                  <Input
                    id="client-businessType"
                    name="businessType"
                    defaultValue={editingClient.businessType}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="client-contactName">Nama Kontak</Label>
                  <Input
                    id="client-contactName"
                    name="contactName"
                    defaultValue={editingClient.contactName}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="client-phone">No. HP / WhatsApp</Label>
                  <Input
                    id="client-phone"
                    name="phone"
                    defaultValue={editingClient.phone ?? ""}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    name="email"
                    type="email"
                    defaultValue={editingClient.email ?? ""}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="client-address">Alamat</Label>
                  <Input
                    id="client-address"
                    name="address"
                    defaultValue={editingClient.address ?? ""}
                    disabled={isUpdating}
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label htmlFor="client-isActive" className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      id="client-isActive"
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingClient.isActive}
                      disabled={isUpdating}
                      className="size-4 rounded accent-primary"
                    />
                    <span>Klien Aktif</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingClient(null)}
                  disabled={isUpdating}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Client Alert Dialog */}
      <AlertDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Klien?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus klien <strong>{deletingClient?.businessName}</strong>? Seluruh data kontrak, konten, dan leads milik klien ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeletingClient(null)}>
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Hapus Klien
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
