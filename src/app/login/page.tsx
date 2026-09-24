import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CircleAlert, MailCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExarLogo } from "@/components/exar-logo";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile) {
    if (profile.role === "ADMIN") redirect("/admin");
    redirect("/dashboard");
  }

  const { error, notice } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-[#242424] p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-dots text-white/25 opacity-40" />
        <div
          className="absolute -top-32 -left-24 size-[36rem] rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, #b42424 0%, transparent 70%)",
          }}
        />
        <Link href="/" className="relative">
          <ExarLogo tone="light" withWordmark />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight">
            Satu dashboard untuk seluruh kerja sama Anda.
          </h2>
          <p className="mt-4 leading-relaxed text-white/70">
            Pantau kalender konten, proses approval, leads, dan masa berlaku
            kontrak — transparan dalam satu platform.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Kalender konten & jadwal publikasi",
              "Approval konten: approve, revisi, reject",
              "Lead management & conversion rate",
              "Pengingat perpanjangan kontrak",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-white/80"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} EXAR Project — Eternal Xpression of Art &
          Reality
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center bg-secondary p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Kembali ke beranda
          </Link>

          <div className="mb-8 lg:hidden">
            <ExarLogo withWordmark />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Masuk ke Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gunakan email dan password yang terdaftar untuk melanjutkan.
          </p>

          {notice === "confirm-email" && (
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-blue-500/10 px-3.5 py-3 text-sm text-blue-700">
              <MailCheck className="mt-0.5 size-4 shrink-0" />
              <span>
                Akun dibuat. Cek email Anda untuk konfirmasi sebelum masuk.
              </span>
            </div>
          )}

          <form action={signIn} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@bisnis.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-muted-foreground">
                  Lupa password? Hubungi tim EXAR.
                </span>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <FormSubmitButton
              variant="primary-full"
              loadingText="Sedang masuk…"
              className="py-3 text-base font-bold"
            >
              Masuk
            </FormSubmitButton>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Daftar gratis sekarang
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
