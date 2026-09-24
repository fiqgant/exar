"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Camera,
  Clapperboard,
  Palette,
  Share2,
  PlayCircle,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Search,
  Loader2,
  AlertTriangle,
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
  updatePortfolio,
  deletePortfolio,
  togglePortfolioActive,
} from "./actions";

export type PortfolioItem = {
  id: string;
  title: string;
  category: "PHOTOGRAPHY" | "VIDEOGRAPHY" | "CONTENT_CREATION" | "SOCIAL_MEDIA_MANAGEMENT";
  clientName: string;
  description: string;
  coverColor: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const CATEGORY_LABEL: Record<string, string> = {
  PHOTOGRAPHY: "Photography",
  VIDEOGRAPHY: "Videography",
  CONTENT_CREATION: "Content Creation",
  SOCIAL_MEDIA_MANAGEMENT: "Social Media Management",
};

const CATEGORY_ICON: Record<string, typeof Camera> = {
  PHOTOGRAPHY: Camera,
  VIDEOGRAPHY: Clapperboard,
  CONTENT_CREATION: Palette,
  SOCIAL_MEDIA_MANAGEMENT: Share2,
};

const CATEGORY_BADGE_STYLE: Record<string, string> = {
  PHOTOGRAPHY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  VIDEOGRAPHY: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  CONTENT_CREATION: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  SOCIAL_MEDIA_MANAGEMENT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function getYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function getItemThumbnail(item: {
  imageUrl?: string | null;
  videoUrl?: string | null;
}): string | null {
  if (item.imageUrl) return item.imageUrl;
  const ytId = getYoutubeId(item.videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return null;
}

export function PortfolioList({ items }: { items: PortfolioItem[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // State for modals
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioItem | null>(null);

  // Edit form states
  const [removeImage, setRemoveImage] = useState(false);
  const [editCoverColor, setEditCoverColor] = useState("#B42424");

  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && item.isActive) ||
      (statusFilter === "INACTIVE" && !item.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditCoverColor(item.coverColor || "#B42424");
    setRemoveImage(false);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (removeImage) {
      formData.set("removeImage", "true");
    }

    startUpdateTransition(async () => {
      const res = await updatePortfolio(editingItem.id, formData);
      if (res.success) {
        toast.success("Portofolio berhasil diperbarui");
        setEditingItem(null);
      } else {
        toast.error(res.error || "Gagal memperbarui portofolio");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingItem) return;

    startDeleteTransition(async () => {
      const res = await deletePortfolio(deletingItem.id);
      if (res.success) {
        toast.success("Portofolio berhasil dihapus");
        setDeletingItem(null);
      } else {
        toast.error(res.error || "Gagal menghapus portofolio");
      }
    });
  };

  const handleToggleActive = (item: PortfolioItem) => {
    startToggleTransition(async () => {
      const res = await togglePortfolioActive(item.id, !item.isActive);
      if (res.success) {
        toast.success(
          item.isActive
            ? `Portofolio "${item.title}" dinonaktifkan`
            : `Portofolio "${item.title}" diaktifkan`
        );
      } else {
        toast.error(res.error || "Gagal mengubah status");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, nama klien, deskripsi..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">Semua Kategori</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Portfolio Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Camera className="size-6" />
          </div>
          <h3 className="font-semibold text-base">Tidak ada portofolio ditemukan</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 0
              ? "Belum ada data portofolio. Silakan tambahkan menggunakan tombol di atas."
              : "Tidak ada data yang cocok dengan pencarian atau filter yang dipilih."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const Icon = CATEGORY_ICON[item.category] ?? Camera;
            const badgeStyle =
              CATEGORY_BADGE_STYLE[item.category] ??
              "bg-muted text-muted-foreground border-border";

            const thumbnail = getItemThumbnail(item);
            const isVideo = Boolean(
              item.videoUrl || item.category === "VIDEOGRAPHY"
            );

            return (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
              >
                {/* Media preview */}
                <div
                  className="relative flex h-40 items-center justify-center overflow-hidden"
                  style={{ backgroundColor: item.coverColor }}
                >
                  {thumbnail ? (
                    <>
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <div className="flex size-10 items-center justify-center rounded-full bg-white/25 text-white shadow-md backdrop-blur-md">
                            <PlayCircle className="size-6 text-white" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : isVideo ? (
                    <div className="flex flex-col items-center gap-1.5 text-white/90">
                      <PlayCircle className="size-10" />
                      <span className="text-[11px] font-medium tracking-wide">
                        Video Portfolio
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-white/90">
                      <Icon className="size-9" />
                      <span className="text-[11px] font-medium tracking-wide">
                        {CATEGORY_LABEL[item.category]}
                      </span>
                    </div>
                  )}

                  {/* Badges on top of preview */}
                  <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md ${badgeStyle}`}
                    >
                      {CATEGORY_LABEL[item.category]}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-black/50 text-white/70 border border-white/20"
                      }`}
                    >
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                      {item.clientName}
                    </p>
                    <h3 className="font-semibold text-base leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary/80 hover:text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        Buka link video
                      </a>
                    )}
                  </div>

                  {/* Actions toolbar */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    {/* Status quick toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      disabled={isToggling}
                      title={item.isActive ? "Klik untuk sembunyikan" : "Klik untuk tampilkan"}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.isActive ? (
                        <>
                          <Eye className="size-3.5 text-emerald-500" />
                          <span className="text-[11px]">Tampil</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-3.5 text-muted-foreground" />
                          <span className="text-[11px]">Tersembunyi</span>
                        </>
                      )}
                    </button>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="h-7 gap-1 px-2.5 text-xs"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingItem(item)}
                        className="h-7 gap-1 px-2.5 text-xs"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setRemoveImage(false);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Portofolio</DialogTitle>
            <DialogDescription>
              Ubah data portofolio &ldquo;{editingItem?.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-title">Judul Proyek / Karya</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingItem.title}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-clientName">Nama Klien / Brand</Label>
                  <Input
                    id="edit-clientName"
                    name="clientName"
                    defaultValue={editingItem.clientName}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Kategori</Label>
                  <select
                    id="edit-category"
                    name="category"
                    defaultValue={editingItem.category}
                    disabled={isUpdating}
                    className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-coverColor">Warna Cover (Fallback)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-coverColor"
                      name="coverColor"
                      type="color"
                      value={editCoverColor}
                      onChange={(e) => setEditCoverColor(e.target.value)}
                      disabled={isUpdating}
                      className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {editCoverColor}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-videoUrl">Link Video</Label>
                  <Input
                    id="edit-videoUrl"
                    name="videoUrl"
                    type="url"
                    defaultValue={editingItem.videoUrl ?? ""}
                    placeholder="https://youtube.com/watch?v=..."
                    disabled={isUpdating}
                  />
                </div>

                {/* Image Section */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-image">Gambar Portofolio</Label>

                  {editingItem.imageUrl && (
                    <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border">
                          <Image
                            src={editingItem.imageUrl}
                            alt="Current image"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Gambar saat ini</p>
                          {removeImage ? (
                            <p className="text-[11px] text-destructive">
                              Akan dihapus saat disimpan
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              Tersimpan di Supabase Storage
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant={removeImage ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => setRemoveImage(!removeImage)}
                        className="text-xs"
                      >
                        {removeImage ? "Urungkan Hapus" : "Hapus Gambar Ini"}
                      </Button>
                    </div>
                  )}

                  <Input
                    id="edit-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    disabled={isUpdating}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Upload file baru untuk mengganti gambar atau thumbnail video (maks 5MB).
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-description">Deskripsi</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingItem.description}
                    rows={3}
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="edit-isActive"
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      id="edit-isActive"
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingItem.isActive}
                      disabled={isUpdating}
                      className="size-4 rounded accent-primary"
                    />
                    <span>Aktif (tampil di halaman publik portofolio)</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-6">
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
      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Portofolio?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus portofolio &ldquo;
              <span className="font-semibold text-foreground">
                {deletingItem?.title}
              </span>
              &rdquo;? Data yang sudah dihapus tidak dapat dipulihkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeletingItem(null)}
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
              {isDeleting ? "Menghapus..." : "Hapus Portofolio"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
