"use client";

import { useState } from "react";
import {
  Video,
  ImageIcon,
  Maximize2,
  ExternalLink,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONTENT_TYPE_LABEL,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  isYouTubeUrl,
} from "@/lib/format";

export function ContentMediaPreview({
  imageUrl,
  videoUrl,
  previewColor,
  type,
  title,
}: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  previewColor: string;
  type: string;
  title: string;
}) {
  const isYoutube = isYouTubeUrl(videoUrl);
  const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);
  const youtubeThumbnail = getYouTubeThumbnailUrl(videoUrl);
  const effectiveImageUrl = imageUrl || youtubeThumbnail;

  const hasBoth = Boolean(effectiveImageUrl && videoUrl);
  const [activeTab, setActiveTab] = useState<"video" | "image">(
    videoUrl ? "video" : "image",
  );
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Switch Tab if both image and video exist */}
      {hasBoth && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeTab === "video" ? "default" : "outline"}
            onClick={() => setActiveTab("video")}
            className="h-8 gap-1.5 text-xs"
          >
            <Video className="size-3.5" />
            {isYoutube ? "YouTube Video" : "Video Preview"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === "image" ? "default" : "outline"}
            onClick={() => setActiveTab("image")}
            className="h-8 gap-1.5 text-xs"
          >
            <ImageIcon className="size-3.5" />
            {imageUrl ? "Gambar / Desain" : "Thumbnail Video"}
          </Button>
        </div>
      )}

      {/* Media Player / Viewer Container */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* VIDEO TAB / VIEW */}
        {videoUrl && (!hasBoth || activeTab === "video") && (
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : (
              <video
                src={videoUrl}
                controls
                poster={effectiveImageUrl || undefined}
                className="h-full w-full object-contain"
                playsInline
              >
                Browser Anda tidak mendukung tag video HTML5.
              </video>
            )}

            <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md flex items-center gap-1.5 pointer-events-auto">
                {isYoutube ? (
                  <>
                    <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                    <span>YouTube</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3 text-primary fill-primary" />
                    <span>Video Review</span>
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* IMAGE TAB / VIEW */}
        {effectiveImageUrl && (!videoUrl || (hasBoth && activeTab === "image")) && (
          <div className="group relative aspect-video w-full overflow-hidden bg-secondary flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={effectiveImageUrl}
              alt={title}
              className="h-full w-full object-contain bg-black/5"
            />

            {/* Hover Overlay with Zoom Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsZoomOpen(true)}
                className="gap-2 shadow-lg backdrop-blur-sm"
              >
                <Maximize2 className="size-4" />
                Lihat Ukuran Penuh
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-3 right-3 rounded-full bg-black/60 p-2 text-white shadow-md backdrop-blur-md hover:bg-black/80 transition-colors"
              title="Perbesar gambar"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
        )}

        {/* PLACEHOLDER WHEN NO MEDIA IS AVAILABLE */}
        {!effectiveImageUrl && !videoUrl && (
          <div
            className="relative flex h-64 items-center justify-center overflow-hidden"
            style={{ backgroundColor: previewColor }}
          >
            <div className="absolute inset-0 bg-dots text-white/40 opacity-60" />
            <div className="relative text-center p-6 text-white">
              <span className="inline-block rounded-full bg-black/30 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
                Preview · {CONTENT_TYPE_LABEL[type as keyof typeof CONTENT_TYPE_LABEL] ?? type}
              </span>
              <p className="mt-2 text-sm text-white/80">
                Aset media (gambar/video) sedang disiapkan oleh tim produksi EXAR.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Direct external link if video or image is present */}
      {(videoUrl || effectiveImageUrl) && (
        <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 transition-colors ${
                isYoutube ? "text-red-600 hover:text-red-700 font-medium" : "hover:text-primary"
              }`}
            >
              {isYoutube ? "Tonton di YouTube" : "Buka video di tab baru"} <ExternalLink className="size-3" />
            </a>
          )}
          {effectiveImageUrl && (
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              Perbesar gambar <Maximize2 className="size-3" />
            </button>
          )}
        </div>
      )}

      {/* Image Zoom Modal Lightbox */}
      {effectiveImageUrl && (
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogContent className="max-w-4xl p-2 sm:p-4 bg-background/95 backdrop-blur-md">
            <DialogHeader className="px-2 pt-2">
              <DialogTitle className="text-base truncate">{title}</DialogTitle>
            </DialogHeader>
            <div className="relative mt-2 max-h-[80vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveImageUrl}
                alt={title}
                className="max-h-[78vh] w-auto object-contain mx-auto"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
