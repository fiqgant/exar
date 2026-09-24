import { Sparkles } from "lucide-react";
import { StrategyGenerator } from "@/components/strategy-generator";
import { prisma } from "@/lib/prisma";

export default async function DashboardStrategyPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { whatsapp: true },
  }).catch(() => null);

  const whatsapp = setting?.whatsapp ?? "6281234567890";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          ● AI Strategy
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#2d2d2d]">
          AI Strategy Generator
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Isi informasi bisnis Anda, dan AI akan menyusun rekomendasi content
          strategy, social media strategy, ide konten, hingga channel yang tepat.
        </p>
      </div>

      <StrategyGenerator whatsappNumber={whatsapp} />
    </div>
  );
}
