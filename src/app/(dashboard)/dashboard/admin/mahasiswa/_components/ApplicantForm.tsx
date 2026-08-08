"use client";

import type { FormEvent, CSSProperties } from "react";
import type { Applicant } from "./types";

const statuses = [
  "PENDAFTARAN",
  "LENGKAPI_CV",
  "PEMBAYARAN",
  "ASESMEN_F02",
  "ASESMEN_KOMPETENSI",
  "EVALUASI_F03",
  "EVALUASI_ASESOR",
  "KONFIRMASI_HASIL",
  "SIAP_PLENO",
  "LULUS"
];

/* ── Inline styles matching Kurikulum modal reference ── */
const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 9,
  fontWeight: 800,
  color: "#94a3b8",
  marginBottom: 3,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "var(--md-surface-2)",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 10,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 700,
  color: "#1e293b",
  outline: "none",
  fontFamily: "inherit",
};

type ApplicantFormProps = {
  applicant?: Applicant;
  mode: "create" | "edit";
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
};

export function ApplicantForm({ applicant, mode, onSubmit, onCancel, submitting }: ApplicantFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          padding: 18,
          background: "#f8fafc",
        }}
      >
        {/* Row 1 */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Nama Lengkap *</label>
          <input name="name" required defaultValue={applicant?.name} style={inputStyle} placeholder="Nama lengkap mahasiswa" />
        </div>
        <div>
          <label style={labelStyle}>Username *</label>
          <input name="username" required defaultValue={applicant?.username} disabled={mode === "edit"} style={{ ...inputStyle, ...(mode === "edit" ? { opacity: 0.5, cursor: "not-allowed" } : {}) }} placeholder="Username login" />
        </div>

        {/* Row 2 */}
        <div>
          <label style={labelStyle}>NIK</label>
          <input name="nik" defaultValue={applicant?.identity?.nik} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="16 digit NIK" />
        </div>
        <div>
          <label style={labelStyle}>No. Pendaftar</label>
          <input name="registrationNumber" defaultValue={applicant?.registrationNumber} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="No. registrasi" />
        </div>
        <div>
          <label style={labelStyle}>NIM</label>
          <input name="nim" defaultValue={applicant?.nim} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="NIM mahasiswa" />
        </div>

        {/* Row 3 */}
        <div>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" defaultValue={applicant?.email || applicant?.contact?.email} style={inputStyle} placeholder="email@contoh.com" />
        </div>
        <div>
          <label style={labelStyle}>WhatsApp</label>
          <input name="phone" defaultValue={applicant?.contact?.phone} style={inputStyle} placeholder="08xxxxxxxxxx" />
        </div>
        <div>
          <label style={labelStyle}>Periode</label>
          <input name="periodName" defaultValue={applicant?.periodName ?? "Batch 1 - 2026"} style={inputStyle} placeholder="Batch 1 - 2026" />
        </div>

        {/* Row 4 */}
        <div>
          <label style={labelStyle}>Program Studi</label>
          <input name="program" defaultValue={applicant?.program} style={inputStyle} placeholder="Contoh: S1 Manajemen" />
        </div>
        <div>
          <label style={labelStyle}>Konsentrasi</label>
          <input name="concentration" defaultValue={applicant?.concentration} style={inputStyle} placeholder="Contoh: Manajemen Keuangan" />
        </div>
        <div>
          <label style={labelStyle}>Tempat Lahir</label>
          <input name="placeOfBirth" defaultValue={applicant?.identity?.placeOfBirth} style={inputStyle} placeholder="Kota / kabupaten" />
        </div>

        {/* Row 5 */}
        <div>
          <label style={labelStyle}>Tanggal Lahir</label>
          <input name="dateOfBirth" type="date" defaultValue={applicant?.identity?.dateOfBirth ? applicant.identity.dateOfBirth.slice(0, 10) : ""} style={{ ...inputStyle, cursor: "pointer" }} />
        </div>
        <div>
          <label style={labelStyle}>Status RPL</label>
          <select name="statusRpl" defaultValue={applicant?.statusRpl ?? "PENDAFTARAN"} style={{ ...inputStyle, cursor: "pointer" }}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ").replace("ASESOR", "PENILAI")}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <label style={labelStyle}>Alamat</label>
          <textarea
            name="address"
            defaultValue={applicant?.contact?.address}
            rows={2}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: 56,
            }}
            placeholder="Alamat lengkap"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", padding: "16px 24px", background: "#f8fafc" }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "2px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            BATAL
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 24px",
            borderRadius: 999,
            border: "none",
            background: "#0ea5e9",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {submitting ? "MENYIMPAN..." : mode === "create" ? "TAMBAH MAHASISWA" : "SIMPAN PERUBAHAN"}
        </button>
      </div>
    </form>
  );
}
