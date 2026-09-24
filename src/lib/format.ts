export function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function daysUntil(date: Date | string) {
  const target = new Date(date);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

export const CONTENT_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  SCHEDULED: { label: "Scheduled", className: "bg-blue-500/10 text-blue-600" },
  PUBLISHED: { label: "Published", className: "bg-emerald-500/10 text-emerald-600" },
  REVISION: { label: "Revision", className: "bg-amber-500/10 text-amber-600" },
  APPROVED: { label: "Approved", className: "bg-primary/10 text-primary" },
  REJECTED: { label: "Rejected", className: "bg-red-500/10 text-red-600" },
};

export const CONTENT_TYPE_LABEL: Record<string, string> = {
  REELS: "Reels",
  FEED: "Feed",
  STORY: "Story",
  CAROUSEL: "Carousel",
  VIDEO: "Video",
};

export const PLATFORM_LABEL: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
};

export const LEAD_STATUS: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-blue-500/10 text-blue-600" },
  CONTACTED: { label: "Contacted", className: "bg-amber-500/10 text-amber-600" },
  FOLLOW_UP: { label: "Follow Up", className: "bg-purple-500/10 text-purple-600" },
  QUALIFIED: { label: "Qualified", className: "bg-primary/10 text-primary" },
  CONVERTED: { label: "Converted", className: "bg-emerald-500/10 text-emerald-600" },
};

export const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  UNPAID: { label: "Belum Bayar", className: "bg-red-500/10 text-red-600" },
  PARTIAL: { label: "Sebagian", className: "bg-amber-500/10 text-amber-600" },
  PAID: { label: "Lunas", className: "bg-emerald-500/10 text-emerald-600" },
};

/** Extracts YouTube video ID from various YouTube URL formats (watch, youtu.be, shorts, embed) */
export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i,
  );
  return match && match[1] ? match[1] : null;
}

/** Returns YouTube embed iframe URL (using privacy-enhanced youtube-nocookie.com) */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}

/** Returns YouTube high quality thumbnail URL */
export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** Checks whether a URL is a YouTube link */
export function isYouTubeUrl(url?: string | null): boolean {
  return Boolean(getYouTubeVideoId(url));
}