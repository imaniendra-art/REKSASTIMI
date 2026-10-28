"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

// Data Klaster & Mata Kuliah RPL
const KLASTER_DATA = [
  {
    id: "sdm",
    name: "Manajemen SDM",
    badge: "Klaster A",
    desc: "Mencakup pengelolaan tenaga kerja, rekrutmen, kompensasi, evaluasi kinerja, kepemimpinan, dan perilaku organisasi.",
    courses: [
      { kode: "MSDM101", nama: "Manajemen Sumber Daya Manusia", sks: 3, semester: 3, evidence: "Surat tugas/jabatan HRD, SOP kepegawaian, bukti rekrutmen/evaluasi karyawan" },
      { kode: "MSDM102", nama: "Perilaku Organisasi", sks: 3, semester: 4, evidence: "Surat rekomendasi atasan, bukti kepemimpinan tim kerja, sertifikat workshop leadership" },
      { kode: "MSDM201", nama: "Pengembangan Karir & Pelatihan", sks: 3, semester: 5, evidence: "Sertifikat trainer/training, modul pelatihan internal kantor, sertifikat BNSP MSDM" },
      { kode: "MSDM202", nama: "Hubungan Industrial", sks: 3, semester: 6, evidence: "Dokumen PKB/peraturan perusahaan, bukti penanganan mediasi kerja, SK serikat/tim adhoc" },
    ],
  },
  {
    id: "pemasaran",
    name: "Manajemen Pemasaran",
    badge: "Klaster B",
    desc: "Mencakup strategi promosi, riset pasar, perilaku konsumen, negosiasi penjualan, dan digital marketing bisnis.",
    courses: [
      { kode: "MKT101", nama: "Manajemen Pemasaran", sks: 3, semester: 3, evidence: "Rencana program marketing, portofolio kampanye produk, laporan omset/target penjualan" },
      { kode: "MKT102", nama: "Riset Pemasaran", sks: 3, semester: 4, evidence: "Laporan analisis kompetitor, kuisioner kepuasan pelanggan, data riset potensi pasar" },
      { kode: "MKT201", nama: "Pemasaran Digital & E-Commerce", sks: 3, semester: 5, evidence: "Dashboard ads (FB/Google/TikTok), portofolio medsos bisnis, sertifikat digital marketing" },
      { kode: "MKT202", nama: "Manajemen Penjualan & Distribusi", sks: 3, semester: 6, evidence: "Surat penugasan supervisor sales, bukti distribusi barang, sertifikat negosiasi bisnis" },
    ],
  },
  {
    id: "keuangan",
    name: "Manajemen Keuangan",
    badge: "Klaster C",
    desc: "Mencakup analisis laporan keuangan, anggaran operasional, perpajakan, investasi, dan perbankan bisnis.",
    courses: [
      { kode: "KEU101", nama: "Manajemen Keuangan Dasar", sks: 3, semester: 3, evidence: "Buku kas operasional, bukti penyusunan anggaran, surat tugas staf akuntansi/keuangan" },
      { kode: "KEU102", nama: "Analisis Laporan Keuangan", sks: 3, semester: 4, evidence: "Laporan neraca & laba rugi tahunan yang disusun, sertifikat brevet/akuntansi" },
      { kode: "KEU201", nama: "Perpajakan Bisnis", sks: 3, semester: 5, evidence: "Bukti lapor SPT tahunan badan/orang pribadi, sertifikat Brevet Pajak A/B" },
      { kode: "KEU202", nama: "Manajemen Investasi & Pasar Modal", sks: 3, semester: 6, evidence: "Portofolio investasi bisnis, sertifikat WPPE/WMI, analisis kelayakan investasi" },
    ],
  },
  {
    id: "bisnis",
    name: "Kewirausahaan & Bisnis",
    badge: "Klaster D",
    desc: "Mencakup pendirian usaha, perizinan, model bisnis kanvas, inovasi produk, dan kepemimpinan UMKM/Korporat.",
    courses: [
      { kode: "WIR101", nama: "Kewirausahaan Mandiri", sks: 3, semester: 2, evidence: "NIB (Nomor Induk Berusaha), legalitas usaha/CV/PT, profil bisnis yang sedang berjalan" },
      { kode: "WIR102", nama: "Perencanaan Bisnis (Business Plan)", sks: 3, semester: 4, evidence: "Dokumen Business Model Canvas (BMC), proposal kemitraan bisnis, investor deck" },
      { kode: "MAN101", nama: "Pengantar Manajemen & Bisnis", sks: 3, semester: 1, evidence: "Surat keterangan masa kerja minimum 2 tahun, SK pengangkatan manajerial" },
      { kode: "MAN201", nama: "Manajemen Operasional", sks: 3, semester: 5, evidence: "SOP alur produksi/layanan, sertifikat ISO/manajemen mutu, laporan efisiensi logistik" },
    ],
  },
];

const FAQS = [
  {
    q: "Apakah ijazah lulusan jalur RPL berbeda dengan jalur kuliah reguler?",
    a: "Tidak ada perbedaan sama sekali. Lulusan jalur RPL menerima Ijazah resmi Sarjana Manajemen (S.M.) dan transkrip akademik yang sama persis dengan mahasiswa reguler, terdaftar sah di PDDikti Kemendikbudristek.",
  },
  {
    q: "Berapa banyak maksimal SKS yang dapat dikonversikan?",
    a: "Sesuai regulasi Permendikbudristek No. 41 Tahun 2021, Anda dapat mengklaim hingga maksimal 100 SKS (sekitar 70% dari total 144 SKS sarjana). Sisanya diselesaikan melalui perkuliahan terarah di STIMI YAPMI.",
  },
  {
    q: "Bagaimana jika saya tidak memiliki sertifikat pelatihan formal atau bukti kerja lama tercecer?",
    a: "Inilah keunggulan utama REKSA STIMI! Platform kami menyediakan modul pembelajaran mandiri singkat per klaster yang diakhiri kuis kelulusan. Setelah lulus, sistem otomatis menerbitkan Sertifikat Kelulusan Resmi STIMI yang sah diakui asesor sebagai bukti pemenuhan SKS Anda.",
  },
  {
    q: "Berapa lama proses asesmen hingga SK Konversi terbit?",
    a: "Proses asesmen di REKSA berjalan sangat efisien. Rata-rata berkas selesai dinilai asesor dalam 3–7 hari kerja sejak dokumen evaluasi diri F03 diajukan secara lengkap.",
  },
  {
    q: "Bagaimana jika saya merasa nilai konversi mata kuliah kurang sesuai?",
    a: "REKSA STIMI menjamin transparansi dengan mekanisme SANGGAHAN RESMI. Mahasiswa berhak mengajukan sanggahan dan bukti tambahan sebelum Berita Acara Pleno dan SK Final ditetapkan.",
  },
];

export function PublicLandingClient() {
  const [activeKlaster, setActiveKlaster] = useState("sdm");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const selectedKlaster = KLASTER_DATA.find((k) => k.id === activeKlaster) || KLASTER_DATA[0];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--md-surface)", color: "var(--md-on-surface)", transition: "background-color 0.2s ease" }}>
      {/* ─── 1. TOP NAVBAR ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--sidebar-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--sidebar-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* Brand */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#fff",
                border: "1.5px solid var(--md-outline-variant)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 14px var(--theme-glow)",
                flexShrink: 0,
              }}
            >
              <img src="/icon-logo-reksa.png" alt="Logo REKSA" style={{ width: 42, height: 42, objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 25, fontWeight: 900, color: "var(--md-primary)", letterSpacing: "-0.03em" }}>
                REKSA
              </span>
              <span style={{ fontSize: 25, fontWeight: 900, color: "var(--md-on-surface)", letterSpacing: "-0.03em" }}>
                STIMI
              </span>
            </div>
          </Link>



          {/* Right Action: Theme Switcher & Auth Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeSelector />

            <Link
              href="/verify/dokumen/cek"
              title="Cek Keaslian SK & Sertifikat via QR Code"
              className="hidden sm:inline-flex"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid var(--md-outline)",
                background: "var(--md-surface-1)",
                color: "var(--md-on-surface)",
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>🔍</span>
              <span>Cek SK</span>
            </Link>

            <Link
              href="/login"
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1.5px solid var(--md-primary)",
                background: "transparent",
                color: "var(--md-primary)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.18s ease",
              }}
            >
              Masuk
            </Link>

            <Link
              href="/register"
              style={{
                padding: "9px 20px",
                borderRadius: 999,
                border: "none",
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px var(--theme-glow)",
                transition: "all 0.18s ease",
              }}
            >
              Daftar RPL
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION (FULL SCREEN / ABOVE THE FOLD) ─── */}
      <section
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(60px, 8vh, 120px) 20px clamp(80px, 10vh, 140px)",
          maxWidth: 1280,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Glow ambient background element */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "70%",
            background: "radial-gradient(ellipse at center, var(--theme-glow) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          {/* Main Title */}
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: 1040,
              margin: "0 auto 24px",
              color: "var(--md-on-surface)",
            }}
          >
            Ubah Pengalaman Kerja Menjadi Gelar{" "}
            <span style={{ color: "var(--md-primary)", textDecoration: "underline", textDecorationColor: "var(--theme-ring)", textUnderlineOffset: 10 }}>
              Sarjana Manajemen (S1)
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(17px, 2.2vw, 21px)",
              color: "var(--md-on-surface-variant)",
              maxWidth: 860,
              margin: "0 auto 44px",
              lineHeight: 1.65,
            }}
          >
            Platform <strong>REKSA STIMI</strong> (<strong>Rekognisi Evaluasi dan Konversi Akademik STIMI</strong>) membantu pekerja profesional, wirausahawan, ASN (Aparatur Sipil Negara), anggota POLRI, prajurit TNI, praktisi manajerial (supervisor, manajer operasional, kepala cabang/ruangan), hingga lulusan diploma mengonversikan jam terbang kerja, kepemimpinan tim, portofolio proyek, serta sertifikasi keahlian menjadi <strong>hingga 100 SKS resmi</strong>. Kuliah lebih cepat, hemat, dan sah diakui PDDikti.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 64 }}>
            <Link
              href="/register"
              style={{
                padding: "18px 42px",
                borderRadius: 999,
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                fontSize: 16.5,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 10px 30px var(--theme-glow)",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                transition: "transform 0.15s ease",
              }}
            >
              <span>Daftar Akun RPL Sekarang</span>
              <span>→</span>
            </Link>

            <a
              href="#katalog-klaster"
              style={{
                padding: "18px 34px",
                borderRadius: 999,
                border: "1.5px solid var(--md-outline)",
                background: "var(--md-surface-1)",
                color: "var(--md-on-surface)",
                fontSize: 15.5,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <span>Telusuri Mata Kuliah RPL</span>
              <span>↓</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
              maxWidth: 1040,
              margin: "0 auto",
            }}
          >
            {[
              { val: "Maks. 100 SKS", label: "Dapat Diakui & Dikonversi", icon: "⚡" },
              { val: "1 - 2 Tahun", label: "Masa Tempuh S1 Lulus", icon: "🎓" },
              { val: "Hemat 70%", label: "Waktu & Biaya Kuliah", icon: "💰" },
              { val: "100% Legal", label: "SK Resmi & Terdaftar PDDikti", icon: "📜" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: "26px 20px",
                  borderRadius: 22,
                  backgroundColor: "var(--md-surface-1)",
                  border: "1.5px solid var(--md-outline-variant)",
                  boxShadow: "var(--md-shadow-1)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--md-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>{stat.val}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--md-on-surface-variant)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. APA ITU REKSA & RPL TIPE A ─── */}
      <section id="apa-itu-rpl" style={{ padding: "80px 20px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Apa itu REKSA & Jalur RPL Tipe A STIMI YAPMI?
          </h2>
          <p style={{ fontSize: "clamp(16px, 1.8vw, 18px)", color: "var(--md-on-surface-variant)", maxWidth: 880, margin: "16px auto 0", lineHeight: 1.75 }}>
            <strong>REKSA STIMI</strong> merupakan singkatan dari <strong>Rekognisi Evaluasi dan Konversi Akademik STIMI</strong> — sistem informasi dan platform terpadu STIMI YAPMI Makassar yang memfasilitasi pengakuan capaian pembelajaran masa lampau (RPL Tipe A) menjadi perolehan Satuan Kredit Semester (SKS) resmi program Sarjana Manajemen (S1).
          </p>

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Card 1: Perolehan Pengalaman Kerja */}
          <div style={{ padding: 32, borderRadius: 24, backgroundColor: "var(--md-surface-1)", border: "1.5px solid var(--md-outline-variant)", boxShadow: "var(--md-shadow-1)" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
              💼
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: "var(--md-on-surface)" }}>
              Jalur Perolehan SKS (Pengalaman Kerja)
            </h3>
            <p style={{ fontSize: 14.5, color: "var(--md-on-surface-variant)", lineHeight: 1.6, marginBottom: 16 }}>
              Diperuntukkan bagi pekerja profesional, wirausahawan, ASN/PNS, anggota POLRI, prajurit TNI, serta praktisi manajerial (supervisor, manajer operasional, kepala cabang/unit) dengan jam terbang kerja minimal 2–3 tahun. Pengalaman kepemimpinan, koordinasi tugas, pengelolaan anggaran, dan administrasi diajukan untuk dinilai asesor menjadi SKS resmi Sarjana Manajemen (S1).
            </p>
            <ul style={{ fontSize: 13.5, color: "var(--md-on-surface)", paddingLeft: 20, lineHeight: 1.8 }}>
              <li>SK Jabatan / Pangkat / Penugasan (ASN, POLRI, TNI, Karyawan)</li>
              <li>Surat keterangan kerja, portofolio proyek & laporan manajerial</li>
              <li>Sertifikasi profesi, diklat kepemimpinan, atau pelatihan teknis</li>
              <li>Legalitas usaha (NIB/CV/PT) bagi wirausahawan & pelaku UMKM</li>
            </ul>
          </div>

          {/* Card 2: Transfer Kredit Akademik */}
          <div style={{ padding: 32, borderRadius: 24, backgroundColor: "var(--md-surface-1)", border: "1.5px solid var(--md-outline-variant)", boxShadow: "var(--md-shadow-1)" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
              📜
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: "var(--md-on-surface)" }}>
              Jalur Transfer SKS (Kuliah Terdahulu)
            </h3>
            <p style={{ fontSize: 14.5, color: "var(--md-on-surface-variant)", lineHeight: 1.6, marginBottom: 16 }}>
              Bagi lulusan D1, D2, D3, atau mahasiswa pindahan dari perguruan tinggi lain yang belum sempat menyelesaikan sarjana. Mata kuliah yang pernah diambil dapat ditransfer secara sah.
            </p>
            <ul style={{ fontSize: 13.5, color: "var(--md-on-surface)", paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Ijazah dan transkrip nilai resmi dari kampus asal</li>
              <li>Silabus / deskripsi mata kuliah terdahulu</li>
              <li>Status akreditasi program studi terdahulu</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── 4. ALUR REKOGNISI 5 LANGKAH ─── */}
      <section id="alur" style={{ padding: "80px 20px", backgroundColor: "var(--md-surface-2)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Alur 5 Langkah Menuju Sarjana RPL
            </h2>
            <p style={{ fontSize: 16, color: "var(--md-on-surface-variant)", maxWidth: 680, margin: "14px auto 0" }}>
              Seluruh tahapan dikawal di dalam sistem REKSA STIMI secara transparan dari awal hingga kelulusan.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            {[
              {
                step: "01",
                title: "Daftar Ringan & Bayar",
                desc: "Isi data dasar (Nama, WA, Prodi) dalam 1 menit, lalu kirimkan bukti bayar pendaftaran. Sambil menunggu verifikasi, nikmati teaser materi.",
              },
              {
                step: "02",
                title: "LMS Kursus Singkat",
                desc: "Tonton video materi ringkas per klaster dan selesaikan kuis mandiri untuk meraih Sertifikat Kelulusan Resmi STIMI sebagai pemenuh SKS.",
              },
              {
                step: "03",
                title: "Evaluasi Diri F03",
                desc: "Klaim mata kuliah per klaster menggunakan sertifikat REKSA atau portofolio kerja. Asesor resmi ber-SK akan memeriksa bukti Anda (VATM).",
              },
              {
                step: "04",
                title: "Pleno & SK Hasil Konversi",
                desc: "Hasil asesmen diplenokan. Terbit SK Hasil RPL dan Transkrip Konversi resmi. Tersedia fitur sanggahan jika ada nilai yang belum pas.",
              },
              {
                step: "05",
                title: "Kuliah Sisa & Wisuda",
                desc: "Anda hanya perlu mengambil sisa mata kuliah yang belum terpenuhi, menyelesaikan skripsi/tugas akhir, dan diwisuda Sarjana Manajemen (S.M.).",
              },
            ].map((st, i) => (
              <div
                key={i}
                style={{
                  padding: "24px 20px",
                  borderRadius: 20,
                  backgroundColor: "var(--md-surface-1)",
                  border: "1px solid var(--md-outline-variant)",
                  boxShadow: "var(--md-shadow-1)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "var(--md-primary)",
                    opacity: 0.8,
                    marginBottom: 12,
                    fontFamily: "monospace",
                  }}
                >
                  {st.step}
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 800, marginBottom: 8, color: "var(--md-on-surface)" }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", lineHeight: 1.5, flex: 1 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. KATALOG KLASTER & MATA KULIAH (FITUR UNGGULAN) ─── */}
      <section id="katalog-klaster" style={{ padding: "80px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Telusuri Mata Kuliah & Bukti yang Dibutuhkan
          </h2>
          <p style={{ fontSize: 16, color: "var(--md-on-surface-variant)", maxWidth: 740, margin: "14px auto 0" }}>
            Pilih klaster peminatan di bawah ini untuk melihat contoh mata kuliah yang dapat di-RPL-kan beserta portofolio pendukung yang dapat Anda ajukan.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
          {KLASTER_DATA.map((k) => {
            const isSelected = activeKlaster === k.id;
            return (
              <button
                key={k.id}
                onClick={() => setActiveKlaster(k.id)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: isSelected ? "1.5px solid var(--md-primary)" : "1.5px solid var(--md-outline-variant)",
                  background: isSelected ? "var(--md-primary)" : "var(--md-surface-1)",
                  color: isSelected ? "var(--md-on-primary)" : "var(--md-on-surface)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 4px 14px var(--theme-glow)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                {k.name}
              </button>
            );
          })}
        </div>

        {/* Klaster Description Card */}
        <div
          style={{
            padding: "24px 28px",
            borderRadius: 20,
            background: "var(--md-surface-1)",
            border: "1px solid var(--md-outline-variant)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, background: "var(--md-primary-container)", color: "var(--md-on-primary-container)", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                {selectedKlaster.badge}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)" }}>{selectedKlaster.name}</h3>
            </div>
            <p style={{ fontSize: 14, color: "var(--md-on-surface-variant)", maxWidth: 780 }}>{selectedKlaster.desc}</p>
          </div>

          <Link
            href="/register"
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Klaim Klaster Ini →
          </Link>
        </div>

        {/* Courses Table / Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 16, marginBottom: 36 }}>
          {selectedKlaster.courses.map((c) => (
            <div
              key={c.kode}
              style={{
                padding: "20px 22px",
                borderRadius: 18,
                background: "var(--md-surface-1)",
                border: "1px solid var(--md-outline-variant)",
                boxShadow: "var(--md-shadow-1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--md-primary)", fontFamily: "monospace" }}>{c.kode}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "var(--md-surface-2)", padding: "2px 8px", borderRadius: 6 }}>
                  {c.sks} SKS • Sem. {c.semester}
                </span>
              </div>
              <h4 style={{ fontSize: 15.5, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 12 }}>{c.nama}</h4>
              <div style={{ marginTop: "auto", borderTop: "1px dashed var(--md-outline-variant)", paddingTop: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--md-primary)", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Contoh Dokumen Bukti:
                </p>
                <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", lineHeight: 1.4 }}>
                  {c.evidence}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── BANNER PENENANG (KILLER USP BANNER) ─── */}
        <div
          style={{
            padding: "28px 32px",
            borderRadius: 24,
            background: "linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-surface-1) 100%)",
            border: "2px solid var(--md-primary)",
            boxShadow: "0 8px 30px var(--theme-glow)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--md-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            💡
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h4 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-primary-container)", marginBottom: 6 }}>
              Bukti Kerja Lama Tercecer atau Tidak Punya Sertifikat Pelatihan? Tenang!
            </h4>
            <p style={{ fontSize: 14, color: "var(--md-on-surface)", lineHeight: 1.6 }}>
              Di dalam <strong>REKSA STIMI</strong>, Anda tidak perlu cemas. Kami menyediakan <strong>Pembelajaran Singkat Mandiri (LMS) per klaster</strong> yang dilengkapi video materi dan kuis evaluasi. Setelah lulus, Anda langsung menerima <strong>Sertifikat Kompetensi Resmi STIMI YAPMI</strong> yang sah dikonversi sebagai bukti SKS mata kuliah klaster ini!
            </p>
          </div>
          <Link
            href="/register"
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              background: "var(--md-primary)",
              color: "var(--md-on-primary)",
              fontSize: 13.5,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 14px var(--theme-glow)",
              whiteSpace: "nowrap",
            }}
          >
            Coba Modul Mandiri →
          </Link>
        </div>
      </section>

      {/* ─── 6. LEGALITAS & AKREDITASI ─── */}
      <section id="legalitas" style={{ padding: "80px 20px", backgroundColor: "var(--md-surface-2)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Payung Hukum, Akreditasi & Keamanan Dokumen
            </h2>
            <p style={{ fontSize: 16, color: "var(--md-on-surface-variant)", maxWidth: 700, margin: "14px auto 0" }}>
              Program RPL STIMI YAPMI Makassar diselenggarakan dengan kepatuhan penuh terhadap standar mutu nasional Kemendikbudristek.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            <div style={{ padding: 28, borderRadius: 20, background: "var(--md-surface-1)", border: "1px solid var(--md-outline-variant)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⚖️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Dasar Hukum Penyelenggaraan RPL</h3>
              <p style={{ fontSize: 13.5, color: "var(--md-on-surface-variant)", lineHeight: 1.6 }}>
                Berdasarkan <strong>Permendikbudristek No. 41 Tahun 2021</strong> tentang Rekognisi Pembelajaran Lampau dan Keputusan Dirjen Diktiristek tentang Petunjuk Teknis RPL Tipe A. Seluruh mahasiswa RPL dilaporkan resmi ke Pangkalan Data Pendidikan Tinggi (PDDikti) dan sistem SIERRA.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: 20, background: "var(--md-surface-1)", border: "1px solid var(--md-outline-variant)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏅</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Akreditasi STIMI YAPMI Makassar</h3>
              <p style={{ fontSize: 13.5, color: "var(--md-on-surface-variant)", lineHeight: 1.6 }}>
                STIMI YAPMI Makassar dan Program Studi S1 Manajemen memiliki status akreditasi resmi dari BAN-PT dan Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi (LAMEMBA), menjamin kualitas akademik dan rekognisi ijazah di dunia kerja & instansi pemerintah.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: 20, background: "var(--md-surface-1)", border: "1px solid var(--md-outline-variant)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🛡️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Verifikasi Digital Anti-Pemalsuan</h3>
              <p style={{ fontSize: 13.5, color: "var(--md-on-surface-variant)", lineHeight: 1.6 }}>
                Setiap Surat Keputusan (SK) Hasil RPL, Transkrip Konversi, dan Sertifikat Matrikulasi dilengkapi <strong>QR Code Token Verifikasi Publik</strong> yang dapat dicek instan oleh instansi atau pengguna lulusan tanpa membocorkan data pribadi sensitif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. FAQ SECTION ─── */}
      <section id="faq" style={{ padding: "80px 20px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                style={{
                  borderRadius: 16,
                  backgroundColor: "var(--md-surface-1)",
                  border: "1px solid var(--md-outline-variant)",
                  overflow: "hidden",
                  transition: "all 0.15s ease",
                }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--md-on-surface)",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "var(--md-primary)" }}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 22px 20px 22px", fontSize: 14, color: "var(--md-on-surface-variant)", lineHeight: 1.6, borderTop: "1px solid var(--md-outline-variant)", paddingTop: 14 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 8. BOTTOM CALL TO ACTION ─── */}
      <section style={{ padding: "60px 20px 100px", maxWidth: 1160, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            padding: "48px 32px",
            borderRadius: 32,
            background: "linear-gradient(135deg, var(--md-primary) 0%, var(--md-primary-container) 100%)",
            color: "var(--md-on-primary)",
            boxShadow: "0 16px 40px var(--theme-glow)",
          }}
        >
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, marginBottom: 14, color: "#fff" }}>
            Siap Raih Gelar Sarjana Manajemen dengan Pengalaman Anda?
          </h2>
          <p style={{ fontSize: 16, maxWidth: 640, margin: "0 auto 30px", opacity: 0.95, color: "#f8fafc" }}>
            Pendaftaran dibuka untuk Periode RPL Aktif. Daftarkan akun Anda secara cepat dengan data ringan, lalu upload bukti transfer untuk memulai.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/register"
              style={{
                padding: "16px 36px",
                borderRadius: 999,
                background: "#ffffff",
                color: "var(--md-primary)",
                fontSize: 15.5,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              Mulai Pendaftaran Ringan →
            </Link>
            <a
              href="https://wa.me/6285174489071?text=Halo%20Panitia%20RPL%20STIMI%20YAPMI,%20saya%20ingin%20konsultasi%20jalur%20RPL"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "16px 28px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              💬 Chat WhatsApp Konsultan
            </a>
          </div>
        </div>
      </section>

      {/* ─── 9. FOOTER ─── */}
      <footer style={{ borderTop: "1px solid var(--md-outline-variant)", padding: "40px 20px 30px", backgroundColor: "var(--md-surface-1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/icon-logo-reksa.png" alt="Logo REKSA" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "var(--md-on-surface)" }}>STIMI YAPMI MAKASSAR</p>
              <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)" }}>Kampus: Jl. Perintis Kemerdekaan, Makassar, Sulawesi Selatan</p>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--md-on-surface-variant)", fontWeight: 600 }}>
            REKSA STIMI © 2026. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
