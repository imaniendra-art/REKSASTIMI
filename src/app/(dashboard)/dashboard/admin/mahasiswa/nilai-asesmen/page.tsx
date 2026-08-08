"use client";

import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";
import { StatusBadge } from "../_components/StatusBadge";
import { ApplicantListFilters } from "../_components/ApplicantListFilters";
import { ApplicantListPagination } from "../_components/ApplicantListPagination";
import { useApplicantList } from "../_components/useApplicantList";

export default function NilaiAsesmenPage() {
  const {
    q, setQ, period, setPeriod, statusRpl, setStatusRpl, page, setPage,
    resetToFirstPage, query
  } = useApplicantList();

  const { data, isLoading, error } = query;
  const accentColor = "#059669";

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
        badgeIcon="📊"
        badgeText="Nilai & Asesmen"
        title="Nilai & Asesmen Mahasiswa"
        subtitle="Progres evaluasi, hasil asesmen, dan pelaporan transkrip mahasiswa RPL."
        tone="success"
      />

      <ApplicantListFilters
        q={q} setQ={setQ}
        period={period} setPeriod={setPeriod}
        statusRpl={statusRpl} setStatusRpl={setStatusRpl}
        resetToFirstPage={resetToFirstPage}
        data={data}
      />

      <div className="md-card animate-fade-up stagger-2" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 48, textAlign: "center" }}>No</th>
                <th style={{ ...thStyle, minWidth: 200 }}>Informasi Mahasiswa</th>
                <th style={{ ...thStyle, minWidth: 160 }}>No. Registrasi</th>
                <th style={{ ...thStyle, minWidth: 320 }}>Pelaporan & Transkrip</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 16px", textAlign: "center", color: "var(--md-on-surface-variant)" }}>
                    <span style={{ display: "block", fontSize: 24, marginBottom: 8 }}>⏳</span>
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
                    style={{ borderBottom: "1px solid var(--md-outline-variant)", transition: "background 200ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 700, color: "var(--md-on-surface-variant)", fontSize: 12 }}>
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #059669, #0284c7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "var(--md-on-surface)" }}>{item.name || "—"}</p>
                          <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)", marginTop: 2 }}>{item.periodName || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "var(--md-on-surface)", marginBottom: 3 }}>
                        NIK: {item.identity?.nik || "—"}
                      </p>
                      <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: accentColor }}>
                        REG: {item.registrationNumber || item.nim || "—"}
                      </p>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { label: "F02 (Matkul)",           val: item.progress.f02Status         },
                          { label: "F03 (Evaluasi Diri)",    val: item.progress.f03Status         },
                          { label: "Asesmen Kompetensi",     val: item.progress.assessmentStatus  },
                          { label: "Hasil Pleno",            val: item.progress.resultStatus      },
                        ].map((prog) => (
                          <div key={prog.label}>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--md-on-surface-variant)", marginBottom: 4 }}>
                              {prog.label}
                            </p>
                            <StatusBadge value={prog.val} />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
                        <Link
                          href={`/dashboard/admin/mahasiswa/${item.id}#asesmen`}
                          style={{ background: "#d1fae5", color: "#064e3b", borderRadius: 999, padding: "7px 14px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          Lihat Nilai
                        </Link>
                        <button
                          style={{ background: "var(--md-surface-2)", color: "var(--md-on-surface)", border: "1.5px solid var(--md-outline-variant)", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                          onClick={() => alert("Fitur cetak transkrip akan diimplementasikan pada tahap selanjutnya.")}
                          type="button"
                        >
                          Cetak Transkrip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "56px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 32, marginBottom: 10 }}>📊</p>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "var(--md-on-surface)", marginBottom: 4 }}>Belum Ada Data Asesmen</p>
                    <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)" }}>Data asesmen akan muncul setelah ada pendaftar.</p>
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
