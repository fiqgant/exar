"use client";

import { useState, useTransition } from "react";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  Plus,
  Package as PackageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { rupiah } from "@/lib/format";
import { createPackage, updatePackage, deletePackage } from "./actions";

export type PackageItem = {
  id: string;
  name: string;
  price: number;
  recommended: boolean;
  freeFotoProduk: boolean;
  managementInstagram: boolean;
  managementTiktok: boolean;
  managementFacebook: boolean;
  professionalTallent: boolean;
  videoReelsCount: number;
  feedsDesignCount: number;
  produksiVisit: string;
  order: number;
  isActive: boolean;
};

const CHECKBOXES: { name: string; label: string }[] = [
  { name: "freeFotoProduk", label: "Free Foto Produk" },
  { name: "managementInstagram", label: "Management Instagram" },
  { name: "managementTiktok", label: "Management TikTok" },
  { name: "managementFacebook", label: "Management Facebook" },
  { name: "professionalTallent", label: "Professional Tallent" },
  { name: "recommended", label: "Tandai Rekomendasi" },
  { name: "isActive", label: "Aktif (tampil di landing page)" },
];

export function PackageManager({ packages }: { packages: PackageItem[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<PackageItem | null>(null);

  const [isCreating, startCreateTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startCreateTransition(async () => {
      const res = await createPackage(formData);
      if (res.success) {
        toast.success("Paket baru berhasil ditambahkan");
        setIsAddOpen(false);
      } else {
        toast.error(res.error || "Gagal menambahkan paket");
      }
    });
  };

  const handleUpdate = (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startUpdateTransition(async () => {
      const res = await updatePackage(id, formData);
      if (res.success) {
        toast.success("Perubahan paket berhasil disimpan");
      } else {
        toast.error(res.error || "Gagal menyimpan perubahan");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingPackage) return;
    startDeleteTransition(async () => {
      const res = await deletePackage(deletingPackage.id);
      if (res.success) {
        toast.success("Paket berhasil dihapus");
        setDeletingPackage(null);
      } else {
        toast.error(res.error || "Gagal menghapus paket");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paket Layanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola pilihan paket dan harga yang ditampilkan di landing page.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="size-4" />
          Tambah Paket Baru
        </Button>
      </div>

      {/* Package List */}
      <div className="grid gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-secondary/30 pb-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                <div className="flex items-center gap-1.5">
                  {pkg.recommended && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Rekomendasi
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      pkg.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pkg.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">
                  {rupiah(pkg.price)}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletingPackage(pkg)}
                  className="h-8 px-2.5 text-xs"
                  title="Hapus Paket"
                >
                  <Trash2 className="size-3.5" />
                  <span className="hidden sm:inline ml-1.5">Hapus</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={(e) => handleUpdate(pkg.id, e)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${pkg.id}`}>Nama Paket</Label>
                    <Input
                      id={`name-${pkg.id}`}
                      name="name"
                      defaultValue={pkg.name}
                      required
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${pkg.id}`}>Harga (Rp)</Label>
                    <Input
                      id={`price-${pkg.id}`}
                      name="price"
                      type="number"
                      defaultValue={pkg.price}
                      required
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`reels-${pkg.id}`}>Jumlah Video Reels</Label>
                    <Input
                      id={`reels-${pkg.id}`}
                      name="videoReelsCount"
                      type="number"
                      defaultValue={pkg.videoReelsCount}
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`design-${pkg.id}`}>Jumlah Feeds Design</Label>
                    <Input
                      id={`design-${pkg.id}`}
                      name="feedsDesignCount"
                      type="number"
                      defaultValue={pkg.feedsDesignCount}
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`visit-${pkg.id}`}>Produksi (kunjungan)</Label>
                    <Input
                      id={`visit-${pkg.id}`}
                      name="produksiVisit"
                      defaultValue={pkg.produksiVisit}
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 pt-2 border-t border-border">
                  {CHECKBOXES.map(({ name, label }) => (
                    <label
                      key={name}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                      htmlFor={`${name}-${pkg.id}`}
                    >
                      <input
                        id={`${name}-${pkg.id}`}
                        name={name}
                        type="checkbox"
                        defaultChecked={Boolean(pkg[name as keyof typeof pkg])}
                        disabled={isUpdating}
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" size="sm" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}

        {packages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <PackageIcon className="mx-auto size-10 opacity-30" />
            <p className="mt-2 font-medium">Belum ada paket layanan.</p>
            <p className="text-xs">Klik tombol Tambah Paket Baru untuk membuat paket.</p>
          </div>
        )}
      </div>

      {/* Add Package Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Paket Baru</DialogTitle>
            <DialogDescription>
              Buat paket penawaran baru yang dapat dipilih klien.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-name">Nama Paket</Label>
                <Input
                  id="add-name"
                  name="name"
                  placeholder="Misal: Growth Plus"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-price">Harga (Rp)</Label>
                <Input
                  id="add-price"
                  name="price"
                  type="number"
                  placeholder="3000000"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-reels">Jumlah Video Reels</Label>
                <Input
                  id="add-reels"
                  name="videoReelsCount"
                  type="number"
                  defaultValue="15"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-design">Jumlah Feeds Design</Label>
                <Input
                  id="add-design"
                  name="feedsDesignCount"
                  type="number"
                  defaultValue="15"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-visit">Produksi (kunjungan)</Label>
                <Input
                  id="add-visit"
                  name="produksiVisit"
                  defaultValue="2x visit produksi"
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 pt-2 border-t border-border">
              {CHECKBOXES.map(({ name, label }) => (
                <label
                  key={name}
                  className="flex items-center gap-2 text-sm cursor-pointer select-none"
                  htmlFor={`add-${name}`}
                >
                  <input
                    id={`add-${name}`}
                    name={name}
                    type="checkbox"
                    defaultChecked={name === "isActive" || name.startsWith("management")}
                    disabled={isCreating}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                disabled={isCreating}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                Tambah Paket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Package Alert Dialog */}
      <AlertDialog
        open={!!deletingPackage}
        onOpenChange={(open) => !open && setDeletingPackage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus paket &quot;
              {deletingPackage?.name}&quot;? Kontrak yang sudah ada akan tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeletingPackage(null)}
            >
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Hapus Paket
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
