"use client";

import { useState, useTransition } from "react";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  User,
  Pencil,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { updateUserAccount, deleteUserAccount } from "./actions";

export type ProfileItem = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  createdAt: Date | string;
  clientId?: string | null;
  businessName?: string | null;
};

export type ClientOption = {
  id: string;
  businessName: string;
  profileId?: string | null;
};

export function UserTable({
  users,
  clients = [],
  currentUserId,
}: {
  users: ProfileItem[];
  clients?: ClientOption[];
  currentUserId?: string;
}) {
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<ProfileItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<ProfileItem | null>(null);

  // Edit form state
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "CLIENT">("CLIENT");
  const [editClientId, setEditClientId] = useState<string>("none");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openEditModal = (u: ProfileItem) => {
    setEditingUser(u);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditClientId(u.clientId || "none");
    setEditPassword("");
    setEditConfirmPassword("");
    setShowPassword(false);
    setEditError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    if (!editEmail || !editEmail.includes("@")) {
      setEditError("Format email tidak valid.");
      return;
    }

    if (editPassword) {
      if (editPassword.length < 6) {
        setEditError("Password baru minimal 6 karakter.");
        return;
      }
      if (editPassword !== editConfirmPassword) {
        setEditError("Konfirmasi password baru tidak cocok.");
        return;
      }
    }

    const formData = new FormData();
    formData.set("email", editEmail);
    formData.set("role", editRole);
    if (editPassword) {
      formData.set("password", editPassword);
    }
    formData.set("clientId", editClientId);

    startUpdateTransition(async () => {
      const res = await updateUserAccount(editingUser.id, formData);
      if (res.success) {
        toast.success(`Akun ${editEmail} berhasil diperbarui`);
        setEditingUser(null);
      } else {
        setEditError(res.error || "Gagal memperbarui user");
        toast.error(res.error || "Gagal memperbarui user");
      }
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

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari email atau bisnis..."
            className="pl-9 h-9 text-xs"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Menampilkan <strong className="text-foreground">{filteredUsers.length}</strong> dari {users.length} user
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">User / Email</th>
                <th className="px-4 py-3 font-semibold">Bisnis Klien</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Terdaftar</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isMe = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                            u.role === "ADMIN"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {u.role === "ADMIN" ? (
                            <ShieldCheck className="size-4" />
                          ) : (
                            <User className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{u.email}</p>
                          {isMe && (
                            <span className="inline-flex items-center text-[10px] font-semibold text-primary">
                              ● Akun Anda saat ini
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {u.role === "CLIENT" ? (
                        u.businessName ? (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{u.businessName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Belum ditautkan
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.role === "ADMIN"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-secondary text-secondary-foreground border border-border"
                        }`}
                      >
                        {u.role === "ADMIN" ? "Admin" : "Client"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(u)}
                          className="h-8 px-2.5 text-xs gap-1"
                          title="Edit User & Password"
                        >
                          <Pencil className="size-3.5" />
                          <span>Edit</span>
                        </Button>

                        {!isMe ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingUser(u)}
                            className="h-8 px-2.5 text-xs gap-1"
                            title="Hapus User"
                          >
                            <Trash2 className="size-3.5" />
                            <span className="hidden sm:inline">Hapus</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic px-2">
                            Terkunci
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-xs">
                    {search ? "Tidak ada user yang cocok dengan pencarian." : "Belum ada user terdaftar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && !isUpdating && setEditingUser(null)}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              <span>Edit Akun User</span>
            </DialogTitle>
            <DialogDescription>
              Perbarui email, role, bisnis klien terkait, atau setel ulang password user.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-1">
            {editError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-semibold">
                Email Pengguna
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-role" className="text-xs font-semibold">
                Role
              </Label>
              <select
                id="edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as "ADMIN" | "CLIENT")}
                disabled={editingUser?.id === currentUserId}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="CLIENT">Client (Akses Portal Klien)</option>
                <option value="ADMIN">Admin (Akses Penuh Manajemen)</option>
              </select>
              {editingUser?.id === currentUserId && (
                <p className="text-[11px] text-muted-foreground">
                  Role akun Anda sendiri dikunci untuk mencegah admin lockout.
                </p>
              )}
            </div>

            {/* Tautkan Bisnis (Khusus Client) */}
            {editRole === "CLIENT" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-client" className="text-xs font-semibold">
                  Tautkan ke Bisnis Klien
                </Label>
                <select
                  id="edit-client"
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="none">— Jangan Tautkan ke Bisnis —</option>
                  {clients.map((c) => {
                    const isTaken = c.profileId && c.profileId !== editingUser?.id;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.businessName} {isTaken ? "(Terhubung user lain)" : ""}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  User akan dapat mengakses dashboard, konten, kalender, dan leads bisnis ini saat login.
                </p>
              </div>
            )}

            {/* Password Section */}
            <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <KeyRound className="size-3.5 text-primary" />
                  <span>Ganti Password (Opsional)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="size-3" /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye className="size-3" /> Lihat
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Kosongkan bila tidak ingin mengubah password. Jika diisi, password baru akan langsung aktif tanpa verifikasi email.
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-password" className="text-[11px]">
                    Password Baru
                  </Label>
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    minLength={6}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-confirm-password" className="text-[11px]">
                    Konfirmasi Password
                  </Label>
                  <Input
                    id="edit-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                onClick={() => setEditingUser(null)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && !isDeleting && setDeletingUser(null)}
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
