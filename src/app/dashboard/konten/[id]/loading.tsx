function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />
  );
}

export default function KontenDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-7 w-3/4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border-l-2 border-border pl-4 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
