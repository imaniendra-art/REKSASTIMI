import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Payment } from "@/models/Payment";
import { Period } from "@/models/Period";
import { workflowSteps } from "@/lib/dashboard-data";
import Link from "next/link";
import { formatRplRegistrationNumber, generateRplIdentityNumber } from "@/lib/rpl-registration";
import { syncProfileToF03WhenAssessmentsComplete, syncProfileToEvaluasiAsesorWhenF03Complete } from "@/lib/assessment-progress";
import { getOrCreateApplicantProfile } from "@/lib/applicant-profile";
import { redirect } from "next/navigation";

export default async function MahasiswaDashboardPage() {
  await connectMongoDB();
  const session = await getSession();

  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  // 1. Fetch or auto-initialize applicant profile and live payment state
  const { profile, hasAcceptedPayment, hasPendingPayment } = await getOrCreateApplicantProfile(session);

  let currentStatus = profile.statusRpl || (hasAcceptedPayment ? "LENGKAPI_CV" : "PENDAFTARAN");
  let registrationNumber = profile.registrationNumber || profile.noPendaftar || "Belum Ada";
  let periodName = profile.periodName || profile.periode || "2025/2026 Ganjil";
  let concentration = profile.concentration || "Manajemen";
  let studentName = profile.identity?.fullName || session?.name || session?.username || "Mahasiswa RPL";

  // 2. Evaluate Biodata completeness based on core required fields & uploaded files
  const identity = (profile.identity || {}) as any;
  const contact = (profile.contact || {}) as any;
  const documents = (profile.documents || []) as any[];

  const requiredIdentityFilled = 
    Boolean(identity.fullName?.trim()) &&
    Boolean(identity.placeOfBirth?.trim()) &&
    Boolean(identity.dateOfBirth) &&
    Boolean(identity.gender) &&
    Boolean(identity.religion?.trim()) &&
    Boolean(identity.motherName?.trim()) &&
    Boolean(identity.citizenship?.trim()) &&
    Boolean(identity.nik?.trim() && identity.nik.trim().length === 16) &&
    Boolean(identity.nisn?.trim() && identity.nisn.trim().length === 10);

  const requiredContactFilled =
    Boolean(contact.address?.trim()) &&
    Boolean(contact.village?.trim()) &&
    Boolean(contact.district?.trim()) &&
    Boolean(contact.email?.trim()) &&
    Boolean(contact.phone?.trim());

  const uploadedDocTypes = documents
    .filter((d: any) => d.fileUrl && d.fileUrl.trim().length > 0)
    .map((d: any) => d.type);

  // Core registration legal docs: KTP, KK, Akta, and Ijazah
  const hasCoreLegalDocs = ["ktp", "kk", "akta", "ijazah"].every((type) => uploadedDocTypes.includes(type));
  const isBiodataComplete = requiredIdentityFilled && requiredContactFilled && hasCoreLegalDocs;

  // 3. Status progression checks
  if (["ASESMEN_KOMPETENSI", "ASESMEN_F02"].includes(currentStatus)) {
    const advancedToF03 = await syncProfileToF03WhenAssessmentsComplete(session.id);
    if (advancedToF03) {
      currentStatus = "EVALUASI_F03";
    }
  }

  if (currentStatus === "EVALUASI_F03") {
    const advancedToAsesor = await syncProfileToEvaluasiAsesorWhenF03Complete(session.id);
    if (advancedToAsesor) {
      currentStatus = "EVALUASI_ASESOR";
    }
  }

  const normalizedStatus = currentStatus.replace(/_/g, " ").replace("ASESOR", "PENILAI");
  let currentIndex = workflowSteps.indexOf(normalizedStatus as any);
  if (currentIndex === -1) currentIndex = 0;
  if (currentIndex === 0 && hasAcceptedPayment) currentIndex = 1;

  const isPaymentLocked = !hasAcceptedPayment;
  const doneCount = currentIndex;
  const totalCount = workflowSteps.length;
  const progressPct = Math.round((doneCount / totalCount) * 100);
  const displayStatus = currentStatus === "PENDAFTARAN" ? "PENDAFTARAN AKUN" : currentStatus.replace(/_/g, " ");

  const menu = [
    {
      title: "Administrasi Keuangan",
      desc: "Tagihan pendaftaran & bukti pembayaran 4 berkas.",
      tone: "var(--md-primary)",
      bg: "var(--md-primary-container)",
      lock: false,
      href: "/dashboard/mahasiswa/keuangan",
      emoji: "💳",
    },
    {
      title: "Biodata Pribadi",
      desc: "Data diri, orang tua & sinkronisasi PDDIKTI.",
      tone: "var(--md-primary)",
      bg: "var(--md-primary-container)",
      lock: isPaymentLocked,
      href: "/dashboard/mahasiswa/biodata",
      emoji: "👤",
    },
    {
      title: "CV Riwayat Hidup (F-07)",
      desc: "Pengalaman kerja, pendidikan & sertifikasi.",
      tone: "var(--md-warning)",
      bg: "var(--md-warning-container)",
      lock: isPaymentLocked || currentIndex < 1,
      href: "/dashboard/mahasiswa/cv",
      emoji: "📄",
    },
    {
      title: "Pemilihan Mata Kuliah (F-02)",
      desc: "Pemilihan mata kuliah konversi & transfer SKS.",
      tone: "var(--md-success)",
      bg: "var(--md-success-container)",
      lock: isPaymentLocked || currentIndex < 3,
      href: "/dashboard/mahasiswa/f02",
      emoji: "📝",
    },
    {
      title: "Test Kompetensi Mandiri",
      desc: "Ujian modul materi & capaian pembelajaran.",
      tone: "var(--md-secondary, var(--md-primary))",
      bg: "var(--md-secondary-container, var(--md-primary-container))",
      lock: isPaymentLocked || currentIndex < 4,
      href: "/dashboard/mahasiswa/asesmen",
      emoji: "🎯",
    },
    {
      title: "Evaluasi Diri Portofolio (F-03)",
      desc: "Evaluasi diri & unggah portofolio bukti VATM.",
      tone: "var(--md-primary)",
      bg: "var(--md-primary-container)",
      lock: isPaymentLocked || currentIndex < 5,
      href: "/dashboard/mahasiswa/f03",
      emoji: "📋",
    },
  ];

  return (
    <div style={{ width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── 1. Hero Identity Card ── */}
      <section
        style={{
          borderRadius: 24,
          padding: "32px 36px",
          background: "linear-gradient(135deg, var(--md-surface-1) 0%, var(--md-surface-2) 100%)",
          border: "1px solid var(--md-outline-variant)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: 280 }}>

            <h1 style={{ fontSize: "clamp(22px, 3.2vw, 32px)", fontWeight: 900, color: "var(--md-on-surface)", lineHeight: 1.25, letterSpacing: "-0.02em", margin: 0 }}>
              Selamat Datang, {studentName}
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--md-on-surface-variant)", marginTop: 8, lineHeight: 1.6, maxWidth: 640 }}>
              Sistem Rekognisi Pembelajaran Lampau (RPL) Tipe A STIMI YAPMI Makassar. Pantau tahapan pendaftaran, evaluasi capaian kompetensi, dan pengakuan konversi SKS Anda.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <Link
                href="/dashboard/mahasiswa/petunjuk"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 999,
                  background: "var(--md-surface-1)",
                  border: "1px solid var(--md-outline)",
                  color: "var(--md-on-surface)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                }}
              >
                <span>📖</span>
                <span>Panduan Prosedur RPL</span>
              </Link>
              <Link
                href="/dashboard/mahasiswa/download"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 999,
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  fontSize: 12.5,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px var(--theme-glow)",
                  transition: "all 0.18s ease",
                }}
              >
                <span>📥</span>
                <span>Pusat Download Berkas</span>
              </Link>
            </div>
          </div>

          {/* Matrix Detail Status */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, minWidth: 280 }}>
            {[
              { label: "Nomor Registrasi", value: registrationNumber, mono: true, tone: "var(--md-primary)" },
              { label: "Program & Peminatan", value: `S1 Manajemen (${concentration})`, mono: false },
              { label: "Periode Akademik", value: periodName, mono: false },
              { label: "Status Berjalan", value: displayStatus, mono: false, highlight: true },
            ].map((info) => (
              <div
                key={info.label}
                style={{
                  background: "var(--md-surface-1)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  border: info.highlight ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--md-on-surface-variant)", marginBottom: 4 }}>
                  {info.label}
                </p>
                <p style={{ fontWeight: 800, fontSize: 13, color: info.tone || "var(--md-on-surface)", fontFamily: info.mono ? "monospace" : "inherit", lineHeight: 1.35, margin: 0 }}>
                  {info.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Payment Notification / Waiting Room ── */}
      {hasAcceptedPayment && !isBiodataComplete && (
        <section
          style={{
            borderRadius: 20,
            background: "var(--md-surface-1)",
            border: "1.5px solid var(--md-primary)",
            boxShadow: "0 4px 18px var(--theme-glow)",
            padding: "22px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>📋</span>
              <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-primary)" }}>
                Tahapan Utama Anda Saat Ini
              </span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)", margin: 0 }}>
              Pembayaran Pendaftaran Terverifikasi — Lengkapi Formulir Biodata Resmi
            </h3>
            <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", marginTop: 6, lineHeight: 1.55 }}>
              Pembayaran Anda telah disetujui. Silakan lengkapi data diri pokok (NIK, NISN, alamat domisili) dan berkas pendukung untuk membuka modul CV Riwayat Hidup (F-07).
            </p>
          </div>

          <Link
            href="/dashboard/mahasiswa/biodata"
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              background: "var(--md-primary)",
              color: "var(--md-on-primary)",
              fontSize: 13.5,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 16px var(--theme-glow)",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Isi Biodata Sekarang</span>
            <span>→</span>
          </Link>
        </section>
      )}

      {!hasAcceptedPayment && (
        <section>
          {hasPendingPayment ? (
            /* Menunggu Verifikasi Keuangan */
            <div
              style={{
                borderRadius: 20,
                background: "var(--md-surface-1)",
                border: "1.5px solid var(--md-warning)",
                boxShadow: "0 6px 24px rgba(217, 119, 6, 0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 28px",
                  background: "var(--md-warning-container)",
                  borderBottom: "1px solid rgba(217,119,6,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-warning)" }}>
                      Status Pembayaran Sedang Diverifikasi
                    </span>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 900, color: "var(--md-on-surface)", margin: 0 }}>
                    Bukti Pembayaran & 4 Berkas Legalitas Anda Sedang Diperiksa
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", marginTop: 6, lineHeight: 1.5 }}>
                    Bagian Keuangan STIMI YAPMI Makassar sedang memvalidasi transfer pendaftaran dan berkas (KTP, KK, Akta Lahir, Ijazah SMA). Estimasi 1–24 jam kerja.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="https://wa.me/6285174489071?text=Halo%20Pak%20Riswan%20(Keuangan%20STIMI),%20saya%20sudah%20mengunggah%20bukti%20bayar%20pendaftaran%20RPL%20mohon%20diverifikasi."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "10px 20px",
                      borderRadius: 999,
                      background: "#25D366",
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 12px rgba(37,211,102,0.25)",
                    }}
                  >
                    💬 Konfirmasi via WhatsApp
                  </a>
                  <Link
                    href="/dashboard/mahasiswa/keuangan"
                    style={{
                      padding: "10px 18px",
                      borderRadius: 999,
                      background: "var(--md-surface-1)",
                      border: "1px solid var(--md-outline)",
                      color: "var(--md-on-surface)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Histori Tagihan
                  </Link>
                </div>
              </div>

              {/* Teaser Content */}
              <div style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--md-on-surface)", margin: 0 }}>
                    Sambil Menunggu: Pelajari Silabus & Peta Konsentrasi RPL
                  </h4>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--md-on-surface-variant)", lineHeight: 1.55, marginBottom: 18 }}>
                  Fitur akademik (F02, LMS matrikulasi, dan F03) akan terbuka otomatis setelah verifikasi selesai. Anda dapat meninjau peta kurikulum peminatan:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {[
                    { title: "Manajemen SDM", matkul: "4 MK • 12 SKS", desc: "Manajemen SDM, Perilaku Organisasi, Pelatihan Karir & Hubungan Industrial." },
                    { title: "Manajemen Pemasaran", matkul: "4 MK • 12 SKS", desc: "Manajemen Pemasaran, Riset Pasar, Digital Marketing & Manajemen Penjualan." },
                    { title: "Manajemen Keuangan", matkul: "4 MK • 12 SKS", desc: "Dasar Keuangan, Analisis Laporan Keuangan, Pajak Bisnis & Investasi." },
                    { title: "Pengembangan Bisnis", matkul: "4 MK • 12 SKS", desc: "Kewirausahaan Mandiri, Business Plan, Pengantar Manajemen & Operasional." },
                  ].map((teaser, idx) => (
                    <div key={idx} style={{ padding: "16px", borderRadius: 16, background: "var(--md-surface-2)", border: "1px solid var(--md-outline-variant)" }}>
                      <p style={{ fontSize: 10.5, fontWeight: 800, color: "var(--md-primary)", textTransform: "uppercase", marginBottom: 4 }}>{teaser.matkul}</p>
                      <h5 style={{ fontSize: 14, fontWeight: 800, color: "var(--md-on-surface)", margin: "0 0 6px 0" }}>{teaser.title}</h5>
                      <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", lineHeight: 1.45, margin: 0 }}>{teaser.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Belum Upload Bukti Pembayaran */
            <div
              style={{
                borderRadius: 20,
                background: "var(--md-surface-1)",
                border: "1.5px solid var(--md-error)",
                boxShadow: "0 6px 24px rgba(220, 38, 38, 0.1)",
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-error)" }}>
                    Langkah Wajib Pertama
                  </span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: "var(--md-on-surface)", margin: 0 }}>
                  Selesaikan Pembayaran Pendaftaran & Unggah Dokumen Legalitas
                </h3>
                <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", marginTop: 6, lineHeight: 1.55 }}>
                  Untuk membuka seluruh akses akademik (Biodata, CV, Form F02, Tes Mandiri, dan Portofolio F03), silakan transfer biaya pendaftaran dan lengkapi foto KTP, KK, Akta Lahir, dan Ijazah SMA/Sederajat.
                </p>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12.5, color: "var(--md-on-surface)" }}>
                  <div style={{ padding: "6px 12px", borderRadius: 8, background: "var(--md-surface-2)", border: "1px solid var(--md-outline-variant)" }}>
                    Biaya Registrasi: <strong>Rp 250.000</strong>
                  </div>
                  <div style={{ padding: "6px 12px", borderRadius: 8, background: "var(--md-surface-2)", border: "1px solid var(--md-outline-variant)" }}>
                    Bank Rakyat Indonesia (BRI): <strong>3419-0106-7835-533</strong> A.n Sekolah Tinggi Ilmu Manajemen Indonesia (RPL)
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/mahasiswa/keuangan"
                style={{
                  padding: "13px 26px",
                  borderRadius: 999,
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  fontSize: 13.5,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px var(--theme-glow)",
                  whiteSpace: "nowrap",
                }}
              >
                Unggah Bukti Bayar & Berkas →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── 3. RPL Journey Tracker (Informative 10 Steps) ── */}
      <section
        style={{
          borderRadius: 24,
          padding: "24px 28px",
          background: "var(--md-surface-1)",
          border: "1px solid var(--md-outline-variant)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)", margin: 0 }}>
              Perjalanan Tahapan RPL Tipe A
            </h2>
            <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginTop: 2 }}>
              Tahap ke-{currentIndex + 1} dari {totalCount} tahapan — {displayStatus}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--md-on-surface-variant)", textTransform: "uppercase" }}>
              Total Capaian:
            </span>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                background: "var(--md-primary-container)",
                color: "var(--md-primary)",
                fontWeight: 900,
                fontSize: 14,
                border: "1px solid var(--md-outline-variant)",
              }}
            >
              {progressPct}% Selesai
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div
          style={{
            background: "var(--md-outline-variant)",
            borderRadius: 999,
            height: 8,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--md-primary), var(--md-secondary))",
              borderRadius: 999,
              transition: "width 0.8s ease",
            }}
          />
        </div>

        {/* 10 Step Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {workflowSteps.map((step, idx) => {
            const done = idx < currentIndex;
            const active = idx === currentIndex;
            const stepName = step === "PENDAFTARAN" ? "PENDAFTARAN AKUN" : step.replace(/_/g, " ");

            const details: Record<string, { note: string; icon: string }> = {
              "PENDAFTARAN": { note: "Pendaftaran akun awal selesai.", icon: "👤" },
              "LENGKAPI CV": { note: "Wajib melengkapi Biodata & CV.", icon: "📄" },
              "PEMBAYARAN": { note: "Verifikasi tagihan registrasi.", icon: "💳" },
              "ASESMEN F02": { note: "Pilih mata kuliah untuk RPL.", icon: "📝" },
              "ASESMEN KOMPETENSI": { note: "Ikuti tes capaian pembelajaran.", icon: "🎯" },
              "EVALUASI F03": { note: "Unggah portofolio asesmen.", icon: "📋" },
              "EVALUASI PENILAI": { note: "Proses penilaian oleh penilai.", icon: "⚖️" },
              "KONFIRMASI HASIL": { note: "Review hasil asesmen penilai.", icon: "✅" },
              "SIAP PLENO": { note: "Menunggu pengesahan akademik.", icon: "🎓" },
              "LULUS": { note: "Proses RPL telah selesai.", icon: "🎉" },
            };

            const detail = details[step] || { note: "Tahapan proses RPL.", icon: "📌" };

            return (
              <div
                key={step}
                style={{
                  padding: "16px",
                  borderRadius: 16,
                  background: active
                    ? "var(--md-primary)"
                    : done
                    ? "var(--md-success-container)"
                    : "var(--md-surface-2)",
                  color: active
                    ? "var(--md-on-primary)"
                    : done
                    ? "var(--md-success)"
                    : "var(--md-on-surface-variant)",
                  border: active
                    ? "1.5px solid var(--md-primary)"
                    : done
                    ? "1px solid var(--md-success)"
                    : "1px solid var(--md-outline-variant)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 120,
                  boxShadow: active ? "0 8px 18px var(--theme-glow)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 900 }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 16 }}>
                    {done ? "✓" : detail.icon}
                  </span>
                </div>

                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.3, margin: "0 0 4px 0", color: active ? "#fff" : "var(--md-on-surface)" }}>
                    {stepName}
                  </p>
                  <p style={{ fontSize: 10.5, lineHeight: 1.4, margin: 0, opacity: active ? 0.9 : 0.8, color: active ? "#fff" : "var(--md-on-surface-variant)" }}>
                    {detail.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic CTA Bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--md-outline-variant)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--md-primary)", margin: 0 }}>
              Tindak Lanjut Anda:
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--md-on-surface)", marginTop: 2, margin: 0 }}>
              {!hasAcceptedPayment
                ? hasPendingPayment
                  ? "Menunggu verifikasi bukti transfer & 4 berkas legalitas dari bagian keuangan."
                  : "Unggah bukti pembayaran registrasi untuk membuka modul akademik."
                : currentIndex === 1
                ? isBiodataComplete
                  ? "Biodata lengkap. Lanjutkan melengkapi CV Riwayat Hidup (F-07)."
                  : "Silakan lengkapi Biodata Resmi dan unggah berkas pendukung."
                : currentIndex === 3
                ? "Pilih mata kuliah yang ingin dikonversi melalui Form F02."
                : currentIndex === 4
                ? "Ikuti modul pembelajaran & tes capaian kompetensi klaster."
                : currentIndex === 5
                ? "Isi evaluasi diri dan unggah berkas portofolio bukti pada Form F03."
                : "Pantau perkembangan evaluasi asesor atau konfirmasi hasil."}
            </p>
          </div>

          <div>
            <Link
              href={
                !hasAcceptedPayment
                  ? "/dashboard/mahasiswa/keuangan"
                  : currentIndex === 1
                  ? isBiodataComplete
                    ? "/dashboard/mahasiswa/cv"
                    : "/dashboard/mahasiswa/biodata"
                  : currentIndex === 3
                  ? "/dashboard/mahasiswa/f02"
                  : currentIndex === 4
                  ? "/dashboard/mahasiswa/asesmen"
                  : currentIndex === 5
                  ? "/dashboard/mahasiswa/f03"
                  : "/dashboard/mahasiswa/hasil-rpl"
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 999,
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 14px var(--theme-glow)",
              }}
            >
              <span>{!hasAcceptedPayment ? "Buka Keuangan" : !isBiodataComplete ? "Lengkapi Biodata Diri" : currentIndex === 1 ? "Lanjut ke CV (F-07)" : "Buka Menu Terkait"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Main Service Cards ── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 18, borderRadius: 999, background: "var(--md-primary)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)", margin: 0 }}>
            Menu Layanan Mandiri Calon Mahasiswa
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {menu.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 20,
                background: "var(--md-surface-1)",
                border: "1px solid var(--md-outline-variant)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: item.lock ? 0.6 : 1,
                filter: item.lock ? "grayscale(0.4)" : "none",
                transition: "all 0.22s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: item.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {item.emoji}
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      background: item.lock ? "var(--md-surface-2)" : item.bg,
                      color: item.lock ? "var(--md-on-surface-variant)" : item.tone,
                      border: "1px solid var(--md-outline-variant)",
                    }}
                  >
                    {item.lock ? "Terkunci" : "Tersedia"}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)", marginBottom: 6, margin: "0 0 6px 0" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--md-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>
                  {item.lock ? (!hasAcceptedPayment ? "Terkunci. Selesaikan pembayaran pendaftaran terlebih dahulu." : "Terkunci. Selesaikan pengisian Biodata Pribadi terlebih dahulu.") : item.desc}
                </p>
              </div>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--md-outline-variant)" }}>
                <Link
                  href={item.lock ? (!hasAcceptedPayment ? "/dashboard/mahasiswa/keuangan" : "/dashboard/mahasiswa/biodata") : item.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: item.lock ? "var(--md-on-surface-variant)" : item.tone,
                    textDecoration: "none",
                  }}
                >
                  <span>{item.lock ? (!hasAcceptedPayment ? "Buka Administrasi Keuangan" : "Isi Biodata Dulu") : "Akses Layanan"}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Secondary Quick Cards: Hasil & Download ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, paddingBottom: 24 }}>
        <Link
          href="/dashboard/mahasiswa/hasil-rpl"
          style={{
            borderRadius: 18,
            padding: "20px 24px",
            background: "var(--md-surface-1)",
            border: "1px solid var(--md-outline-variant)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "var(--md-primary)", letterSpacing: "0.06em" }}>
              Penetapan Akademik
            </span>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: "var(--md-on-surface)", margin: "2px 0 0 0" }}>
              Draf & Hasil Konversi RPL
            </h3>
            <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", margin: "4px 0 0 0" }}>
              Cek konfirmasi SKS diakui dan pengajuan sanggahan resmi.
            </p>
          </div>
          <span style={{ fontSize: 18, color: "var(--md-primary)" }}>→</span>
        </Link>

        <Link
          href="/dashboard/mahasiswa/download"
          style={{
            borderRadius: 18,
            padding: "20px 24px",
            background: "var(--md-surface-1)",
            border: "1px solid var(--md-outline-variant)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "var(--md-secondary)", letterSpacing: "0.06em" }}>
              Arsip & Dokumen
            </span>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: "var(--md-on-surface)", margin: "2px 0 0 0" }}>
              Pusat Unduh Dokumen
            </h3>
            <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", margin: "4px 0 0 0" }}>
              Unduh formulir resmi F01, F02, F03, F07 dan template sanggahan.
            </p>
          </div>
          <span style={{ fontSize: 18, color: "var(--md-secondary)" }}>→</span>
        </Link>
      </section>
    </div>
  );
}
