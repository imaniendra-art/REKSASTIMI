"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [prodi] = useState("S1 Manajemen");
  const [concentration, setConcentration] = useState("Manajemen SDM");
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState("SMA/SMK/MA");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          whatsapp,
          email,
          username,
          password,
          prodi,
          concentration,
          pendidikanTerakhir,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi.");
      }

      router.push(data.redirectUrl || "/dashboard/mahasiswa/keuangan");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "var(--md-on-surface)",
    marginBottom: 4,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
      {error && (
        <div
          role="alert"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "var(--md-error-container)",
            color: "var(--md-error)",
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(220,38,38,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Baris 1: Nama Lengkap & No WhatsApp */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label htmlFor="name" style={labelStyle}>
            Nama Lengkap <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Sesuai KTP"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-reg-input"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" style={labelStyle}>
            No. WhatsApp Aktif <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            required
            placeholder="0812xxxxxxxx"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="auth-reg-input"
          />
        </div>
      </div>

      {/* Baris 2: Pilihan Konsentrasi & Pendidikan Terakhir */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label htmlFor="concentration" style={labelStyle}>
            Pilihan Konsentrasi <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <select
            id="concentration"
            required
            value={concentration}
            onChange={(e) => setConcentration(e.target.value)}
            className="auth-reg-input"
          >
            <option value="Manajemen SDM">Manajemen SDM (Sumber Daya Manusia)</option>
            <option value="Manajemen Keuangan">Manajemen Keuangan</option>
            <option value="Manajemen Pemasaran">Manajemen Pemasaran</option>
            <option value="Pengembangan Bisnis">Pengembangan Bisnis</option>
          </select>
        </div>
        <div>
          <label htmlFor="pendidikanTerakhir" style={labelStyle}>
            Pendidikan Terakhir <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <select
            id="pendidikanTerakhir"
            value={pendidikanTerakhir}
            onChange={(e) => setPendidikanTerakhir(e.target.value)}
            className="auth-reg-input"
          >
            <option value="SMA/SMK/MA">SMA / SMK / MA</option>
            <option value="Diploma (D1/D2/D3)">Diploma (D1/D2/D3)</option>
            <option value="Pindahan S1">Pindahan S1</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Baris 3: Email & Username */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label htmlFor="email" style={labelStyle}>
            Alamat Email Aktif <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-reg-input"
          />
        </div>
        <div>
          <label htmlFor="username" style={labelStyle}>
            Username Akun <span style={{ fontSize: 10, color: "var(--md-on-surface-variant)" }}>(Opsional)</span>
          </label>
          <input
            id="username"
            type="text"
            placeholder="Otomatis jika kosong"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-reg-input"
          />
        </div>
      </div>

      {/* Baris 4: Password Akun */}
      <div>
        <label htmlFor="password" style={labelStyle}>
          Password Akun <span style={{ color: "var(--md-error)" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-reg-input"
            style={{ paddingRight: 74 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              border: "1px solid var(--md-outline-variant)",
              borderRadius: 6,
              background: "var(--md-surface-1)",
              color: "var(--md-on-surface-variant)",
              padding: "3px 8px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {showPassword ? "Tutup" : "Lihat"}
          </button>
        </div>
      </div>


      {/* Submit Button */}
      <div style={{ marginTop: 2 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            minHeight: 44,
            borderRadius: 999,
            background: "var(--md-primary)",
            color: "var(--md-on-primary)",
            fontSize: 14,
            fontWeight: 800,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px var(--theme-glow)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>{loading ? "Membuat Akun & Menyiapkan..." : "Daftar & Lanjut ke Pembayaran"}</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
