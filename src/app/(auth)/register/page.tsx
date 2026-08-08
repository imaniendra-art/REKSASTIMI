import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { dashboardByRole } from "@/lib/roles";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
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
            <p className="auth-eyebrow">Registrasi Mahasiswa RPL</p>
            <h1>Mulai pendaftaran RPL melalui REKSA</h1>
            <p>
              Buat akun mahasiswa untuk mengisi biodata, mengunggah dokumen, dan mengikuti proses pengajuan RPL STIMI YAPMI Makassar.
            </p>
          </div>

          <div className="auth-points" aria-label="Tahapan awal registrasi">
            {["Buat akun mahasiswa", "Lengkapi data awal", "Lanjutkan ke proses RPL"].map((item) => (
              <div key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card" aria-label="Form registrasi">
          <div className="auth-card-heading">
            <p>Registrasi</p>
            <h2>Daftar Mahasiswa</h2>
            <span>Masukkan data akun awal untuk mengakses REKSA STIMI.</span>
          </div>

          <RegisterForm />

          <div className="auth-switch">
            Sudah punya akun? <Link href="/login">Login di sini</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
