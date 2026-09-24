import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export type StrategyInput = {
  businessName: string;
  businessType: string;
  targetCustomer: string;
  offering: string;
  problem: string;
  goal: string;
};

export type StrategyResult = {
  summary: string;
  contentStrategy: string[];
  socialMediaStrategy: string[];
  contentIdeas: { title: string; format: string; angle: string }[];
  targetAudience: string[];
  recommendedChannels: { name: string; reason: string }[];
  callToAction: string[];
  generatedBy: "AI" | "DEMO";
};

const SCHEMA_HINT = `Balas HANYA dengan objek JSON valid (tanpa markdown, tanpa penjelasan) dengan bentuk:
{
  "summary": string,
  "contentStrategy": string[],
  "socialMediaStrategy": string[],
  "contentIdeas": [{ "title": string, "format": string, "angle": string }],
  "targetAudience": string[],
  "recommendedChannels": [{ "name": string, "reason": string }],
  "callToAction": string[]
}
Semua teks dalam Bahasa Indonesia, ringkas, praktis, dan dapat langsung dieksekusi.
Isi: contentStrategy 4-5 poin, socialMediaStrategy 4-5 poin, contentIdeas 5 ide,
targetAudience 3-4 segmen, recommendedChannels 3-4 channel, callToAction 3-4 saran.`;

function buildPrompt(input: StrategyInput) {
  return `Kamu adalah strategist digital senior di EXAR Project, agensi social media management.
Susun strategi digital awal untuk calon klien berikut.

Nama bisnis: ${input.businessName}
Jenis bisnis: ${input.businessType}
Target customer: ${input.targetCustomer}
Produk/Jasa: ${input.offering}
Masalah saat ini: ${input.problem}
Tujuan bisnis: ${input.goal}

${SCHEMA_HINT}`;
}

/** Safe JSON extraction: models sometimes wrap output in ```json fences. */
function parseStrategy(raw: string): StrategyResult | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return {
      summary: String(parsed.summary ?? ""),
      contentStrategy: toArray(parsed.contentStrategy),
      socialMediaStrategy: toArray(parsed.socialMediaStrategy),
      contentIdeas: Array.isArray(parsed.contentIdeas)
        ? parsed.contentIdeas.map((i: Record<string, unknown>) => ({
            title: String(i.title ?? ""),
            format: String(i.format ?? ""),
            angle: String(i.angle ?? ""),
          }))
        : [],
      targetAudience: toArray(parsed.targetAudience),
      recommendedChannels: Array.isArray(parsed.recommendedChannels)
        ? parsed.recommendedChannels.map((c: Record<string, unknown>) => ({
            name: String(c.name ?? ""),
            reason: String(c.reason ?? ""),
          }))
        : [],
      callToAction: toArray(parsed.callToAction),
      generatedBy: "AI",
    };
  } catch {
    return null;
  }
}

function toArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

async function callGemini(apiKey: string, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callGrok(apiKey: string, prompt: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Grok ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/**
 * Generates an initial digital strategy. Uses the admin-configured AI provider
 * when a key is stored; otherwise falls back to a deterministic demo strategy
 * so the public feature never dead-ends for a prospective client.
 */
export async function generateStrategy(
  input: StrategyInput,
): Promise<StrategyResult> {
  const setting = await prisma.aiSetting.findUnique({
    where: { id: "default" },
  });

  if (setting?.apiKey) {
    try {
      const apiKey = decrypt(setting.apiKey);
      const prompt = buildPrompt(input);
      const raw =
        setting.provider === "GROK"
          ? await callGrok(apiKey, prompt)
          : await callGemini(apiKey, prompt);
      const parsed = parseStrategy(raw);
      if (parsed) return parsed;
    } catch (error) {
      console.error("[ai-strategy] provider call failed:", error);
    }
  }

  return demoStrategy(input);
}

function demoStrategy(input: StrategyInput): StrategyResult {
  return {
    summary: `Untuk ${input.businessName} (${input.businessType}), fokus awalnya adalah membangun kehadiran digital yang konsisten di channel utama, lalu mengubah audiens menjadi pelanggan lewat konten yang menjawab kebutuhan ${input.targetCustomer}.`,
    contentStrategy: [
      `Pisahkan konten menjadi 3 pilar: edukasi, bukti sosial (testimoni), dan penawaran produk ${input.offering}.`,
      "Gunakan format Reels/carousel pendek untuk jangkauan, dan konten storytelling untuk kedekatan.",
      "Publikasikan minimal 3–4 konten per minggu dengan jadwal yang konsisten.",
      `Selipkan pesan yang menyoroti solusi atas: ${input.problem}.`,
    ],
    socialMediaStrategy: [
      "Fokuskan energi di 2 channel utama dulu sebelum melebar ke kanal lain.",
      "Aktifkan Community Management: balas komentar & DM maksimal 1x24 jam.",
      "Manfaatkan kolaborasi dengan micro-influencer lokal yang relevan.",
      `Evaluasi performa bulanan untuk mengejar target: ${input.goal}.`,
    ],
    contentIdeas: [
      {
        title: `Kenapa ${input.targetCustomer} butuh ${input.offering}`,
        format: "Carousel edukasi",
        angle: "Membangun kesadaran masalah yang sering dialami audiens.",
      },
      {
        title: "Behind the scenes proses kami",
        format: "Reels 30–60 detik",
        angle: "Membangun kepercayaan dan kesan manusiawi brand.",
      },
      {
        title: "Testimoni / studi kasus klien",
        format: "Carousel + kutipan",
        angle: "Bukti sosial yang mendorong keputusan.",
      },
      {
        title: "Tips cepat seputar produk/jasa",
        format: "Reels tips",
        angle: "Konten simpan-able yang memperluas jangkauan.",
      },
      {
        title: "Promo terbatas akhir pekan",
        format: "Post promo + story countdown",
        angle: "Mendorong konversi cepat.",
      },
    ],
    targetAudience: [
      `${input.targetCustomer} yang aktif mencari solusi secara online.`,
      "Pelanggan lama berpotensi repeat order.",
      "Audiens lokasi terdekat yang berniat mencoba.",
    ],
    recommendedChannels: [
      {
        name: "Instagram",
        reason: "Visual-first, kuat untuk konten produk dan membangun brand.",
      },
      {
        name: "TikTok",
        reason: "Jangkauan organik tinggi untuk video pendek dan tren.",
      },
      {
        name: "Facebook",
        reason: "Menjangkau segmen usia lebih luas & komunitas lokal.",
      },
    ],
    callToAction: [
      "Konsultasi gratis 30 menit untuk menyusun kalender konten pertama.",
      "Mulai dari paket yang paling sesuai dengan kapasitas bisnis saat ini.",
      "Jalankan pilot 1 bulan, lalu evaluasi bersama berdasarkan data.",
    ],
    generatedBy: "DEMO",
  };
}