"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const createSchema = z.object({
  businessName: z.string().trim().min(2, "Nama bisnis minimal 2 karakter"),
  businessType: z.string().trim().min(2, "Jenis bisnis wajib diisi"),
  contactName: z.string().trim().min(2, "Nama kontak minimal 2 karakter"),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export async function createClient(formData: FormData) {
  try {
    await requireAdmin();

    const parsed = createSchema.safeParse({
      businessName: formData.get("businessName"),
      businessType: formData.get("businessType"),
      contactName: formData.get("contactName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Data tidak valid" };
    }

    await prisma.client.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
      },
    });

    revalidatePath("/admin/klien");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to create client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat klien",
    };
  }
}

export async function updateClient(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const businessName = (formData.get("businessName") as string)?.trim();
    const businessType = (formData.get("businessType") as string)?.trim();
    const contactName = (formData.get("contactName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim() || null;
    const phone = (formData.get("phone") as string)?.trim() || null;
    const address = (formData.get("address") as string)?.trim() || null;
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    if (!businessName || !businessType || !contactName) {
      return { success: false, error: "Nama bisnis, jenis bisnis, dan nama kontak wajib diisi." };
    }

    await prisma.client.update({
      where: { id },
      data: {
        businessName,
        businessType,
        contactName,
        email,
        phone,
        address,
        isActive,
      },
    });

    revalidatePath("/admin/klien");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui klien",
    };
  }
}

export async function deleteClient(id: string) {
  try {
    await requireAdmin();

    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/admin/klien");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus klien",
    };
  }
}

export async function toggleClientActive(id: string, isActive: boolean) {
  try {
    await requireAdmin();
    await prisma.client.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/klien");
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle client active:", err);
    return { success: false, error: "Gagal mengubah status klien" };
  }
}