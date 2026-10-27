import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { dashboardByRole } from "@/lib/roles";
import { RegisterForm } from "./RegisterForm";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect(dashboardByRole[session.role]);
  }

  return (
    <main className="auth-page auth-page-register">
      {/* ─── Top Utility Navigation ─── */}
      <nav className="auth-nav">
        <Link href="/" className="auth-back-link" title="Kembali ke Halaman Utama">
          <span>←</span>
          <span>Kembali ke Beranda</span>
        </Link>
        <ThemeSelector />
      </nav>

      {/* ─── Main Auth Shell ─── */}
      <div className="auth-shell">
        {/* Left Side: Brand, Edukasi REKSA, Alur, & Berkas Persyaratan */}
        <section
          className="auth-intro"
          aria-label="Informasi Program REKSA STIMI dan Persyaratan"
          style={{
            padding: "24px 28px",
            minHeight: "unset",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          {/* Header Brand & Penjelasan REKSA */}
          <div>
            <Link href="/" className="auth-brand" aria-label="Beranda REKSA STIMI">
              <div className="auth-logo-box" style={{ width: 44, height: 44, borderRadius: 12 }}>
                <img src="/icon-logo-reksa.png" alt="Logo REKSA STIMI" style={{ width: 38, height: 38 }} />
              </div>
              <div className="auth-brand-text">
                <div className="auth-brand-title" style={{ fontSize: 20 }}>
                  <span>REKSA</span>
                  <span>STIMI</span>
                </div>
                <span className="auth-brand-sub" style={{ fontSize: 10 }}>STIMI YAPMI MAKASSAR</span>
              </div>
            </Link>

            <div style={{ marginTop: 12 }}>
              <div className="auth-eyebrow" style={{ marginBottom: 8, padding: "3px 10px", fontSize: 10, letterSpacing: "0.08em" }}>
                Program Sarjana S1 Jalur RPL Tipe A
              </div>
              <h1 style={{ fontSize: "clamp(19px, 2.2vw, 24px)", lineHeight: 1.25, margin: "0 0 8px 0", fontWeight: 800 }}>
                Kuliah Lebih Cepat & Hemat Berbasis Pengalaman Kerja
              </h1>
              <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--md-on-surface-variant)", margin: 0, fontWeight: 500 }}>
                <strong>REKSA</strong> (<em>Rekognisi Evaluasi dan Konversi Akademik</em>) adalah platform resmi STIMI YAPMI Makassar yang memfasilitasi konversi jam terbang kerja, sertifikasi profesi, dan pengalaman manajerial Anda menjadi pengakuan hingga <strong>100 SKS sah</strong> Sarjana Manajemen (S.M.).
              </p>
            </div>
          </div>

          {/* ── Alur Pendaftaran (Tanpa Emoji Grafis, Mengedepankan Tipografi Bersih) ── */}
          <div
            style={{
              background: "var(--md-surface-2)",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 9.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--md-primary)" }}>
                Tahapan Pendaftaran
              </span>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)", margin: "2px 0 0 0" }}>
                4 Langkah Mudah Meraih Gelar S1
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px" }}>
              {/* Step 1 */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--md-primary)",
                    color: "var(--md-on-primary)",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  1
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>Pendaftaran Akun</div>
                  <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.3, marginTop: 1 }}>
                    Pilih konsentrasi studi peminatan Anda
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--md-primary-container)",
                    color: "var(--md-on-primary-container)",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  2
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>Konfirmasi Berkas</div>
                  <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.3, marginTop: 1 }}>
                    Kirim bukti bayar & identitas dasar
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--md-surface-1)",
                    border: "1.5px solid var(--md-outline-variant)",
                    color: "var(--md-on-surface)",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  3
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>Matrikulasi Mandiri</div>
                  <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.3, marginTop: 1 }}>
                    Akses modul materi video & kuis
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--md-surface-1)",
                    border: "1.5px solid var(--md-outline-variant)",
                    color: "var(--md-on-surface)",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  4
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>SK Konversi S1</div>
                  <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.3, marginTop: 1 }}>
                    Penilaian asesor s.d. 100 SKS resmi
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dokumen Persyaratan Calon Mahasiswa (Bahasa Manusiawi) ── */}
          <div
            style={{
              background: "var(--md-surface-1)",
              border: "1px solid var(--md-outline-variant)",
              borderRadius: 14,
              padding: "12px 14px",
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 9.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--md-primary)" }}>
                Kelengkapan Administrasi
              </span>
              <h4 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--md-on-surface)", margin: "2px 0 0 0" }}>
                Dokumen Persyaratan Calon Mahasiswa
              </h4>
              <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)", margin: "2px 0 0 0", lineHeight: 1.4 }}>
                Disiapkan untuk diunggah saat Anda melakukan konfirmasi pendaftaran:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--md-on-surface)" }}>
                <span style={{ color: "var(--md-primary)", fontWeight: 900 }}>•</span>
                <span>Foto / Scan KTP Asli</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--md-on-surface)" }}>
                <span style={{ color: "var(--md-primary)", fontWeight: 900 }}>•</span>
                <span>Kartu Keluarga (KK)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--md-on-surface)" }}>
                <span style={{ color: "var(--md-primary)", fontWeight: 900 }}>•</span>
                <span>Akta Kelahiran</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--md-on-surface)" }}>
                <span style={{ color: "var(--md-primary)", fontWeight: 900 }}>•</span>
                <span>Ijazah Terakhir SMA/SMK/D3</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Form Registrasi */}
        <section
          className="auth-card"
          aria-label="Form registrasi mahasiswa baru"
          style={{
            padding: "24px 28px",
            minHeight: "unset",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="auth-card-heading" style={{ marginBottom: 12, paddingBottom: 10 }}>
            <span className="auth-card-eyebrow" style={{ fontSize: 10 }}>Pendaftaran Mahasiswa Baru</span>
            <h2 style={{ fontSize: 22, margin: "2px 0 4px 0" }}>Buat Akun Mahasiswa RPL</h2>
            <p style={{ fontSize: 12, margin: 0 }}>Pilih konsentrasi program studi dan lengkapi data awal Anda.</p>
          </div>

          <RegisterForm />

          <div className="auth-switch" style={{ marginTop: 12, paddingTop: 10, fontSize: 12.5 }}>
            Sudah memiliki akun? <Link href="/login">Masuk di sini →</Link>
          </div>
        </section>
      </div>

      {/* ─── Footer ─── */}
      <footer className="auth-footer" style={{ marginTop: 8, fontSize: 11 }}>
        <p>© 2026 STIMI YAPMI Makassar • Sistem Rekognisi Pembelajaran Lampau (RPL Tipe A)</p>
      </footer>
    </main>
  );
}
