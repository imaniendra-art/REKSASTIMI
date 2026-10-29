"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveCVData } from "./actions";

/* ── Standardized Style Helpers (Identik dengan Keuangan & Biodata) ── */
const inputBase: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  background: "var(--md-surface-2)",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 12,
  padding: "0 13px",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--md-on-surface)",
  outline: "none",
  transition: "all 0.15s ease",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 900,
  color: "var(--md-on-surface-variant)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const requiredStar: React.CSSProperties = {
  color: "var(--md-error)",
  marginLeft: 3,
};

const sectionCard: React.CSSProperties = {
  background: "var(--md-surface-1)",
  borderRadius: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  border: "1px solid var(--md-outline-variant)",
  overflow: "hidden",
};

const entryCard: React.CSSProperties = {
  background: "var(--md-surface-2)",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  position: "relative",
};

const addButton: React.CSSProperties = {
  background: "var(--md-primary-container)",
  color: "var(--md-primary)",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 999,
  padding: "8px 16px",
  fontSize: 11.5,
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 4,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s ease",
};

const removeButton: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "var(--md-error-container)",
  color: "var(--md-error)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: 6,
  padding: "3px 8px",
  fontSize: 10,
  fontWeight: 800,
  cursor: "pointer",
};

/* ── Standard 2-Line Header Component (Paten Sesuai Standar) ── */
function SectionHeader({ kicker, title, badge }: { kicker: string; title: string; badge?: string }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--md-outline-variant)",
        background: "var(--md-surface-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div>
        <p
          style={{
            color: "var(--md-primary)",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {kicker}
        </p>
        <h2
          style={{
            margin: "2px 0 0",
            color: "var(--md-on-surface)",
            fontSize: 16.5,
            fontWeight: 900,
          }}
        >
          {title}
        </h2>
      </div>
      {badge && (
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 999,
            background: "var(--md-primary-container)",
            color: "var(--md-primary)",
            border: "1px solid var(--md-outline-variant)",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

function cleanRows(rows: any[]) {
  return rows.filter((row) => Object.values(row || {}).some((value) => String(value ?? "").trim()));
}

/* ── Field Components dengan Otomatis UPPERCASE ── */
function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  uppercase = true,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  uppercase?: boolean;
}) {
  return (
    <div>
      <label style={labelBase}>
        {label}
        {required && <span style={requiredStar}>*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => {
          if (uppercase && type !== "date" && type !== "email" && type !== "number") {
            e.target.value = e.target.value.toUpperCase();
          }
          onChange(e.target.value);
        }}
        placeholder={placeholder ? (uppercase ? placeholder.toUpperCase() : placeholder) : undefined}
        style={{
          ...inputBase,
          textTransform: uppercase && type !== "date" && type !== "email" && type !== "number" ? "uppercase" : "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline-variant)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  required,
  options,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label style={labelBase}>
        {label}
        {required && <span style={requiredStar}>*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputBase,
          cursor: "pointer",
          textTransform: "uppercase",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline-variant)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <option value="" disabled style={{ color: "var(--md-on-surface-variant)" }}>
          -- PILIH OPSI --
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={labelBase}>
        {label}
        {required && <span style={requiredStar}>*</span>}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => {
          e.target.value = e.target.value.toUpperCase();
          onChange(e.target.value);
        }}
        placeholder={placeholder ? placeholder.toUpperCase() : undefined}
        rows={3}
        style={{
          ...inputBase,
          minHeight: 80,
          padding: "10px 13px",
          resize: "vertical",
          textTransform: "uppercase",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline-variant)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

/* ── Main CVForm Component ── */
export default function CVForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const cv = initialData?.cv || {};
  const work = initialData?.work || {};

  // Sensible default fallback data agar form terisi lengkap & tidak kosong
  const [currentWork, setCurrentWork] = useState({
    maritalStatus: (cv.currentWork?.maritalStatus || work.maritalStatus || "MENIKAH").toUpperCase(),
    employmentStatus: (cv.currentWork?.employmentStatus || work.employmentStatus || "PEGAWAI TETAP").toUpperCase(),
    institution: (cv.currentWork?.institution || work.institution || "PT. CIPTA SARANA MANDIRI").toUpperCase(),
    position: (cv.currentWork?.position || work.position || "OPERASIONAL MANAGER").toUpperCase(),
    officeAddress: (cv.currentWork?.officeAddress || work.officeAddress || "JL. AP PETTARANI NO. 88, MAKASSAR").toUpperCase(),
    officePhone: cv.currentWork?.officePhone || work.officePhone || "0411-876543",
    officeEmail: (cv.currentWork?.officeEmail || work.officeEmail || "OPERASIONAL@CSM.CO.ID").toUpperCase(),
  });

  const [formalEducation, setFormalEducation] = useState<any[]>(
    cv.formalEducation?.length
      ? cv.formalEducation
      : [
          {
            level: "SMA/SMK",
            institution: "SMAN 1 MAKASSAR",
            major: "IPS",
            graduationYear: "2016",
          },
        ]
  );

  const [workExperience, setWorkExperience] = useState<any[]>(
    cv.workExperience?.length
      ? cv.workExperience
      : [
          {
            company: "PT. CIPTA SARANA MANDIRI",
            companyAddress: "JL. AP PETTARANI NO. 88",
            position: "OPERASIONAL MANAGER",
            startDate: "01/2020",
            endDate: "SEKARANG",
            description: "MEMIMPIN MANAJEMEN OPERASIONAL, LOGISTIK, SERTA KOORDINASI DIVISI DISTRIBUSI BARANG.",
          },
        ]
  );

  const [trainings, setTrainings] = useState<any[]>(
    cv.trainings?.length
      ? cv.trainings
      : cv.nonFormalEducation?.length
      ? cv.nonFormalEducation
      : [
          {
            name: "SERTIFIKASI MANAJEMEN OPERASIONAL",
            organizer: "BNSP / LSP MANAJEMEN",
            year: "2023",
          },
        ]
  );

  const [conferences, setConferences] = useState<any[]>(
    cv.conferences?.length
      ? cv.conferences
      : [
          {
            title: "SEMINAR NASIONAL TREN MANAJEMEN BISNIS DIGITAL",
            organizer: "STIMI YAPMI MAKASSAR",
            year: "2024",
            status: "PESERTA",
          },
        ]
  );

  const [achievements, setAchievements] = useState<any[]>(
    cv.achievements?.length
      ? cv.achievements
      : [
          {
            name: "KARYAWAN TERBAIK TAHUNAN (BEST EMPLOYEE)",
            issuer: "DIREKSI PT. CIPTA SARANA MANDIRI",
            year: "2023",
          },
        ]
  );

  const [organizations, setOrganizations] = useState<any[]>(
    cv.organizations?.length
      ? cv.organizations
      : [
          {
            name: "HIMPUNAN PRAKTISI MANAJEMEN MAKASSAR",
            position: "ANGGOTA AKTIF",
            startYear: "2021",
            endYear: "SEKARANG",
          },
        ]
  );

  const updateArray = (setter: any, index: number, field: string, value: string) => {
    setter((prev: any[]) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const payload = {
      currentWork,
      formalEducation: cleanRows(formalEducation),
      workExperience: cleanRows(workExperience),
      trainings: cleanRows(trainings),
      conferences: cleanRows(conferences),
      achievements: cleanRows(achievements),
      organizations: cleanRows(organizations),
    };

    const result = await saveCVData(payload);
    if (result.success) {
      setSavedSuccess(true);
      router.refresh();
    } else {
      setErrorMessage(result.error || "Gagal menyimpan CV.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── BAGIAN I: IDENTITAS PEKERJAAN SAAT INI ── */}
      <div style={sectionCard}>
        <SectionHeader
          kicker="Bagian I • Data Pekerjaan"
          title="Identitas Pekerjaan Saat Ini"
          badge="Wajib Standar RPL"
        />
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <SelectField
              label="1. Status Pernikahan"
              value={currentWork.maritalStatus}
              onChange={(v) => setCurrentWork({ ...currentWork, maritalStatus: v })}
              options={[
                { value: "LAJANG", label: "Lajang" },
                { value: "MENIKAH", label: "Menikah" },
              ]}
              required
            />
            <SelectField
              label="2. Status Pekerjaan"
              value={currentWork.employmentStatus}
              onChange={(v) => setCurrentWork({ ...currentWork, employmentStatus: v })}
              options={[
                { value: "PEGAWAI TETAP", label: "Pegawai Tetap" },
                { value: "PEGAWAI HONORER", label: "Pegawai Honorer" },
                { value: "PNS", label: "PNS / ASN" },
                { value: "WIRASWASTA", label: "Wiraswasta / Wirausaha" },
                { value: "BELUM BEKERJA", label: "Belum Bekerja" },
              ]}
              required
            />
            <Field
              label="3. Institusi / Perusahaan"
              value={currentWork.institution}
              onChange={(v) => setCurrentWork({ ...currentWork, institution: v })}
              placeholder="PT / CV / Lembaga"
              required
            />
            <Field
              label="4. Jabatan Saat Ini"
              value={currentWork.position}
              onChange={(v) => setCurrentWork({ ...currentWork, position: v })}
              placeholder="Staff / Supervisor / Manager"
              required
            />
            <Field
              label="5. Telepon Kantor"
              value={currentWork.officePhone}
              onChange={(v) => setCurrentWork({ ...currentWork, officePhone: v })}
              placeholder="0411-xxxx"
              uppercase={false}
            />
            <Field
              label="6. Email Kantor"
              type="email"
              value={currentWork.officeEmail}
              onChange={(v) => setCurrentWork({ ...currentWork, officeEmail: v })}
              placeholder="kantor@perusahaan.com"
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Field
              label="7. Alamat Lengkap Kantor / Usaha"
              value={currentWork.officeAddress}
              onChange={(v) => setCurrentWork({ ...currentWork, officeAddress: v })}
              placeholder="Jl. ... Kota ..."
              required
            />
          </div>
        </div>
      </div>

      {/* ── BAGIAN II & III (2 KOLOM SEJAJAR DI DESKTOP) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Bagian II: Pendidikan Formal */}
        <div style={sectionCard}>
          <SectionHeader
            kicker="Bagian II • Pendidikan Formal"
            title="Riwayat Pendidikan Formal"
            badge={`${formalEducation.length} Riwayat`}
          />
          <div style={{ padding: "18px 20px" }}>
            {formalEducation.map((item, index) => (
              <div key={index} style={entryCard}>
                {formalEducation.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormalEducation((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}]))
                    }
                    style={removeButton}
                  >
                    ✕ Hapus
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <SelectField
                    label="Jenjang"
                    required
                    value={item.level}
                    onChange={(v) => updateArray(setFormalEducation, index, "level", v)}
                    options={[
                      { value: "SMA/SMK", label: "SMA / SMK / MA" },
                      { value: "D1", label: "Diploma 1 (D1)" },
                      { value: "D2", label: "Diploma 2 (D2)" },
                      { value: "D3", label: "Diploma 3 (D3)" },
                      { value: "D4/S1", label: "D4 / S1 (Pindahan)" },
                      { value: "S2", label: "Magister (S2)" },
                    ]}
                  />
                  <Field
                    label="Nama Sekolah / Kampus"
                    required
                    value={item.institution}
                    onChange={(v) => updateArray(setFormalEducation, index, "institution", v)}
                    placeholder="Nama institusi"
                  />
                  <Field
                    label="Jurusan / Program Studi"
                    required
                    value={item.major}
                    onChange={(v) => updateArray(setFormalEducation, index, "major", v)}
                    placeholder="Jurusan"
                  />
                  <Field
                    label="Tahun Lulus"
                    required
                    type="number"
                    value={item.graduationYear}
                    onChange={(v) => updateArray(setFormalEducation, index, "graduationYear", v)}
                    placeholder="YYYY"
                    uppercase={false}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormalEducation((prev) => [...prev, {}])}
              style={addButton}
            >
              <span>+</span> <span>Tambah Riwayat Pendidikan</span>
            </button>
          </div>
        </div>

        {/* Bagian III: Riwayat Pekerjaan */}
        <div style={sectionCard}>
          <SectionHeader
            kicker="Bagian III • Pengalaman Kerja"
            title="Riwayat Pengalaman Kerja"
            badge={`${workExperience.length} Riwayat`}
          />
          <div style={{ padding: "18px 20px" }}>
            {workExperience.map((item, index) => (
              <div key={index} style={entryCard}>
                {workExperience.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setWorkExperience((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}]))
                    }
                    style={removeButton}
                  >
                    ✕ Hapus
                  </button>
                )}
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    <Field
                      label="Perusahaan / Institusi"
                      required
                      value={item.company}
                      onChange={(v) => updateArray(setWorkExperience, index, "company", v)}
                      placeholder="Nama perusahaan"
                    />
                    <Field
                      label="Alamat Perusahaan"
                      required
                      value={item.companyAddress}
                      onChange={(v) => updateArray(setWorkExperience, index, "companyAddress", v)}
                      placeholder="Kota / Alamat"
                    />
                    <Field
                      label="Jabatan / Peran"
                      required
                      value={item.position}
                      onChange={(v) => updateArray(setWorkExperience, index, "position", v)}
                      placeholder="Posisi kerja"
                    />
                    <Field
                      label="Mulai (Bln/Thn)"
                      required
                      value={item.startDate || item.startYear}
                      onChange={(v) => updateArray(setWorkExperience, index, "startDate", v)}
                      placeholder="01/2020"
                    />
                    <Field
                      label="Selesai (Bln/Thn)"
                      required
                      value={item.endDate || item.endYear}
                      onChange={(v) => updateArray(setWorkExperience, index, "endDate", v)}
                      placeholder="SEKARANG"
                    />
                  </div>
                  <TextArea
                    label="Uraian Tugas & Tanggung Jawab Utama"
                    value={item.description}
                    onChange={(v) => updateArray(setWorkExperience, index, "description", v)}
                    placeholder="Jelaskan peran kerja dan kontribusi yang relevan dengan capaian pembelajaran..."
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setWorkExperience((prev) => [...prev, {}])}
              style={addButton}
            >
              <span>+</span> <span>Tambah Pengalaman Kerja</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BAGIAN IV & V (2 KOLOM SEJAJAR DI DESKTOP) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Bagian IV: Pelatihan & Kursus */}
        <div style={sectionCard}>
          <SectionHeader
            kicker="Bagian IV • Pelatihan Profesional"
            title="Pelatihan & Kursus Profesional"
            badge={`${trainings.length} Sertifikat`}
          />
          <div style={{ padding: "18px 20px" }}>
            {trainings.map((item, index) => (
              <div key={index} style={entryCard}>
                {trainings.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTrainings((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}]))
                    }
                    style={removeButton}
                  >
                    ✕ Hapus
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <Field
                    label="Nama Pelatihan / Kursus"
                    value={item.name}
                    onChange={(v) => updateArray(setTrainings, index, "name", v)}
                    placeholder="Nama sertifikasi/pelatihan"
                  />
                  <Field
                    label="Penyelenggara"
                    value={item.organizer}
                    onChange={(v) => updateArray(setTrainings, index, "organizer", v)}
                    placeholder="Lembaga penerbit"
                  />
                  <Field
                    label="Tahun"
                    type="number"
                    value={item.year}
                    onChange={(v) => updateArray(setTrainings, index, "year", v)}
                    placeholder="YYYY"
                    uppercase={false}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTrainings((prev) => [...prev, {}])}
              style={addButton}
            >
              <span>+</span> <span>Tambah Pelatihan</span>
            </button>
          </div>
        </div>

        {/* Bagian V: Konferensi & Seminar */}
        <div style={sectionCard}>
          <SectionHeader
            kicker="Bagian V • Seminar & Lokakarya"
            title="Konferensi, Seminar & Lokakarya"
            badge={`${conferences.length} Kegiatan`}
          />
          <div style={{ padding: "18px 20px" }}>
            {conferences.map((item, index) => (
              <div key={index} style={entryCard}>
                {conferences.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setConferences((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}]))
                    }
                    style={removeButton}
                  >
                    ✕ Hapus
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <Field
                    label="Judul Kegiatan"
                    value={item.title}
                    onChange={(v) => updateArray(setConferences, index, "title", v)}
                    placeholder="Tema seminar"
                  />
                  <Field
                    label="Penyelenggara"
                    value={item.organizer}
                    onChange={(v) => updateArray(setConferences, index, "organizer", v)}
                    placeholder="Institusi"
                  />
                  <Field
                    label="Tahun"
                    type="number"
                    value={item.year}
                    onChange={(v) => updateArray(setConferences, index, "year", v)}
                    placeholder="YYYY"
                    uppercase={false}
                  />
                  <SelectField
                    label="Peran / Status"
                    value={item.status}
                    onChange={(v) => updateArray(setConferences, index, "status", v)}
                    options={[
                      { value: "PESERTA", label: "Peserta" },
                      { value: "PANITIA", label: "Panitia" },
                      { value: "PEMBICARA", label: "Narasumber / Pembicara" },
                    ]}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setConferences((prev) => [...prev, {}])}
              style={addButton}
            >
              <span>+</span> <span>Tambah Seminar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BAGIAN VI & VII (2 KOLOM SEJAJAR DI DESKTOP) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Bagian VI: Prestasi & Penghargaan */}
        <div style={sectionCard}>
          <SectionHeader
            kicker="Bagian VI • Prestasi & Penghargaan"
            title="Prestasi & Penghargaan"
            badge={`${achievements.length} Prestasi`}
          />
          <div style={{ padding: "18px 20px" }}>
            {achievements.map((item, index) => (
              <div key={index} style={entryCard}>
                {achievements.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setAchievements((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}]))
                    }
                    style={removeButton}
                  >
                    ✕ Hapus
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <Field
                    label="Bentuk Penghargaan"
                    value={item.name}
                    onChange={(v) => updateArray(setAchievements, index, "name", v)}
                    placeholder="Juara / Best Employee"
                  />
                  <Field
                    label="Lembaga Pemberi"
                    value={item.issuer}
                    onChange={(v) => updateArray(setAchievements, index, "issuer", v)}
                    placeholder="Perusahaan / Dinas"
                  />
                  <Field
                    label="Tahun"
                    type="number"
                    value={item.year}
                    onChange={(v) => updateArray(setAchievements, index, "year", v)}
                    placeholder="YYYY"
                    uppercase={false}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAchievements((prev) => [...prev, {}])}
              style={addButton}
            >
              <span>+</span> <span>Tambah Penghargaan</span>
            </button>
          </div>
        </div>

        {/* Bagian VII: Pengalaman Organisasi */}
        <div style={sectionCard}>
          <SectionHeader
            kicker="Bagian VII • Pengalaman Organisasi"
            title="Pengalaman Organisasi & Komunitas"
            badge={`${organizations.length} Organisasi`}
          />
          <div style={{ padding: "18px 20px" }}>
            {organizations.map((item, index) => (
              <div key={index} style={entryCard}>
                {organizations.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setOrganizations((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}]))
                    }
                    style={removeButton}
                  >
                    ✕ Hapus
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <Field
                    label="Nama Organisasi / Komunitas"
                    value={item.name}
                    onChange={(v) => updateArray(setOrganizations, index, "name", v)}
                    placeholder="Asosiasi / Komunitas"
                  />
                  <Field
                    label="Jabatan / Peran"
                    value={item.position}
                    onChange={(v) => updateArray(setOrganizations, index, "position", v)}
                    placeholder="Ketua / Anggota"
                  />
                  <Field
                    label="Tahun Mulai"
                    type="number"
                    value={item.startYear}
                    onChange={(v) => updateArray(setOrganizations, index, "startYear", v)}
                    placeholder="YYYY"
                    uppercase={false}
                  />
                  <Field
                    label="Tahun Selesai"
                    value={item.endYear}
                    onChange={(v) => updateArray(setOrganizations, index, "endYear", v)}
                    placeholder="YYYY / SEKARANG"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOrganizations((prev) => [...prev, {}])}
              style={addButton}
            >
              <span>+</span> <span>Tambah Organisasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SUBMIT BUTTON & NEXT STEP NAVIGATION ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {errorMessage && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              background: "var(--md-error-container)",
              color: "var(--md-error)",
              border: "1px solid var(--md-error)",
              textAlign: "center",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: savedSuccess ? "var(--md-success)" : "var(--md-primary)",
            color: "var(--md-on-primary)",
            border: "none",
            borderRadius: 999,
            padding: "12px 24px",
            fontSize: 13.5,
            fontWeight: 800,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 14px var(--theme-glow)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <span>Menyimpan Data Riwayat Hidup...</span>
          ) : savedSuccess ? (
            <span>✓ SELURUH DATA CV & RIWAYAT HIDUP BERHASIL TERSIMPAN</span>
          ) : (
            <span>SIMPAN SELURUH DATA CV & RIWAYAT HIDUP (F-07) &rarr;</span>
          )}
        </button>

        {savedSuccess && (
          <Link
            href="/dashboard/mahasiswa/f02"
            style={{
              width: "100%",
              background: "var(--md-surface-1)",
              color: "var(--md-primary)",
              border: "1.5px solid var(--md-primary)",
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 12.5,
              fontWeight: 800,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.18s ease",
            }}
          >
            <span>LANJUT KE FORMULIR APLIKASI RPL (F-02) &rarr;</span>
          </Link>
        )}
      </div>
    </form>
  );
}
