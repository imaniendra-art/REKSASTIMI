# PRD: REKSA STIMI (Modernisasi UI/UX, Portal Publik & Onboarding Ringan)

**Versi:** 2.0  
**Tanggal:** 26 Oktober 2026  
**Status:** In Progress / Execution  
**Institusi:** STIMI YAPMI Makassar  
**Sistem:** REKSA (Rekognisi Evaluasi dan Konversi Akademik) STIMI

---

## 1. Latar Belakang & Tujuan
REKSA STIMI adalah platform manajemen Rekognisi Pembelajaran Lampau (RPL Tipe A) untuk Program Studi S1 Manajemen STIMI YAPMI Makassar, yang memfasilitasi konversi jam terbang profesional para pekerja swasta, wirausahawan UMKM, ASN/PNS, anggota POLRI, prajurit TNI, praktisi manajerial (supervisor, manajer operasional, kepala cabang/ruangan), staf BUMN/Perbankan, nakes faskes, dan lulusan diploma menjadi hingga 100 SKS resmi sarjana. 
Versi Core MVP sebelumnya telah berhasil lolos 100% uji coba A-Z (22 skenario UAT). 

Tahap ini berfokus pada **perombakan total antarmuka (UI/UX Overhaul)**, **penyediaan Portal Publik yang komprehensif & edukatif**, serta **penyederhanaan funnel pendaftaran (Onboarding Ringan + Payment Gate)** tanpa mengorbankan integritas fitur inti akademik yang telah selesai.

---

## 2. Tiga Pilar Pembaruan Utama

### Pilar 1: Portal Publik & Edukasi Terpadu (Landing Page `/`)
- **Branding & Trust:** Menegaskan payung hukum RPL (Permendikbudristek No. 41/2021) dan akreditasi prodi (LAMEMBA/BAN-PT).
- **Alur 5 Langkah Transparan:** Visualisasi alur dari daftar, pembayaran, matrikulasi, asesmen portofolio, hingga terbit SK Konversi.
- **Katalog Klaster & Mata Kuliah Interaktif:** Menampilkan mata kuliah yang dapat di-RPL-kan dan bukti yang dibutuhkan.
- **Banner Penenang (Killer USP):** Solusi bagi calon mahasiswa yang kekurangan sertifikat kerja lama, dengan mengikuti kursus mandiri singkat di REKSA ber-Sertifikat Digital resmi yang sah dikonversi menjadi SKS.
- **Verifikasi Publik:** Cek keaslian SK & Sertifikat berbasis QR Code / Token (`/verify/dokumen/[token]`).
- **FAQ & Konsultasi Langsung:** Tombol WhatsApp ke Tim Konsultan PMB RPL STIMI.

### Pilar 2: Onboarding Ringan & Payment Gatekeeper
- **Pendaftaran Ringan (Low Friction):**
  - Form pendaftaran awal hanya memuat: Nama Lengkap, Nomor WhatsApp, Email, Password, Pilihan Jenjang/Prodi (S1 Manajemen), dan Pendidikan Terakhir (SMA/SMK, D3, Pindahan).
- **Halaman Pembayaran & Instruksi Transfer:**
  - Rincian biaya pendaftaran, nomor rekening kampus resmi STIMI YAPMI, dan upload bukti transfer.
- **Teaser Waiting Room:**
  - Pendaftar yang menunggu verifikasi Admin Keuangan dapat menonton video pengantar RPL dan membaca preview silabus materi klaster (read-only teaser) dengan tombol konfirmasi WhatsApp instan.
- **Aktivasi Penuh:**
  - Begitu diverifikasi Admin Keuangan, seluruh fitur internal (LMS, kuis matrikulasi, F02, F03, dll.) otomatis terbuka penuh.

### Pilar 3: Sistem Desain & UI Shell (Floating Rounded Sidebar + Multi-Theme)
- **Floating Rounded Sidebar:**
  - Sidebar terpisah dari tepi viewport (`rounded-3xl`, elevated shadow, floating margin sekeliling).
  - Tampilan rapi, collapsible, dan responsif (menjadi slide-over drawer di perangkat mobile).
- **Multi-Theme Engine:**
  - Mendukung mode **Light** dan **Dark** (true dark).
  - 5 Preset Palet Warna Aksen:
    1. **Teal:** Toska modern segar.
    2. **Burgundy:** Merah anggur marun berwibawa.
    3. **Dusty Rose:** Merah muda lembut hangat.
    4. **Charcoal:** Arang netral minimalis tajam.
    5. **Orange Burn:** Oranye bata/terakota energetik.
  - Pengatur tema diletakkan di Navbar kanan atas (Dropdown Palet Warna + Switcher Dark/Light), dengan penyimpanan preferensi di `localStorage`.

---

## 3. Kompatibilitas & Penegakan Fitur Inti (Zero Regression)
Fitur-fitur berikut yang telah teruji pada MVP tetap dipertahankan:
1. Modul Evaluasi Diri F03 & Portofolio.
2. Modul Penilaian VATM & Nilai oleh Asesor/Penilai.
3. Plotting Asesor Otomatis & Manual berbasis legalitas SK Penilai aktif.
4. Generator SK Penetapan Tim, SK Penilai, Berita Acara Pleno, dan SK Hasil Konversi RPL.
5. Mekanisme Sanggahan Mahasiswa atas hasil konversi.
6. Pembuatan Bundle Dokumen Mahasiswa & Bundle Dokumen Periode.
7. Ekspor CSV Standar SIERRA Kemendikbudristek.
8. Penyimpanan berkas lokal di server mandiri kampus (`public/uploads`).

---

## 4. Rencana Kerja Eksekusi
- [x] Konfigurasi `.env` (MongoDB Atlas & Session Secret).
- [ ] Instalasi dependensi npm (`node_modules`).
- [ ] Implementasi Theme Provider & CSS Variables 5 Warna + Dark/Light.
- [ ] Redesain `DashboardShell` (Floating Rounded Sidebar + Navbar Controls).
- [ ] Implementasi Landing Page Publik (`src/app/page.tsx`) dengan Katalog Klaster Interaktif.
- [ ] Penyesuaian Form Registrasi Ringan & Endpoint Auth.
- [ ] Pembuatan Halaman Pembayaran & Teaser Waiting Room.
- [ ] Verifikasi Build & Pengujian Fungsionalitas End-to-End.
