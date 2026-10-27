"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

const DEMO_ACCOUNTS = [
  { role: "Admin SIRESTI", username: "admin" },
  { role: "Akademik", username: "akademik" },
  { role: "Keuangan", username: "keuangan" },
  { role: "Asesor", username: "asesor" },
  { role: "Mahasiswa", username: "mahasiswa" },
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const fillAccount = (user: string) => {
    setUsername(user);
    setPassword("admin123");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <form action={formAction} className="auth-form">
        {state.error ? (
          <div className="auth-alert" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{state.error}</span>
          </div>
        ) : null}

        <div className="auth-field">
          <label htmlFor="username">Username Akun</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input
              autoComplete="username"
              id="username"
              name="username"
              placeholder="Masukkan username Anda"
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="password">Password</label>
          </div>
          <div className="auth-input-wrap auth-password-wrap">
            <span className="auth-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              placeholder="Masukkan password Anda"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
            >
              {showPassword ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <span>Tutup</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>Lihat</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button className="auth-submit" disabled={pending} type="submit">
          {pending ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"></circle>
              </svg>
              <span>Memproses Masuk...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Dashboard</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Auto-Fill Box */}
      <div className="auth-demo-hint">
        <div className="auth-demo-title">
          <span>⚡ Cepat Pilih Akun Demo (PW: admin123)</span>
        </div>
        <div className="auth-demo-badges">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.username}
              type="button"
              className="auth-demo-badge"
              onClick={() => fillAccount(acc.username)}
              title={`Klik untuk mengisi username: ${acc.username}`}
            >
              <span>{acc.role}</span>
              <span style={{ opacity: 0.6 }}>({acc.username})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
