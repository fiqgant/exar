"use client";

import { useTransition, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "./actions";

export function CreateClientForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createClient(formData);
      if (res.success) {
        toast.success("Klien baru berhasil ditambahkan");
        formRef.current?.reset();
      } else {
        toast.error(res.error || "Gagal menambahkan klien");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 font-semibold text-foreground">Tambah Klien Baru</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessName">Nama Bisnis</Label>
          <Input
            id="businessName"
            name="businessName"
            placeholder="Misal: Kopi Senja"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Jenis Bisnis</Label>
          <Input
            id="businessType"
            name="businessType"
            placeholder="Misal: F&B / Coffee Shop"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Nama Kontak</Label>
          <Input
            id="contactName"
            name="contactName"
            placeholder="Misal: Budi Santoso"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">No. HP / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="08123456789"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="klien@bisnis.com"
            disabled={isPending}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Tambah Klien
          </Button>
        </div>
      </form>
    </div>
  );
}
