"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getYouTubeThumbnailUrl } from "@/lib/format";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

async function uploadMediaFile(file: File, prefix: "img" | "vid"): Promise<string> {
  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || (prefix === "img" ? "jpg" : "mp4");
  const path = `${prefix}-${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const contentType = file.type || (prefix === "img" ? "image/jpeg" : "video/mp4");

  const { error } = await admin.storage
    .from("portfolio")
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`Storage upload error for ${prefix}:`, error);
    throw new Error(error.message || `Gagal mengunggah file ${prefix === "img" ? "gambar" : "video"}`);
  }

  const { data } = admin.storage.from("portfolio").getPublicUrl(path);
  return data.publicUrl;
}

const contentSchema = z.object({
  clientId: z.string().min(1, "Klien wajib dipilih"),
  title: z.string().trim().min(2, "Judul minimal 2 karakter"),
  type: z.string().trim().min(1),
  platform: z.string().trim().min(1),
  scheduledAt: z.string().min(1, "Jadwal upload wajib diisi"),
  caption: z.string().trim().min(1, "Caption wajib diisi"),
  hashtags: z.string().optional(),
  objective: z.string().optional(),
  strategy: z.string().optional(),
  status: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export async function createContent(formData: FormData) {
  try {
    await requireAdmin();

    const parsed = contentSchema.safeParse({
      clientId: formData.get("clientId"),
      title: formData.get("title"),
      type: formData.get("type"),
      platform: formData.get("platform"),
      scheduledAt: formData.get("scheduledAt"),
      caption: formData.get("caption"),
      hashtags: formData.get("hashtags"),
      objective: formData.get("objective"),
      strategy: formData.get("strategy"),
      imageUrl: formData.get("imageUrl") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" };
    }

    const { clientId, type, platform, scheduledAt, ...rest } = parsed.data;

    let finalImageUrl = rest.imageUrl?.trim() || null;
    let finalVideoUrl = rest.videoUrl?.trim() || null;

    // Handle uploaded image file
    const imageFile = formData.get("imageFile");
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > MAX_IMAGE_BYTES) {
        return { success: false, error: "Ukuran gambar maksimal 15MB" };
      }
      try {
        finalImageUrl = await uploadMediaFile(imageFile, "img");
      } catch (err) {
        return {
          success: false,
          error: `Gagal upload gambar: ${err instanceof Error ? err.message : "Kesalahan server"}`,
        };
      }
    }

    // Handle uploaded video file
    const videoFile = formData.get("videoFile");
    if (videoFile instanceof File && videoFile.size > 0) {
      if (videoFile.size > MAX_VIDEO_BYTES) {
        return { success: false, error: "Ukuran video maksimal 50MB" };
      }
      try {
        finalVideoUrl = await uploadMediaFile(videoFile, "vid");
      } catch (err) {
        return {
          success: false,
          error: `Gagal upload video: ${err instanceof Error ? err.message : "Kesalahan server"}`,
        };
      }
    }

    // Auto-extract YouTube thumbnail if no image is uploaded
    if (!finalImageUrl && finalVideoUrl) {
      const ytThumb = getYouTubeThumbnailUrl(finalVideoUrl);
      if (ytThumb) finalImageUrl = ytThumb;
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: "Format tanggal jadwal upload tidak valid" };
    }

    await prisma.content.create({
      data: {
        clientId,
        title: rest.title,
        caption: rest.caption,
        hashtags: rest.hashtags ?? "",
        objective: rest.objective ?? "",
        strategy: rest.strategy ?? "",
        type: type as never,
        platform: platform as never,
        scheduledAt: scheduledDate,
        status: "DRAFT",
        previewColor: "#B42424",
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
      },
    });

    revalidatePath("/admin/konten");
    revalidatePath("/admin");
    revalidatePath("/dashboard/konten");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to create content:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membuat konten baru",
    };
  }
}

export async function updateContent(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const parsed = contentSchema.safeParse({
      clientId: formData.get("clientId"),
      title: formData.get("title"),
      type: formData.get("type"),
      platform: formData.get("platform"),
      scheduledAt: formData.get("scheduledAt"),
      caption: formData.get("caption"),
      hashtags: formData.get("hashtags"),
      objective: formData.get("objective"),
      strategy: formData.get("strategy"),
      status: formData.get("status"),
      imageUrl: formData.get("imageUrl") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Input tidak valid",
      };
    }

    const { clientId, type, platform, scheduledAt, status, ...rest } = parsed.data;

    // Retrieve current content to preserve existing media if not modified
    const current = await prisma.content.findUnique({ where: { id } });
    if (!current) {
      return { success: false, error: "Konten tidak ditemukan" };
    }

    let finalImageUrl = current.imageUrl;
    let finalVideoUrl = current.videoUrl;

    // Check URL inputs if specified in form
    if (rest.imageUrl !== undefined) {
      finalImageUrl = rest.imageUrl.trim() || null;
    }
    if (rest.videoUrl !== undefined) {
      finalVideoUrl = rest.videoUrl.trim() || null;
    }

    // Handle new uploaded image file (takes priority over manual URL)
    const imageFile = formData.get("imageFile");
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > MAX_IMAGE_BYTES) {
        return { success: false, error: "Ukuran gambar maksimal 15MB" };
      }
      try {
        finalImageUrl = await uploadMediaFile(imageFile, "img");
      } catch (err) {
        return {
          success: false,
          error: `Gagal upload gambar: ${err instanceof Error ? err.message : "Kesalahan server"}`,
        };
      }
    }

    // Handle new uploaded video file (takes priority over manual URL)
    const videoFile = formData.get("videoFile");
    if (videoFile instanceof File && videoFile.size > 0) {
      if (videoFile.size > MAX_VIDEO_BYTES) {
        return { success: false, error: "Ukuran video maksimal 50MB" };
      }
      try {
        finalVideoUrl = await uploadMediaFile(videoFile, "vid");
      } catch (err) {
        return {
          success: false,
          error: `Gagal upload video: ${err instanceof Error ? err.message : "Kesalahan server"}`,
        };
      }
    }

    // Explicit removal flags override previous values
    if (formData.get("removeImage") === "true") {
      finalImageUrl = null;
    }
    if (formData.get("removeVideo") === "true") {
      finalVideoUrl = null;
    }

    // Auto-extract YouTube thumbnail if no image is uploaded
    if (!finalImageUrl && finalVideoUrl) {
      const ytThumb = getYouTubeThumbnailUrl(finalVideoUrl);
      if (ytThumb) finalImageUrl = ytThumb;
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: "Format tanggal jadwal upload tidak valid" };
    }

    await prisma.content.update({
      where: { id },
      data: {
        client: { connect: { id: clientId } },
        title: rest.title,
        caption: rest.caption,
        hashtags: rest.hashtags ?? "",
        objective: rest.objective ?? "",
        strategy: rest.strategy ?? "",
        type: type as never,
        platform: platform as never,
        scheduledAt: scheduledDate,
        ...(status ? { status: status as never } : {}),
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
      },
    });

    revalidatePath("/admin/konten");
    revalidatePath("/admin");
    revalidatePath("/dashboard/konten");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to update content:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui konten",
    };
  }
}

export async function setContentStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.content.update({
    where: { id },
    data: { status: status as never },
  });
  revalidatePath("/admin/konten");
  revalidatePath("/admin");
  revalidatePath("/dashboard/konten");
  revalidatePath("/dashboard");
}

export async function deleteContent(id: string) {
  await requireAdmin();

  try {
    await prisma.content.delete({
      where: { id },
    });

    revalidatePath("/admin/konten");
    revalidatePath("/admin");
    revalidatePath("/dashboard/konten");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete content:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus konten",
    };
  }
}