"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [prodi, setProdi] = useState("S1 Manajemen");
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
          pendidikanTerakhir,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi.");
      }

      // Smoothly redirect to payment page
      router.push(data.redirectUrl || "/dashboard/mahasiswa/keuangan");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    border: "1px solid var(--md-outline)",
    background: "var(--md-surface-1)",
    color: "var(--md-on-surface)",
    fontSize: 14,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12.5,
    fontWeight: 700,
    color: "var(--md-on-surface)",
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "var(--md-error-container)",
            color: "var(--md-error)",
            fontSize: 13,
            fontWeight: 700,
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Nama Lengkap */}
      <div>
        <label htmlFor="name" style={labelStyle}>
          Nama Lengkap (Sesuai KTP) <span style={{ color: "var(--md-error)" }}>*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="Contoh: Muhammad Fajrin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={fieldStyle}
        />
      </div>

      {/* WhatsApp & Email (Grid 2 kolom) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div>
          <label htmlFor="whatsapp" style={labelStyle}>
            No. WhatsApp Aktif <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            required
            placeholder="081234567890"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            style={fieldStyle}
          />
        </div>

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
            style={fieldStyle}
          />
        </div>
      </div>

      {/* Pilihan Jenjang & Pendidikan Asal (Grid 2 kolom) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div>
          <label htmlFor="prodi" style={labelStyle}>
            Pilihan Program Studi
          </label>
          <select
            id="prodi"
            value={prodi}
            onChange={(e) => setProdi(e.target.value)}
            style={fieldStyle}
          >
            <option value="S1 Manajemen">S1 Manajemen</option>
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
            style={fieldStyle}
          >
            <option value="SMA/SMK/MA">SMA / SMK / MA Sederajat</option>
            <option value="Diploma (D1/D2/D3)">Diploma (D1 / D2 / D3)</option>
            <option value="Pindahan S1">Pindahan Perguruan Tinggi (S1)</option>
            <option value="Lainnya">Lainnya / Pelatihan Setara</option>
          </select>
        </div>
      </div>

      {/* Username & Password */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div>
          <label htmlFor="username" style={labelStyle}>
            Username Akun <span style={{ fontSize: 11, fontWeight: 500, color: "var(--md-on-surface-variant)" }}>(Opsional)</span>
          </label>
          <input
            id="username"
            type="text"
            placeholder="Otomatis dibuat jika kosong"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={fieldStyle}
          />
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>
            Password Akun <span style={{ color: "var(--md-error)" }}>*</span>
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={fieldStyle}
          />
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 999,
            background: "var(--md-primary)",
            color: "var(--md-on-primary)",
            fontSize: 15,
            fontWeight: 800,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px var(--theme-glow)",
            transition: "all 0.18s ease",
          }}
        >
          {loading ? "Membuat Akun & Menyiapkan..." : "Lanjut ke Pembayaran Pendaftaran →"}
        </button>
      </div>
    </form>
  );
}
