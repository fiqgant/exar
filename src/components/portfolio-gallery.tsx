"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Clapperboard,
  Palette,
  PlayCircle,
  Share2,
  ZoomIn,
  ExternalLink,
  Film,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  clientName: string;
  description: string;
  coverColor: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

const CATEGORIES = [
  { key: "ALL", label: "Semua" },
  { key: "PHOTOGRAPHY", label: "Photography" },
  { key: "VIDEOGRAPHY", label: "Videography" },
  { key: "CONTENT_CREATION", label: "Content Creation" },
  { key: "SOCIAL_MEDIA_MANAGEMENT", label: "Social Media" },
] as const;

const CATEGORY_ICON: Record<string, typeof Camera> = {
  PHOTOGRAPHY: Camera,
  VIDEOGRAPHY: Clapperboard,
  CONTENT_CREATION: Palette,
  SOCIAL_MEDIA_MANAGEMENT: Share2,
};

const CATEGORY_LABEL: Record<string, string> = {
  PHOTOGRAPHY: "Photography",
  VIDEOGRAPHY: "Videography",
  CONTENT_CREATION: "Content Creation",
  SOCIAL_MEDIA_MANAGEMENT: "Social Media",
};

/** Extracts 11-character video ID from various YouTube URL formats. */
export function getYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/** Resolves thumbnail: priority is uploaded imageUrl, then auto YouTube thumbnail, otherwise null. */
export function getItemThumbnail(item: {
  imageUrl?: string | null;
  videoUrl?: string | null;
}): string | null {
  if (item.imageUrl) return item.imageUrl;
  const ytId = getYoutubeId(item.videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return null;
}

export function PortfolioGallery({ items }: { items: PortfolioItem[] }) {
  const [active, setActive] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [modalView, setModalView] = useState<"image" | "video">("image");

  const filtered =
    active === "ALL" ? items : items.filter((i) => i.category === active);

  const handleOpenItem = (item: PortfolioItem) => {
    setSelectedItem(item);
    // If has image, default to image view; otherwise default to video view
    if (item.imageUrl) {
      setModalView("image");
    } else if (item.videoUrl) {
      setModalView("video");
    } else {
      setModalView("image");
    }
  };

  const selectedYtId = selectedItem ? getYoutubeId(selectedItem.videoUrl) : null;
  const selectedThumbnail = selectedItem ? getItemThumbnail(selectedItem) : null;
  const hasBothMedia = Boolean(selectedItem?.imageUrl && selectedItem?.videoUrl);

  return (
    <div>
      {/* Category filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const count =
            cat.key === "ALL"
              ? items.length
              : items.filter((i) => i.category === cat.key).length;
          if (cat.key !== "ALL" && count === 0) return null;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActive(cat.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active === cat.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Portfolio Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, index) => {
          const Icon = CATEGORY_ICON[item.category] ?? Camera;
          const thumbnail = getItemThumbnail(item);
          const isVideo = Boolean(
            item.videoUrl || item.category === "VIDEOGRAPHY",
          );

          return (
            <Reveal key={item.id} delay={index * 60}>
              <article
                onClick={() => handleOpenItem(item)}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5"
              >
                {/* Media Preview Box */}
                <div
                  className="relative flex h-52 w-full items-center justify-center overflow-hidden"
                  style={{ backgroundColor: item.coverColor }}
                >
                  {thumbnail ? (
                    <>
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />

                      {/* Video overlay with play badge */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                          <div className="flex size-14 items-center justify-center rounded-full bg-white/25 text-white shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                            <PlayCircle className="size-8 text-white fill-white/20" />
                          </div>
                        </div>
                      )}

                      {/* Non-video hover zoom indicator */}
                      {!isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
                          <div className="flex size-11 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                            <ZoomIn className="size-5" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : isVideo ? (
                    <>
                      <div className="absolute inset-0 bg-dots text-white/40 opacity-60" />
                      <div className="relative flex flex-col items-center gap-2 text-white">
                        <div className="flex size-14 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                          <PlayCircle className="size-8" />
                        </div>
                        <span className="text-xs font-medium tracking-wide">
                          Tonton Video
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-dots text-white/40 opacity-60" />
                      <div className="relative flex flex-col items-center gap-2 text-white/85">
                        <Icon className="size-10 transition-transform duration-500 group-hover:scale-110" />
                        <span className="text-xs font-medium tracking-wide">
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </span>
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                      {item.clientName}
                    </p>
                    <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      {isVideo ? (
                        <>
                          <PlayCircle className="size-3.5" />
                          Lihat detail & video
                        </>
                      ) : (
                        <>
                          <ZoomIn className="size-3.5" />
                          Lihat gambar penuh
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Lightbox / Media Modal Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-4xl border-border bg-card">
          {selectedItem && (
            <div>
              {/* Media Display Container */}
              <div className="relative flex w-full items-center justify-center bg-black/90">
                {modalView === "video" && selectedItem.videoUrl ? (
                  selectedYtId ? (
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${selectedYtId}?autoplay=1&rel=0`}
                        title={selectedItem.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
                      <PlayCircle className="size-16 text-primary" />
                      <div>
                        <p className="font-semibold text-base">Video Eksternal</p>
                        <p className="text-xs text-white/70 max-w-sm mt-1">
                          Video ini dihosting di platform eksternal. Klik tombol di bawah untuk membukanya.
                        </p>
                      </div>
                      <a
                        href={selectedItem.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
                      >
                        <ExternalLink className="size-4" /> Buka Video
                      </a>
                    </div>
                  )
                ) : selectedThumbnail ? (
                  <div className="relative flex max-h-[65vh] min-h-[260px] w-full items-center justify-center p-3">
                    <Image
                      src={selectedThumbnail}
                      alt={selectedItem.title}
                      width={1200}
                      height={800}
                      unoptimized
                      className="max-h-[62vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                    />
                  </div>
                ) : (
                  <div
                    className="flex min-h-[260px] w-full flex-col items-center justify-center gap-3 p-8 text-center text-white"
                    style={{ backgroundColor: selectedItem.coverColor }}
                  >
                    <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Camera className="size-8" />
                    </div>
                    <span className="text-sm font-medium">
                      {CATEGORY_LABEL[selectedItem.category] ?? selectedItem.category}
                    </span>
                  </div>
                )}

                {/* Media Switcher Tab (if both image and video exist) */}
                {hasBothMedia && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full border border-white/15 bg-black/60 p-1 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => setModalView("image")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                        modalView === "image"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-white/75 hover:text-white",
                      )}
                    >
                      <ImageIcon className="size-3.5" />
                      Gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalView("video")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                        modalView === "video"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-white/75 hover:text-white",
                      )}
                    >
                      <Film className="size-3.5" />
                      Video
                    </button>
                  </div>
                )}
              </div>

              {/* Information & Details Footer */}
              <div className="p-6">
                <DialogHeader className="gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                      {selectedItem.clientName}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                      {CATEGORY_LABEL[selectedItem.category] ?? selectedItem.category}
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-bold sm:text-2xl mt-1">
                    {selectedItem.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground mt-2">
                    {selectedItem.description}
                  </DialogDescription>
                </DialogHeader>

                {/* External video link button if videoUrl exists and viewing image */}
                {selectedItem.videoUrl && modalView === "image" && (
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setModalView("video")}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <PlayCircle className="size-4" /> Tonton Video Portofolio
                    </button>

                    <a
                      href={selectedItem.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="size-3.5" /> Buka tautan asli
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
