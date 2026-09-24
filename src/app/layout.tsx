import type { Metadata } from "next";
import { Geist_Mono, Onest } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const onest = Onest({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EXAR Project — Partner Strategi Digital untuk Bisnis Anda",
    template: "%s · EXAR Project",
  },
  description:
    "EXAR Project membantu bisnis Anda tumbuh lewat konten, media sosial, dan strategi digital yang terukur — transparan dalam satu platform.",
  keywords: [
    "EXAR Project",
    "social media management",
    "content creation",
    "digital strategy",
    "agency digital Indonesia",
  ],
  openGraph: {
    title: "EXAR Project — Eternal Xpression of Art & Reality",
    description:
      "Partner strategi digital untuk bisnis Anda. Dari konten, media sosial, sampai laporan performa.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${onest.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
