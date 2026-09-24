"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  CircleCheck,
  Lightbulb,
  Sparkles,
  Target,
  Zap,
  MessageCircle,
} from "lucide-react";
import { requestStrategy, type StrategyActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWhatsAppUrl } from "@/lib/settings";
import type { StrategyResult } from "@/lib/ai";

const FIELDS = [
  {
    name: "businessName",
    label: "Nama Bisnis",
    placeholder: "Contoh: Kopi Senja",
  },
  {
    name: "businessType",
    label: "Jenis Bisnis",
    placeholder: "Coffee shop, fashion, klinik, dll.",
  },
  {
    name: "targetCustomer",
    label: "Target Customer",
    placeholder: "Contoh: pekerja muda 20–35 tahun di kota besar",
  },
  {
    name: "offering",
    label: "Produk / Jasa",
    placeholder: "Contoh: kopi susu signature & biji kopi lokal",
  },
] as const;

const initialState: StrategyActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full sm:w-auto"
    >
      <Sparkles className="size-4" />
      {pending ? "Menganalisis…" : "Generate Strategi dengan AI"}
    </Button>
  );
}

export function StrategyGenerator({
  whatsappNumber = "6281234567890",
}: {
  whatsappNumber?: string;
}) {
  const [state, formAction] = useActionState(requestStrategy, initialState);
  const [businessInfo, setBusinessInfo] = useState<{
    businessName: string;
    businessType: string;
    goal: string;
  } | null>(null);

  const handleSubmit = (formData: FormData) => {
    setBusinessInfo({
      businessName: (formData.get("businessName") as string) || "",
      businessType: (formData.get("businessType") as string) || "",
      goal: (formData.get("goal") as string) || "",
    });
    formAction(formData);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form
        action={handleSubmit}
        className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="problem">Masalah yang Sedang Dihadapi</Label>
            <Textarea
              id="problem"
              name="problem"
              rows={2}
              placeholder="Contoh: konten jalan sendiri tapi belum konsisten & leads seret"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="goal">Tujuan Bisnis</Label>
            <Textarea
              id="goal"
              name="goal"
              rows={2}
              placeholder="Contoh: naikkan penjualan 30% dalam 3 bulan"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Hasilnya berupa rekomendasi awal yang bisa langsung didiskusikan
            dengan tim kami.
          </p>
          <SubmitButton />
        </div>

        {state.status === "error" && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.message}
          </p>
        )}
      </form>

      {state.status === "success" && (
        <StrategyResultView
          result={state.data}
          businessInfo={businessInfo}
          whatsappNumber={whatsappNumber}
        />
      )}
    </div>
  );
}

function StrategyResultView({
  result,
  businessInfo,
  whatsappNumber,
}: {
  result: StrategyResult;
  businessInfo: {
    businessName: string;
    businessType: string;
    goal: string;
  } | null;
  whatsappNumber: string;
}) {
  return (
    <div className="mt-8 animate-fade-up space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="eyebrow">
            {result.generatedBy === "AI"
              ? "Dibuat oleh AI"
              : "Preview Strategi"}
          </span>
        </div>
        <p className="leading-relaxed text-foreground">{result.summary}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ResultList
          icon={Zap}
          title="Content Strategy"
          items={result.contentStrategy}
        />
        <ResultList
          icon={Target}
          title="Social Media Strategy"
          items={result.socialMediaStrategy}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Lightbulb className="size-4 text-primary" /> Ide Konten
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.contentIdeas.map((idea, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-secondary/50 p-4"
            >
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {idea.format}
              </p>
              <p className="mt-1 font-medium">{idea.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{idea.angle}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ResultList
          icon={Target}
          title="Target Audience"
          items={result.targetAudience}
        />
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Rekomendasi Channel</h3>
          <ul className="space-y-3">
            {result.recommendedChannels.map((channel) => (
              <li key={channel.name} className="flex gap-3">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm">
                  <span className="font-medium">{channel.name}</span> —{" "}
                  <span className="text-muted-foreground">
                    {channel.reason}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ResultList
        icon={Sparkles}
        title="Call to Action"
        items={result.callToAction}
      />

      {/* WhatsApp Consultation Action */}
      {(() => {
        const message = `Halo Tim EXAR, saya baru saja menyusun strategi via AI Strategy Generator:
- Nama Bisnis: ${businessInfo?.businessName || "-"}
- Jenis Bisnis: ${businessInfo?.businessType || "-"}
- Target: ${businessInfo?.goal || "-"}

Saya ingin konsultasi lebih lanjut untuk menjalankan strategi ini bersama EXAR Project.`;
        const waUrl = createWhatsAppUrl(whatsappNumber, message);

        return (
          <div className="rounded-2xl bg-primary p-6 text-center text-primary-foreground sm:p-8">
            <h3 className="text-xl font-bold">Siap eksekusi strategi ini?</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm opacity-90">
              Tim EXAR siap membantu menjalankan rencana di atas — dari produksi
              konten, pengelolaan media sosial, sampai laporan performa bulanan.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-600 cursor-pointer"
              >
                <MessageCircle className="size-5" />
                Konsultasikan via WhatsApp
              </a>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
                render={<a href="#paket">Lihat Pilihan Paket</a>}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ResultList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Zap;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-primary" /> {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
