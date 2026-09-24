"use client";

import { useState, useTransition } from "react";
import {
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Search,
  Plus,
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
import { LEAD_STATUS, formatDate, rupiah } from "@/lib/format";
import { createLead, updateLead, deleteLead } from "./actions";

export type LeadItem = {
  id: string;
  clientId: string;
  name: string;
  source: string;
  interest: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "QUALIFIED" | "CONVERTED";
  followUp?: string | null;
  potentialValue: number;
  createdAt: Date | string;
  client: {
    id: string;
    businessName: string;
  };
};

type ClientOption = {
  id: string;
  businessName: string;
};

export function LeadList({
  leads,
  clients,
}: {
  leads: LeadItem[];
  clients: ClientOption[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadItem | null>(null);

  const [isCreating, startCreateTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const statuses = [
    { key: "ALL", label: "Semua" },
    { key: "NEW", label: "Baru" },
    { key: "CONTACTED", label: "Dihubungi" },
    { key: "FOLLOW_UP", label: "Follow Up" },
    { key: "QUALIFIED", label: "Qualified" },
    { key: "CONVERTED", label: "Closing / Converted" },
  ];

  const filtered = leads.filter((lead) => {
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.interest.toLowerCase().includes(search.toLowerCase()) ||
      lead.source.toLowerCase().includes(search.toLowerCase()) ||
      lead.client.businessName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalFilteredValue = filtered.reduce(
    (sum, l) => sum + l.potentialValue,
    0
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startCreateTransition(async () => {
      const res = await createLead(formData);
      if (res.success) {
        toast.success("Lead baru berhasil ditambahkan");
        setIsAddOpen(false);
      } else {
        toast.error(res.error || "Gagal menambahkan lead");
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;

    const formData = new FormData(e.currentTarget);
    startUpdateTransition(async () => {
      const res = await updateLead(editingLead.id, formData);
      if (res.success) {
        toast.success("Data lead berhasil diperbarui");
        setEditingLead(null);
      } else {
        toast.error(res.error || "Gagal memperbarui lead");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingLead) return;

    startDeleteTransition(async () => {
      const res = await deleteLead(deletingLead.id);
      if (res.success) {
        toast.success("Lead berhasil dihapus");
        setDeletingLead(null);
      } else {
        toast.error(res.error || "Gagal menghapus lead");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
            <span>Total Potensi Terfilter:</span>
            <span className="font-semibold text-primary">
              {rupiah(totalFilteredValue)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({filtered.length} leads)
            </span>
          </p>
        </div>

        {clients.length > 0 && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 self-start sm:self-auto">
            <Plus className="size-4" />
            Tambah Lead
          </Button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1">
          {statuses.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
              <span className="ml-1.5 text-[10px] opacity-75">
                {s.key === "ALL"
                  ? leads.length
                  : leads.filter((l) => l.status === s.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama lead, minat, sumber, klien..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Klien</th>
                <th className="px-4 py-3 font-semibold">Sumber</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Potensi Nilai</th>
                <th className="px-4 py-3 font-semibold">Masuk</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const meta =
                  LEAD_STATUS[lead.status as keyof typeof LEAD_STATUS] ?? {
                    label: lead.status,
                    className: "bg-muted text-muted-foreground",
                  };

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.interest}
                      </p>
                      {lead.followUp && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground italic">
                          Catatan: {lead.followUp}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.client.businessName}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.source}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-primary">
                      {rupiah(lead.potentialValue)}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(lead.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLead(lead)}
                          className="h-7 px-2 text-xs"
                          title="Edit Lead"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingLead(lead)}
                          className="h-7 px-2 text-xs"
                          title="Hapus Lead"
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
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {leads.length === 0
                      ? "Belum ada leads terdaftar."
                      : "Tidak ada leads yang sesuai pencarian."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Lead Baru</DialogTitle>
            <DialogDescription>
              Catat calon prospek / leads baru untuk klien EXAR.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-clientId">Klien</Label>
                <select
                  id="add-clientId"
                  name="clientId"
                  required
                  disabled={isCreating}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-name">Nama Lead / Prospek</Label>
                <Input
                  id="add-name"
                  name="name"
                  placeholder="Misal: Bapak Doni"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-source">Sumber Lead</Label>
                <Input
                  id="add-source"
                  name="source"
                  placeholder="Misal: Instagram DM, WhatsApp, Ads"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-interest">Produk / Minat</Label>
                <Input
                  id="add-interest"
                  name="interest"
                  placeholder="Misal: Paket Wedding Kopi Senja / Catering"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-status">Status</Label>
                <select
                  id="add-status"
                  name="status"
                  defaultValue="NEW"
                  disabled={isCreating}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="NEW">Baru</option>
                  <option value="CONTACTED">Dihubungi</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CONVERTED">Closing / Converted</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-potentialValue">Potensi Nilai (Rp)</Label>
                <Input
                  id="add-potentialValue"
                  name="potentialValue"
                  type="number"
                  placeholder="0"
                  defaultValue="0"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-followUp">Catatan Follow Up</Label>
                <Textarea
                  id="add-followUp"
                  name="followUp"
                  placeholder="Catatan diskusi terakhir..."
                  rows={2}
                  disabled={isCreating}
                />
              </div>
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
                Tambah Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog
        open={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Lead</DialogTitle>
            <DialogDescription>
              Perbarui status, prospek minat, atau catatan follow up.
            </DialogDescription>
          </DialogHeader>

          {editingLead && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-clientId">Klien</Label>
                  <select
                    id="edit-clientId"
                    name="clientId"
                    defaultValue={editingLead.clientId}
                    required
                    disabled={isUpdating}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Nama Lead</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingLead.name}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-source">Sumber Lead</Label>
                  <Input
                    id="edit-source"
                    name="source"
                    defaultValue={editingLead.source}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-interest">Produk / Minat</Label>
                  <Input
                    id="edit-interest"
                    name="interest"
                    defaultValue={editingLead.interest}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    name="status"
                    defaultValue={editingLead.status}
                    disabled={isUpdating}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="NEW">Baru</option>
                    <option value="CONTACTED">Dihubungi</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Closing / Converted</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-potentialValue">Potensi Nilai (Rp)</Label>
                  <Input
                    id="edit-potentialValue"
                    name="potentialValue"
                    type="number"
                    defaultValue={editingLead.potentialValue}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-followUp">Catatan Follow Up</Label>
                  <Textarea
                    id="edit-followUp"
                    name="followUp"
                    defaultValue={editingLead.followUp ?? ""}
                    rows={2}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <DialogFooter className="mt-5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLead(null)}
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

      {/* Delete Lead Alert Dialog */}
      <AlertDialog
        open={!!deletingLead}
        onOpenChange={(open) => !open && setDeletingLead(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Lead?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data lead &quot;
              {deletingLead?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeletingLead(null)}
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
              Hapus Lead
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
