"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="auth-form">
      {state.error ? (
        <div className="auth-alert" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="auth-field">
        <label htmlFor="username">Username</label>
        <input
          autoComplete="username"
          id="username"
          name="username"
          placeholder="Masukkan username"
          required
          type="text"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <div className="auth-password-wrap">
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            placeholder="Masukkan password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
      </div>

      <button className="auth-submit" disabled={pending} type="submit">
        {pending ? "Memproses..." : "Masuk Sekarang"}
      </button>
    </form>
  );
}
