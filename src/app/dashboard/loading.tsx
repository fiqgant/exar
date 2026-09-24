export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Memuat halaman…</p>
    </div>
  );
}
