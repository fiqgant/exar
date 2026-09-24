"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const CATEGORIES = [
  "PHOTOGRAPHY",
  "VIDEOGRAPHY",
  "CONTENT_CREATION",
  "SOCIAL_MEDIA_MANAGEMENT",
] as const;

const schema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter"),
  category: z.enum(CATEGORIES, { message: "Kategori tidak valid" }),
  clientName: z.string().trim().min(1, "Nama klien wajib diisi"),
  description: z.string().trim().min(2, "Deskripsi minimal 2 karakter"),
  coverColor: z.string().trim().default("#B42424"),
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function cleanUrl(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isValidUrl(val: string): boolean {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

/** Uploads to the public "portfolio" Storage bucket, returns its public URL. */
async function uploadImage(file: File) {
  const admin = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage
    .from("portfolio")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;

  return admin.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}

export type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function createPortfolio(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const rawVideoUrl = (formData.get("videoUrl") as string)?.trim() || "";
    const videoUrl = cleanUrl(rawVideoUrl);

    if (videoUrl && !isValidUrl(videoUrl)) {
      return { success: false, error: "Format link video tidak valid. Pastikan URL benar." };
    }

    const parsed = schema.safeParse({
      title: formData.get("title"),
      category: formData.get("category"),
      clientName: formData.get("clientName"),
      description: formData.get("description"),
      coverColor: formData.get("coverColor") || "#B42424",
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Data input tidak valid";
      return { success: false, error: firstIssue };
    }

    const image = formData.get("image");
    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      if (image.size > MAX_IMAGE_BYTES) {
        return { success: false, error: "Ukuran gambar maksimal 5MB" };
      }
      try {
        imageUrl = await uploadImage(image);
      } catch (uploadErr) {
        console.error("Gagal mengunggah gambar ke Supabase Storage:", uploadErr);
        return {
          success: false,
          error:
            "Gagal mengunggah gambar ke storage: " +
            (uploadErr instanceof Error ? uploadErr.message : String(uploadErr)),
        };
      }
    }

    const order = await prisma.portfolio.count();

    await prisma.portfolio.create({
      data: {
        ...parsed.data,
        imageUrl,
        videoUrl: videoUrl || undefined,
        order: order + 1,
      },
    });

    revalidatePath("/admin/portofolio");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Gagal membuat portofolio:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat menambah portofolio",
    };
  }
}

export async function updatePortfolio(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const rawVideoUrl = (formData.get("videoUrl") as string)?.trim() || "";
    const videoUrl = cleanUrl(rawVideoUrl);

    if (videoUrl && !isValidUrl(videoUrl)) {
      return { success: false, error: "Format link video tidak valid. Pastikan URL benar." };
    }

    const parsed = schema.safeParse({
      title: formData.get("title"),
      category: formData.get("category"),
      clientName: formData.get("clientName"),
      description: formData.get("description"),
      coverColor: formData.get("coverColor") || "#B42424",
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Data input tidak valid";
      return { success: false, error: firstIssue };
    }

    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
    const removeImage = formData.get("removeImage") === "true";

    const image = formData.get("image");
    let imageUrlToSet: string | null | undefined = undefined;

    if (removeImage) {
      imageUrlToSet = null;
    } else if (image instanceof File && image.size > 0) {
      if (image.size > MAX_IMAGE_BYTES) {
        return { success: false, error: "Ukuran gambar maksimal 5MB" };
      }
      try {
        imageUrlToSet = await uploadImage(image);
      } catch (uploadErr) {
        console.error("Gagal mengunggah gambar baru:", uploadErr);
        return {
          success: false,
          error:
            "Gagal mengunggah gambar ke storage: " +
            (uploadErr instanceof Error ? uploadErr.message : String(uploadErr)),
        };
      }
    }

    await prisma.portfolio.update({
      where: { id },
      data: {
        ...parsed.data,
        videoUrl: videoUrl || null,
        isActive,
        ...(imageUrlToSet !== undefined ? { imageUrl: imageUrlToSet } : {}),
      },
    });

    revalidatePath("/admin/portofolio");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Gagal memperbarui portofolio:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui portofolio",
    };
  }
}

export async function deletePortfolio(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath("/admin/portofolio");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Gagal menghapus portofolio:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus portofolio",
    };
  }
}

export async function togglePortfolioActive(
  id: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    await prisma.portfolio.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/portofolio");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Gagal mengubah status portofolio:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat mengubah status",
    };
  }
}