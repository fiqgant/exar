function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />
  );
}

export default function KalenderLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/60">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
            <div
              key={d}
              className="px-2 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-28 border-r border-b border-border p-2 last:border-r-0"
            >
              <Skeleton className="size-6 rounded-full" />
              {i % 5 === 0 && <Skeleton className="mt-2 h-5 w-full rounded-md" />}
              {i % 7 === 0 && <Skeleton className="mt-1 h-5 w-3/4 rounded-md" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
