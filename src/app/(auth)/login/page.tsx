import Link from "next/link";
import { redirect } from "next/navigation";
import { dashboardByRole } from "@/lib/roles";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(dashboardByRole[session.role]);
  }

  return (
    <main className="auth-page">
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
        {/* Left Side: Brand & Ecosystem Brief */}
        <section className="auth-intro" aria-label="Informasi REKSA STIMI">
          <div>
            <Link href="/" className="auth-brand" aria-label="Beranda REKSA STIMI">
              <div className="auth-logo-box">
                <img src="/icon-logo-reksa.png" alt="Logo REKSA" />
              </div>
              <div className="auth-brand-text">
                <div className="auth-brand-title">
                  <span>REKSA</span>
                  <span>STIMI</span>
                </div>
                <span className="auth-brand-sub">RPL STIMI YAPMI Makassar</span>
              </div>
            </Link>

            <div className="auth-intro-copy">
              <div className="auth-eyebrow">Rekognisi Pembelajaran Lampau (RPL Tipe A)</div>
              <h1>Masuk ke Portal REKSA STIMI</h1>
              <p>
                Akses dashboard terpadu untuk memantau proses evaluasi diri, konversi hingga 100 SKS Sarjana Manajemen, dan penerbitan SK resmi PDDikti.
              </p>
            </div>
          </div>

          <div>
            <div className="auth-points" aria-label="Keunggulan REKSA">
              <div className="auth-point-card">
                <span className="auth-point-icon">⚡</span>
                <span className="auth-point-title">Maks. 100 SKS</span>
                <span className="auth-point-desc">Pengakuan jam terbang kerja profesional</span>
              </div>
              <div className="auth-point-card">
                <span className="auth-point-icon">📜</span>
                <span className="auth-point-title">Ijazah Resmi S1</span>
                <span className="auth-point-desc">Sah terdaftar PDDikti Kemendikbudristek</span>
              </div>
              <div className="auth-point-card">
                <span className="auth-point-icon">🔒</span>
                <span className="auth-point-title">Aman & Terpadu</span>
                <span className="auth-point-desc">Akses multi-role sesuai penugasan</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Form Card */}
        <section className="auth-card" aria-label="Form login akun">
          <div className="auth-card-heading">
            <span className="auth-card-eyebrow">Portal Masuk</span>
            <h2>Selamat Datang Kembali</h2>
            <p>Silakan masukkan kredensial akun Anda untuk mengakses sistem.</p>
          </div>

          <LoginForm />

          <div className="auth-switch">
            Belum memiliki akun mahasiswa?{" "}
            <Link href="/register">Daftar Akun RPL Sekarang →</Link>
          </div>
        </section>
      </div>

      {/* ─── Footer ─── */}
      <footer className="auth-footer">
        <p>© 2026 STIMI YAPMI Makassar • Platform Rekognisi Pembelajaran Lampau (RPL Tipe A)</p>
      </footer>
    </main>
  );
}
