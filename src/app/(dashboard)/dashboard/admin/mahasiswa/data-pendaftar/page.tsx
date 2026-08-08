"use client";

import Link from "next/link";
import { PageHero, AlertNotice } from "@/components/dashboard/UIComponents";
import { useState } from "react";
import { ApplicantForm } from "../_components/ApplicantForm";
import { StatusBadge } from "../_components/StatusBadge";
import { ApplicantListFilters } from "../_components/ApplicantListFilters";
import { ApplicantListPagination } from "../_components/ApplicantListPagination";
import { useApplicantList } from "../_components/useApplicantList";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DataPendaftarPage() {
  const {
    q, setQ, period, setPeriod, statusRpl, setStatusRpl, page, setPage,
    resetToFirstPage, params, query, deactivateMutation
  } = useApplicantList();

  const { data, isLoading, error } = query;
  const [showCreate, setShowCreate] = useState(false);

  const thStyle: React.CSSProperties = {
    padding: "13px 16px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--md-on-surface-variant)",
    whiteSpace: "nowrap",
    background: "var(--md-surface-2)",
    borderBottom: "1px solid var(--md-outline-variant)",
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>

      {/* ── Page Header ── */}
      <PageHero
        badgeIcon="👤"
        badgeText="Data Pendaftar"
        title="Daftar Pendaftar Mahasiswa"
        subtitle="Kelola biodata, pencarian, dan pengelolaan akun mahasiswa RPL."
        tone="primary"
        rightContent={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="hero-action-button"
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 999,
                padding: "10px 20px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "inherit",
              }}
              onClick={() => setShowCreate(true)}
              type="button"
            >
              Tambah Mahasiswa
            </button>
            <a
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: 999,
                padding: "9px 16px",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
                transition: "background 200ms",
                textDecoration: "none"
              }}
              href={`/api/admin/mahasiswa?${params.toString()}&export=csv`}
              target="_blank"
            >
              ⬇️ Export CSV
            </a>
          </div>
        }
      />

      {/* ── Create Form ── */}
      {showCreate && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(15,23,42,0.48)", backdropFilter: "blur(4px)" }}
        >
          <div className="md-card animate-fade-up" style={{ width: "100%", maxWidth: 660, overflow: "hidden", background: "#fff", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: 16, color: "#0284c7", margin: 0 }}>Tambah Mahasiswa / Pendaftar</h2>
                <p style={{ fontSize: 11, marginTop: 4, color: "#64748b", fontWeight: 700 }}>
                  Password awal akun mahasiswa baru: <strong>mahasiswa123</strong>
                </p>
              </div>
              <button onClick={() => setShowCreate(false)} type="button" style={{ minWidth: 72, height: 34, borderRadius: 999, border: "1px solid #bae6fd", background: "#f0f9ff", color: "#0284c7", fontSize: 12, fontWeight: 900, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Tutup
              </button>
            </div>
            <CreateApplicantForm onSuccess={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <ApplicantListFilters
        q={q} setQ={setQ}
        period={period} setPeriod={setPeriod}
        statusRpl={statusRpl} setStatusRpl={setStatusRpl}
        resetToFirstPage={resetToFirstPage}
        data={data}
      />

      {/* ── Table ── */}
      <div className="md-card animate-fade-up stagger-2" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 48, textAlign: "center" }}>No</th>
                <th style={{ ...thStyle, minWidth: 240 }}>Informasi Mahasiswa</th>
                <th style={{ ...thStyle, minWidth: 160 }}>No. Registrasi</th>
                <th style={{ ...thStyle }}>Status Tahapan</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Aksi Kendali</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 16px", textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 14 }}>
                    <span style={{ display: "block", marginBottom: 8, fontSize: 24 }}>⏳</span>
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 16px", textAlign: "center", color: "var(--md-error)", fontWeight: 700 }}>
                    ⚠️ {error.message}
                  </td>
                </tr>
              ) : data && data.data.length > 0 ? (
                data.data.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--md-outline-variant)",
                      background: item.userStatus === "nonaktif" ? "var(--md-surface-2)" : "transparent",
                      opacity: item.userStatus === "nonaktif" ? 0.6 : 1,
                      transition: "background 200ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = item.userStatus === "nonaktif" ? "#dbeafe" : "#eff6ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = item.userStatus === "nonaktif" ? "var(--md-surface-2)" : "transparent";
                    }}
                  >
                    {/* No */}
                    <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 700, color: "var(--md-on-surface-variant)", fontSize: 12 }}>
                      {(page - 1) * 10 + index + 1}
                    </td>

                    {/* Info */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #1a56db, #6366f1)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 15,
                            flexShrink: 0,
                          }}
                        >
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "var(--md-on-surface)", marginBottom: 2 }}>{item.name || "—"}</p>
                          <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)" }}>{item.email || item.contact?.email || "—"}</p>
                          <p style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>{item.contact?.phone || ""}</p>
                          {item.userStatus === "nonaktif" && (
                            <span style={{ display: "inline-flex", marginTop: 3, background: "#fee2e2", color: "#7f1d1d", borderRadius: 999, padding: "2px 8px", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              NONAKTIF
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Registrasi */}
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "var(--md-on-surface)", marginBottom: 3 }}>
                        NIK: {item.identity?.nik || "—"}
                      </p>
                      <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "var(--md-primary)", marginBottom: 3 }}>
                        REG: {item.registrationNumber || item.nim || "—"}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)" }}>{item.periodName || "—"}</p>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge value={item.statusRpl} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
                        <Link
                          href={`/dashboard/admin/mahasiswa/${item.id}`}
                          style={{ background: "var(--md-primary)", color: "#fff", borderRadius: 999, padding: "7px 14px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          Lihat Detail
                        </Link>
                        <Link
                          href={`/dashboard/admin/mahasiswa/${item.id}?edit=1`}
                          style={{ background: "var(--md-surface-2)", color: "var(--md-on-surface)", border: "1.5px solid var(--md-outline-variant)", borderRadius: 999, padding: "6px 14px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center" }}
                        >
                          Edit
                        </Link>
                        {item.userStatus !== "nonaktif" && (
                          <button
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 999, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                            onClick={() => {
                              if (confirm(`Nonaktifkan ${item.name}?`)) deactivateMutation.mutate(item.id);
                            }}
                            type="button"
                          >
                            Nonaktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "56px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 32, marginBottom: 10 }}>👥</p>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "var(--md-on-surface)", marginBottom: 4 }}>Belum Ada Pendaftar</p>
                    <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)" }}>Data akan muncul setelah pendaftar ditambahkan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApplicantListPagination page={page} setPage={setPage} data={data} />
    </div>
  );
}

/* ── Inline Create Form helper ── */
function CreateApplicantForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/mahasiswa", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal menambah mahasiswa.");
      return body;
    },
    onSuccess: async () => {
      onSuccess();
      await queryClient.invalidateQueries({ queryKey: ["admin-mahasiswa"] });
    },
  });

  return (
    <>
      <ApplicantForm
        mode="create"
        onCancel={onSuccess}
        onSubmit={async (formData) => { await createMutation.mutateAsync(formData); }}
        submitting={createMutation.isPending}
      />
      {createMutation.error && (
        <AlertNotice tone="error" message={createMutation.error.message} />
      )}
    </>
  );
}
