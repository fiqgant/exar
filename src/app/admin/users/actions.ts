"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const createUserSchema = z.object({
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: z.enum(["ADMIN", "CLIENT"]),
});

/** Admin-provisioned account: created pre-confirmed, so it can log in immediately. */
export async function createUserAccount(formData: FormData) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    redirect(
      `/admin/users?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Data tidak lengkap.",
      )}`,
    );
  }

  const { email, password, role } = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect(
      `/admin/users?error=${encodeURIComponent(error?.message ?? "Gagal membuat user.")}`,
    );
  }

  await prisma.profile.upsert({
    where: { id: data.user.id },
    create: { id: data.user.id, email, role },
    update: { role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?success=1");
}

export async function updateUserRole(id: string, formData: FormData) {
  const admin = await requireAdmin();

  const role = String(formData.get("role") ?? "CLIENT") as "ADMIN" | "CLIENT";

  // Guard against an admin locking themselves out by demoting their own account.
  if (id === admin.id && role !== "ADMIN") {
    return { success: false, error: "Tidak dapat mengubah role akun Anda sendiri" };
  }

  try {
    await prisma.profile.update({ where: { id }, data: { role } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("Failed to update role:", err);
    return { success: false, error: "Gagal mengubah role" };
  }
}

export async function deleteUserAccount(id: string) {
  const admin = await requireAdmin();

  if (id === admin.id) {
    return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri" };
  }

  try {
    // Unlink any Client record pointing to this profileId
    await prisma.client.updateMany({
      where: { profileId: id },
      data: { profileId: null },
    });

    // Delete from Supabase Auth
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.auth.admin.deleteUser(id);

    // Delete from Prisma Profile
    await prisma.profile.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete user account:", err);
    return { success: false, error: "Gagal menghapus akun user" };
  }
}

