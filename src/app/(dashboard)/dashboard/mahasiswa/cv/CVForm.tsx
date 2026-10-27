"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveCVData } from "./actions";

/* ── Shared style helpers ── */
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--md-surface-1)",
  border: "1px solid var(--md-outline)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--md-on-surface)",
  outline: "none",
  transition: "all 0.18s ease",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 800,
  color: "var(--md-on-surface-variant)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const sectionCard = (color: string): React.CSSProperties => ({
  background: "var(--md-surface-1)",
  borderRadius: 18,
  padding: "22px 24px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
  border: "1px solid var(--md-outline-variant)",
  position: "relative",
  overflow: "hidden",
  borderLeft: `5px solid ${color}`,
});

const entryCard: React.CSSProperties = {
  background: "var(--md-surface-2)",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 14,
  padding: 16,
  marginBottom: 12,
  position: "relative",
};

const addButton: React.CSSProperties = {
  background: "var(--md-primary-container)",
  color: "var(--md-primary)",
  border: "1px dashed var(--md-primary)",
  borderRadius: 10,
  padding: "8px 14px",
  fontSize: 11.5,
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 4,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const removeButton: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "var(--md-error-container)",
  color: "var(--md-error)",
  border: "none",
  borderRadius: 6,
  padding: "3px 8px",
  fontSize: 10,
  fontWeight: 900,
  cursor: "pointer",
};

function cleanRows(rows: any[]) {
  return rows.filter((row) => Object.values(row || {}).some((value) => String(value ?? "").trim()));
}

function Field({ label, value, onChange, required, type = "text", placeholder }: any) {
  return (
    <div>
      <label style={labelBase}>
        {label}
        {required ? <span style={{ color: "var(--md-error)", marginLeft: 2 }}>*</span> : null}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputBase}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, required, options }: any) {
  return (
    <div>
      <label style={labelBase}>
        {label}
        {required ? <span style={{ color: "var(--md-error)", marginLeft: 2 }}>*</span> : null}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, cursor: "pointer" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <option value="" disabled style={{ color: "var(--md-on-surface-variant)" }}>-- Pilih --</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ ...inputBase, resize: "vertical" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function SectionTitle({ n, title, subtitle, color }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 900, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Bagian {n}</p>
      <h2 style={{ marginTop: 2, fontSize: 15.5, fontWeight: 900, color: "var(--md-on-surface)" }}>{title}</h2>
      {subtitle ? <p style={{ marginTop: 2, fontSize: 11.5, color: "var(--md-on-surface-variant)", fontWeight: 600 }}>{subtitle}</p> : null}
    </div>
  );
}

function CompactGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
      {children}
    </div>
  );
}

function ArraySection({ n, title, color, items, setter, addLabel, render }: any) {
  return (
    <div style={sectionCard(color)}>
      <SectionTitle n={n} title={title} color={color} />
      {items.map((item: any, index: number) => (
        <div key={index} style={entryCard}>
          {items.length > 1 ? (
            <button type="button" onClick={() => setter((prev: any[]) => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{}])} style={removeButton}>
              ✕ Hapus
            </button>
          ) : null}
          {render(item, index)}
        </div>
      ))}
      <button type="button" onClick={() => setter((prev: any[]) => [...prev, {}])} style={addButton}>
        <span>+</span> <span>{addLabel}</span>
      </button>
    </div>
  );
}

export default function CVForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const cv = initialData?.cv || {};
  const work = initialData?.work || {};

  const [currentWork, setCurrentWork] = useState({
    maritalStatus: cv.currentWork?.maritalStatus || work.maritalStatus || "",
    employmentStatus: cv.currentWork?.employmentStatus || work.employmentStatus || "",
    institution: cv.currentWork?.institution || work.institution || "",
    position: cv.currentWork?.position || work.position || "",
    officeAddress: cv.currentWork?.officeAddress || work.officeAddress || "",
    officePhone: cv.currentWork?.officePhone || work.officePhone || "",
    officeEmail: cv.currentWork?.officeEmail || work.officeEmail || "",
  });
  const [formalEducation, setFormalEducation] = useState<any[]>(cv.formalEducation?.length ? cv.formalEducation : [{}]);
  const [workExperience, setWorkExperience] = useState<any[]>(cv.workExperience?.length ? cv.workExperience : [{}]);
  const [trainings, setTrainings] = useState<any[]>(
    cv.trainings?.length ? cv.trainings : cv.nonFormalEducation?.length ? cv.nonFormalEducation : [{}]
  );
  const [conferences, setConferences] = useState<any[]>(cv.conferences?.length ? cv.conferences : [{}]);
  const [achievements, setAchievements] = useState<any[]>(cv.achievements?.length ? cv.achievements : [{}]);
  const [organizations, setOrganizations] = useState<any[]>(cv.organizations?.length ? cv.organizations : [{}]);

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
    setMessage({ type: "", text: "" });

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
      setMessage({ type: "success", text: "CV Riwayat Hidup (F-07) berhasil disimpan. Mengalihkan ke dashboard..." });
      setTimeout(() => {
        router.push("/dashboard/mahasiswa");
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan CV." });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24 }}>
      {message.text ? (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            fontSize: 12.5,
            fontWeight: 800,
            background: message.type === "success" ? "var(--md-success-container)" : "var(--md-error-container)",
            color: message.type === "success" ? "var(--md-success)" : "var(--md-error)",
            border: `1.5px solid ${message.type === "success" ? "var(--md-success)" : "var(--md-error)"}`,
          }}
        >
          {message.text}
        </div>
      ) : null}

      {/* Bagian I: Pekerjaan Saat Ini */}
      <div style={sectionCard("var(--md-primary)")}>
        <SectionTitle n="I" title="Identitas Pekerjaan Saat Ini" subtitle="Data tempat kerja atau aktivitas usaha calon mahasiswa saat ini." color="var(--md-primary)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          <SelectField label="Status Pernikahan" value={currentWork.maritalStatus} onChange={(v: string) => setCurrentWork({ ...currentWork, maritalStatus: v })} options={[
            { value: "Lajang", label: "Lajang" },
            { value: "Menikah", label: "Menikah" },
          ]} />
          <SelectField label="Status Pekerjaan" value={currentWork.employmentStatus} onChange={(v: string) => setCurrentWork({ ...currentWork, employmentStatus: v })} options={[
            { value: "Pegawai Tetap", label: "Pegawai Tetap" },
            { value: "Pegawai Honorer", label: "Pegawai Honorer" },
            { value: "PNS", label: "PNS / ASN" },
            { value: "Wiraswasta", label: "Wiraswasta / Wirausaha" },
            { value: "Belum Bekerja", label: "Belum Bekerja" },
          ]} />
          <Field label="Institusi / Perusahaan" value={currentWork.institution} onChange={(v: string) => setCurrentWork({ ...currentWork, institution: v })} placeholder="PT / CV / Lembaga" />
          <Field label="Jabatan Saat Ini" value={currentWork.position} onChange={(v: string) => setCurrentWork({ ...currentWork, position: v })} placeholder="Staff / Supervisor / Manager" />
          <Field label="Telepon Kantor" value={currentWork.officePhone} onChange={(v: string) => setCurrentWork({ ...currentWork, officePhone: v })} placeholder="0411-xxxx" />
          <Field label="Email Kantor" type="email" value={currentWork.officeEmail} onChange={(v: string) => setCurrentWork({ ...currentWork, officeEmail: v })} placeholder="kantor@perusahaan.com" />
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Alamat Kantor" value={currentWork.officeAddress} onChange={(v: string) => setCurrentWork({ ...currentWork, officeAddress: v })} placeholder="Jl. ... Kota ..." />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Bagian II: Pendidikan Formal */}
          <ArraySection n="II" title="Riwayat Pendidikan Formal" color="var(--md-success)" items={formalEducation} setter={setFormalEducation} addLabel="Tambah Riwayat Pendidikan" render={(item: any, index: number) => (
            <CompactGrid>
              <SelectField label="Jenjang" required value={item.level} onChange={(v: string) => updateArray(setFormalEducation, index, "level", v)} options={[{ value: "SMA/SMK", label: "SMA / SMK / MA" }, { value: "D1", label: "Diploma 1 (D1)" }, { value: "D2", label: "Diploma 2 (D2)" }, { value: "D3", label: "Diploma 3 (D3)" }, { value: "D4/S1", label: "D4 / S1 (Pindahan)" }, { value: "S2", label: "Magister (S2)" }]} />
              <Field label="Nama Sekolah / Kampus" required value={item.institution} onChange={(v: string) => updateArray(setFormalEducation, index, "institution", v)} placeholder="Nama institusi" />
              <Field label="Jurusan / Program Studi" required value={item.major} onChange={(v: string) => updateArray(setFormalEducation, index, "major", v)} placeholder="Jurusan" />
              <Field label="Tahun Lulus" required type="number" value={item.graduationYear} onChange={(v: string) => updateArray(setFormalEducation, index, "graduationYear", v)} placeholder="YYYY" />
            </CompactGrid>
          )} />

          {/* Bagian III: Riwayat Pekerjaan */}
          <ArraySection n="III" title="Riwayat Pengalaman Kerja" color="var(--md-warning)" items={workExperience} setter={setWorkExperience} addLabel="Tambah Pengalaman Kerja" render={(item: any, index: number) => (
            <div style={{ display: "grid", gap: 12 }}>
              <CompactGrid>
                <Field label="Nama Perusahaan / Institusi" required value={item.company} onChange={(v: string) => updateArray(setWorkExperience, index, "company", v)} />
                <Field label="Alamat Perusahaan" required value={item.companyAddress} onChange={(v: string) => updateArray(setWorkExperience, index, "companyAddress", v)} />
                <Field label="Jabatan" required value={item.position} onChange={(v: string) => updateArray(setWorkExperience, index, "position", v)} />
                <Field label="Mulai (Bln/Thn)" required value={item.startDate || item.startYear} onChange={(v: string) => updateArray(setWorkExperience, index, "startDate", v)} placeholder="01/2020" />
                <Field label="Selesai (Bln/Thn)" required value={item.endDate || item.endYear} onChange={(v: string) => updateArray(setWorkExperience, index, "endDate", v)} placeholder="12/2023 / Sekarang" />
              </CompactGrid>
              <TextArea label="Uraian Tugas & Tanggung Jawab Utama" value={item.description} onChange={(v: string) => updateArray(setWorkExperience, index, "description", v)} placeholder="Jelaskan peran kerja dan kontribusi yang relevan dengan capaian pembelajaran mata kuliah..." />
            </div>
          )} />

          {/* Bagian IV: Pelatihan */}
          <ArraySection n="IV" title="Pelatihan & Kursus Profesional" color="var(--md-info)" items={trainings} setter={setTrainings} addLabel="Tambah Pelatihan" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Nama Pelatihan / Kursus" value={item.name} onChange={(v: string) => updateArray(setTrainings, index, "name", v)} placeholder="Nama sertifikasi/pelatihan" />
              <Field label="Penyelenggara" value={item.organizer} onChange={(v: string) => updateArray(setTrainings, index, "organizer", v)} placeholder="Lembaga penerbit" />
              <Field label="Tahun" type="number" value={item.year} onChange={(v: string) => updateArray(setTrainings, index, "year", v)} placeholder="YYYY" />
            </CompactGrid>
          )} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Bagian V: Konferensi */}
          <ArraySection n="V" title="Konferensi, Seminar & Lokakarya" color="var(--md-secondary)" items={conferences} setter={setConferences} addLabel="Tambah Seminar" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Judul Kegiatan" value={item.title} onChange={(v: string) => updateArray(setConferences, index, "title", v)} placeholder="Tema seminar" />
              <Field label="Penyelenggara" value={item.organizer} onChange={(v: string) => updateArray(setConferences, index, "organizer", v)} placeholder="Institusi" />
              <Field label="Tahun" type="number" value={item.year} onChange={(v: string) => updateArray(setConferences, index, "year", v)} placeholder="YYYY" />
              <SelectField label="Peran / Status" value={item.status} onChange={(v: string) => updateArray(setConferences, index, "status", v)} options={[{ value: "Peserta", label: "Peserta" }, { value: "Panitia", label: "Panitia" }, { value: "Pembicara", label: "Narasumber / Pembicara" }]} />
            </CompactGrid>
          )} />

          {/* Bagian VI: Penghargaan */}
          <ArraySection n="VI" title="Prestasi & Penghargaan" color="var(--md-error)" items={achievements} setter={setAchievements} addLabel="Tambah Penghargaan" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Bentuk Penghargaan" value={item.name} onChange={(v: string) => updateArray(setAchievements, index, "name", v)} placeholder="Juara / Best Employee" />
              <Field label="Lembaga Pemberi" value={item.issuer} onChange={(v: string) => updateArray(setAchievements, index, "issuer", v)} placeholder="Perusahaan / Dinas" />
              <Field label="Tahun" type="number" value={item.year} onChange={(v: string) => updateArray(setAchievements, index, "year", v)} placeholder="YYYY" />
            </CompactGrid>
          )} />

          {/* Bagian VII: Organisasi */}
          <ArraySection n="VII" title="Pengalaman Organisasi" color="var(--md-on-surface-variant)" items={organizations} setter={setOrganizations} addLabel="Tambah Organisasi" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Nama Organisasi / Komunitas" value={item.name} onChange={(v: string) => updateArray(setOrganizations, index, "name", v)} placeholder="Asosiasi / Komunitas" />
              <Field label="Jabatan / Peran" value={item.position} onChange={(v: string) => updateArray(setOrganizations, index, "position", v)} placeholder="Ketua / Anggota" />
              <Field label="Tahun Mulai" type="number" value={item.startYear} onChange={(v: string) => updateArray(setOrganizations, index, "startYear", v)} placeholder="YYYY" />
              <Field label="Tahun Selesai" value={item.endYear} onChange={(v: string) => updateArray(setOrganizations, index, "endYear", v)} placeholder="YYYY / Sekarang" />
            </CompactGrid>
          )} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "var(--md-primary)",
          color: "var(--md-on-primary)",
          border: "none",
          borderRadius: 999,
          padding: "15px 24px",
          fontSize: 14,
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 4px 16px var(--theme-glow)",
          transition: "all 0.18s ease",
          marginTop: 10,
        }}
      >
        {loading ? "Menyimpan Data Riwayat Hidup..." : "Simpan CV & Riwayat Hidup (F-07) →"}
      </button>
    </form>
  );
}
