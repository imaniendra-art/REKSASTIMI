# REKSA MVP Final Handover

Tanggal: 13 Juni 2026

## 1. Ringkasan Status MVP REKSA

Core MVP REKSA dinyatakan PASS untuk alur utama A-Z berdasarkan UAT dummy skenario `UAT REKSA 2026/2027 Ganjil - 1 Mahasiswa, 8 Penilai, 4 Penilai Aktif Periode`.

MVP sudah mencakup proses periode RPL, SK awal periode, SK Penilai, F03, plotting penilai, penilaian VATM/nilai, konfirmasi hasil, finalisasi RPL, sanggahan, dokumen hasil, bundle, public verify, export CSV SIERRA, dan build final.

## 2. Alur Utama yang Sudah PASS

- Periode aktif
- SK awal periode
- SK Penilai
- Manual plotting
- Auto plotting
- Penolakan penilai non-eligible
- F03
- SK Penugasan
- VATM/nilai
- Konfirmasi admin
- Draft/finalisasi RPL
- Sanggahan mahasiswa
- BA Pleno
- SK Hasil RPL
- Lampiran Konversi
- Bundle mahasiswa
- Bundle periode
- Public verify
- Export CSV SIERRA
- Build final

## 3. Data UAT yang Digunakan

- Periode: `RPL 2026/2027 Ganjil`
- Mahasiswa: `Joko Widodo`
- Username mahasiswa: `joko-widodo-uat`
- Jumlah penilai dummy: 8 penilai
- Penilai aktif periode: 4 penilai
- Penilai non-periode: 4 penilai tetap ada di master, tetapi tidak eligible untuk plotting periode UAT
- Klaster UAT:
  - Manajemen SDM
  - Manajemen Pemasaran
  - Manajemen Keuangan
  - Kewirausahaan / Pengembangan Bisnis
- Mata kuliah UAT utama:
  - `MSDM101` - Manajemen Sumber Daya Manusia - 3 SKS
  - `MSDM102` - Perilaku Organisasi - 3 SKS
  - `MKT101` - Manajemen Pemasaran - 3 SKS
  - `MKT102` - Riset Pemasaran - 3 SKS

## 4. Bug Utama yang Ditemukan dan Sudah Diperbaiki

- Bug manual plotting eligibility
- Field F03 finalisasi memakai field yang salah
- Export SIERRA memakai field periode/klaster yang tidak sesuai schema
- Public verify memakai field periode lama dan metadata dokumen belum lengkap
- Terima hasil setelah sanggahan selesai sebelumnya ditolak
- Istilah UI/dokumen `Asesor` disesuaikan menjadi `Penilai`
- Konflik route Next.js pada path finalisasi RPL

## 5. Penyebab Bug Plotting dan Perbaikannya

Bug manual plotting terjadi karena validasi eligibility belum sepenuhnya konsisten antara dropdown eligible penilai dan submit plotting manual.

Perbaikan yang sudah dilakukan:

- `periodId` kini memprioritaskan periode mahasiswa dari `ApplicantProfile`.
- Jika periode mahasiswa tidak tersedia, sistem baru fallback ke periode aktif.
- ObjectId dinormalisasi ke string sebelum dibandingkan.
- Eligibility penilai dicek secara konsisten terhadap:
  - SK Penilai RPL FINAL
  - `RplPeriodPenilai`
  - `PenilaiProfile`
  - `PenilaiKlaster`
  - user penilai aktif dengan role `penilai`
- Helper eligibility digunakan konsisten untuk dropdown penilai, manual plotting, dan auto plotting.
- Saat UAT/development, kegagalan eligibility mencatat alasan teknis ke console server tanpa membuka detail sensitif ke user production.

## 6. Modul yang Siap Demo

- Admin
- Mahasiswa
- Penilai
- Public Verify

## 7. Modul yang Perlu Dicek Manual Visual

- Print layout pixel-perfect
- Kerapian bundle jika dicetak fisik

## 8. Backlog Teknis Non-Kritis

- Route internal `/dashboard/asesor` dapat dibuat alias `/dashboard/penilai`.
- Refactor variabel internal `asesor` jika dibutuhkan nanti.
- Environment `npm` PATH nanti ditangani programmer.
- Storage permanen untuk lampiran pedoman jika sistem sudah online.

## 9. Catatan Penting

- SIERRA hanya export data siap olah, bukan integrasi API langsung.
- Public verify tidak menampilkan nilai akademik sensitif.
- Dokumen final tidak boleh ditimpa tanpa fitur versi/revisi.
- Data UAT tidak dihapus dan database tidak di-reset.

## 10. Kesimpulan

REKSA Core MVP siap untuk UAT internal lanjutan, demo kampus, dan diserahkan kepada programmer untuk kebutuhan teknis online/deployment.

## Build Penutup

Build penutup berhasil.

Catatan lingkungan: `npm` masih tidak tersedia di PATH sesi ini. Perintah build dijalankan memakai Node bundled dengan perintah ekuivalen `node node_modules/next/dist/bin/next build`. Hasilnya PASS: compiled successfully, TypeScript selesai, 58 static pages generated, dan finalizing page optimization selesai tanpa error.
