"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";

type KlasterModul = {
  id: string;
  namaKlaster: string;
  deskripsi: string;
  lmsDeskripsi: string;
  lmsVideos: string[];
  lmsDocuments: { title: string; url: string }[];
  matkulCount: number;
  soalCount: number;
  videoCount?: number;
  pretestCount?: number;
  materialCount?: number;
  gradeBooster?: boolean;
  isActive?: boolean;
  createdAt: string;
};

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

export function LmsClient() {
  const queryClient = useQueryClient();

  const { data: modulesData, isLoading } = useQuery({
    queryKey: ["assessment_klasters"],
    queryFn: async () => {
      const res = await fetch("/api/admin/asesmen");
      if (!res.ok) throw new Error("Failed to fetch klaster modules");
      return res.json() as Promise<{ data: KlasterModul[] }>;
    },
  });

  const toggleBoosterMutation = useMutation({
    mutationFn: async ({ id, gradeBooster }: { id: string; gradeBooster: boolean }) => {
      const res = await fetch(`/api/admin/asesmen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeBooster }),
      });
      if (!res.ok) throw new Error("Failed to update booster settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment_klasters"] });
    },
    onError: () => {
      alert("Gagal memperbarui Grade Booster");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/asesmen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update active status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment_klasters"] });
    },
    onError: () => {
      alert("Gagal memperbarui status aktif modul");
    }
  });

  const modules = modulesData?.data || [];

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Manajemen Asesmen (LMS)"
        title="Daftar Modul Asesmen"
        subtitle="Kelola bank soal dan tes keahlian untuk mahasiswa RPL."
        rightContent={null}
      />

      <div className="md-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--md-outline-variant)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>Modul Klaster</h2>
            <p style={{ marginTop: 4, fontSize: 12, color: "var(--md-on-surface-variant)", fontWeight: 700 }}>
              Daftar ini memuat klaster rumpun ilmu yang otomatis bertindak sebagai modul asesmen/LMS.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto", background: "#f8fafc", padding: "10px 12px 14px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 800 }}>
            <thead>
              <tr>
                {["Judul Klaster Modul", "Statistik LMS", "Aksi"].map((heading) => (
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
                  <td colSpan={3} style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
                    Memuat data...
                  </td>
                </tr>
              ) : modules.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
                    Belum ada klaster. Buat klaster di menu Kurikulum &gt; Rumpun Ilmu.
                  </td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr
                    key={module.id}
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
                        borderLeft: "5px solid var(--md-primary)",
                        borderTopLeftRadius: 16,
                        borderBottomLeftRadius: 16,
                        boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
                      }}
                    >
                      <strong style={{ display: "block", color: "var(--md-on-surface)", fontSize: 15, lineHeight: 1.25 }}>
                        {module.namaKlaster}
                      </strong>
                      <span style={{ display: "block", marginTop: 5, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                        {module.deskripsi || "Tidak ada deskripsi rumpun ilmu"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px 14px",
                        background: "#fff",
                        borderTop: "1px solid #e2e8f0",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#334155",
                        fontWeight: 600,
                        fontSize: 12,
                        maxWidth: 250,
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, fontWeight: 800 }}>
                        <span style={{ color: "#0f172a", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>{module.matkulCount || 0} Matkul</span>
                        <span style={{ color: "#2563eb", background: "#eff6ff", padding: "3px 8px", borderRadius: 6 }}>{module.videoCount || 0} Video Pembelajaran</span>
                        <span style={{ color: "#d97706", background: "#fef3c7", padding: "3px 8px", borderRadius: 6 }}>{module.pretestCount || 0} Soal Pretest</span>
                        <span style={{ color: "#059669", background: "#d1fae5", padding: "3px 8px", borderRadius: 6 }}>{module.soalCount || 0} Soal Ujian Final</span>
                      </div>
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
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <ActiveToggle module={module} toggleActiveMutation={toggleActiveMutation} />
                          <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
                          <BoosterToggle module={module} toggleBoosterMutation={toggleBoosterMutation} />
                        </div>
                        <Link
                          href={`/dashboard/admin/lms/${module.id}`}
                          style={{ ...ghostButtonStyle, minWidth: 64, textDecoration: "none" }}
                          onMouseEnter={liftButton}
                          onMouseLeave={(e) => resetButton(e, "#fff", "var(--md-on-surface)", "var(--md-outline-variant)")}
                        >
                          Edit Klaster & Soal
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function liftButton(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow = "0 8px 16px rgba(15,23,42,0.08)";
  e.currentTarget.style.borderColor = "var(--md-primary)";
  e.currentTarget.style.background = "#eff6ff";
  e.currentTarget.style.color = "var(--md-primary)";
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

function ActiveToggle({ module, toggleActiveMutation }: { module: KlasterModul, toggleActiveMutation: any }) {
  const [isOn, setIsOn] = React.useState(module.isActive !== false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsOn(module.isActive !== false);
  }, [module.isActive]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.checked;
    setIsOn(newVal); 
    setIsLoading(true);
    
    toggleActiveMutation.mutate(
      { id: module.id, isActive: newVal },
      {
        onSettled: () => setIsLoading(false),
        onError: () => setIsOn(!newVal)
      }
    );
  };

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: isLoading ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)", opacity: isLoading ? 0.6 : 1 }}>
      Modul Aktif
      <div style={{ position: "relative", width: 34, height: 20 }}>
        <input
          type="checkbox"
          checked={isOn}
          disabled={isLoading}
          onChange={handleToggle}
          style={{
            appearance: "none", width: "100%", height: "100%", background: isOn ? "#10b981" : "#cbd5e1",
            borderRadius: 20, margin: 0, cursor: isLoading ? "not-allowed" : "pointer", outline: "none", transition: "background 0.2s"
          }}
        />
        <div style={{
          position: "absolute", top: 2, left: isOn ? 16 : 2, width: 16, height: 16,
          background: "#fff", borderRadius: "50%", pointerEvents: "none", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }} />
      </div>
    </label>
  );
}

function BoosterToggle({ module, toggleBoosterMutation }: { module: KlasterModul, toggleBoosterMutation: any }) {
  const [isOn, setIsOn] = React.useState(module.gradeBooster || false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Sync with prop if it changes
  React.useEffect(() => {
    setIsOn(module.gradeBooster || false);
  }, [module.gradeBooster]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.checked;
    setIsOn(newVal); // Optimistic UI update
    setIsLoading(true);
    
    toggleBoosterMutation.mutate(
      { id: module.id, gradeBooster: newVal },
      {
        onSettled: () => setIsLoading(false),
        onError: () => setIsOn(!newVal) // Revert on error
      }
    );
  };

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: isLoading ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)", opacity: isLoading ? 0.6 : 1 }}>
      Grade Booster
      <div style={{ position: "relative", width: 34, height: 20 }}>
        <input
          type="checkbox"
          checked={isOn}
          disabled={isLoading}
          onChange={handleToggle}
          style={{
            appearance: "none", width: "100%", height: "100%", background: isOn ? "var(--md-primary)" : "#cbd5e1",
            borderRadius: 20, margin: 0, cursor: isLoading ? "not-allowed" : "pointer", outline: "none", transition: "background 0.2s"
          }}
        />
        <div style={{
          position: "absolute", top: 2, left: isOn ? 16 : 2, width: 16, height: 16,
          background: "#fff", borderRadius: "50%", pointerEvents: "none", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }} />
      </div>
    </label>
  );
}
