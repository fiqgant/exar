"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPortfolio } from "./actions";

const CATEGORY_LABEL: Record<string, string> = {
  PHOTOGRAPHY: "Photography",
  VIDEOGRAPHY: "Videography",
  CONTENT_CREATION: "Content Creation",
  SOCIAL_MEDIA_MANAGEMENT: "Social Media Management",
};

export function CreatePortfolioForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [coverColor, setCoverColor] = useState("#B42424");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createPortfolio(formData);
      if (res.success) {
        toast.success("Portofolio berhasil ditambahkan");
        form.reset();
        setCoverColor("#B42424");
        setIsOpen(false);
      } else {
        toast.error(res.error || "Gagal menambah portofolio");
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between p-6">
        <div>
          <h2 className="font-semibold text-lg">Tambah Portofolio</h2>
          <p className="text-sm text-muted-foreground">
            Tambahkan karya atau proyek baru ke portofolio EXAR.
          </p>
        </div>
        <Button
          type="button"
          variant={isOpen ? "secondary" : "default"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-1.5"
        >
          {isOpen ? (
            <>
              <ChevronUp className="size-4" />
              Tutup Form
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Tambah Portofolio
            </>
          )}
        </Button>
      </div>

      {isOpen && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="border-t border-border p-6 pt-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-title">Judul Proyek / Karya</Label>
              <Input
                id="create-title"
                name="title"
                placeholder="Contoh: Photoshoot Kampanye Musim Panas"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-clientName">Nama Klien / Brand</Label>
              <Input
                id="create-clientName"
                name="clientName"
                placeholder="Contoh: Kopi Kenangan"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-category">Kategori</Label>
              <select
                id="create-category"
                name="category"
                defaultValue="PHOTOGRAPHY"
                disabled={isPending}
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
              <Label htmlFor="create-coverColor">Warna Cover (Fallback)</Label>
              <div className="flex items-center gap-2">
                <input
                  id="create-coverColor"
                  name="coverColor"
                  type="color"
                  value={coverColor}
                  onChange={(e) => setCoverColor(e.target.value)}
                  disabled={isPending}
                  className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                />
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {coverColor}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-image">Upload Gambar</Label>
              <Input
                id="create-image"
                name="image"
                type="file"
                accept="image/*"
                disabled={isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Format JPG/PNG/WebP, maks 5MB. Berfungsi sebagai gambar portofolio atau thumbnail video.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-videoUrl">Link Video (Opsional)</Label>
              <Input
                id="create-videoUrl"
                name="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... atau https://tiktok.com/..."
                disabled={isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Bisa link YouTube, TikTok, Vimeo, dll.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create-description">Deskripsi</Label>
              <Textarea
                id="create-description"
                name="description"
                rows={3}
                placeholder="Ceritakan singkat mengenai proyek, hasil, atau konsep yang dibuat..."
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Tambah Portofolio"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
