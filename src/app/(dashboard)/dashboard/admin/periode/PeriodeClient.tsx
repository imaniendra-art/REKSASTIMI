"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHero } from "@/components/dashboard/UIComponents";

type Period = {
  id: string;
  namaPeriode: string;
  semester: string;
  tahunAkademik: string;
  status: string;
  isActive: boolean;
  applicantCount: number;
};

const fieldStyle = {
  width: "100%",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "var(--md-on-surface)",
} as const;

const primaryButtonStyle = {
  border: 0,
  borderRadius: 14,
  padding: "12px 18px",
  background: "var(--md-primary)",
  color: "#fff",
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(26,86,219,0.18)",
  transition: "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease, background 160ms ease",
} as const;

const ghostButtonStyle = {
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 12,
  padding: "9px 13px",
  background: "#fff",
  color: "var(--md-on-surface)",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease",
} as const;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        padding: "6px 11px",
        background: active ? "#d1fae5" : "#f1f5f9",
        color: active ? "#065f46" : "#475569",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {active ? "Aktif" : "Non-Aktif"}
    </span>
  );
}

export function PeriodeClient({ activePeriodName }: { activePeriodName: string }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    namaPeriode: "",
    semester: "",
    tahunAkademik: "",
  });

  const { data: periodsData, isLoading } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const res = await fetch("/api/admin/periode");
      if (!res.ok) throw new Error("Failed to fetch periods");
      return res.json() as Promise<{ data: Period[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/periode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal menambah periode");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      setNotice({ type: "success", text: "Periode berhasil ditambahkan." });
      closeModal();
    },
    onError: (err) => setNotice({ type: "error", text: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Period> }) => {
      const res = await fetch(`/api/admin/periode/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal mengubah periode");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      setNotice({ type: "success", text: "Periode berhasil diperbarui." });
      closeModal();
    },
    onError: (err) => setNotice({ type: "error", text: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/periode/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal menghapus periode");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      setNotice({ type: "success", text: "Periode berhasil dihapus." });
    },
    onError: (err) => setNotice({ type: "error", text: err.message }),
  });

  const periods = periodsData?.data || [];
  const openModal = (period?: Period) => {
    setNotice(null);
    if (period) {
      setEditId(period.id);
      setFormData({
        namaPeriode: period.namaPeriode,
        semester: period.semester || "",
        tahunAkademik: period.tahunAkademik || "",
      });
    } else {
      setEditId(null);
      setFormData({ namaPeriode: "", semester: "", tahunAkademik: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({ id: editId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleActive = (period: Period) => {
    const shouldActivate = !period.isActive;
    if (shouldActivate && !confirm(`Aktifkan periode ${period.namaPeriode}? Periode lain akan otomatis nonaktif.`)) {
      return;
    }
    updateMutation.mutate({ id: period.id, data: { isActive: shouldActivate } });
  };

  const handleDelete = (period: Period) => {
    if (period.applicantCount > 0) {
      setNotice({ type: "error", text: "Periode tidak dapat dihapus karena sudah memiliki pendaftar. Cukup nonaktifkan." });
      return;
    }
    if (confirm(`Yakin ingin menghapus periode ${period.namaPeriode}?`)) {
      deleteMutation.mutate(period.id);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Manajemen Periode"
        title={
          <>
            <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#bfdbfe", marginBottom: 8 }}>
              Periode Aktif
            </span>
            {activePeriodName}
          </>
        }
        subtitle="Atur batch pendaftaran RPL yang sedang aktif."
        rightContent={
          <button
            className="hero-action-button"
            onClick={() => openModal()}
            type="button"
          >
            Tambah Periode
          </button>
        }
      />

      {notice && (
        <div
          className="md-card"
          style={{
            padding: "14px 16px",
            marginBottom: 18,
            borderColor: notice.type === "success" ? "#86efac" : "#fecaca",
            background: notice.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: notice.type === "success" ? "#166534" : "#991b1b",
            fontWeight: 800,
          }}
        >
          {notice.text}
        </div>
      )}

      <div className="md-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--md-outline-variant)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            background: "#fff",
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>Daftar Periode</h2>
            <p style={{ marginTop: 4, fontSize: 12, color: "var(--md-on-surface-variant)", fontWeight: 700 }}>
              Atur batch pendaftaran RPL tanpa mengubah data mahasiswa yang sudah masuk.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto", background: "#f8fafc", padding: "10px 12px 14px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 980 }}>
            <thead>
              <tr>
                {["Nama Periode", "Semester", "Tahun Akademik", "Pendaftar", "Status", "Aksi"].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "8px 14px",
                      textAlign: heading === "Aksi" ? "right" : "left",
                      fontSize: 10,
                      textTransform: "uppercase",
                      color: "#64748b",
                      letterSpacing: "0.08em",
                      fontWeight: 900,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
                    Memuat data periode...
                  </td>
                </tr>
              ) : periods.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
                    Belum ada periode. Tambahkan periode untuk membuka batch pendaftaran.
                  </td>
                </tr>
              ) : (
                periods.map((period, index) => (
                  <tr
                    key={period.id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.filter = "drop-shadow(0 10px 18px rgba(15,23,42,0.10))";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.filter = "none";
                    }}
                    style={{ transition: "transform 160ms ease, filter 160ms ease" }}
                  >
                    <td
                      style={{
                        padding: "16px 18px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        borderLeft: `5px solid ${period.isActive ? "#16a34a" : "#cbd5e1"}`,
                        borderTopLeftRadius: 16,
                        borderBottomLeftRadius: 16,
                        boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 14,
                            background: period.isActive ? "#dcfce7" : "#f1f5f9",
                            color: period.isActive ? "#166534" : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: "block", color: "var(--md-on-surface)", fontSize: 15, lineHeight: 1.25 }}>
                            {period.namaPeriode}
                          </strong>
                          <span style={{ display: "block", marginTop: 5, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                            {period.isActive ? "Sedang digunakan untuk pendaftaran" : "Tersimpan sebagai periode nonaktif"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 14px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#334155",
                        fontWeight: 800,
                      }}
                    >
                      <span style={{ display: "inline-flex", minWidth: 96 }}>{period.semester || "-"}</span>
                    </td>
                    <td
                      style={{
                        padding: "16px 14px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#334155",
                        fontWeight: 800,
                      }}
                    >
                      {period.tahunAkademik || "-"}
                    </td>
                    <td
                      style={{
                        padding: "16px 14px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 104,
                          borderRadius: 999,
                          padding: "7px 12px",
                          background: "#e0f2fe",
                          color: "#075985",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        {period.applicantCount} Pendaftar
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px 14px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <StatusBadge active={period.isActive} />
                    </td>
                    <td
                      style={{
                        padding: "16px 18px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderRight: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        borderTopRightRadius: 16,
                        borderBottomRightRadius: 16,
                        textAlign: "right",
                        boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
                      }}
                    >
                      <div style={{ display: "inline-flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
                        <button
                          onClick={() => handleToggleActive(period)}
                          onMouseEnter={liftButton}
                          onMouseLeave={(e) =>
                            resetButton(
                              e,
                              period.isActive ? "#fef3c7" : "#d1fae5",
                              period.isActive ? "#92400e" : "#065f46",
                              period.isActive ? "#fde68a" : "#86efac"
                            )
                          }
                          style={{
                            ...ghostButtonStyle,
                            minWidth: 104,
                            background: period.isActive ? "#fef3c7" : "#d1fae5",
                            color: period.isActive ? "#92400e" : "#065f46",
                            borderColor: period.isActive ? "#fde68a" : "#86efac",
                          }}
                        >
                          {period.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button
                          onClick={() => openModal(period)}
                          style={{ ...ghostButtonStyle, minWidth: 64 }}
                          onMouseEnter={liftButton}
                          onMouseLeave={(e) => resetButton(e, "#fff", "var(--md-on-surface)", "var(--md-outline-variant)")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(period)}
                          disabled={period.applicantCount > 0}
                          title={period.applicantCount > 0 ? "Tidak bisa dihapus karena sudah memiliki pendaftar" : "Hapus periode"}
                          onMouseEnter={(e) => {
                            if (period.applicantCount > 0) return;
                            liftDangerButton(e);
                          }}
                          onMouseLeave={(e) => {
                            if (period.applicantCount > 0) return;
                            resetButton(e, "#fff", "#dc2626", "var(--md-outline-variant)");
                          }}
                          style={{
                            ...ghostButtonStyle,
                            minWidth: 70,
                            color: period.applicantCount > 0 ? "#94a3b8" : "#dc2626",
                            background: period.applicantCount > 0 ? "#f8fafc" : "#fff",
                            cursor: period.applicantCount > 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.52)",
            padding: 16,
          }}
        >
          <div className="md-card" style={{ width: "100%", maxWidth: 520, overflow: "hidden", background: "#fff" }}>
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--md-outline-variant)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  {editId ? "Edit Periode" : "Tambah Periode"}
                </h3>
                <p style={{ marginTop: 4, fontSize: 12, color: "var(--md-on-surface-variant)", fontWeight: 700 }}>
                  Isi nama batch, semester, dan tahun akademik.
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  minWidth: 72,
                  height: 36,
                  borderRadius: 999,
                  border: "1px solid var(--md-outline-variant)",
                background: "#fff",
                color: "var(--md-on-surface-variant)",
                fontSize: 12,
                fontWeight: 900,
                lineHeight: 1,
                  cursor: "pointer",
                  transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
                onMouseEnter={liftButton}
                onMouseLeave={(e) => resetButton(e, "#fff", "var(--md-on-surface-variant)", "var(--md-outline-variant)")}
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 22 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Nama Periode *
                  <input
                    type="text"
                    required
                    value={formData.namaPeriode}
                    onChange={(e) => setFormData({ ...formData, namaPeriode: e.target.value })}
                    style={fieldStyle}
                    placeholder="Contoh: Batch 1 - 2026"
                  />
                </label>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Semester
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    style={fieldStyle}
                    placeholder="Contoh: Ganjil / Genap"
                  />
                </label>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Tahun Akademik
                  <input
                    type="text"
                    value={formData.tahunAkademik}
                    onChange={(e) => setFormData({ ...formData, tahunAkademik: e.target.value })}
                    style={fieldStyle}
                    placeholder="Contoh: 2025/2026"
                  />
                </label>
              </div>

              <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={ghostButtonStyle}
                  onMouseEnter={liftButton}
                  onMouseLeave={(e) => resetButton(e, "#fff", "var(--md-on-surface)", "var(--md-outline-variant)")}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  onMouseEnter={(e) => {
                    if (createMutation.isPending || updateMutation.isPending) return;
                    liftPrimary(e);
                  }}
                  onMouseLeave={(e) => {
                    if (createMutation.isPending || updateMutation.isPending) return;
                    resetPrimary(e);
                  }}
                  style={{
                    ...primaryButtonStyle,
                    opacity: createMutation.isPending || updateMutation.isPending ? 0.65 : 1,
                    cursor: createMutation.isPending || updateMutation.isPending ? "wait" : "pointer",
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function liftPrimary(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow = "0 10px 20px rgba(26,86,219,0.24)";
  e.currentTarget.style.filter = "brightness(1.05)";
}

function resetPrimary(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,86,219,0.18)";
  e.currentTarget.style.filter = "none";
}

function liftButton(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow = "0 8px 16px rgba(15,23,42,0.10)";
  e.currentTarget.style.borderColor = "var(--md-primary)";
  e.currentTarget.style.background = "#eff6ff";
  e.currentTarget.style.color = "var(--md-primary)";
}

function liftDangerButton(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow = "0 8px 16px rgba(220,38,38,0.12)";
  e.currentTarget.style.borderColor = "#fecaca";
  e.currentTarget.style.background = "#fef2f2";
  e.currentTarget.style.color = "#dc2626";
}

function resetButton(
  e: React.MouseEvent<HTMLElement>,
  background = "#fff",
  color = "var(--md-on-surface)",
  borderColor = "var(--md-outline-variant)"
) {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.filter = "none";
  e.currentTarget.style.background = background;
  e.currentTarget.style.color = color;
  e.currentTarget.style.borderColor = borderColor;
}
