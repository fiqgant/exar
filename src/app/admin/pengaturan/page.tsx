import { getSiteSettings } from "@/lib/settings.server";
import { SettingsForm } from "./settings-form";

export default async function AdminPengaturanPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Kontak & Pembayaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur nomor WhatsApp, email, dan rekening transfer yang tampil di seluruh website serta alur konsultasi AI.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
