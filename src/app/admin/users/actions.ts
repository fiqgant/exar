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
  clientId: z.string().optional(),
});

/** Admin-provisioned account: created pre-confirmed, so it can log in immediately. */
export async function createUserAccount(formData: FormData) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    clientId: formData.get("clientId") || undefined,
  });
  if (!parsed.success) {
    redirect(
      `/admin/users?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Data tidak lengkap.",
      )}`,
    );
  }

  const { email, password, role, clientId } = parsed.data;

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

  if (role === "CLIENT" && clientId && clientId !== "none") {
    await prisma.client.updateMany({
      where: { profileId: data.user.id },
      data: { profileId: null },
    });
    await prisma.client.update({
      where: { id: clientId },
      data: { profileId: data.user.id },
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/klien");
  redirect("/admin/users?success=1");
}

export async function updateUserAccount(id: string, formData: FormData) {
  const currentAdmin = await requireAdmin();

  const email = (formData.get("email") as string)?.trim();
  const role = (formData.get("role") as string)?.trim() as "ADMIN" | "CLIENT";
  const password = (formData.get("password") as string)?.trim();
  const clientId = (formData.get("clientId") as string)?.trim();

  if (!email || !email.includes("@")) {
    return { success: false, error: "Format email tidak valid." };
  }

  if (!["ADMIN", "CLIENT"].includes(role)) {
    return { success: false, error: "Role tidak valid." };
  }

  if (id === currentAdmin.id && role !== "ADMIN") {
    return { success: false, error: "Tidak dapat mengubah role akun Anda sendiri." };
  }

  if (password && password.length < 6) {
    return { success: false, error: "Password baru minimal 6 karakter." };
  }

  try {
    const existing = await prisma.profile.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "User tidak ditemukan." };
    }

    const supabaseAdmin = createAdminClient();
    const updateAttrs: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
    } = {};

    if (email !== existing.email) {
      updateAttrs.email = email;
      updateAttrs.email_confirm = true;
    }

    if (password && password.length >= 6) {
      updateAttrs.password = password;
    }

    if (Object.keys(updateAttrs).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        updateAttrs,
      );
      if (authError) {
        return { success: false, error: authError.message };
      }
    }

    // Update Prisma profile
    await prisma.profile.update({
      where: { id },
      data: { email, role },
    });

    // Update Client workspace link
    if (role === "CLIENT") {
      if (clientId && clientId !== "none") {
        // Unlink previous client if different
        await prisma.client.updateMany({
          where: { profileId: id, NOT: { id: clientId } },
          data: { profileId: null },
        });
        // Link new client
        await prisma.client.update({
          where: { id: clientId },
          data: { profileId: id },
        });
      } else if (clientId === "none") {
        // Unlink any client from this user
        await prisma.client.updateMany({
          where: { profileId: id },
          data: { profileId: null },
        });
      }
    } else {
      // If role is ADMIN, clear any client link
      await prisma.client.updateMany({
        where: { profileId: id },
        data: { profileId: null },
      });
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/klien");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to update user account:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui akun user.",
    };
  }
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

