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
  Loader2,
} from "lucide-react";
import { requestStrategy, type StrategyActionState } from "@/app/actions";
import { createWhatsAppUrl } from "@/lib/settings";
import type { StrategyResult } from "@/lib/ai";

const FIELDS = [
  { name: "businessName", label: "Nama Bisnis", placeholder: "Contoh: Kopi Senja" },
  { name: "businessType", label: "Jenis Bisnis", placeholder: "Coffee shop, fashion, klinik, dll." },
  { name: "targetCustomer", label: "Target Customer", placeholder: "Contoh: pekerja muda 20–35 tahun di kota besar" },
  { name: "offering", label: "Produk / Jasa", placeholder: "Contoh: kopi susu signature & biji kopi lokal" },
] as const;

const initialState: StrategyActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-[#2d2d2d] bg-primary px-6 py-3 text-sm font-black text-white shadow-[3px_3px_0_#2d2d2d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#2d2d2d]"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {pending ? "Menganalisis…" : "Generate Strategi dengan AI"}
    </button>
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Form */}
      <form action={handleSubmit} className="nb-card overflow-hidden">
        <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-6 py-4">
          <h2 className="flex items-center gap-2 font-black text-white">
            <Sparkles className="size-4 text-primary" /> Informasi Bisnis
          </h2>
        </div>

        <div className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                >
                  {field.label} *
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required
                  className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:font-normal placeholder:text-muted-foreground/60"
                />
              </div>
            ))}

            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="problem"
                className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
              >
                Masalah yang Sedang Dihadapi *
              </label>
              <textarea
                id="problem"
                name="problem"
                rows={2}
                placeholder="Contoh: konten jalan sendiri tapi belum konsisten & leads seret"
                required
                className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:font-normal placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="goal"
                className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
              >
                Tujuan Bisnis *
              </label>
              <textarea
                id="goal"
                name="goal"
                rows={2}
                placeholder="Contoh: naikkan penjualan 30% dalam 3 bulan"
                required
                className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:font-normal placeholder:text-muted-foreground/60 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Hasilnya berupa rekomendasi awal yang bisa langsung didiskusikan dengan tim kami.
            </p>
            <SubmitButton />
          </div>

          {state.status === "error" && (
            <div className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 shadow-[2px_2px_0_#ef4444]">
              <p className="text-sm font-bold text-red-700">{state.message}</p>
            </div>
          )}
        </div>
      </form>

      {/* Result */}
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
  businessInfo: { businessName: string; businessType: string; goal: string } | null;
  whatsappNumber: string;
}) {
  const message = `Halo Tim EXAR, saya baru menyusun strategi via AI Strategy Generator:
- Nama Bisnis: ${businessInfo?.businessName || "-"}
- Jenis Bisnis: ${businessInfo?.businessType || "-"}
- Target: ${businessInfo?.goal || "-"}

Saya ingin konsultasi lebih lanjut untuk menjalankan strategi ini bersama EXAR Project.`;
  const waUrl = createWhatsAppUrl(whatsappNumber, message);

  return (
    <div className="animate-fade-up space-y-5">
      {/* Summary banner */}
      <div className="overflow-hidden rounded-xl border-2 border-[#2d2d2d] bg-primary shadow-[4px_4px_0_#2d2d2d]">
        <div className="border-b-2 border-white/20 px-5 py-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {result.generatedBy === "AI" ? "● Dibuat oleh AI" : "● Preview Strategi"}
          </span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-white/90">{result.summary}</p>
        </div>
      </div>

      {/* Strategy grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <ResultList icon={Zap} title="Content Strategy" items={result.contentStrategy} color="#3b82f6" />
        <ResultList icon={Target} title="Social Media Strategy" items={result.socialMediaStrategy} color="#8b5cf6" />
      </div>

      {/* Content ideas */}
      <div className="nb-card overflow-hidden">
        <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-5 py-4">
          <h3 className="flex items-center gap-2 font-black text-white">
            <Lightbulb className="size-4 text-amber-400" /> Ide Konten
          </h3>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {result.contentIdeas.map((idea, i) => (
            <div
              key={i}
              className="rounded-lg border-2 border-[#2d2d2d] bg-[#f5f4f0] p-4 shadow-[2px_2px_0_#2d2d2d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#2d2d2d]"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                {idea.format}
              </p>
              <p className="mt-1 font-black text-[#2d2d2d]">{idea.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{idea.angle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Target + Channels */}
      <div className="grid gap-5 md:grid-cols-2">
        <ResultList icon={Target} title="Target Audience" items={result.targetAudience} color="#10b981" />
        <div className="nb-card overflow-hidden">
          <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-5 py-4">
            <h3 className="flex items-center gap-2 font-black text-white">
              <CircleCheck className="size-4 text-emerald-400" /> Rekomendasi Channel
            </h3>
          </div>
          <ul className="space-y-0 divide-y-2 divide-[#2d2d2d]/10">
            {result.recommendedChannels.map((channel) => (
              <li key={channel.name} className="flex gap-3 px-5 py-3">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span className="text-sm">
                  <span className="font-black text-[#2d2d2d]">{channel.name}</span>{" "}
                  <span className="text-muted-foreground">— {channel.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <ResultList icon={Sparkles} title="Call to Action" items={result.callToAction} color="#f97316" />

      {/* WhatsApp CTA */}
      <div className="overflow-hidden rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] shadow-[4px_4px_0_#b42424]">
        <div className="p-6 text-center sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            ● Siap Eksekusi?
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            Jalankan strategi ini bersama EXAR
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
            Tim EXAR siap membantu dari produksi konten, pengelolaan media sosial, sampai laporan performa bulanan.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-400 bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-[3px_3px_0_#065f46] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#065f46] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <MessageCircle className="size-4" />
              Konsultasikan via WhatsApp
            </a>
            <a
              href="#paket"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(255,255,255,0.1)] transition-all hover:bg-white/20"
            >
              Lihat Pilihan Paket
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultList({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: typeof Zap;
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="nb-card overflow-hidden">
      <div
        className="border-b-2 border-[#2d2d2d] px-5 py-4"
        style={{ backgroundColor: color }}
      >
        <h3 className="flex items-center gap-2 font-black text-white">
          <Icon className="size-4 text-white/80" /> {title}
        </h3>
      </div>
      <ul className="space-y-0 divide-y-2 divide-[#2d2d2d]/10">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 px-5 py-3">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
