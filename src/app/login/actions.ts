"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Sends a signed-in user to the dashboard that matches their role. */
async function redirectByRole(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  redirect(profile?.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Gagal masuk.")}`,
    );
  }

  await redirectByRole(data.user.id);
}