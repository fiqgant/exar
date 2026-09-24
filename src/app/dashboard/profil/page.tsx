import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/auth";
import { updateProfile } from "./actions";
import { User, Building2, ShieldCheck, AlertCircle } from "lucide-react";

export default async function ProfilPage() {
  const session = await getCurrentClient();
  if (!session?.profile) {
    return (
      <div className="nb-card p-10 text-center">
        <AlertCircle className="mx-auto size-8 text-primary" />
        <p className="mt-3 font-black text-[#2d2d2d]">Session tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Coba logout lalu login kembali.
        </p>
      </div>
    );
  }

  const client = session.client;
  const contract = client
    ? await prisma.contract.findFirst({
        where: { clientId: client.id, isActive: true },
      })
    : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          ● Profil
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#2d2d2d]">
          Profil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data bisnis dan informasi akun Anda.
        </p>
      </div>

      {!client && (
        <div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-4 shadow-[3px_3px_0_#f59e0b]">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">
              Workspace belum terhubung. Tim EXAR sedang menyiapkan akun bisnis Anda.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form — hanya tampil jika ada client */}
        <div className="lg:col-span-2">
          {client ? (
            <form action={updateProfile} className="nb-card overflow-hidden">
              <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-6 py-4">
                <h2 className="flex items-center gap-2 font-black text-white">
                  <Building2 className="size-4 text-white/70" /> Data Bisnis
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="businessName"
                      className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                    >
                      Nama Bisnis *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      defaultValue={client.businessName}
                      required
                      className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="businessType"
                      className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                    >
                      Jenis Bisnis
                    </label>
                    <input
                      id="businessType"
                      name="businessType"
                      defaultValue={client.businessType}
                      className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contactName"
                      className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                    >
                      Nama Kontak
                    </label>
                    <input
                      id="contactName"
                      name="contactName"
                      defaultValue={client.contactName}
                      className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                    >
                      No. HP
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      defaultValue={client.phone ?? ""}
                      className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                    >
                      Email Bisnis
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={client.email ?? ""}
                      className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="text-[10px] font-black uppercase tracking-widest text-[#2d2d2d]"
                    >
                      Alamat
                    </label>
                    <input
                      id="address"
                      name="address"
                      defaultValue={client.address ?? ""}
                      className="w-full rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] outline-none transition-all focus:border-primary focus:shadow-[3px_3px_0_#b42424] placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 rounded-lg border-2 border-[#2d2d2d] bg-primary px-6 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#2d2d2d] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2d2d2d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <div className="nb-card p-8 text-center">
              <Building2 className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                Data bisnis akan tersedia setelah workspace Anda disiapkan oleh tim EXAR.
              </p>
            </div>
          )}
        </div>

        {/* Account info sidebar */}
        <div className="space-y-4">
          <div className="nb-card overflow-hidden">
            <div className="border-b-2 border-[#2d2d2d] bg-[#2d2d2d] px-5 py-4">
              <h2 className="flex items-center gap-2 font-black text-white">
                <User className="size-4 text-white/70" /> Informasi Akun
              </h2>
            </div>
            <dl className="divide-y-2 divide-[#2d2d2d]/10">
              {[
                { label: "Email Login", value: session.profile.email },
                {
                  label: "Peran",
                  value: session.profile.role === "ADMIN" ? "Admin" : "Client",
                },
                {
                  label: "Paket Aktif",
                  value: contract?.packageName ?? "Belum ada",
                },
              ].map(({ label, value }) => (
                <div key={label} className="px-5 py-3">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 break-all text-sm font-bold text-[#2d2d2d]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 shadow-[3px_3px_0_#10b981]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <p className="text-xs font-black text-emerald-800">
                Akun Terverifikasi
              </p>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              Data Anda aman dan dikelola oleh tim EXAR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
