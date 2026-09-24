import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createTerm, deleteTerm, updateTerm } from "./actions";

export default async function SyaratKetentuanAdminPage() {
  const terms = await prisma.termsCondition.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Syarat & Ketentuan</h1>

      {terms.map((term, i) => (
        <Card key={term.id}>
          <CardContent className="pt-6">
            <form
              action={updateTerm.bind(null, term.id)}
              className="flex gap-4"
            >
              <div className="flex-1 space-y-2">
                <Textarea name="content" defaultValue={term.content} rows={2} />
              </div>
              <div className="w-20 space-y-2">
                <Input
                  name="order"
                  type="number"
                  defaultValue={term.order}
                  aria-label="Urutan"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" size="sm">
                  Simpan
                </Button>
              </div>
            </form>
            <form action={deleteTerm.bind(null, term.id)} className="mt-2">
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button type="button" variant="outline" size="sm">
                      Hapus
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus poin ke-{i + 1}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak bisa dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction type="submit">Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Poin Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTerm} className="flex gap-4">
            <Textarea
              name="content"
              placeholder="Isi syarat & ketentuan..."
              rows={2}
              required
              className="flex-1"
            />
            <Button type="submit">Tambah</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
