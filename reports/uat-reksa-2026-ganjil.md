# Laporan UAT REKSA 2026/2027 Ganjil

Tanggal: 12/6/2026, 23.57.37
Skenario: UAT REKSA 2026/2027 Ganjil - 1 Mahasiswa, 8 Penilai, 4 Penilai Aktif Periode

## Ringkasan

- PASS: 22
- FAIL: 0
- SKIPPED: 0
- Mahasiswa: Joko Widodo (joko-widodo-uat)
- Periode: RPL 2026/2027 Ganjil
- Token verifikasi bundle mahasiswa: 96c494a1ba66d33b4871e9fd320e18ed
- Build: PASS - `next build` ekuivalen `npm run build` berhasil dengan Node bundled. `npm` tidak tersedia di PATH lingkungan ini.

## Penyebab Bug Plotting

Manual plotting gagal karena validasi eligibility masih rentan terhadap perbedaan sumber periode dan pembacaan relasi ObjectId. Endpoint submit manual sebelumnya memakai periode aktif saja, sedangkan data legal plotting seharusnya memprioritaskan periode mahasiswa. Helper eligibility juga mengandalkan pencarian array/populate yang kurang eksplisit untuk audit UAT. Perbaikan membuat periode manual/auto konsisten, menormalisasi ObjectId sebelum pembandingan, dan memvalidasi user penilai, PenilaiProfile aktif, PenilaiKlaster, SK FINAL, serta RplPeriodPenilai.

## File yang Diperbaiki

- `src/lib/penilai-eligibility.ts`
- `src/app/api/admin/plotting-f03/route.ts`
- `src/app/api/admin/plotting-f03/penilai/route.ts`
- `src/app/api/admin/plotting-f03/auto-plot/route.ts`
- `scripts/uat-reksa-2026-ganjil.mjs`
- File perbaikan UAT sebelumnya: finalisasi draft, export SIERRA, public verify, dokumen metadata, terima hasil, routing finalisasi, dan istilah UI Penilai.

## Checklist

- PASS - Periode UAT aktif: RPL 2026/2027 Ganjil
- PASS - Admin, mahasiswa, profil, dan pembayaran UAT tersedia
- PASS - Klaster dan mata kuliah UAT tersedia: 2 klaster utama, 4 mata kuliah
- PASS - 8 penilai dummy tersedia: 4 aktif di periode, 4 hanya master penilai
- PASS - SK awal periode dan lampiran pedoman tersedia
- PASS - F02 dan asesmen kompetensi UAT tersedia
- PASS - Server Next production in-process dinyalakan: http://127.0.0.1:3030
- PASS - Mahasiswa mengisi F03 semua mata kuliah
- PASS - Joko muncul sebagai mahasiswa siap plotting
- PASS - Dropdown plotting hanya berisi penilai eligible per klaster
- PASS - Backend menolak plotting penilai non-SK: Penilai belum memenuhi syarat legal plotting. Pastikan Penilai aktif, memiliki klaster keahlian, dan sudah masuk SK Penilai RPL periode aktif.
- PASS - Manual dan auto plotting menghasilkan 2 entri
- PASS - SK Penugasan Penilai dan lampiran dibuat
- PASS - Isolasi tugas dashboard penilai benar
- PASS - Penilai mengisi VATM dan nilai
- PASS - Admin konfirmasi hasil F03
- PASS - Draft hasil RPL dibuat dengan 4 mata kuliah: Total SKS 12
- PASS - Sanggahan, blok finalisasi, resolve, dan terima hasil berhasil
- PASS - Finalisasi, BA Pleno, dan SK Hasil RPL dibuat
- PASS - Bundle mahasiswa dan bundle periode difinalisasi: Token periode a7ac834e15b3a86ae31549f57aa0a388
- PASS - Public verify valid dan tidak membocorkan nilai/detail matkul
- PASS - Export SIERRA CSV berhasil
- PASS - Build final: `next build` selesai tanpa error.

## Bukti Status Utama

- Manual plotting: PASS - Joko Widodo / Manajemen SDM berhasil diplot ke Dr. Andi Pratama.
- Auto plotting: PASS - klaster Manajemen Pemasaran berhasil diplot otomatis ke penilai eligible load terendah.
- Negatif non-eligible: PASS - penilai master yang tidak masuk SK periode ditolak backend.
- SK Penugasan: PASS - SK Penugasan Penilai dan lampiran penugasan dibuat.
- VATM/Nilai: PASS - Penilai mengisi VATM lengkap dan nilai huruf untuk 4 mata kuliah.
- Finalisasi RPL: PASS - draft 4 mata kuliah/12 SKS, sanggahan, resolve, terima hasil, dan finalisasi selesai.
- BA Pleno: PASS - BA Pleno dibuat.
- SK Hasil: PASS - SK Hasil RPL dibuat.
- Lampiran Konversi: PASS - data konversi personal masuk metadata/bundle dan export detail.
- Bundle Mahasiswa: PASS - bundle final mahasiswa dibuat, token `96c494a1ba66d33b4871e9fd320e18ed`.
- Bundle Periode: PASS - bundle periode final dibuat, token `a7ac834e15b3a86ae31549f57aa0a388`.
- Public Verify: PASS - token valid dan tidak membocorkan nilai/detail mata kuliah.
- Export CSV: PASS - rekap mahasiswa, detail mata kuliah, dan penilai/penugasan memuat data Joko/penilai.

## Bug Ditemukan dan Diperbaiki

- Draft finalisasi memakai field F03 yang salah (`matkulId`), diperbaiki ke `courseId` dan penilai diambil dari plotting.
- Export SIERRA memakai nama field periode/klaster yang tidak sesuai schema, diperbaiki ke `namaPeriode`, `tahunAkademik`, dan `namaKlaster`.
- Export penugasan memfilter `periodId` pada plotting padahal plotting tidak menyimpan periode, diperbaiki memakai profil mahasiswa periode.
- Public verify memakai field periode lama dan metadata dokumen belum lengkap, diperbaiki agar memuat periode, judul, nomor, token, dan URL verifikasi.
- Terima hasil setelah sanggahan selesai sebelumnya ditolak, diperbaiki agar status `SANGGAHAN_SELESAI` dapat diterima.
- Beberapa teks UI/dokumen masih memakai istilah Asesor, diperbaiki menjadi Penilai.

## Backlog / Catatan

- Preview/cetak layout PDF diverifikasi secara data/API dalam UAT otomatis ini; pemeriksaan visual pixel-perfect tetap perlu sesi manual bila ingin menilai kerapian cetak secara penuh.
- Modul pembayaran aktif secara model data dan tercatat terverifikasi; tidak ada gateway pembayaran nyata yang diuji.
