"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

type Decision = "APPROVED" | "REVISION" | "REJECTED";

/** Records the client's approve / revision / reject decision on a content item. */
export async function decideContent(
  contentId: string,
  decision: Decision,
  note: string,
) {
  const session = await getCurrentClient();
  if (!session?.client) throw new Error("Unauthorized");

  const content = await prisma.content.findFirst({
    where: { id: contentId, clientId: session.client.id },
  });
  if (!content) throw new Error("Konten tidak ditemukan");

  const actionLabel =
    decision === "APPROVED"
      ? "APPROVED"
      : decision === "REVISION"
        ? "REVISION"
        : "REJECTED";

  await prisma.content.update({
    where: { id: contentId },
    data: {
      status: decision,
      rejectReason: decision === "REJECTED" ? note : null,
    },
  });

  await prisma.contentRevision.create({
    data: {
      contentId,
      action: actionLabel,
      note: note || null,
      actor: "CLIENT",
    },
  });

  revalidatePath("/dashboard/konten");
  revalidatePath(`/dashboard/konten/${contentId}`);
  revalidatePath("/dashboard/kalender");
  revalidatePath("/dashboard");
}