import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExarLogo } from "@/components/exar-logo";
import { signUp } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile) {
    if (profile.role === "ADMIN") redirect("/admin");
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-[#242424] p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-dots text-white/25 opacity-40" />
        <div
          className="absolute -bottom-32 -left-24 size-[36rem] rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, #b42424 0%, transparent 70%)",
          }}
        />
        <Link href="/" className="relative">
          <ExarLogo tone="light" withWordmark />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight">
            Mulai perjalanan digital bisnis Anda.
          </h2>
          <p className="mt-4 leading-relaxed text-white/70">
            Buat akun untuk membuka AI Strategy Generator dan dashboard kerja
            sama — tanpa biaya, langsung aktif.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "AI Strategy Generator tanpa batas",
              "Dashboard pantau konten & approval",
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
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Sudah punya akun? Masuk
          </Link>

          <div className="mb-8 lg:hidden">
            <ExarLogo withWordmark />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Daftar Akun</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun langsung aktif — tidak perlu verifikasi email.
          </p>

          <form action={signUp} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nama Bisnis</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Contoh: Kopi Senja"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nama Anda</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessType">Jenis Bisnis</Label>
                <Input
                  id="businessType"
                  name="businessType"
                  placeholder="Coffee shop, fashion…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP (opsional)</Label>
                <Input id="phone" name="phone" placeholder="+62…" />
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimal 6 karakter"
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
              loadingText="Membuat akun…"
              className="py-3 text-base font-bold"
            >
              Daftar & Mulai
            </FormSubmitButton>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link
              href="/syarat-ketentuan"
              className="font-medium text-primary hover:underline"
            >
              Syarat & Ketentuan
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
