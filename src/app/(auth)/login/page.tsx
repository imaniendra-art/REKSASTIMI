import Link from "next/link";
import { redirect } from "next/navigation";
import { dashboardByRole } from "@/lib/roles";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(dashboardByRole[session.role]);
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <Link href="/" className="auth-brand" aria-label="REKSA STIMI">
            <span className="auth-logo">R</span>
            <span>
              <strong>REKSA STIMI</strong>
              <small>RPL STIMI YAPMI Makassar</small>
            </span>
          </Link>

          <div className="auth-intro-copy">
            <p className="auth-eyebrow">Sistem Rekognisi Pembelajaran Lampau</p>
            <h1>Masuk ke layanan REKSA STIMI</h1>
            <p>
              Gunakan akun REKSA untuk mengakses dashboard, mengelola proses RPL, dan memantau tahapan akademik sesuai peran pengguna.
            </p>
          </div>

          <div className="auth-points" aria-label="Fitur REKSA">
            {["Pendaftaran RPL", "Dokumen dan portofolio", "Asesmen dan hasil konversi"].map((item) => (
              <div key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card" aria-label="Form login">
          <div className="auth-card-heading">
            <p>Login</p>
            <h2>Selamat Datang</h2>
            <span>Silakan masuk menggunakan username dan password akun Anda.</span>
          </div>

          <LoginForm />

          <div className="auth-switch">
            Belum memiliki akun? <Link href="/register">Daftar sekarang</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
