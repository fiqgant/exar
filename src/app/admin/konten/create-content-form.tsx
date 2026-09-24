"use client";

import { useRef, useTransition, useState } from "react";
import { Loader2, Upload, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_TYPE_LABEL, PLATFORM_LABEL } from "@/lib/format";
import { createContent } from "./actions";

type ClientOption = {
  id: string;
  businessName: string;
};

export function CreateContentForm({ clients }: { clients: ClientOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file gambar maksimal 10MB");
        e.target.value = "";
        setImagePreview(null);
        return;
      }
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createContent(formData);
      if (res && !res.success) {
        toast.error(res.error || "Gagal membuat konten baru");
      } else {
        toast.success("Konten baru berhasil dibuat & dikirim ke klien");
        formRef.current?.reset();
        setImagePreview(null);
      }
    });
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Tambahkan klien terlebih dahulu di menu Klien.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground">Buat Konten Baru</h2>
        <p className="text-xs text-muted-foreground">
          Sertakan gambar atau tautan video agar klien dapat melihat pratinjau media langsung di dashboard mereka.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="create-clientId">Klien</Label>
          <select
            id="create-clientId"
            name="clientId"
            required
            disabled={isPending}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-title">Judul / Topik</Label>
          <Input
            id="create-title"
            name="title"
            placeholder="Misal: Review Menu Es Kopi Senja"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-type">Jenis Konten</Label>
          <select
            id="create-type"
            name="type"
            disabled={isPending}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {Object.entries(CONTENT_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-platform">Platform</Label>
          <select
            id="create-platform"
            name="platform"
            disabled={isPending}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {Object.entries(PLATFORM_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="create-scheduledAt">Jadwal Upload</Label>
          <Input
            id="create-scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            required
            disabled={isPending}
          />
        </div>

        {/* Media Upload & URL Section */}
        <div className="space-y-2 sm:col-span-2 rounded-xl border border-border/80 bg-secondary/20 p-4">
          <div className="flex items-center gap-2 mb-2 font-medium text-sm">
            <Upload className="size-4 text-primary" />
            <span>Aset Media Konten (Pratinjau Klien)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-imageFile" className="flex items-center gap-1.5 text-xs">
                <ImageIcon className="size-3.5" /> Upload File Gambar (JPG, PNG, WEBP)
              </Label>
              <Input
                id="create-imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isPending}
                className="cursor-pointer file:cursor-pointer text-xs"
              />
              {imagePreview && (
                <div className="mt-2 relative h-28 w-44 overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-imageUrl" className="text-xs">
                Atau Masukkan URL Gambar Langsung
              </Label>
              <Input
                id="create-imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://images.unsplash.com/..."
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Bisa diisi jika gambar sudah dihosting di tempat lain.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-videoFile" className="flex items-center gap-1.5 text-xs">
                <Video className="size-3.5 text-primary" /> Upload File Video (MP4, WebM, MOV)
              </Label>
              <Input
                id="create-videoFile"
                name="videoFile"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                disabled={isPending}
                className="cursor-pointer file:cursor-pointer text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Maksimal ukuran video 50MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-videoUrl" className="text-xs">
                Atau Link Video (URL MP4 / Cloud)
              </Label>
              <Input
                id="create-videoUrl"
                name="videoUrl"
                type="url"
                placeholder="https://assets.mixkit.co/.../video.mp4"
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Alternatif jika video sudah diupload di cloud/CDN.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="create-caption">Caption</Label>
          <Textarea
            id="create-caption"
            name="caption"
            rows={3}
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="create-hashtags">Hashtag</Label>
          <Input
            id="create-hashtags"
            name="hashtags"
            placeholder="#KopiSenja #BaristaLife #PromoKopi"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-objective">Content Objective</Label>
          <Input
            id="create-objective"
            name="objective"
            placeholder="Misal: Meningkatkan brand awareness"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-strategy">Strategi Konten</Label>
          <Input
            id="create-strategy"
            name="strategy"
            placeholder="Misal: Konten edukasi + storytelling"
            disabled={isPending}
          />
        </div>

        <div className="sm:col-span-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Simpan & Kirim ke Klien
          </Button>
        </div>
      </form>
    </div>
  );
}
