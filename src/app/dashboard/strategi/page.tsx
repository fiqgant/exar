import { Sparkles } from "lucide-react";
import { StrategyGenerator } from "@/components/strategy-generator";

export default function DashboardStrategyPage() {
  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">
          <Sparkles className="size-3.5" /> AI Strategy Generator
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Susun strategi digital Anda
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Isi informasi bisnis Anda, dan sistem akan menyusun rekomendasi
          content strategy, social media strategy, ide konten, hingga channel
          yang tepat.
        </p>
      </div>

      <StrategyGenerator />
    </div>
  );
}
