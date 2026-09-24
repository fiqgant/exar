import Image from "next/image";
import { cn } from "@/lib/utils";

/** EXAR brand mark — the actual reference/logo.png artwork, not a redraw. */
export function ExarLogo({
  className,
  tone = "color",
  withWordmark = false,
}: {
  tone?: "color" | "light";
  withWordmark?: boolean;
  className?: string;
}) {
  const sub = tone === "light" ? "text-white/70" : "text-muted-foreground";
  const main = tone === "light" ? "text-white" : "text-foreground";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="EXAR Project"
        width={620}
        height={569}
        className="h-9 w-auto shrink-0"
        priority
      />

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn("text-[15px] font-extrabold tracking-[0.14em]", main)}
          >
            EXAR
          </span>
          <span
            className={cn(
              "mt-1 text-[7.5px] font-semibold tracking-[0.18em]",
              sub,
            )}
          >
            ETERNAL XPRESSION
          </span>
          <span
            className={cn("text-[7.5px] font-semibold tracking-[0.18em]", sub)}
          >
            OF ART & REALITY
          </span>
        </span>
      )}
    </span>
  );
}
