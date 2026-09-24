"use client";

import { useState, useTransition } from "react";
import { CircleCheck, CircleX, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decideContent } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

type Decision = "APPROVED" | "REVISION" | "REJECTED";

export function ContentApproval({
  contentId,
  status,
}: {
  contentId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [choice, setChoice] = useState<Decision | null>(null);

  const submit = (decision: Decision) => {
    startTransition(async () => {
      try {
        await decideContent(contentId, decision, note);
        toast.success(
          decision === "APPROVED"
            ? "Konten disetujui."
            : decision === "REVISION"
              ? "Permintaan revisi terkirim."
              : "Konten ditolak.",
        );
        setChoice(null);
        setNote("");
      } catch {
        toast.error("Gagal menyimpan keputusan. Coba lagi.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => submit("APPROVED")}
          disabled={pending}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <CircleCheck className="size-4" /> Approve
        </Button>
        <Button
          variant="outline"
          onClick={() => setChoice(choice === "REVISION" ? null : "REVISION")}
          className={cn(
            choice === "REVISION" && "border-amber-500 text-amber-600",
          )}
        >
          <RotateCcw className="size-4" /> Minta Revisi
        </Button>
        <Button
          variant="outline"
          onClick={() => setChoice(choice === "REJECTED" ? null : "REJECTED")}
          className={cn(choice === "REJECTED" && "border-red-500 text-red-600")}
        >
          <CircleX className="size-4" /> Reject
        </Button>
      </div>

      {choice && (
        <div className="space-y-3 rounded-xl border border-border bg-secondary/50 p-4">
          <label className="text-sm font-medium" htmlFor="revision-note">
            {choice === "REVISION"
              ? "Catatan revisi untuk tim EXAR"
              : "Alasan penolakan"}
          </label>
          <Textarea
            id="revision-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={
              choice === "REVISION"
                ? "Contoh: tolong ganti background dan tambahkan logo."
                : "Contoh: topik belum sesuai brief."
            }
          />
          <div className="flex gap-2">
            <Button
              onClick={() => submit(choice)}
              disabled={pending || (choice === "REJECTED" && !note.trim())}
              size="sm"
            >
              {pending ? "Mengirim…" : "Kirim"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setChoice(null)}>
              Batal
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Status saat ini: <span className="font-medium">{status}</span>
      </p>
    </div>
  );
}
