import Link from "next/link";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PREVIEW = [
  "Content strategy",
  "Social media strategy",
  "Ide konten",
  "Target audience",
  "Rekomendasi channel",
  "Call to action",
];

/**
 * Shown on the public landing page in place of the AI Strategy Generator.
 * The generator is a members-only feature, so we tease the value and route
 * prospective clients to register first.
 */
export function StrategyLocked() {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="relative border-b border-border bg-[#242424] px-6 py-10 text-center text-white sm:px-10">
        <div className="absolute inset-0 bg-dots text-white/25 opacity-40" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-white/80 uppercase">
            <Lock className="size-3.5 text-primary" />
            Khusus Member
          </span>
          <h3 className="mt-5 text-2xl font-bold tracking-tight">
            Daftar untuk membuka AI Strategy Generator
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Buat akun gratis (langsung aktif, tanpa verifikasi email) dan
            dapatkan rekomendasi strategi digital yang dipersonalisasi untuk
            bisnis Anda.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              render={
                <Link href="/register">
                  Daftar Gratis <ArrowRight className="size-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              render={<Link href="/login">Sudah punya akun? Masuk</Link>}
            />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          Yang akan Anda dapatkan:
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEW.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
