"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function createTerm(formData: FormData) {
  await requireAdmin();

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const last = await prisma.termsCondition.findFirst({
    orderBy: { order: "desc" },
  });

  await prisma.termsCondition.create({
    data: { content, order: (last?.order ?? 0) + 1 },
  });

  revalidatePath("/admin/syarat-ketentuan");
  revalidatePath("/syarat-ketentuan");
}

export async function updateTerm(id: string, formData: FormData) {
  await requireAdmin();

  const content = String(formData.get("content") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  if (!content) return;

  await prisma.termsCondition.update({
    where: { id },
    data: { content, order },
  });

  revalidatePath("/admin/syarat-ketentuan");
  revalidatePath("/syarat-ketentuan");
}

export async function deleteTerm(id: string) {
  await requireAdmin();

  await prisma.termsCondition.delete({ where: { id } });

  revalidatePath("/admin/syarat-ketentuan");
  revalidatePath("/syarat-ketentuan");
}
