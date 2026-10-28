"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicantForm } from "./ApplicantForm";
import { StatusBadge } from "./StatusBadge";
import type { Applicant } from "./types";

const tabs = [
  { id: "profil", label: "Profil" },
  { id: "cv", label: "Riwayat / CV" },
  { id: "dokumen", label: "Dokumen" },
  { id: "pembayaran", label: "Pembayaran" },
  { id: "f02", label: "F02" },
  { id: "f03", label: "F03 / Portofolio" },
  { id: "asesmen", label: "Asesmen" },
  { id: "hasil", label: "Hasil Konversi" },
  { id: "cetak", label: "Cetak" },
];

const buttonStyle = {
  border: 0,
  borderRadius: 999,
  padding: "11px 16px",
  background: "var(--md-primary)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
} as const;

async function fetchApplicant(id: string) {
  const response = await fetch(`/api/admin/mahasiswa/${id}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Gagal memuat detail mahasiswa.");
  return body.data as Applicant;
}

export function ApplicantDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "profil");
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-mahasiswa-detail", id],
    queryFn: () => fetchApplicant(id),
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/admin/mahasiswa/${id}`, { method: "PATCH", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal menyimpan perubahan.");
      return body.data as Applicant;
    },
    onSuccess: async () => {
      setEditing(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-mahasiswa-detail", id] }),
        queryClient.invalidateQueries({ queryKey: ["admin-mahasiswa"] }),
      ]);
    },
  });

  if (isLoading) {
    return (
      <div className="md-card" style={{ padding: 28, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>
        Memuat detail mahasiswa...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="md-card" style={{ padding: 28, color: "#991b1b", fontWeight: 900 }}>
        {error?.message ?? "Data tidak ditemukan."}
      </div>
    );
  }

  const summary = [
    ["No. Registrasi", data.registrationNumber || data.nim || "-"],
    ["Username", `@${data.username}`],
    ["Periode", data.periodName || "-"],
    ["Program", data.program || "-"],
  ];

  return (
    <section style={{ width: "100%" }}>
      <div
        className="md-card"
        style={{
          padding: "24px 26px",
          marginBottom: 18,
          background: "linear-gradient(135deg, var(--md-primary) 0%, var(--md-secondary) 100%)",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: "#e0e7ff", marginBottom: 8 }}>
                Detail Pendaftar Mahasiswa
              </p>
              <h1 style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.12, fontWeight: 900, marginBottom: 12 }}>
                {data.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={data.statusRpl} />
                <span style={{ borderRadius: 999, padding: "6px 11px", background: "rgba(255,255,255,0.14)", fontSize: 11, fontWeight: 900 }}>
                  {data.userStatus === "aktif" ? "AKUN AKTIF" : "AKUN NONAKTIF"}
                </span>
              </div>
            </div>
          </div>

          <button style={{ ...buttonStyle, background: "#fff", color: "var(--md-primary)" }} onClick={() => setEditing((value) => !value)} type="button">
            {editing ? "Tutup Edit" : "Edit Biodata Dasar"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ marginTop: 22 }}>
          {summary.map(([label, value]) => (
            <div key={label} style={{ borderRadius: 16, background: "rgba(255,255,255,0.12)", padding: "13px 14px", border: "1px solid rgba(255,255,255,0.16)" }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "#e0e7ff" }}>{label}</p>
              <p style={{ marginTop: 6, fontSize: 13, fontWeight: 900, color: "#fff", wordBreak: "break-word" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="md-card" style={{ padding: 10, marginBottom: 18, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              style={{
                border: "1px solid var(--md-outline-variant)",
                borderRadius: 999,
                padding: "10px 14px",
                background: activeTab === tab.id ? "var(--md-primary)" : "#fff",
                color: activeTab === tab.id ? "#fff" : "var(--md-on-surface-variant)",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {editing ? (
        <div className="md-card" style={{ padding: 22, marginBottom: 18 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>Edit Biodata Dasar</h2>
            <p style={{ marginTop: 5, fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
              Perbarui identitas utama, kontak, periode, dan status proses RPL.
            </p>
          </div>
          <ApplicantForm
            applicant={data}
            mode="edit"
            onCancel={() => setEditing(false)}
            onSubmit={async (formData) => {
              await updateMutation.mutateAsync(formData);
            }}
            submitting={updateMutation.isPending}
          />
          {updateMutation.error ? <p style={{ marginTop: 12, color: "#991b1b", fontSize: 13, fontWeight: 900 }}>{updateMutation.error.message}</p> : null}
        </div>
      ) : null}

      <div className="md-card" style={{ padding: 22 }}>
        {activeTab === "profil" ? <ProfileTab applicant={data} /> : null}
        {activeTab === "cv" ? <CVTab applicant={data} /> : null}
        {activeTab === "dokumen" ? <DocumentsTab applicant={data} /> : null}
        {activeTab !== "profil" && activeTab !== "cv" && activeTab !== "dokumen" ? <PlaceholderTab title={tabs.find((tab) => tab.id === activeTab)?.label ?? "Modul"} /> : null}
      </div>
    </section>
  );
}

function ProfileTab({ applicant }: { applicant: Applicant }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <InfoCard
        title="Identitas Utama"
        rows={[
          ["Nama Lengkap", applicant.name],
          ["Username", applicant.username],
          ["NIK", applicant.identity?.nik || "-"],
          ["No. Pendaftar", applicant.registrationNumber || "-"],
          ["NIM", applicant.nim || "-"],
          ["Tempat, Tgl Lahir", `${applicant.identity?.placeOfBirth || "-"}, ${applicant.identity?.dateOfBirth ? applicant.identity.dateOfBirth.slice(0, 10) : "-"}`],
        ]}
      />
      <InfoCard
        title="Kontak & Akademik"
        rows={[
          ["Email", applicant.email || applicant.contact?.email || "-"],
          ["WhatsApp / HP", applicant.contact?.phone || "-"],
          ["Alamat", applicant.contact?.address || "-"],
          ["Periode", applicant.periodName || "-"],
          ["Program Studi", applicant.program || "-"],
          ["Konsentrasi", applicant.concentration || "-"],
        ]}
      />
      <InfoCard
        title="Progres Sistem"
        rows={[
          ["Pembayaran", applicant.progress?.paymentStatus || "-"],
          ["F02", applicant.progress?.f02Status || "-"],
          ["F03", applicant.progress?.f03Status || "-"],
          ["Asesmen", applicant.progress?.assessmentStatus || "-"],
          ["Hasil", applicant.progress?.resultStatus || "-"],
          ["Status RPL", applicant.statusRpl || "-"],
        ]}
      />
    </div>
  );
}

function CVTab({ applicant }: { applicant: Applicant }) {
  const cv = applicant.cv || {};
  const currentWork = (cv.currentWork || applicant.work || {}) as Record<string, any>;
  const formalEducation = asRows(cv.formalEducation);
  const workExperience = asRows(cv.workExperience);
  const trainings = asRows(cv.trainings?.length ? cv.trainings : cv.nonFormalEducation);
  const conferences = asRows(cv.conferences);
  const achievements = asRows(cv.achievements);
  const organizations = asRows(cv.organizations);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <InfoCard
        title="Identitas Pekerjaan Saat Ini"
        rows={[
          ["Status Pernikahan", text(currentWork.maritalStatus)],
          ["Status Pekerjaan", text(currentWork.employmentStatus)],
          ["Institusi / Perusahaan", text(currentWork.institution)],
          ["Jabatan", text(currentWork.position)],
          ["Alamat Kantor", text(currentWork.officeAddress)],
          ["Telepon Kantor", text(currentWork.officePhone)],
          ["Email Kantor", text(currentWork.officeEmail)],
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DataSection
          title="Riwayat Pendidikan"
          emptyText="Belum ada riwayat pendidikan."
          rows={formalEducation}
          columns={[
            ["Jenjang", "level"],
            ["Sekolah / Kampus", "institution"],
            ["Jurusan", "major"],
            ["Tahun Lulus", "graduationYear"],
          ]}
        />
        <DataSection
          title="Riwayat Pekerjaan"
          emptyText="Belum ada riwayat pekerjaan."
          rows={workExperience}
          columns={[
            ["Perusahaan / Institusi", "company"],
            ["Alamat", "companyAddress"],
            ["Jabatan", "position"],
            ["Masuk", "startDate", "startYear"],
            ["Keluar", "endDate", "endYear"],
            ["Uraian Tugas", "description"],
          ]}
        />
        <DataSection
          title="Pelatihan"
          emptyText="Belum ada data pelatihan."
          rows={trainings}
          columns={[
            ["Nama Pelatihan", "name"],
            ["Penyelenggara", "organizer"],
            ["Tahun", "year"],
          ]}
        />
        <DataSection
          title="Konferensi / Seminar"
          emptyText="Belum ada data konferensi atau seminar."
          rows={conferences}
          columns={[
            ["Kegiatan", "title"],
            ["Penyelenggara", "organizer"],
            ["Tahun", "year"],
            ["Status", "status"],
          ]}
        />
        <DataSection
          title="Penghargaan"
          emptyText="Belum ada data penghargaan."
          rows={achievements}
          columns={[
            ["Penghargaan", "name"],
            ["Pemberi", "issuer"],
            ["Tahun", "year"],
          ]}
        />
        <DataSection
          title="Organisasi"
          emptyText="Belum ada data organisasi."
          rows={organizations}
          columns={[
            ["Organisasi", "name"],
            ["Jabatan", "position"],
            ["Tahun Mulai", "startYear"],
            ["Tahun Selesai", "endYear"],
          ]}
        />
      </div>
    </div>
  );
}

function DocumentsTab({ applicant }: { applicant: Applicant }) {
  const docTypes = ["ktp", "kk", "akta", "ijazah", "pendukung", "ttd"];
  const docLabels: Record<string, string> = {
    ktp: "KTP Asli",
    kk: "Kartu Keluarga (KK)",
    akta: "Akta Kelahiran",
    ijazah: "Ijazah SMA/Sederajat",
    pendukung: "Dok. Pendukung Lainnya",
    ttd: "Tanda Tangan Digital",
  };

  return (
    <div>
      <SectionTitle title="Dokumen Pendaftar" subtitle="Ringkasan dokumen yang telah diunggah oleh mahasiswa." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {docTypes.map((type) => {
          const found = applicant.documents.find((doc) => doc.type === type);
          return (
            <div className="md-card" style={{ padding: 16, background: "#f8fafc", boxShadow: "none" }} key={type}>
              <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "var(--md-on-surface)" }}>{docLabels[type] || type}</p>
              <p style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, fontWeight: 700, color: "var(--md-on-surface-variant)", wordBreak: "break-all" }}>
                {found?.fileName ?? "Belum ada dokumen."}
              </p>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <StatusBadge value={found ? found.validationStatus?.toUpperCase() ?? "MENUNGGU" : "BELUM"} />
                {found?.fileUrl && (
                  <a
                    href={found.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--md-primary)",
                      background: "#eff6ff",
                      border: "1.5px solid #93c5fd",
                      borderRadius: 8,
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "background 150ms",
                    }}
                  >
                    📂 Lihat File
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataSection({
  title,
  emptyText,
  rows,
  columns,
}: {
  title: string;
  emptyText: string;
  rows: Array<Record<string, any>>;
  columns: Array<[string, string, string?]>;
}) {
  return (
    <div style={{ border: "1px solid var(--md-outline-variant)", borderRadius: 18, padding: 18, background: "#fff" }}>
      <SectionTitle title={title} />
      {rows.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((row, index) => (
            <div key={index} style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, background: "#f8fafc" }}>
              <p style={{ marginBottom: 12, fontSize: 11, fontWeight: 900, color: "var(--md-primary)", textTransform: "uppercase" }}>
                Data {index + 1}
              </p>
              <dl style={{ display: "grid", gap: 9 }}>
                {columns.map(([label, key, fallbackKey]) => (
                  <div key={`${label}-${key}`} style={{ display: "grid", gap: 4 }}>
                    <dt style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "var(--md-on-surface-variant)" }}>{label}</dt>
                    <dd style={{ fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)", lineHeight: 1.5, wordBreak: "break-word" }}>
                      {text(row[key] || (fallbackKey ? row[fallbackKey] : ""))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ borderRadius: 14, background: "#f8fafc", border: "1px dashed #cbd5e1", padding: 16, fontSize: 13, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>
          {emptyText}
        </p>
      )}
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div style={{ padding: "34px 18px", textAlign: "center" }}>
      <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--md-primary)" }}>
        Modul Detail
      </p>
      <h2 style={{ marginTop: 10, fontSize: 24, fontWeight: 900, color: "var(--md-on-surface)" }}>{title}</h2>
      <p style={{ margin: "10px auto 0", maxWidth: 560, fontSize: 13, lineHeight: 1.7, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
        Struktur tab sudah disiapkan mengikuti alur REKSA. Konten detail modul ini akan mengikuti tahap pengembangan Manajemen Mahasiswa.
      </p>
    </div>
  );
}

function asRows(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row) => row && typeof row === "object" && Object.values(row).some((item) => String(item ?? "").trim())) as Array<Record<string, any>>
    : [];
}

function text(value: unknown) {
  const clean = String(value ?? "").trim();
  return clean || "-";
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div style={{ border: "1px solid var(--md-outline-variant)", borderRadius: 18, padding: 18, background: "#fff" }}>
      <SectionTitle title={title} />
      <dl style={{ display: "grid", gap: 10 }}>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(130px, 180px) 1fr",
              gap: 12,
              padding: "11px 0",
              borderBottom: "1px solid #eef2f7",
            }}
          >
            <dt style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: "var(--md-on-surface-variant)" }}>{label}</dt>
            <dd style={{ fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)", wordBreak: "break-word" }}>{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 900, color: "var(--md-on-surface)" }}>{title}</h2>
      {subtitle ? <p style={{ marginTop: 5, fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>{subtitle}</p> : null}
    </div>
  );
}
