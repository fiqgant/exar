"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatWhatsAppNumber } from "@/lib/settings";

export type SettingsActionResponse = {
  success: boolean;
  error?: string;
};

export async function updateSiteSettings(formData: FormData): Promise<SettingsActionResponse> {
  try {
    await requireAdmin();

    const rawWhatsapp = (formData.get("whatsapp") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const phone = (formData.get("phone") as string)?.trim() || "";
    const address = (formData.get("address") as string)?.trim() || "";
    const instagram = (formData.get("instagram") as string)?.trim() || "";
    const bankName = (formData.get("bankName") as string)?.trim() || "";
    const bankAccount = (formData.get("bankAccount") as string)?.trim() || "";
    const bankHolder = (formData.get("bankHolder") as string)?.trim() || "";

    if (!rawWhatsapp) {
      return { success: false, error: "Nomor WhatsApp wajib diisi" };
    }
    if (!email) {
      return { success: false, error: "Email wajib diisi" };
    }

    const whatsapp = formatWhatsAppNumber(rawWhatsapp);

    await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        whatsapp,
        email,
        phone,
        address,
        instagram,
        bankName,
        bankAccount,
        bankHolder,
      },
      create: {
        id: "default",
        whatsapp,
        email,
        phone,
        address,
        instagram,
        bankName,
        bankAccount,
        bankHolder,
      },
    });

    revalidatePath("/admin/pengaturan");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan",
    };
  }
}
