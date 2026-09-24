"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

export async function saveAiSetting(formData: FormData) {
  await requireAdmin();

  const provider = String(formData.get("provider") ?? "GEMINI") as
    | "GEMINI"
    | "GROK";
  const apiKey = String(formData.get("apiKey") ?? "").trim();

  if (!apiKey) return; // blank = keep existing key, only provider could change below

  await prisma.aiSetting.upsert({
    where: { id: "default" },
    create: { id: "default", provider, apiKey: encrypt(apiKey) },
    update: { provider, apiKey: encrypt(apiKey) },
  });

  revalidatePath("/admin/ai-settings");
}
