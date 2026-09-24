"use client";

import { useState, useTransition } from "react";
import { Check, Copy, CreditCard, Loader2, MessageCircle, UploadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPackageOrder } from "@/app/actions";
import { createWhatsAppUrl, type SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings";
import type { PackageItem } from "./package-grid";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderPackageDialog({
  pkg,
  open,
  onOpenChange,
  settings = DEFAULT_SITE_SETTINGS,
}: {
  pkg: PackageItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: SiteSettings;
}) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    if (!settings.bankAccount) return;
    navigator.clipboard.writeText(settings.bankAccount);
    setCopied(true);
    toast.success("Nomor rekening berhasil disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pkg) return;

    const formData = new FormData(e.currentTarget);
    formData.set("packageId", pkg.id);

    startTransition(async () => {
      const res = await createPackageOrder(formData);
      if (res.success) {
        setIsSubmitted(true);
        toast.success("Pesanan dan bukti transfer berhasil dikirim!");
      } else {
        toast.error(res.error || "Gagal mengirim pesanan");
      }
    });
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onOpenChange(false);
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <span>Pemesanan Paket</span>
          </div>
          <DialogTitle className="text-xl font-bold">
            {isSubmitted ? "Pesanan Berhasil Dikirim" : `Pilih Paket ${pkg.name}`}
          </DialogTitle>
          <DialogDescription>
            {isSubmitted
              ? "Bukti pembayaran Anda telah kami terima dan sedang dalam antrean verifikasi oleh tim admin EXAR."
              : "Lengkapi data bisnis Anda dan unggah bukti transfer untuk memulai aktivasi kerja sama."}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Terima Kasih atas Pembayaran Anda!</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Tim admin EXAR akan memverifikasi bukti transfer untuk paket <strong>{pkg.name}</strong>. Setelah dikonfirmasi, kontrak Anda akan resmi <strong>Aktif</strong> dan tim kami akan segera menghubungi Anda untuk memulai onboarding.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <a
                href={createWhatsAppUrl(
                  settings.whatsapp,
                  `Halo Tim EXAR, saya baru saja memesan paket ${pkg.name} dan sudah mengunggah bukti transfer. Mohon bantuannya untuk verifikasi.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors"
              >
                <MessageCircle className="size-4" />
                Konfirmasi Cepat via WhatsApp
              </a>
              <Button variant="outline" onClick={handleClose}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-1">
            {/* Package Summary Box */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <div>
                <span className="font-bold text-base text-foreground">{pkg.name}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pkg.videoReelsCount} Reels · {pkg.feedsDesignCount} Feeds · {pkg.produksiVisit}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Nilai Paket:</span>
                <p className="font-extrabold text-lg text-primary">{rupiah(pkg.price)}</p>
              </div>
            </div>

            {/* Bank Transfer Instructions */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CreditCard className="size-4 text-primary" />
                <span>Instruksi Transfer Bank</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{settings.bankName}</p>
                  <p className="text-lg font-mono font-bold tracking-wider">{settings.bankAccount}</p>
                  <p className="text-xs text-muted-foreground">a.n. {settings.bankHolder}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAccount}
                  className="gap-1.5 text-xs"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copied ? "Tersalin" : "Salin Rekening"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Silakan transfer tepat sejumlah <strong>{rupiah(pkg.price)}</strong> ke rekening di atas, lalu lampirkan bukti transfer pada form di bawah.
              </p>
            </div>

            {/* Client Information Form */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="order-businessName">Nama Bisnis / Brand <span className="text-destructive">*</span></Label>
                <Input id="order-businessName" name="businessName" placeholder="Contoh: Kopi Senja" required disabled={isPending} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-businessType">Jenis Bisnis</Label>
                <Input id="order-businessType" name="businessType" placeholder="Contoh: Coffee Shop, F&B" disabled={isPending} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-contactName">Nama Pemilik / Kontak <span className="text-destructive">*</span></Label>
                <Input id="order-contactName" name="contactName" placeholder="Contoh: Rani Wijaya" required disabled={isPending} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="order-phone">Nomor WhatsApp Aktif <span className="text-destructive">*</span></Label>
                <Input id="order-phone" name="phone" placeholder="Contoh: 081234567890" required disabled={isPending} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="order-email">Email Bisnis</Label>
                <Input id="order-email" name="email" type="email" placeholder="Contoh: rani@kopisenja.id" disabled={isPending} />
                <p className="text-[11px] text-muted-foreground">
                  Digunakan untuk mengakses dashboard klien EXAR dan memantau konten.
                </p>
              </div>

              {/* Payment Proof Upload */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="order-paymentProof" className="flex items-center gap-1.5">
                  <UploadCloud className="size-4 text-primary" />
                  <span>Upload Bukti Transfer (Screenshot/Foto Struk)</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="order-paymentProof"
                  name="paymentProof"
                  type="file"
                  accept="image/*"
                  required
                  disabled={isPending}
                />
                <p className="text-[11px] text-muted-foreground">
                  Format gambar JPG, PNG, atau WebP, maksimal 5MB.
                </p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="order-notes">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="order-notes"
                  name="notes"
                  rows={2}
                  placeholder="Informasi tambahan terkait produk, permintaan jadwal kick-off, dll."
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "Mengirim Pesanan..." : "Kirim Bukti Pembayaran"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
