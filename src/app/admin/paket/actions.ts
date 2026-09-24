"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const packageSchema = z.object({
  name: z.string().trim().min(2, "Nama paket wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  videoReelsCount: z.coerce.number().min(0).default(0),
  feedsDesignCount: z.coerce.number().min(0).default(0),
  produksiVisit: z.string().trim().default("Tidak ada visit"),
  recommended: z.boolean().default(false),
  isActive: z.boolean().default(true),
  freeFotoProduk: z.boolean().default(false),
  managementInstagram: z.boolean().default(false),
  managementTiktok: z.boolean().default(false),
  managementFacebook: z.boolean().default(false),
  professionalTallent: z.boolean().default(false),
});

export async function createPackage(formData: FormData) {
  await requireAdmin();

  const checkbox = (name: string) => formData.get(name) === "on" || formData.get(name) === "true";

  const parsed = packageSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    videoReelsCount: formData.get("videoReelsCount"),
    feedsDesignCount: formData.get("feedsDesignCount"),
    produksiVisit: formData.get("produksiVisit"),
    recommended: checkbox("recommended"),
    isActive: checkbox("isActive"),
    freeFotoProduk: checkbox("freeFotoProduk"),
    managementInstagram: checkbox("managementInstagram"),
    managementTiktok: checkbox("managementTiktok"),
    managementFacebook: checkbox("managementFacebook"),
    professionalTallent: checkbox("professionalTallent"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  try {
    const highestOrder = await prisma.package.aggregate({
      _max: { order: true },
    });
    const nextOrder = (highestOrder._max.order ?? 0) + 1;

    await prisma.package.create({
      data: {
        ...parsed.data,
        order: nextOrder,
      },
    });

    revalidatePath("/admin/paket");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to create package:", err);
    return { success: false, error: "Gagal membuat paket baru" };
  }
}

export async function updatePackage(id: string, formData: FormData) {
  await requireAdmin();

  const checkbox = (name: string) => formData.get(name) === "on" || formData.get(name) === "true";

  const parsed = packageSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    videoReelsCount: formData.get("videoReelsCount"),
    feedsDesignCount: formData.get("feedsDesignCount"),
    produksiVisit: formData.get("produksiVisit"),
    recommended: checkbox("recommended"),
    isActive: checkbox("isActive"),
    freeFotoProduk: checkbox("freeFotoProduk"),
    managementInstagram: checkbox("managementInstagram"),
    managementTiktok: checkbox("managementTiktok"),
    managementFacebook: checkbox("managementFacebook"),
    professionalTallent: checkbox("professionalTallent"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  try {
    await prisma.package.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/paket");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to update package:", err);
    return { success: false, error: "Gagal memperbarui paket" };
  }
}

export async function deletePackage(id: string) {
  await requireAdmin();

  try {
    // Set packageId to null on associated contracts before deleting
    await prisma.contract.updateMany({
      where: { packageId: id },
      data: { packageId: null },
    });

    await prisma.package.delete({
      where: { id },
    });

    revalidatePath("/admin/paket");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete package:", err);
    return { success: false, error: "Gagal menghapus paket" };
  }
}
