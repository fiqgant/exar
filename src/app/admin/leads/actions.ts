"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const leadSchema = z.object({
  clientId: z.string().min(1, "Klien wajib dipilih"),
  name: z.string().trim().min(2, "Nama lead wajib diisi"),
  source: z.string().trim().min(1, "Sumber wajib diisi"),
  interest: z.string().trim().min(1, "Produk / minat wajib diisi"),
  status: z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "QUALIFIED", "CONVERTED"]).default("NEW"),
  potentialValue: z.coerce.number().min(0).default(0),
  followUp: z.string().optional(),
});

export async function createLead(formData: FormData) {
  await requireAdmin();

  const parsed = leadSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    source: formData.get("source"),
    interest: formData.get("interest"),
    status: formData.get("status") || "NEW",
    potentialValue: formData.get("potentialValue") || 0,
    followUp: formData.get("followUp") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  try {
    await prisma.lead.create({
      data: parsed.data,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Failed to create lead:", err);
    return { success: false, error: "Gagal membuat lead baru" };
  }
}

export async function updateLead(id: string, formData: FormData) {
  await requireAdmin();

  const parsed = leadSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    source: formData.get("source"),
    interest: formData.get("interest"),
    status: formData.get("status") || "NEW",
    potentialValue: formData.get("potentialValue") || 0,
    followUp: formData.get("followUp") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  try {
    await prisma.lead.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Failed to update lead:", err);
    return { success: false, error: "Gagal memperbarui lead" };
  }
}

export async function deleteLead(id: string) {
  await requireAdmin();

  try {
    await prisma.lead.delete({
      where: { id },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete lead:", err);
    return { success: false, error: "Gagal menghapus lead" };
  }
}
