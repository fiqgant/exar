"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const session = await getCurrentClient();
  if (!session?.client) throw new Error("Unauthorized");

  await prisma.client.update({
    where: { id: session.client.id },
    data: {
      businessName: String(formData.get("businessName") ?? "").trim(),
      businessType: String(formData.get("businessType") ?? "").trim(),
      contactName: String(formData.get("contactName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
    },
  });

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard");
}