"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drop-in submit button that shows a spinner while the parent <form>
 * Server Action is pending. Must be rendered INSIDE the <form>.
 *
 * Supports two visual variants:
 *  - "default"  — plain dark Tailwind button (used in client dashboard)
 *  - "neo"      — neobrutalism style with hard shadow + lift/press effect
 */
export function FormSubmitButton({
  children,
  loadingText,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  loadingText?: string;
  variant?: "default" | "neo" | "primary-full";
  className?: string;
}) {
  const { pending } = useFormStatus();

  if (variant === "neo") {
    return (
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#2d2d2d] bg-primary px-6 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#2d2d2d] transition-all",
          "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2d2d2d]",
          "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#2d2d2d]",
          className,
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : null}
        {pending ? (loadingText ?? "Memproses…") : children}
      </button>
    );
  }

  if (variant === "primary-full") {
    return (
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-all",
          "hover:bg-primary/90",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : null}
        {pending ? (loadingText ?? "Memproses…") : children}
      </button>
    );
  }

  // default
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all",
        "hover:bg-primary/90",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : null}
      {pending ? (loadingText ?? "Memproses…") : children}
    </button>
  );
}
