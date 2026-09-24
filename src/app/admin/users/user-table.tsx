"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import { updateUserRole, deleteUserAccount } from "./actions";

export type ProfileItem = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  createdAt: Date | string;
};

export function UserTable({
  users,
  currentUserId,
}: {
  users: ProfileItem[];
  currentUserId?: string;
}) {
  const [deletingUser, setDeletingUser] = useState<ProfileItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();

  const handleRoleChange = (userId: string, newRole: "ADMIN" | "CLIENT") => {
    setUpdatingId(userId);
    const formData = new FormData();
    formData.set("role", newRole);

    startUpdateTransition(async () => {
      const res = await updateUserRole(userId, formData);
      if (res.success) {
        toast.success("Role berhasil diperbarui");
      } else {
        toast.error(res.error || "Gagal mengubah role");
      }
      setUpdatingId(null);
    });
  };

  const handleDelete = () => {
    if (!deletingUser) return;

    startDeleteTransition(async () => {
      const res = await deleteUserAccount(deletingUser.id);
      if (res.success) {
        toast.success(`Akun ${deletingUser.email} berhasil dihapus`);
        setDeletingUser(null);
      } else {
        toast.error(res.error || "Gagal menghapus user");
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Terdaftar</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === currentUserId;
              return (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        {u.role === "ADMIN" ? (
                          <ShieldCheck className="size-4 text-primary" />
                        ) : (
                          <User className="size-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.email}</p>
                        {isMe && (
                          <p className="text-[11px] font-semibold text-primary">
                            Akun Anda saat ini
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(u.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as "ADMIN" | "CLIENT")
                      }
                      disabled={isMe || (isUpdating && updatingId === u.id)}
                      className={`h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs font-medium cursor-pointer ${
                        isMe ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {!isMe ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingUser(u)}
                        className="h-7 px-2 text-xs"
                        title="Hapus User"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline ml-1">Hapus</span>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-2">
                        Terkunci
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Belum ada user terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete User Alert Dialog */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Hapus Akun User?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun <strong>{deletingUser?.email}</strong>? User tidak akan dapat login lagi dan tautan ke bisnis klien akan dilepas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeletingUser(null)}
            >
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Hapus User
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
