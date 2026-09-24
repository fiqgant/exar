import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  return prisma.profile.findUnique({ where: { id: data.user.id } });
});

/** Throws if there is no signed-in admin. Call at the top of every admin Server Action. */
export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return profile;
}

/**
 * Returns the signed-in user's client workspace. For local/demo use, when the
 * profile is a CLIENT but not yet linked to a Client row, we fall back to the
 * single demo workspace so the dashboard is explorable without extra setup.
 */
export const getCurrentClient = cache(async () => {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const linked = await prisma.client.findUnique({
    where: { profileId: profile.id },
  });
  if (linked) return { profile, client: linked };

  if (profile.role === "CLIENT") {
    const demo = await prisma.client.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    if (demo) return { profile, client: demo };
  }

  return { profile, client: null };
});