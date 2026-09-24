"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function confirmContractPayment(id: string) {
  try {
    await requireAdmin();

    await prisma.contract.update({
      where: { id },
      data: {
        isActive: true,
        paymentStatus: "PAID",
      },
    });

    revalidatePath("/admin/kontrak");
    revalidatePath("/dashboard/kontrak");
    return { success: true };
  } catch (error) {
    console.error("Failed to confirm contract payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengonfirmasi pembayaran",
    };
  }
}

export async function updateContract(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const packageName = (formData.get("packageName") as string)?.trim();
    const services = (formData.get("services") as string)?.trim() || "";
    const startDateRaw = formData.get("startDate") as string;
    const endDateRaw = formData.get("endDate") as string;
    const value = parseInt(formData.get("value") as string, 10);
    const paymentStatus = formData.get("paymentStatus") as string;
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!packageName || isNaN(value)) {
      return { success: false, error: "Nama paket dan nilai kontrak wajib diisi." };
    }

    await prisma.contract.update({
      where: { id },
      data: {
        packageName,
        services,
        ...(startDateRaw ? { startDate: new Date(startDateRaw) } : {}),
        ...(endDateRaw ? { endDate: new Date(endDateRaw) } : {}),
        value,
        paymentStatus: paymentStatus as never,
        isActive,
        notes,
      },
    });

    revalidatePath("/admin/kontrak");
    revalidatePath("/dashboard/kontrak");
    return { success: true };
  } catch (error) {
    console.error("Failed to update contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui kontrak",
    };
  }
}

export async function deleteContract(id: string) {
  try {
    await requireAdmin();

    await prisma.contract.delete({
      where: { id },
    });

    revalidatePath("/admin/kontrak");
    revalidatePath("/dashboard/kontrak");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus kontrak",
    };
  }
}
