"use client";

import { useTransition } from "react";
import { Loader2, MessageSquare, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteSettings } from "./actions";
import type { SiteSettings } from "@/lib/settings";

export function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateSiteSettings(formData);
      if (res.success) {
        toast.success("Pengaturan kontak dan rekening berhasil disimpan!");
      } else {
        toast.error(res.error || "Gagal menyimpan pengaturan");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kontak & WhatsApp */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <CardTitle className="text-base">Kontak & WhatsApp Perusahaan</CardTitle>
          </div>
          <CardDescription>
            Nomor WhatsApp dan email ini akan digunakan di seluruh tombol konsultasi (termasuk hasil AI Strategy Generator), header, dan footer website.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
              <span>Nomor WhatsApp Konsultasi</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              defaultValue={initialSettings.whatsapp}
              placeholder="Contoh: 081234567890 atau 6281234567890"
              required
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Format otomatis disesuaikan ke format internasional (628...).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <span>Email Resmi</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialSettings.email}
              placeholder="halo@exarproject.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telepon Kantor (Opsional)</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={initialSettings.phone}
              placeholder="+62 812 3456 7890"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram (Opsional)</Label>
            <Input
              id="instagram"
              name="instagram"
              defaultValue={initialSettings.instagram}
              placeholder="https://instagram.com/exarproject atau @exarproject"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat Fisik / Lokasi (Opsional)</Label>
            <Input
              id="address"
              name="address"
              defaultValue={initialSettings.address}
              placeholder="Bandung, Jawa Barat, Indonesia"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informasi Rekening Pembayaran */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <CardTitle className="text-base">Rekening Pembayaran & Bukti Transfer</CardTitle>
          </div>
          <CardDescription>
            Rekening tujuan transfer yang ditampilkan kepada klien saat memilih paket layanan sebelum mengunggah bukti pembayaran.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nama Bank</Label>
            <Input
              id="bankName"
              name="bankName"
              defaultValue={initialSettings.bankName}
              placeholder="Contoh: BCA / Mandiri / BNI"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccount">Nomor Rekening</Label>
            <Input
              id="bankAccount"
              name="bankAccount"
              defaultValue={initialSettings.bankAccount}
              placeholder="Contoh: 1234567890"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankHolder">Atas Nama (Pemilik Rekening)</Label>
            <Input
              id="bankHolder"
              name="bankHolder"
              defaultValue={initialSettings.bankHolder}
              placeholder="Contoh: PT EXAR Digital Studio"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending} className="gap-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan Pengaturan..." : "Simpan Semua Pengaturan"}
        </Button>
      </div>
    </form>
  );
}
