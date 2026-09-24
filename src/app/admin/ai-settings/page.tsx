import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAiSetting } from "./actions";

export default async function AiSettingsPage() {
  const setting = await prisma.aiSetting.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Strategy Generator — API Key</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Status:{" "}
            {setting
              ? `key tersimpan (${setting.provider})`
              : "belum diatur"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveAiSetting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                name="provider"
                defaultValue={setting?.provider ?? "GEMINI"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="GEMINI">Google Gemini</option>
                <option value="GROK">Grok (xAI)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                autoComplete="off"
                placeholder={
                  setting
                    ? "Biarkan kosong untuk tetap pakai key lama"
                    : "Tempel API key di sini"
                }
              />
              <p className="text-xs text-muted-foreground">
                Key dienkripsi sebelum disimpan, tidak pernah ditampilkan lagi
                setelah disimpan.
              </p>
            </div>
            <Button type="submit">Simpan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
