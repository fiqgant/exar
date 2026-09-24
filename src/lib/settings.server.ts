import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "./settings";

/** Fetches site settings from database with safe fallback defaults. Server-only. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    if (!setting) return DEFAULT_SITE_SETTINGS;

    return {
      whatsapp: setting.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
      email: setting.email || DEFAULT_SITE_SETTINGS.email,
      phone: setting.phone || DEFAULT_SITE_SETTINGS.phone,
      address: setting.address || DEFAULT_SITE_SETTINGS.address,
      instagram: setting.instagram || DEFAULT_SITE_SETTINGS.instagram,
      bankName: setting.bankName || DEFAULT_SITE_SETTINGS.bankName,
      bankAccount: setting.bankAccount || DEFAULT_SITE_SETTINGS.bankAccount,
      bankHolder: setting.bankHolder || DEFAULT_SITE_SETTINGS.bankHolder,
    };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}
