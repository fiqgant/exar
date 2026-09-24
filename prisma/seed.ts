import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Memulai seeding data...");

  // 1. Site Settings (Kontak, WA, Rekening)
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      whatsapp: "6281234567890",
      email: "halo@exarproject.com",
      phone: "+62 812 3456 7890",
      address: "Jl. Riau No. 88, Bandung, Jawa Barat",
      instagram: "https://instagram.com/exarproject",
      bankName: "BCA",
      bankAccount: "1234567890",
      bankHolder: "PT EXAR Digital Studio",
    },
    update: {
      whatsapp: "6281234567890",
      email: "halo@exarproject.com",
      phone: "+62 812 3456 7890",
      address: "Jl. Riau No. 88, Bandung, Jawa Barat",
      instagram: "https://instagram.com/exarproject",
      bankName: "BCA",
      bankAccount: "1234567890",
      bankHolder: "PT EXAR Digital Studio",
    },
  });
  console.log("✓ SiteSetting berhasil disiapkan.");

  // 2. Paket Layanan
  // Bersihkan referensi paket di kontrak terlebih dahulu jika ada
  await prisma.contract.updateMany({ data: { packageId: null } });
  await prisma.package.deleteMany();

  const packagesData = [
    {
      name: "Friendly Pack",
      price: 2_450_000,
      recommended: false,
      freeFotoProduk: false,
      managementInstagram: true,
      managementTiktok: false,
      managementFacebook: false,
      videoReelsCount: 6,
      feedsDesignCount: 3,
      produksiVisit: "1 Visit",
      professionalTallent: false,
      order: 1,
      isActive: true,
    },
    {
      name: "Lovers Pack",
      price: 3_724_000,
      recommended: true,
      freeFotoProduk: false,
      managementInstagram: true,
      managementTiktok: true,
      managementFacebook: false,
      videoReelsCount: 9,
      feedsDesignCount: 6,
      produksiVisit: "1 Visit",
      professionalTallent: false,
      order: 2,
      isActive: true,
    },
    {
      name: "Lovers Pack Pro",
      price: 4_494_000,
      recommended: false,
      freeFotoProduk: true,
      managementInstagram: true,
      managementTiktok: true,
      managementFacebook: true,
      videoReelsCount: 14,
      feedsDesignCount: 10,
      produksiVisit: "1-2 Visit",
      professionalTallent: true,
      order: 3,
      isActive: true,
    },
  ];

  for (const pkg of packagesData) {
    await prisma.package.create({ data: pkg });
  }
  console.log("✓ Paket layanan berhasil dibuat.");

  const loversPack = await prisma.package.findFirst({
    where: { name: "Lovers Pack" },
  });
  const proPack = await prisma.package.findFirst({
    where: { name: "Lovers Pack Pro" },
  });

  // 3. Portofolio
  await prisma.portfolio.deleteMany();
  await prisma.portfolio.createMany({
    data: [
      {
        title: "Racikan Signature Kopi Senja",
        category: "PHOTOGRAPHY",
        clientName: "Kopi Senja",
        description: "Foto katalog produk untuk feed Instagram bulanan dan menu digital.",
        coverColor: "#B42424",
        imageUrl: "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&q=80&w=1200",
        order: 1,
        isActive: true,
      },
      {
        title: "Cerita di Balik Seduhan Kopi",
        category: "VIDEOGRAPHY",
        clientName: "Kopi Senja",
        description: "Reels cinematic behind-the-scenes proses roasting hingga seduh manual brew.",
        coverColor: "#2D2D2D",
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-making-coffee-41121-large.mp4",
        order: 2,
        isActive: true,
      },
      {
        title: "Edukasi Varian Beans Nusantara",
        category: "CONTENT_CREATION",
        clientName: "Kopi Senja",
        description: "Carousel interaktif pengenalan profil rasa biji kopi Gayo, Kintamani, dan Toraja.",
        coverColor: "#8a1c1c",
        imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
        order: 3,
        isActive: true,
      },
      {
        title: "Peluncuran Season Menu Musim Panas",
        category: "SOCIAL_MEDIA_MANAGEMENT",
        clientName: "Kopi Senja",
        description: "Kampanye digital menyeluruh 30 hari yang menaikkan omzet dine-in 45%.",
        coverColor: "#4a4a4a",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1200",
        order: 4,
        isActive: true,
      },
    ],
  });
  console.log("✓ Portofolio berhasil dibuat.");

  // 4. Syarat & Ketentuan
  await prisma.termsCondition.deleteMany();
  await prisma.termsCondition.createMany({
    data: [
      { content: "Kontrak kerja sama berlaku minimum 4 bulan berturut-turut.", order: 1 },
      { content: "Pencerminan otomatis konten ke platform TikTok & Facebook.", order: 2 },
      { content: "Termasuk jadwal pengambilan gambar langsung di lokasi klien (visit produksi).", order: 3 },
      { content: "Seluruh aset desain dan file mentah resolusi tinggi menjadi hak milik klien.", order: 4 },
      { content: "Talenta / model profesional disediakan sesuai paket yang disepakati.", order: 5 },
      { content: "Revisi konten maksimal 2 kali sebelum jadwal upload otomatis.", order: 6 },
    ],
  });
  console.log("✓ Syarat & Ketentuan berhasil dibuat.");

  // 5. Setup Profile User (Admin & Client Taufiq)
  // Pastikan profile admin fiqgant@gmail.com ada
  const adminEmail = "fiqgant@gmail.com";
  const adminProfile = await prisma.profile.findUnique({
    where: { email: adminEmail },
  });
  if (adminProfile) {
    await prisma.profile.update({
      where: { email: adminEmail },
      data: { role: "ADMIN" },
    });
  }

  // Pastikan profile klien taufiq@wbi.ac.id
  const clientEmail = "taufiq@wbi.ac.id";
  const taufiqProfile = await prisma.profile.findUnique({
    where: { email: clientEmail },
  });
  if (taufiqProfile) {
    await prisma.profile.update({
      where: { email: clientEmail },
      data: { role: "CLIENT" },
    });
  }

  // 6. Bersihkan dan bangun data Klien, Kontrak, Konten, Leads
  await prisma.contentRevision.deleteMany();
  await prisma.content.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.client.deleteMany();

  // Klien Tunggal: Taufiq (taufiq@wbi.ac.id)
  const clientTaufiq = await prisma.client.create({
    data: {
      profileId: taufiqProfile?.id ?? undefined,
      businessName: "Kopi Senja",
      businessType: "Coffee Shop & Roastery",
      contactName: "Taufiq",
      email: clientEmail,
      phone: "+62 812 3456 7890",
      address: "Jl. Merdeka No. 21, Bandung",
      isActive: true,
    },
  });

  // Kontrak Kopi Senja (Taufiq)
  // 1. Kontrak Aktif
  await prisma.contract.create({
    data: {
      clientId: clientTaufiq.id,
      packageId: loversPack?.id,
      packageName: loversPack?.name ?? "Lovers Pack",
      services: "Instagram + TikTok, 9 Reels, 6 Feeds, 1 Visit/bulan",
      startDate: daysFromNow(-60),
      endDate: daysFromNow(60),
      value: loversPack?.price ?? 3_724_000,
      paymentStatus: "PAID",
      isActive: true,
      notes: "Kontrak periode 4 bulan (bulan ke-2 berjalan)",
    },
  });

  // 2. Kontrak Baru Menunggu Konfirmasi TF (untuk admin verifikasi)
  await prisma.contract.create({
    data: {
      clientId: clientTaufiq.id,
      packageId: proPack?.id,
      packageName: proPack?.name ?? "Lovers Pack Pro",
      services: "Upgrade Lovers Pack Pro: 14 Reels, 10 Feeds, Talenta Profesional",
      startDate: daysFromNow(1),
      endDate: daysFromNow(120),
      value: proPack?.price ?? 4_494_000,
      paymentStatus: "UNPAID",
      isActive: false,
      paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
      notes: "Transfer via BCA m-banking. Menunggu konfirmasi admin.",
    },
  });

  console.log("✓ Data Klien (taufiq@wbi.ac.id) dan Kontrak berhasil dibuat.");

  // 7. Konten untuk Kopi Senja
  const contents = [
    {
      title: "Kenapa Kopi Senja Cocok untuk Nongkrong & WFC",
      type: "CAROUSEL" as const,
      platform: "INSTAGRAM" as const,
      status: "APPROVED" as const,
      scheduledAt: daysFromNow(2),
      caption:
        "Suasana hangat, kopi pilihan, dan wifi stabil — kombinasi sempurna untuk nongkrong santai atau Work From Cafe. Yuk mampir hari ini!",
      hashtags: "#KopiSenja #CoffeeShopBandung #WFCBandung #NgopiYuk",
      objective: "Meningkatkan brand awareness lokal",
      strategy: "Konten edukasi suasana & fasilitas tempat",
      previewColor: "#B42424",
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    },
    {
      title: "Behind The Scenes: Teknik Seduh Manual Brew V60",
      type: "REELS" as const,
      platform: "TIKTOK" as const,
      status: "REVISION" as const,
      scheduledAt: daysFromNow(4),
      caption: "Intip proses seduh manual brew V60 oleh barista kami yang bikin aroma kopi keluar maksimal!",
      hashtags: "#ManualBrew #BaristaLife #KopiSenja #BehindTheScenes",
      objective: "Meningkatkan engagement penonton",
      strategy: "Storytelling proses pembuatan kopi",
      previewColor: "#2D2D2D",
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-making-coffee-41121-large.mp4",
    },
    {
      title: "Promo Spesial Akhir Pekan: Beli 1 Gratis 1",
      type: "FEED" as const,
      platform: "INSTAGRAM" as const,
      status: "SCHEDULED" as const,
      scheduledAt: daysFromNow(6),
      caption: "Khusus Sabtu-Minggu ini! Beli 1 Ice Spanish Latte GRATIS 1 Americano. Ajak bestie kamu sekarang!",
      hashtags: "#PromoKopi #WeekendDeal #KopiSenja #DiskonBandung",
      objective: "Mendorong kunjungan dan transaksi akhir pekan",
      strategy: "Penawaran promo dengan call-to-action urgensi",
      previewColor: "#8a1c1c",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200",
    },
    {
      title: "Panduan Menyimpan Biji Kopi Agar Tetap Fresh",
      type: "CAROUSEL" as const,
      platform: "INSTAGRAM" as const,
      status: "DRAFT" as const,
      scheduledAt: daysFromNow(9),
      caption: "Jangan simpan biji kopi di kulkas! Simak 4 tips penyimpanan terbaik agar cita rasa tetap otentik.",
      hashtags: "#TipsKopi #CoffeeBeans #KopiSenja #KopiNusantara",
      objective: "Membangun otoritas dan kredibilitas brand",
      strategy: "Konten tips edukatif yang mudah disimpan (save-able)",
      previewColor: "#4a4a4a",
      imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
    },
    {
      title: "Kata Mereka Tentang Cold Brew Signature Kami",
      type: "VIDEO" as const,
      platform: "INSTAGRAM" as const,
      status: "PUBLISHED" as const,
      scheduledAt: daysFromNow(-3),
      caption: "Terima kasih untuk antusiasme teman-teman penikmat Cold Brew Kopi Senja! Sudah coba varian baru kami?",
      hashtags: "#TestimoniPelanggan #ColdBrew #KopiSenja",
      objective: "Social proof dan validasi pelanggan",
      strategy: "UGC / ulasan kepuasan pelanggan",
      previewColor: "#B42424",
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=1200",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-serving-coffee-with-ice-into-a-glass-41122-large.mp4",
    },
  ];

  for (const item of contents) {
    const created = await prisma.content.create({
      data: { ...item, clientId: clientTaufiq.id },
    });

    if (item.status === "REVISION") {
      await prisma.contentRevision.create({
        data: {
          contentId: created.id,
          action: "REVISION",
          note: "Tolong tambahkan logo di sudut kanan atas video dan gunakan musik akustik santai.",
          actor: "CLIENT",
        },
      });
    }

    if (item.status === "APPROVED") {
      await prisma.contentRevision.create({
        data: {
          contentId: created.id,
          action: "APPROVED",
          note: "Visual dan caption sudah pas, disetujui untuk tayang.",
          actor: "CLIENT",
        },
      });
    }
  }

  console.log("✓ Konten dan revisi berhasil dibuat.");

  // 8. Leads untuk Kopi Senja (Taufiq)
  await prisma.lead.createMany({
    data: [
      {
        clientId: clientTaufiq.id,
        name: "Andi Pratama (PT Sinergi Abadi)",
        source: "Instagram DM",
        interest: "Paket catering coffee bar untuk gathering kantor 150 pax",
        status: "NEW",
        potentialValue: 3_500_000,
        followUp: "Kirim proposal menu & price list paket catering event",
      },
      {
        clientId: clientTaufiq.id,
        name: "Sinta Dewi",
        source: "WhatsApp",
        interest: "Pemesanan biji kopi roasted beans 20kg per bulan",
        status: "CONTACTED",
        potentialValue: 4_200_000,
        followUp: "Sudah kirim tester varian Gayo & Kintamani. Tunggu feedback rasa.",
      },
      {
        clientId: clientTaufiq.id,
        name: "Bagas Nugroho (Komunitas Fotografi)",
        source: "Instagram DM",
        interest: "Sewa lantai 2 untuk workshop & pameran foto 1 hari",
        status: "FOLLOW_UP",
        potentialValue: 2_500_000,
        followUp: "Konfirmasi tanggal acara dan estimasi peserta 40 orang.",
      },
      {
        clientId: clientTaufiq.id,
        name: "Maya Lestari (Bank Mandiri)",
        source: "Website Landing Page",
        interest: "Paket hampers Ramadan kopi & kue kering 80 paket",
        status: "QUALIFIED",
        potentialValue: 9_600_000,
        followUp: "Jadwal meeting presentasi sampel hampers hari Jumat jam 14.00.",
      },
      {
        clientId: clientTaufiq.id,
        name: "Rizky Firmansyah",
        source: "Walk-in Store",
        interest: "Langganan cold brew botolan untuk suplai pantry kantor harian",
        status: "CONVERTED",
        potentialValue: 5_000_000,
        followUp: "PO sudah ditandatangani, pengiriman rutin setiap Senin pagi.",
      },
    ],
  });

  console.log("✓ Leads berhasil dibuat.");
  console.log("Semua seed dummy data berhasil selesai dijalankan!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Error during seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });