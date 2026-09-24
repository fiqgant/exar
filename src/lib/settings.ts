export type SiteSettings = {
  whatsapp: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp: "6281234567890",
  email: "halo@exarproject.com",
  phone: "+62 812 3456 7890",
  address: "Bandung, Indonesia",
  instagram: "https://instagram.com/exarproject",
  bankName: "BCA",
  bankAccount: "1234567890",
  bankHolder: "PT EXAR Digital Studio",
};

/** Formats any phone number into standard international WhatsApp digits (e.g. 628...) */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/** Generates a direct wa.me link with prefilled text message. */
export function createWhatsAppUrl(phone: string, text: string): string {
  const number = formatWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
