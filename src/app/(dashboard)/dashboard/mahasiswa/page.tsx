import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Payment } from "@/models/Payment";
import { Period } from "@/models/Period";
import { workflowSteps } from "@/lib/dashboard-data";
import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";
import { formatRplRegistrationNumber, generateRplIdentityNumber } from "@/lib/rpl-registration";
import { syncProfileToF03WhenAssessmentsComplete, syncProfileToEvaluasiAsesorWhenF03Complete } from "@/lib/assessment-progress";

export default async function MahasiswaDashboardPage() {
  await connectMongoDB();
  const session = await getSession();

  let currentStatus = "PENDAFTARAN";
  let registrationNumber = "-";
  let periodName = "-";
  let isBiodataComplete = false;

  let hasAcceptedPayment = false;
  let hasPendingPayment = false;

  if (session?.id) {
    const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();
    if (profile) {
      if (profile.statusRpl) {
        currentStatus = profile.statusRpl;
        registrationNumber = profile.registrationNumber || profile.noPendaftar || "Belum ada";
        periodName = profile.periodName || profile.periode || "Belum ditentukan";
      }

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

      const acceptedRegistrationPayment = await Payment.exists({
        userId: session.id,
        statusVerifikasi: "Diterima",
        jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
      });

      if (acceptedRegistrationPayment) {
        hasAcceptedPayment = true;
        const canAdvanceToF02 = ["PENDAFTARAN", "LENGKAPI_CV", "PEMBAYARAN"].includes(currentStatus);
        const profileUpdate: Record<string, string> = {
          "progress.paymentStatus": "DITERIMA",
          statusPembayaran: "DITERIMA",
        };

        if (canAdvanceToF02) {
          currentStatus = "ASESMEN_F02";
          profileUpdate.statusRpl = "ASESMEN_F02";
        }

        if (!profile.nim) {
          const activePeriod = profile.periodId
            ? await Period.findById(profile.periodId).lean()
            : await Period.findOne({ isActive: true }).lean();
          const nim = await generateRplIdentityNumber(activePeriod);

          profileUpdate.nim = nim;
          profileUpdate.registrationNumber = formatRplRegistrationNumber(nim);
          registrationNumber = profileUpdate.registrationNumber;
        } else if (!profile.registrationNumber || !profile.registrationNumber.startsWith("RPL-")) {
          profileUpdate.registrationNumber = formatRplRegistrationNumber(profile.nim);
          registrationNumber = profileUpdate.registrationNumber;
        }

        if (Object.keys(profileUpdate).length > 0) {
          await ApplicantProfile.updateOne(
            { userId: session.id },
            { $set: profileUpdate }
          );
        }
      } else {
        // Check if there is an uploaded payment in process
        const pendingPayment = await Payment.findOne({
          userId: session.id,
          jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
          statusVerifikasi: "Proses",
        }).lean();

        if (pendingPayment) {
          hasPendingPayment = true;
        }
      }

      // Check if biodata is complete
      const identity = (profile.identity || {}) as any;
      const contact = (profile.contact || {}) as any;
      const documents = (profile.documents || []) as any[];

      const requiredIdentityFilled = 
        !!identity.fullName?.trim() &&
        !!identity.placeOfBirth?.trim() &&
        !!identity.dateOfBirth &&
        !!identity.gender &&
        !!identity.religion?.trim() &&
        !!identity.motherName?.trim() &&
        !!identity.citizenship?.trim() &&
        !!identity.nik?.trim() &&
        identity.nik.trim().length === 16 &&
        !!identity.nisn?.trim() &&
        identity.nisn.trim().length === 10;

      const requiredContactFilled =
        !!contact.address?.trim() &&
        !!contact.village?.trim() &&
        !!contact.district?.trim() &&
        !!contact.email?.trim() &&
        !!contact.phone?.trim();

      const requiredDocTypes = ["kk", "ktp", "ijazah", "pendukung", "ttd"];
      const uploadedDocTypes = documents
        .filter((d: any) => d.fileUrl && d.fileUrl.trim().length > 0)
        .map((d: any) => d.type);

      const allDocsUploaded = requiredDocTypes.every((type) => uploadedDocTypes.includes(type));

      isBiodataComplete = requiredIdentityFilled && requiredContactFilled && allDocsUploaded;
    }
  }

  // Normalize status string
  const normalizedStatus = currentStatus.replace(/_/g, " ").replace("ASESOR", "PENILAI");
  let currentIndex = workflowSteps.indexOf(normalizedStatus as any);
  
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  if (currentIndex === 0 && hasAcceptedPayment) {
    currentIndex = 1;
  }

  // Locked status for service menus
  const isPaymentLocked = !hasAcceptedPayment;

  const menu = [
    { title: "Keuangan",           desc: "Tagihan & bukti pembayaran.",              tone: "#dc2626", bg: "#fee2e2", lock: false, href: "/dashboard/mahasiswa/keuangan",    emoji: "💳" },
    { title: "Biodata",            desc: "Data diri, orang tua & alamat.",          tone: "#1a56db", bg: "#dbeafe", lock: isPaymentLocked, href: "/dashboard/mahasiswa/biodata",     emoji: "👤" },
    { title: "CV Riwayat",         desc: "Pengalaman kerja & organisasi.",           tone: "#d97706", bg: "#fef3c7", lock: isPaymentLocked || currentIndex < 1, href: "/dashboard/mahasiswa/cv",          emoji: "📄" },
    { title: "Form F02",           desc: "Pemilihan mata kuliah RPL.",               tone: "#059669", bg: "#d1fae5", lock: isPaymentLocked || currentIndex < 3,  href: "/dashboard/mahasiswa/f02",         emoji: "📝" },
    { title: "Test Kompetensi",    desc: "Ujian & capaian pembelajaran.",            tone: "#0284c7", bg: "#e0f2fe", lock: isPaymentLocked || currentIndex < 4,  href: "/dashboard/mahasiswa/asesmen", emoji: "🎯" },
    { title: "Form F03",           desc: "Evaluasi diri & portofolio.",              tone: "#6366f1", bg: "#ede9fe", lock: isPaymentLocked || currentIndex < 5,  href: "/dashboard/mahasiswa/f03",         emoji: "📋" },
  ];

  const doneCount = currentIndex;
  const totalCount = workflowSteps.length;
  const progressPct = Math.round((doneCount / totalCount) * 100);
  
  const displayStatus = currentStatus === "PENDAFTARAN" ? "PENDAFTARAN AKUN" : currentStatus;

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>

      {/* ── Hero Identity Card ── */}
      <PageHero
        badgeIcon="👤"
        badgeText="Identitas Asesi"
        title="Mahasiswa RPL"
        tone="secondary"
        subtitle={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <Link href="/dashboard/mahasiswa/petunjuk" className="student-hero-button">
              Petunjuk
            </Link>
            <Link href="/dashboard/mahasiswa/download" className="student-hero-button student-hero-button-strong">
              Pusat Download
            </Link>
          </div>
        }
        rightContent={
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[
              { label: "No. Registrasi",           value: registrationNumber,  mono: true  },
              { label: "Periode Terdaftar",        value: periodName, mono: false },
              { label: "Username Login",           value: session?.username || "-", mono: true  },
              { label: "Status Saat Ini",          value: displayStatus, mono: false },
            ].map((info) => (
              <div key={info.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: 3 }}>
                  {info.label}
                </p>
                <p style={{ fontWeight: 800, fontSize: 13, fontFamily: info.mono ? "monospace" : "inherit" }}>
                  {info.value}
                </p>
              </div>
            ))}
          </div>
        }
      />

      {/* ─── PAYMENT GATE / TEASER WAITING ROOM (JIKA BELUM DIVERIFIKASI KEUANGAN) ─── */}
      {!hasAcceptedPayment && (
        <div style={{ marginBottom: 24 }}>
          {hasPendingPayment ? (
            /* TEASER WAITING ROOM: SUDAH UPLOAD BUKTI BAYAR, MENUNGGU VERIFIKASI */
            <div
              style={{
                borderRadius: 24,
                backgroundColor: "var(--md-surface-1)",
                border: "2px solid var(--md-warning)",
                boxShadow: "0 8px 30px rgba(217, 119, 6, 0.15)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "24px 28px", background: "var(--md-warning-container)", borderBottom: "1px solid rgba(217,119,6,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-warning)" }}>
                      Status Pembayaran
                    </span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--md-on-surface)" }}>
                    Bukti Pembayaran Anda Sedang Diverifikasi
                  </h3>
                  <p style={{ fontSize: 13.5, color: "var(--md-on-surface-variant)", marginTop: 4 }}>
                    Tim Keuangan STIMI YAPMI sedang memvalidasi bukti transfer pendaftaran Anda (Estimasi 1–24 jam kerja).
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Keuangan%20STIMI%20YAPMI,%20saya%20sudah%20mengunggah%20bukti%20bayar%20pendaftaran%20RPL%20mohon%20diverifikasi."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "10px 20px",
                      borderRadius: 999,
                      background: "#25D366",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
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
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Histori Pembayaran
                  </Link>
                </div>
              </div>

              {/* Teaser Content (Opsi B: Pelajari Sambil Menunggu) */}
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>
                    Sambil Menunggu: Pelajari Pengantar RPL & Silabus Klaster
                  </h4>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--md-on-surface-variant)", lineHeight: 1.6, marginBottom: 20 }}>
                  Fitur akademik (pengisian F02, LMS matrikulasi, dan F03) akan terbuka otomatis setelah verifikasi selesai. Anda dapat memanfaatkan waktu tunggu untuk memahami peta mata kuliah RPL STIMI berikut:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {[
                    { title: "Manajemen SDM", matkul: "4 MK • 12 SKS", desc: "MSDM, Perilaku Organisasi, Pelatihan Karir, Hubungan Industrial" },
                    { title: "Manajemen Pemasaran", matkul: "4 MK • 12 SKS", desc: "Manajemen Pemasaran, Riset Pasar, Digital Marketing, Manajemen Penjualan" },
                    { title: "Manajemen Keuangan", matkul: "4 MK • 12 SKS", desc: "Keuangan Dasar, Analisis Lap. Keuangan, Pajak Bisnis, Investasi" },
                    { title: "Kewirausahaan & Bisnis", matkul: "4 MK • 12 SKS", desc: "Kewirausahaan Mandiri, Business Plan, Pengantar Manajemen, Operasional" },
                  ].map((teaser, idx) => (
                    <div key={idx} style={{ padding: "16px", borderRadius: 16, background: "var(--md-surface-2)", border: "1px solid var(--md-outline-variant)" }}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "var(--md-primary)", textTransform: "uppercase", marginBottom: 4 }}>{teaser.matkul}</p>
                      <h5 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 6 }}>{teaser.title}</h5>
                      <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", lineHeight: 1.4 }}>{teaser.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* BELUM UPLOAD BUKTI BAYAR SAMA SEKALI */
            <div
              style={{
                borderRadius: 24,
                backgroundColor: "var(--md-surface-1)",
                border: "2px solid var(--md-error)",
                boxShadow: "0 8px 30px rgba(220, 38, 38, 0.12)",
                padding: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-error)" }}>
                    Langkah Wajib Pertama
                  </span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Selesaikan Pembayaran Biaya Pendaftaran RPL
                </h3>
                <p style={{ fontSize: 14, color: "var(--md-on-surface-variant)", marginTop: 6, lineHeight: 1.6 }}>
                  Untuk membuka seluruh akses layanan akademik (Biodata, CV, Form F02, Test Mandiri, dan Portofolio F03), silakan transfer biaya pendaftaran dan unggah bukti transfer.
                </p>
                <div style={{ marginTop: 12, fontSize: 13, color: "var(--md-on-surface)" }}>
                  <strong>Biaya Pendaftaran:</strong> Rp 250.000 • <strong>Rekening:</strong> BSI 7123456789 a.n. STIMI YAPMI Makassar
                </div>
              </div>

              <Link
                href="/dashboard/mahasiswa/keuangan"
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "var(--md-error)",
                  color: "#fff",
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(220,38,38,0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                💳 Unggah Bukti Transfer Sekarang →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Progress Card ── */}
      <div
        className="md-card animate-fade-up stagger-2 student-progress-card"
        style={{ padding: "20px", marginBottom: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: "var(--md-on-surface)" }}>Progress Perjalanan RPL</p>
            <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)", marginTop: 2 }}>
              Tahap {currentIndex + 1} dari {totalCount} — {displayStatus}
            </p>
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--md-primary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--md-primary)" }}>{progressPct}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: "var(--md-outline-variant)",
            borderRadius: 999,
            height: 10,
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
              transition: "width 1s ease",
            }}
          />
        </div>

        {/* Step indicators */}
        <div style={{ marginTop: 10, paddingBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {workflowSteps.map((step, idx) => {
              const done   = idx < currentIndex;
              const active = idx === currentIndex;
              const stepName = step === "PENDAFTARAN" ? "PENDAFTARAN AKUN" : step;
              
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
                "LULUS": { note: "Proses RPL telah selesai.", icon: "🎉" }
              };

              const detail = details[step] || { note: "Tahapan proses RPL.", icon: "📌" };

              const bg = done ? "var(--md-success)" : active ? "var(--md-primary)" : "var(--md-surface-2)";
              const color = done || active ? "#fff" : "var(--md-on-surface-variant)";
              
              return (
                <div
                  key={step}
                  className="student-step-card"
                  style={{
                    background: bg,
                    borderRadius: 16,
                    padding: "16px",
                    color: color,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: active ? "0 8px 16px var(--theme-glow)" : "none",
                    border: (!done && !active) ? "1px solid var(--md-outline-variant)" : "none",
                    transition: "all 300ms",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.9, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
                      {stepName}
                    </p>
                    <span style={{ fontSize: 20 }}>
                      {done ? "✅" : detail.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <p style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 4 }}>
                    {idx + 1}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 600, opacity: 0.85, lineHeight: 1.4 }}>
                    {detail.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic CTA */}
        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(() => {
            if (!hasAcceptedPayment) {
              return (
                <Link
                  href="/dashboard/mahasiswa/keuangan"
                  style={{
                    flex: 1,
                    minWidth: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "var(--md-primary)",
                    color: "var(--md-on-primary)",
                    borderRadius: 999,
                    padding: "12px 20px",
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: "0 4px 14px var(--theme-glow)",
                    textDecoration: "none",
                  }}
                >
                  💳 {hasPendingPayment ? "Cek Status Verifikasi Pembayaran" : "Kirim Bukti Pembayaran Pendaftaran"}
                </Link>
              );
            }

            let ctaText = "📝 Isi Form F02 Sekarang";
            let ctaHref = "/dashboard/mahasiswa/f02";

            if (currentIndex === 1) {
              if (isBiodataComplete) {
                ctaText = "📄 Lengkapi CV Riwayat Hidup Sekarang";
                ctaHref = "/dashboard/mahasiswa/cv";
              } else {
                ctaText = "👤 Lengkapi Biodata Sekarang";
                ctaHref = "/dashboard/mahasiswa/biodata";
              }
            } else if (currentIndex === 2) {
              ctaText = "💳 Selesaikan Pembayaran";
              ctaHref = "/dashboard/mahasiswa/keuangan";
            } else if (currentIndex === 4) {
              ctaText = "🎯 Mulai Test Kompetensi";
              ctaHref = "/dashboard/mahasiswa/asesmen";
            } else if (currentIndex === 5) {
              ctaText = "📋 Isi Form F03 Sekarang";
              ctaHref = "/dashboard/mahasiswa/f03";
            } else if (currentIndex >= 6) {
              ctaText = "📊 Pantau Hasil Asesmen";
              ctaHref = "/dashboard/mahasiswa";
            }

            return (
              <Link
                href={ctaHref}
                className="student-cta-button"
                style={{
                  flex: 1,
                  minWidth: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  borderRadius: 999,
                  padding: "12px 20px",
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: "0 4px 14px var(--theme-glow)",
                  textDecoration: "none",
                }}
              >
                {ctaText}
              </Link>
            );
          })()}
        </div>
      </div>

      {/* ── Menu Cards ── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 99, background: "var(--md-primary)" }} />
          <h2 style={{ fontWeight: 800, fontSize: 15, color: "var(--md-on-surface)" }}>Menu Layanan RPL</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
        {menu.map((item, i) => (
          <div
            key={item.title}
            className={`md-card animate-fade-up stagger-${Math.min(i + 2, 8)} student-menu-card`}
            style={{
              padding: "24px 20px",
              opacity: item.lock ? 0.6 : 1,
              filter: item.lock ? "grayscale(0.6)" : "none",
              cursor: item.lock ? "not-allowed" : "pointer",
              transition: "all 300ms ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Link
              href={item.lock ? "/dashboard/mahasiswa/keuangan" : item.href}
              style={{ display: "block", textDecoration: "none", height: "100%" }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle at center, ${item.bg} 0%, transparent 70%)`, opacity: 0.6, pointerEvents: "none", borderRadius: "50%" }} />
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: item.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 16,
                  border: `1px solid ${item.tone}44`,
                  position: "relative",
                  zIndex: 1,
                  boxShadow: `0 4px 12px ${item.bg}`,
                }}
              >
                {item.emoji}
              </div>

              <h3
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: "var(--md-on-surface)",
                  lineHeight: 1.3,
                  marginBottom: 8,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {item.lock ? `🔒 ${item.title}` : item.title}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--md-on-surface-variant)",
                  lineHeight: 1.5,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {item.lock ? "Terkunci (Selesaikan Pembayaran)" : item.desc}
              </p>

              {!item.lock && (
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", position: "relative", zIndex: 1 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: item.tone,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Akses Fitur <span style={{ fontSize: 14 }}>→</span>
                  </span>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
