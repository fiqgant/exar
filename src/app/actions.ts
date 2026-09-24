"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateStrategy, type StrategyResult } from "@/lib/ai";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  businessName: z.string().trim().min(2, "Nama bisnis minimal 2 karakter."),
  businessType: z.string().trim().min(2, "Jenis bisnis wajib diisi."),
  targetCustomer: z.string().trim().min(2, "Target customer wajib diisi."),
  offering: z.string().trim().min(2, "Produk/jasa wajib diisi."),
  problem: z.string().trim().min(2, "Ceritakan masalah yang dihadapi."),
  goal: z.string().trim().min(2, "Tujuan bisnis wajib diisi."),
});

export type StrategyActionState =
  | { status: "idle" }
  | { status: "success"; data: StrategyResult }
  | { status: "error"; message: string };

export async function requestStrategy(
  _prev: StrategyActionState,
  formData: FormData,
): Promise<StrategyActionState> {
  // AI Strategy Generator is a members-only feature: users must sign up / log
  // in before they can generate a strategy.
  const profile = await getCurrentProfile();
  if (!profile) {
    return {
      status: "error",
      message:
        "Silakan masuk atau daftar terlebih dahulu untuk menggunakan AI Strategy Generator.",
    };
  }

  const parsed = schema.safeParse({
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    targetCustomer: formData.get("targetCustomer"),
    offering: formData.get("offering"),
    problem: formData.get("problem"),
    goal: formData.get("goal"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Data tidak lengkap.",
    };
  }

  try {
    const data = await generateStrategy(parsed.data);
    return { status: "success", data };
  } catch (error) {
    console.error("[requestStrategy]", error);
    return {
      status: "error",
      message: "Gagal membuat strategi. Silakan coba lagi sebentar.",
    };
  }
}

async function uploadProof(file: File): Promise<string | undefined> {
  try {
    const admin = createAdminClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `proofs/${crypto.randomUUID()}.${ext}`;

    const { error } = await admin.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type });
    if (error) {
      console.warn("Storage upload error:", error);
      return undefined;
    }
    return admin.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
  } catch (err) {
    console.warn("Supabase upload exception:", err);
    return undefined;
  }
}

export type OrderPackageResult = {
  success: boolean;
  error?: string;
  contractId?: string;
};

export async function createPackageOrder(formData: FormData): Promise<OrderPackageResult> {
  try {
    const packageId = (formData.get("packageId") as string)?.trim();
    const businessName = (formData.get("businessName") as string)?.trim() || "";
    const businessType = (formData.get("businessType") as string)?.trim() || "Bisnis";
    const contactName = (formData.get("contactName") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const phone = (formData.get("phone") as string)?.trim() || "";
    const notes = (formData.get("notes") as string)?.trim() || "";

    if (!packageId || !businessName || !contactName || !phone) {
      return { success: false, error: "Mohon lengkapi semua data wajib bertanda bintang (*)." };
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return { success: false, error: "Paket yang dipilih tidak ditemukan." };
    }

    const proofFile = formData.get("paymentProof");
    let paymentProofUrl: string | undefined;
    if (proofFile instanceof File && proofFile.size > 0) {
      if (proofFile.size > 5 * 1024 * 1024) {
        return { success: false, error: "Ukuran file bukti transfer maksimal 5MB." };
      }
      paymentProofUrl = await uploadProof(proofFile);
    }

    // Match existing client or create a new client
    let client = email ? await prisma.client.findFirst({ where: { email } }) : null;
    if (!client) {
      client = await prisma.client.create({
        data: {
          businessName,
          businessType,
          contactName,
          email: email || null,
          phone,
          isActive: true,
        },
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 4); // Kontrak minimum 4 bulan

    const services = [
      pkg.managementInstagram ? "Instagram" : null,
      pkg.managementTiktok ? "TikTok" : null,
      pkg.managementFacebook ? "Facebook" : null,
      `${pkg.videoReelsCount} Reels`,
      `${pkg.feedsDesignCount} Feeds`,
      pkg.produksiVisit,
    ].filter(Boolean).join(", ");

    const contract = await prisma.contract.create({
      data: {
        clientId: client.id,
        packageId: pkg.id,
        packageName: pkg.name,
        services,
        startDate,
        endDate,
        value: pkg.price,
        paymentStatus: "UNPAID",
        paymentProofUrl,
        notes: notes || null,
        isActive: false, // Menunggu konfirmasi admin!
      },
    });

    revalidatePath("/admin/kontrak");
    revalidatePath("/dashboard/kontrak");

    return {
      success: true,
      contractId: contract.id,
    };
  } catch (error) {
    console.error("[createPackageOrder]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat memproses pesanan",
    };
  }
}