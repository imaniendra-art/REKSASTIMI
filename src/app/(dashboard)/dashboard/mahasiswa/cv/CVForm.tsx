"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveCVData } from "./actions";

/* ── Shared style helpers ── */
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "2px solid #cbd5e1",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--md-on-surface)",
  outline: "none",
  transition: "border 200ms, box-shadow 200ms, background 200ms",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--md-on-surface-variant)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const sectionCard = (color: string): React.CSSProperties => ({
  background: "var(--md-surface)",
  borderRadius: 16,
  padding: "20px 20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  border: "1px solid var(--md-outline-variant)",
  position: "relative",
  overflow: "hidden",
  borderLeft: `5px solid ${color}`,
});

const entryCard: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  position: "relative",
};

const addButton: React.CSSProperties = {
  background: "#eff6ff",
  color: "#1a56db",
  border: "1.5px dashed #93c5fd",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 4,
};

const removeButton: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: 9,
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
        {required ? <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span> : null}
      </label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputBase} />
    </div>
  );
}

function SelectField({ label, value, onChange, required, options }: any) {
  return (
    <div>
      <label style={labelBase}>
        {label}
        {required ? <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span> : null}
      </label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, cursor: "pointer" }}>
        <option value="" disabled>Pilih</option>
        {options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputBase, resize: "vertical" }} />
    </div>
  );
}

function SectionTitle({ n, title, subtitle, color }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 900, color, textTransform: "uppercase", letterSpacing: "0.1em" }}>Bagian {n}</p>
      <h2 style={{ marginTop: 2, fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)" }}>{title}</h2>
      {subtitle ? <p style={{ marginTop: 2, fontSize: 11, color: "var(--md-on-surface-variant)", fontWeight: 700 }}>{subtitle}</p> : null}
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
              HAPUS
            </button>
          ) : null}
          {render(item, index)}
        </div>
      ))}
      <button type="button" onClick={() => setter((prev: any[]) => [...prev, {}])} style={addButton}>
        {addLabel}
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
      setMessage({ type: "success", text: "CV Riwayat Hidup berhasil disimpan. Mengalihkan ke dashboard..." });
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {message.text ? (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 800,
            background: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1.5px solid ${message.type === "success" ? "#34d399" : "#f87171"}`,
          }}
        >
          {message.text}
        </div>
      ) : null}

      <div style={sectionCard("#1a56db")}>
        <SectionTitle n="I" title="Identitas Pekerjaan Saat Ini" subtitle="Mengikuti isian identitas F07 pada SIRESTI." color="#1a56db" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          <SelectField label="Status Pernikahan" value={currentWork.maritalStatus} onChange={(v: string) => setCurrentWork({ ...currentWork, maritalStatus: v })} options={[
            { value: "Lajang", label: "Lajang" },
            { value: "Menikah", label: "Menikah" },
          ]} />
          <SelectField label="Status Pekerjaan" value={currentWork.employmentStatus} onChange={(v: string) => setCurrentWork({ ...currentWork, employmentStatus: v })} options={[
            { value: "Pegawai Tetap", label: "Pegawai Tetap" },
            { value: "Pegawai Honorer", label: "Pegawai Honorer" },
            { value: "PNS", label: "PNS" },
            { value: "Wiraswasta", label: "Wiraswasta" },
            { value: "Belum Bekerja", label: "Belum Bekerja" },
          ]} />
          <Field label="Institusi / Perusahaan" value={currentWork.institution} onChange={(v: string) => setCurrentWork({ ...currentWork, institution: v })} />
          <Field label="Jabatan Saat Ini" value={currentWork.position} onChange={(v: string) => setCurrentWork({ ...currentWork, position: v })} />
          <Field label="Telepon Kantor" value={currentWork.officePhone} onChange={(v: string) => setCurrentWork({ ...currentWork, officePhone: v })} />
          <Field label="Email Kantor" type="email" value={currentWork.officeEmail} onChange={(v: string) => setCurrentWork({ ...currentWork, officeEmail: v })} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Field label="Alamat Kantor" value={currentWork.officeAddress} onChange={(v: string) => setCurrentWork({ ...currentWork, officeAddress: v })} placeholder="Jl. ... Kota ..." />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ArraySection n="II" title="Riwayat Pendidikan" color="#059669" items={formalEducation} setter={setFormalEducation} addLabel="Tambah Pendidikan" render={(item: any, index: number) => (
            <CompactGrid>
              <SelectField label="Jenjang" required value={item.level} onChange={(v: string) => updateArray(setFormalEducation, index, "level", v)} options={[{ value: "SMA/SMK", label: "SMA/SMK" }, { value: "D1", label: "D1" }, { value: "D2", label: "D2" }, { value: "D3", label: "D3" }, { value: "D4/S1", label: "D4/S1" }, { value: "S2", label: "S2" }]} />
              <Field label="Nama Sekolah / Kampus" required value={item.institution} onChange={(v: string) => updateArray(setFormalEducation, index, "institution", v)} />
              <Field label="Jurusan" required value={item.major} onChange={(v: string) => updateArray(setFormalEducation, index, "major", v)} />
              <Field label="Tahun Lulus" required type="number" value={item.graduationYear} onChange={(v: string) => updateArray(setFormalEducation, index, "graduationYear", v)} />
            </CompactGrid>
          )} />

          <ArraySection n="III" title="Riwayat Pekerjaan" color="#d97706" items={workExperience} setter={setWorkExperience} addLabel="Tambah Pekerjaan" render={(item: any, index: number) => (
            <div style={{ display: "grid", gap: 16 }}>
              <CompactGrid>
                <Field label="Nama Perusahaan / Institusi" required value={item.company} onChange={(v: string) => updateArray(setWorkExperience, index, "company", v)} />
                <Field label="Alamat Perusahaan" required value={item.companyAddress} onChange={(v: string) => updateArray(setWorkExperience, index, "companyAddress", v)} />
                <Field label="Jabatan" required value={item.position} onChange={(v: string) => updateArray(setWorkExperience, index, "position", v)} />
                <Field label="Masuk (tgl/bln/th)" required value={item.startDate || item.startYear} onChange={(v: string) => updateArray(setWorkExperience, index, "startDate", v)} placeholder="01/05/2020" />
                <Field label="Keluar (tgl/bln/th)" required value={item.endDate || item.endYear} onChange={(v: string) => updateArray(setWorkExperience, index, "endDate", v)} placeholder="01/12/2023 / Sekarang" />
              </CompactGrid>
              <TextArea label="Uraian Tugas Utama" value={item.description} onChange={(v: string) => updateArray(setWorkExperience, index, "description", v)} placeholder="Sebutkan tugas utama Anda..." />
            </div>
          )} />

          <ArraySection n="IV" title="Pelatihan" color="#0284c7" items={trainings} setter={setTrainings} addLabel="Tambah Pelatihan" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Nama Pelatihan" value={item.name} onChange={(v: string) => updateArray(setTrainings, index, "name", v)} />
              <Field label="Penyelenggara" value={item.organizer} onChange={(v: string) => updateArray(setTrainings, index, "organizer", v)} />
              <Field label="Tahun" type="number" value={item.year} onChange={(v: string) => updateArray(setTrainings, index, "year", v)} />
            </CompactGrid>
          )} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ArraySection n="V" title="Konferensi / Seminar" color="#f59e0b" items={conferences} setter={setConferences} addLabel="Tambah Konferensi" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Judul Kegiatan" value={item.title} onChange={(v: string) => updateArray(setConferences, index, "title", v)} />
              <Field label="Penyelenggara" value={item.organizer} onChange={(v: string) => updateArray(setConferences, index, "organizer", v)} />
              <Field label="Tahun" type="number" value={item.year} onChange={(v: string) => updateArray(setConferences, index, "year", v)} />
              <SelectField label="Status" value={item.status} onChange={(v: string) => updateArray(setConferences, index, "status", v)} options={[{ value: "Peserta", label: "Peserta" }, { value: "Panitia", label: "Panitia" }, { value: "Pembicara", label: "Pembicara" }]} />
            </CompactGrid>
          )} />

          <ArraySection n="VI" title="Penghargaan" color="#dc2626" items={achievements} setter={setAchievements} addLabel="Tambah Penghargaan" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Bentuk Penghargaan" value={item.name} onChange={(v: string) => updateArray(setAchievements, index, "name", v)} />
              <Field label="Pemberi" value={item.issuer} onChange={(v: string) => updateArray(setAchievements, index, "issuer", v)} />
              <Field label="Tahun" type="number" value={item.year} onChange={(v: string) => updateArray(setAchievements, index, "year", v)} />
            </CompactGrid>
          )} />

          <ArraySection n="VII" title="Organisasi" color="#64748b" items={organizations} setter={setOrganizations} addLabel="Tambah Organisasi" render={(item: any, index: number) => (
            <CompactGrid>
              <Field label="Nama Organisasi" value={item.name} onChange={(v: string) => updateArray(setOrganizations, index, "name", v)} />
              <Field label="Jabatan" value={item.position} onChange={(v: string) => updateArray(setOrganizations, index, "position", v)} />
              <Field label="Tahun Mulai" type="number" value={item.startYear} onChange={(v: string) => updateArray(setOrganizations, index, "startYear", v)} />
              <Field label="Tahun Selesai" value={item.endYear} onChange={(v: string) => updateArray(setOrganizations, index, "endYear", v)} />
            </CompactGrid>
          )} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #1a56db, #6366f1)",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px 24px",
          fontSize: 15,
          fontWeight: 900,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 6px 20px rgba(26,86,219,0.3)",
        }}
      >
        {loading ? "Menyimpan..." : "SIMPAN CV & RIWAYAT"}
      </button>
    </form>
  );

}
