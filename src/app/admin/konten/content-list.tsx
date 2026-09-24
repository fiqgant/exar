"use client";

import { useState, useTransition } from "react";
import {
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Search,
  Video,
  ImageIcon,
  Upload,
  ExternalLink,
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
import {
  CONTENT_STATUS,
  CONTENT_TYPE_LABEL,
  PLATFORM_LABEL,
  formatDate,
} from "@/lib/format";
import { updateContent, deleteContent } from "./actions";

export type ContentItem = {
  id: string;
  clientId: string;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduledAt: Date | string;
  caption: string;
  hashtags: string;
  objective: string;
  strategy: string;
  previewColor: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  client: {
    id: string;
    businessName: string;
  };
};

type ClientOption = {
  id: string;
  businessName: string;
};

export function ContentList({
  contents,
  clients,
}: {
  contents: ContentItem[];
  clients: ClientOption[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [deletingContent, setDeletingContent] = useState<ContentItem | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const statuses = [
    { key: "ALL", label: "Semua" },
    { key: "DRAFT", label: "Draft" },
    { key: "SCHEDULED", label: "Terjadwal" },
    { key: "REVISION", label: "Revisi" },
    { key: "APPROVED", label: "Disetujui" },
    { key: "PUBLISHED", label: "Tayang" },
  ];

  const filtered = contents.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.caption.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContent) return;

    const formData = new FormData(e.currentTarget);
    startUpdateTransition(async () => {
      const res = await updateContent(editingContent.id, formData);
      if (res.success) {
        toast.success("Konten berhasil diperbarui");
        setEditingContent(null);
        setEditImagePreview(null);
      } else {
        toast.error(res.error || "Gagal memperbarui konten");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingContent) return;

    startDeleteTransition(async () => {
      const res = await deleteContent(deletingContent.id);
      if (res.success) {
        toast.success("Konten berhasil dihapus");
        setDeletingContent(null);
      } else {
        toast.error(res.error || "Gagal menghapus konten");
      }
    });
  };

  const formatDatetimeLocal = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file gambar maksimal 10MB");
        e.target.value = "";
        setEditImagePreview(null);
        return;
      }
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setEditImagePreview(null);
    }
  };

  return (
    <div className="space-y-4">
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
                  ? contents.length
                  : contents.filter((c) => c.status === s.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau klien..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Contents Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Media</th>
                <th className="px-4 py-3 font-semibold">Judul & Format</th>
                <th className="px-4 py-3 font-semibold">Klien</th>
                <th className="px-4 py-3 font-semibold">Jadwal Upload</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const meta =
                  CONTENT_STATUS[item.status as keyof typeof CONTENT_STATUS] ?? {
                    label: item.status,
                    className: "bg-muted text-muted-foreground",
                  };

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : item.videoUrl ? (
                          <div className="flex h-full w-full items-center justify-center bg-black/80 text-primary">
                            <Video className="size-5" />
                          </div>
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: item.previewColor }}
                          >
                            {item.type.slice(0, 3)}
                          </div>
                        )}
                        {item.videoUrl && item.imageUrl && (
                          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 p-0.5 text-white">
                            <Video className="size-2.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {CONTENT_TYPE_LABEL[
                          item.type as keyof typeof CONTENT_TYPE_LABEL
                        ] ?? item.type}{" "}
                        ·{" "}
                        {PLATFORM_LABEL[
                          item.platform as keyof typeof PLATFORM_LABEL
                        ] ?? item.platform}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {item.client.businessName}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(item.scheduledAt)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingContent(item);
                            setEditImagePreview(null);
                          }}
                          className="h-7 px-2 text-xs"
                          title="Edit Konten"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingContent(item)}
                          className="h-7 px-2 text-xs"
                          title="Hapus Konten"
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
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {contents.length === 0
                      ? "Belum ada konten dibuat."
                      : "Tidak ada konten yang sesuai filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Content Dialog */}
      <Dialog
        open={!!editingContent}
        onOpenChange={(open) => {
          if (!open) {
            setEditingContent(null);
            setEditImagePreview(null);
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Konten</DialogTitle>
            <DialogDescription>
              Ubah rincian, media gambar/video, jadwal, atau status konten untuk{" "}
              {editingContent?.client.businessName}.
            </DialogDescription>
          </DialogHeader>

          {editingContent && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-clientId">Klien</Label>
                  <select
                    id="edit-clientId"
                    name="clientId"
                    defaultValue={editingContent.clientId}
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

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-title">Judul / Topik</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingContent.title}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-type">Jenis Konten</Label>
                  <select
                    id="edit-type"
                    name="type"
                    defaultValue={editingContent.type}
                    disabled={isUpdating}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {Object.entries(CONTENT_TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-platform">Platform</Label>
                  <select
                    id="edit-platform"
                    name="platform"
                    defaultValue={editingContent.platform}
                    disabled={isUpdating}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {Object.entries(PLATFORM_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    name="status"
                    defaultValue={editingContent.status}
                    disabled={isUpdating}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-medium"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Terjadwal</option>
                    <option value="REVISION">Revisi</option>
                    <option value="APPROVED">Disetujui</option>
                    <option value="PUBLISHED">Tayang</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-scheduledAt">Jadwal Upload</Label>
                  <Input
                    id="edit-scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    defaultValue={formatDatetimeLocal(editingContent.scheduledAt)}
                    required
                    disabled={isUpdating}
                  />
                </div>

                {/* Edit Media Section */}
                <div className="space-y-3 sm:col-span-2 rounded-xl border border-border/80 bg-secondary/20 p-4">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Upload className="size-4 text-primary" />
                    <span>Aset Media Pratinjau Klien</span>
                  </div>

                  {/* Current media previews */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Image Preview & Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-imageFile" className="flex items-center gap-1.5 text-xs">
                        <ImageIcon className="size-3.5" /> File Gambar (Upload Baru)
                      </Label>
                      <Input
                        id="edit-imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        disabled={isUpdating}
                        className="cursor-pointer file:cursor-pointer text-xs"
                      />

                      {(editImagePreview || editingContent.imageUrl) && (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-[11px] text-muted-foreground">Pratinjau Gambar:</p>
                          <div className="relative h-28 w-44 overflow-hidden rounded-lg border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={editImagePreview || editingContent.imageUrl!}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {editingContent.imageUrl && !editImagePreview && (
                            <label className="flex items-center gap-1.5 text-xs text-destructive cursor-pointer">
                              <input
                                type="checkbox"
                                name="removeImage"
                                value="true"
                                className="size-3.5 rounded accent-destructive"
                              />
                              <span>Hapus gambar ini</span>
                            </label>
                          )}
                        </div>
                      )}

                      <div className="pt-1">
                        <Label htmlFor="edit-imageUrl" className="text-xs">
                          Atau URL Gambar
                        </Label>
                        <Input
                          id="edit-imageUrl"
                          name="imageUrl"
                          type="url"
                          defaultValue={editingContent.imageUrl ?? ""}
                          placeholder="https://images.unsplash.com/..."
                          disabled={isUpdating}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Video File Upload & URL */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-videoFile" className="flex items-center gap-1.5 text-xs">
                        <Video className="size-3.5 text-primary" /> File Video (Upload Baru)
                      </Label>
                      <Input
                        id="edit-videoFile"
                        name="videoFile"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        disabled={isUpdating}
                        className="cursor-pointer file:cursor-pointer text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Maksimal ukuran video 50MB.
                      </p>

                      <div className="pt-1">
                        <Label htmlFor="edit-videoUrl" className="text-xs">
                          Atau Link Video (URL MP4 / Cloud)
                        </Label>
                        <Input
                          id="edit-videoUrl"
                          name="videoUrl"
                          type="url"
                          defaultValue={editingContent.videoUrl ?? ""}
                          placeholder="https://assets.../video.mp4"
                          disabled={isUpdating}
                          className="text-xs"
                        />
                      </div>

                      {editingContent.videoUrl && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Video Terpasang:</span>
                            <a
                              href={editingContent.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Buka video <ExternalLink className="size-3" />
                            </a>
                          </div>
                          <video
                            src={editingContent.videoUrl}
                            controls
                            className="h-28 w-full rounded-lg bg-black object-contain"
                          />
                          <label className="flex items-center gap-1.5 text-xs text-destructive cursor-pointer">
                            <input
                              type="checkbox"
                              name="removeVideo"
                              value="true"
                              className="size-3.5 rounded accent-destructive"
                            />
                            <span>Hapus video ini</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-caption">Caption</Label>
                  <Textarea
                    id="edit-caption"
                    name="caption"
                    rows={4}
                    defaultValue={editingContent.caption}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="edit-hashtags">Hashtag</Label>
                  <Input
                    id="edit-hashtags"
                    name="hashtags"
                    defaultValue={editingContent.hashtags}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-objective">Content Objective</Label>
                  <Input
                    id="edit-objective"
                    name="objective"
                    defaultValue={editingContent.objective}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-strategy">Strategi Konten</Label>
                  <Input
                    id="edit-strategy"
                    name="strategy"
                    defaultValue={editingContent.strategy}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingContent(null);
                    setEditImagePreview(null);
                  }}
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

      {/* Delete Content Alert Dialog */}
      <AlertDialog
        open={!!deletingContent}
        onOpenChange={(open) => !open && setDeletingContent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Konten?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus konten &quot;
              {deletingContent?.title}&quot;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeletingContent(null)}
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
              Hapus Konten
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
