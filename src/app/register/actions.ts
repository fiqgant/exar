"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  businessName: z.string().trim().min(2, "Nama bisnis minimal 2 karakter."),
  contactName: z.string().trim().min(2, "Nama Anda wajib diisi."),
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  businessType: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export async function signUp(formData: FormData) {
  const parsed = schema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    password: formData.get("password"),
    businessType: formData.get("businessType"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Data tidak lengkap.";
    redirect(`/register?error=${encodeURIComponent(msg)}`);
  }

  const { businessName, contactName, email, password, businessType, phone } =
    parsed.data;

  // Check first: if Supabase's "Confirm email" is on, signUp() on an email
  // that's already registered doesn't error — it silently returns a fake
  // user object (anti-enumeration behavior), which would otherwise reach the
  // Prisma insert below and crash on the unique email constraint.
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    redirect(
      `/register?error=${encodeURIComponent("Email sudah terdaftar. Silakan masuk.")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(
      `/register?error=${encodeURIComponent(error?.message ?? "Gagal mendaftar.")}`,
    );
  }

  // Create the mirrored profile and the client workspace.
  try {
    await prisma.profile.upsert({
      where: { id: data.user.id },
      create: { id: data.user.id, email, role: "CLIENT" },
      update: { email },
    });
  } catch {
    // Race, or the fake-user case above slipped through despite the pre-check.
    redirect(
      `/register?error=${encodeURIComponent("Email sudah terdaftar. Silakan masuk.")}`,
    );
  }

  await prisma.client.upsert({
    where: { profileId: data.user.id },
    create: {
      profileId: data.user.id,
      businessName,
      contactName,
      email,
      businessType: businessType || "Belum diisi",
      phone: phone || null,
    },
    update: {},
  });

  // If the Supabase project still has "Confirm email" turned on, signUp
  // returns a user but no session — the account can't log in yet. Route to
  // /login with a notice instead of bouncing off the auth-gated dashboard.
  if (!data.session) {
    redirect("/login?notice=confirm-email");
  }

  redirect("/dashboard");
}