"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Receipt,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PAYMENT_STATUS, daysUntil, formatDate, rupiah } from "@/lib/format";
import { confirmContractPayment, updateContract, deleteContract } from "./actions";

export type ContractItem = {
  id: string;
  clientId: string;
  packageName: string;
  services: string;
  startDate: Date;
  endDate: Date;
  value: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  paymentProofUrl?: string | null;
  notes?: string | null;
  isActive: boolean;
  client: {
    id: string;
    businessName: string;
    contactName: string;
    email?: string | null;
    phone?: string | null;
  };
};

export function ContractList({ contracts }: { contracts: ContractItem[] }) {
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "ACTIVE" | "INACTIVE">("ALL");

  // State for modals
  const [viewProofItem, setViewProofItem] = useState<ContractItem | null>(null);
  const [editingItem, setEditingItem] = useState<ContractItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ContractItem | null>(null);

  const [isConfirming, startConfirmTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const filtered = contracts.filter((c) => {
    if (activeTab === "PENDING") return !c.isActive && !!c.paymentProofUrl;
    if (activeTab === "ACTIVE") return c.isActive;
    if (activeTab === "INACTIVE") return !c.isActive;
    return true;
  });

  const pendingCount = contracts.filter((c) => !c.isActive && !!c.paymentProofUrl).length;

  const handleConfirmPayment = (id: string) => {
    startConfirmTransition(async () => {
      const res = await confirmContractPayment(id);
      if (res.success) {
        toast.success("Pembayaran berhasil dikonfirmasi! Kontrak kini aktif.");
        setViewProofItem(null);
      } else {
        toast.error(res.error || "Gagal mengonfirmasi pembayaran");
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const formData = new FormData(e.currentTarget);
    startUpdateTransition(async () => {
      const res = await updateContract(editingItem.id, formData);
      if (res.success) {
        toast.success("Data kontrak berhasil diperbarui");
        setEditingItem(null);
      } else {
        toast.error(res.error || "Gagal memperbarui kontrak");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingItem) return;

    startDeleteTransition(async () => {
      const res = await deleteContract(deletingItem.id);
      if (res.success) {
        toast.success("Kontrak berhasil dihapus");
        setDeletingItem(null);
      } else {
        toast.error(res.error || "Gagal menghapus kontrak");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Semua ({contracts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "PENDING"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Menunggu Verifikasi TF
            {pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "ACTIVE"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Aktif ({contracts.filter((c) => c.isActive).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INACTIVE")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "INACTIVE"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Nonaktif ({contracts.filter((c) => !c.isActive).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Klien</th>
                <th className="px-4 py-3 font-semibold">Paket</th>
                <th className="px-4 py-3 font-semibold">Periode</th>
                <th className="px-4 py-3 font-semibold">Nilai</th>
                <th className="px-4 py-3 font-semibold">Status Bayar</th>
                <th className="px-4 py-3 font-semibold">Status Kontrak</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const remaining = daysUntil(c.endDate);
                const soon = remaining >= 0 && remaining <= 30 && c.isActive;

                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.client.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.client.contactName} · {c.client.phone ?? c.client.email ?? "-"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium">{c.packageName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.services}</p>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <p>{formatDate(c.startDate)} – {formatDate(c.endDate)}</p>
                      {soon && (
                        <span className="text-[11px] font-semibold text-amber-600">
                          Sisa {remaining} hari
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold text-primary">
                      {rupiah(c.value)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAYMENT_STATUS[c.paymentStatus].className}`}>
                          {PAYMENT_STATUS[c.paymentStatus].label}
                        </span>
                        {c.paymentProofUrl && (
                          <button
                            type="button"
                            onClick={() => setViewProofItem(c)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                          >
                            <Receipt className="size-3" />
                            Bukti Transfer
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.isActive ? "Aktif" : "Belum Aktif"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick confirm button if has payment proof and inactive */}
                        {c.paymentProofUrl && !c.isActive && (
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => handleConfirmPayment(c.id)}
                            disabled={isConfirming}
                            className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                            title="Konfirmasi & Aktifkan Kontrak"
                          >
                            <CheckCircle className="size-3.5 mr-1" />
                            Aktifkan
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(c)}
                          className="h-7 px-2 text-xs"
                          title="Edit Kontrak"
                        >
                          <Pencil className="size-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingItem(c)}
                          className="h-7 px-2 text-xs"
                          title="Hapus Kontrak"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Tidak ada kontrak pada tab ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Bukti Transfer Dialog */}
      <Dialog open={!!viewProofItem} onOpenChange={(open) => !open && setViewProofItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bukti Transfer Pembayaran</DialogTitle>
            <DialogDescription>
              Klien: {viewProofItem?.client.businessName} · Paket: {viewProofItem?.packageName} ({viewProofItem ? rupiah(viewProofItem.value) : ""})
            </DialogDescription>
          </DialogHeader>

          {viewProofItem?.paymentProofUrl && (
            <div className="space-y-4 pt-2">
              <div className="relative max-h-[60vh] min-h-[250px] w-full overflow-hidden rounded-xl border border-border bg-black/90 flex items-center justify-center p-2">
                <Image
                  src={viewProofItem.paymentProofUrl}
                  alt="Bukti Transfer"
                  width={800}
                  height={1000}
                  unoptimized
                  className="max-h-[58vh] w-auto max-w-full object-contain rounded-lg"
                />
              </div>

              {viewProofItem.notes && (
                <div className="rounded-lg bg-muted p-3 text-xs">
                  <span className="font-semibold text-foreground">Catatan Klien:</span>
                  <p className="mt-1 text-muted-foreground">{viewProofItem.notes}</p>
                </div>
              )}

              <DialogFooter className="gap-2 sm:justify-between">
                <a
                  href={viewProofItem.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-3.5" /> Buka gambar di tab baru
                </a>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setViewProofItem(null)}
                  >
                    Tutup
                  </Button>
                  {!viewProofItem.isActive && (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isConfirming}
                      onClick={() => handleConfirmPayment(viewProofItem.id)}
                    >
                      {isConfirming && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                      Konfirmasi & Aktifkan
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Contract Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Kontrak</DialogTitle>
            <DialogDescription>
              Ubah rincian kontrak untuk {editingItem?.client.businessName}.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-packageName">Nama Paket</Label>
                  <Input
                    id="edit-packageName"
                    name="packageName"
                    defaultValue={editingItem.packageName}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-services">Layanan Termasuk</Label>
                  <Input
                    id="edit-services"
                    name="services"
                    defaultValue={editingItem.services}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-startDate">Tanggal Mulai</Label>
                  <Input
                    id="edit-startDate"
                    name="startDate"
                    type="date"
                    defaultValue={new Date(editingItem.startDate).toISOString().split("T")[0]}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-endDate">Tanggal Berakhir</Label>
                  <Input
                    id="edit-endDate"
                    name="endDate"
                    type="date"
                    defaultValue={new Date(editingItem.endDate).toISOString().split("T")[0]}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-value">Nilai Kontrak (Rp)</Label>
                  <Input
                    id="edit-value"
                    name="value"
                    type="number"
                    defaultValue={editingItem.value}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-paymentStatus">Status Pembayaran</Label>
                  <select
                    id="edit-paymentStatus"
                    name="paymentStatus"
                    defaultValue={editingItem.paymentStatus}
                    disabled={isUpdating}
                    className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="UNPAID">Belum Dibayar (UNPAID)</option>
                    <option value="PARTIAL">Dibayar Sebagian (PARTIAL)</option>
                    <option value="PAID">Lunas (PAID)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-notes">Catatan Kontrak</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    defaultValue={editingItem.notes ?? ""}
                    rows={2}
                    disabled={isUpdating}
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label htmlFor="edit-isActive" className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      id="edit-isActive"
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingItem.isActive}
                      disabled={isUpdating}
                      className="size-4 rounded accent-primary"
                    />
                    <span>Kontrak Aktif (klien dapat mengakses workspace)</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={isUpdating}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Kontrak?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kontrak <strong>{deletingItem?.packageName}</strong> untuk klien <strong>{deletingItem?.client.businessName}</strong>? Data ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeletingItem(null)}>
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Hapus Kontrak
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
