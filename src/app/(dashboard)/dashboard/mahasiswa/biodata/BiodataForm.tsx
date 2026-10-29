"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveBiodata } from "./actions";
import { compressImageIfNeeded } from "@/lib/image-compressor";

/* ── Compact Style Helpers ── */
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

export default function BiodataForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [compressing, setCompressing] = useState<Record<string, boolean>>({});

  const ident = initialData?.identity || {};
  const cont = initialData?.contact || {};

  const formattedDateOfBirth = ident.dateOfBirth
    ? new Date(ident.dateOfBirth).toISOString().split("T")[0]
    : "1998-05-15";

  const normalizeReligion = (val?: string) => {
    if (!val) return "ISLAM";
    const u = val.toUpperCase();
    if (u.includes("KRISTEN")) return "KRISTEN";
    if (u.includes("KATOLIK")) return "KATOLIK";
    if (u.includes("HINDU")) return "HINDU";
    if (u.includes("BUDHA")) return "BUDHA";
    if (u.includes("KONGHUCU")) return "KONGHUCU";
    return "ISLAM";
  };

  const normalizeCitizenship = (val?: string) => {
    if (!val) return "WNI";
    const u = val.toUpperCase();
    if (u === "WNA" || u.includes("ASING")) return "WNA";
    return "WNI";
  };

  // State terkontrol: Semua kolom terisi dan otomatis UPPERCASE
  const [formValues, setFormValues] = useState({
    nama_lengkap: (ident.fullName || "MAHASISWA RPL").toUpperCase(),
    tempat_lahir: (ident.placeOfBirth || "MAKASSAR").toUpperCase(),
    tanggal_lahir: formattedDateOfBirth,
    jenis_kelamin: (ident.gender || "L").toUpperCase(),
    nik: ident.nik || "7371141901920001",
    nisn: ident.nisn || "0008999121",
    nama_ibu: (ident.motherName || "IBU KANDUNG").toUpperCase(),
    agama: normalizeReligion(ident.religion),
    alamat: (cont.address || "JL. PERINTIS KEMERDEKAAN KM. 10").toUpperCase(),
    kelurahan: (cont.village || "TAMALANREA").toUpperCase(),
    kecamatan: (cont.district || "TAMALANREA").toUpperCase(),
    kewarganegaraan: normalizeCitizenship(ident.citizenship),
    email: (cont.email || "MAHASISWA@STIMI.AC.ID").toUpperCase(),
    no_hp: cont.phone || "081234567890",
  });

  const handleInputChange = (field: keyof typeof formValues, val: string, toUpper = true) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: toUpper ? val.toUpperCase() : val,
    }));
  };

  const docs = initialData?.documents || [];
  const getDoc = (type: string) => docs.find((d: any) => d.type === type);
  const isUploaded = (type: string) => Boolean(getDoc(type)?.fileUrl || selectedFiles[type]);

  const docKeys = ["kk", "ktp", "akta", "ijazah", "pendukung", "ttd"];
  const docsUploadedCount = docKeys.filter(isUploaded).length;

  const handleFileChange = async (docType: string, file: File | null) => {
    if (!file) return;

    setCompressing((prev) => ({ ...prev, [docType]: true }));
    try {
      const processed = await compressImageIfNeeded(file);
      setSelectedFiles((prev) => ({ ...prev, [docType]: processed }));

      if (processed.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(processed);
        setPreviewUrls((prev) => ({ ...prev, [docType]: objectUrl }));
      } else {
        setPreviewUrls((prev) => {
          const next = { ...prev };
          delete next[docType];
          return next;
        });
      }
    } catch (err) {
      console.error("Compression error:", err);
      setSelectedFiles((prev) => ({ ...prev, [docType]: file }));
    } finally {
      setCompressing((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    // Sync state values to form data
    Object.entries(formValues).forEach(([k, v]) => {
      formData.set(k, v);
    });

    if (selectedFiles.kk) formData.set("file_kk", selectedFiles.kk);
    if (selectedFiles.ktp) formData.set("file_ktp", selectedFiles.ktp);
    if (selectedFiles.akta) formData.set("file_akta", selectedFiles.akta);
    if (selectedFiles.ijazah) formData.set("file_ijazah", selectedFiles.ijazah);
    if (selectedFiles.pendukung) formData.set("file_dukung", selectedFiles.pendukung);
    if (selectedFiles.ttd) formData.set("file_ttd", selectedFiles.ttd);

    const result = await saveBiodata(formData);

    if (result.success) {
      setSavedSuccess(true);
      if (result.data?.identity) {
        setFormValues((prev) => ({
          ...prev,
          nama_lengkap: (result.data.identity.fullName || prev.nama_lengkap).toUpperCase(),
          tempat_lahir: (result.data.identity.placeOfBirth || prev.tempat_lahir).toUpperCase(),
          jenis_kelamin: (result.data.identity.gender || prev.jenis_kelamin).toUpperCase(),
          nama_ibu: (result.data.identity.motherName || prev.nama_ibu).toUpperCase(),
          nik: result.data.identity.nik || prev.nik,
          nisn: result.data.identity.nisn || prev.nisn,
          agama: normalizeReligion(result.data.identity.religion || prev.agama),
          kewarganegaraan: normalizeCitizenship(result.data.identity.citizenship || prev.kewarganegaraan),
        }));
      }
      router.refresh();
    } else {
      setErrorMessage(result.error || "Gagal menyimpan data biodata.");
    }
    setLoading(false);
  };

  /* ── Field renderers ── */
  function InputField({
    label,
    name,
    value,
    onChange,
    required,
    type = "text",
    placeholder,
    maxLength,
    minLength,
    mono,
    uppercase = true,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    mono?: boolean;
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
          name={name}
          value={value}
          onChange={(e) => {
            if (uppercase && type !== "date") {
              e.target.value = e.target.value.toUpperCase();
            }
            onChange(e);
          }}
          required={required}
          placeholder={placeholder ? placeholder.toUpperCase() : undefined}
          maxLength={maxLength}
          minLength={minLength}
          style={{
            ...inputBase,
            textTransform: uppercase && type !== "date" ? "uppercase" : "none",
            fontFamily: mono ? "monospace" : "inherit",
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
    name,
    value,
    onChange,
    required,
    options,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            ...inputBase,
            textTransform: "uppercase",
            cursor: "pointer",
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
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    );
  }

  /* ── 1-Row Compact File Card ── */
  function SingleRowFileCard({
    label,
    shortLabel,
    name,
    docType,
    accept,
    icon,
  }: {
    label: string;
    shortLabel: string;
    name: string;
    docType: string;
    accept: string;
    icon: string;
  }) {
    const uploaded = isUploaded(docType);
    const existingDoc = getDoc(docType);
    const pickedFile = selectedFiles[docType];
    const pickedPreview = previewUrls[docType];
    const isComp = compressing[docType];

    const isImageFile = (url?: string) => {
      if (!url) return false;
      return url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".webp");
    };

    const previewSrc = pickedPreview || (isImageFile(existingDoc?.fileUrl) ? existingDoc?.fileUrl : null);

    return (
      <div
        style={{
          background: "var(--md-surface-2)",
          border: pickedFile ? "1.5px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
          borderRadius: 12,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 8,
          minWidth: 0,
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--md-surface-1)",
              border: "1px solid var(--md-outline-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {previewSrc ? (
              <img src={previewSrc} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 15 }}>{icon}</span>
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              title={label}
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--md-on-surface)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {shortLabel || label}
            </p>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "1px 5px",
                borderRadius: 4,
                background: pickedFile
                  ? "var(--md-primary-container)"
                  : uploaded
                  ? "var(--md-success-container)"
                  : "var(--md-surface-1)",
                color: pickedFile
                  ? "var(--md-primary)"
                  : uploaded
                  ? "var(--md-success)"
                  : "var(--md-on-surface-variant)",
                border: "1px solid var(--md-outline-variant)",
                display: "inline-block",
                marginTop: 2,
              }}
            >
              {isComp ? "Kompres..." : pickedFile ? "File Baru" : uploaded ? "✓ Siap" : "Kosong"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, paddingTop: 4, borderTop: "1px solid var(--md-outline-variant)" }}>
          {existingDoc?.fileUrl && !pickedFile ? (
            <a
              href={existingDoc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: "var(--md-primary)", fontWeight: 700, textDecoration: "underline" }}
            >
              Lihat &rarr;
            </a>
          ) : pickedFile ? (
            <span style={{ fontSize: 9.5, color: "var(--md-primary)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 65 }}>
              {(pickedFile.size / 1024).toFixed(0)}KB
            </span>
          ) : (
            <span style={{ fontSize: 9.5, color: "var(--md-on-surface-variant)" }}>Wajib</span>
          )}

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: 800,
              color: "var(--md-primary)",
              background: "var(--md-primary-container)",
              border: "1px solid var(--md-outline-variant)",
              borderRadius: 6,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span>{uploaded || pickedFile ? "Ganti" : "Pilih"}</span>
            <input
              type="file"
              name={name}
              accept={accept}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) handleFileChange(docType, file);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <form encType="multipart/form-data" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Section 1: Data Pokok Mahasiswa (Standar Feeder PDDIKTI) ── */}
      <div style={sectionCard}>
        {/* Header Bernuansa Hijau/Mint Khas Keuangan */}
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
              Standar Neo Feeder PDDIKTI
            </p>
            <h2
              style={{
                margin: "2px 0 0",
                color: "var(--md-on-surface)",
                fontSize: 16.5,
                fontWeight: 900,
              }}
            >
              Identitas Calon Mahasiswa
            </h2>
          </div>
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
            14 Field Standar Feeder
          </div>
        </div>

        {/* Form Body dengan Padding */}
        <div style={{ padding: "20px 22px" }}>
          {/* 12-Column Responsive Proportional Grid: 4 Baris Ringkas */}
          <div className="biodata-grid-12">
            {/* Row 1: 4 Kolom -> Nama (span 4), Tempat Lahir (span 3), Tanggal Lahir (span 3), Jenis Kelamin (span 2) */}
            <div className="col-span-4" style={{ gridColumn: "span 4" }}>
              <InputField
                label="1. Nama Lengkap (KTP)"
                name="nama_lengkap"
                value={formValues.nama_lengkap}
                onChange={(e) => handleInputChange("nama_lengkap", e.target.value)}
                required
                placeholder="Nama lengkap sesuai identitas"
              />
            </div>
            <div className="col-span-3" style={{ gridColumn: "span 3" }}>
              <InputField
                label="2. Tempat Lahir"
                name="tempat_lahir"
                value={formValues.tempat_lahir}
                onChange={(e) => handleInputChange("tempat_lahir", e.target.value)}
                required
                placeholder="Kota / Kab. Lahir"
              />
            </div>
            <div className="col-span-3" style={{ gridColumn: "span 3" }}>
              <InputField
                label="3. Tanggal Lahir"
                name="tanggal_lahir"
                value={formValues.tanggal_lahir}
                onChange={(e) => handleInputChange("tanggal_lahir", e.target.value, false)}
                type="date"
                required
              />
            </div>
            <div className="col-span-2" style={{ gridColumn: "span 2" }}>
              <SelectField
                label="4. Jenis Kelamin"
                name="jenis_kelamin"
                value={formValues.jenis_kelamin}
                onChange={(e) => handleInputChange("jenis_kelamin", e.target.value)}
                required
                options={[
                  { value: "L", label: "Laki-laki (L)" },
                  { value: "P", label: "Perempuan (P)" },
                ]}
              />
            </div>

            {/* Row 2: 4 Kolom -> NIK (span 3), NISN (span 3), Nama Ibu (span 4), Agama (span 2) */}
            <div className="col-span-3" style={{ gridColumn: "span 3" }}>
              <InputField
                label="5. NIK (Nomor KTP)"
                name="nik"
                value={formValues.nik}
                onChange={(e) => handleInputChange("nik", e.target.value.replace(/\D/g, ""))}
                required
                maxLength={16}
                placeholder="16 Digit Angka NIK"
                mono
              />
            </div>
            <div className="col-span-3" style={{ gridColumn: "span 3" }}>
              <InputField
                label="6. NISN (Sekolah)"
                name="nisn"
                value={formValues.nisn}
                onChange={(e) => handleInputChange("nisn", e.target.value.replace(/\D/g, ""))}
                required
                maxLength={10}
                minLength={10}
                placeholder="10 Digit NISN"
                mono
              />
            </div>
            <div className="col-span-4" style={{ gridColumn: "span 4" }}>
              <InputField
                label="7. Nama Ibu Kandung"
                name="nama_ibu"
                value={formValues.nama_ibu}
                onChange={(e) => handleInputChange("nama_ibu", e.target.value)}
                required
                placeholder="Wajib untuk Feeder PDDIKTI"
              />
            </div>
            <div className="col-span-2" style={{ gridColumn: "span 2" }}>
              <SelectField
                label="8. Agama"
                name="agama"
                value={formValues.agama}
                onChange={(e) => handleInputChange("agama", e.target.value)}
                required
                options={[
                  { value: "ISLAM", label: "Islam" },
                  { value: "KRISTEN", label: "Kristen (Protestan)" },
                  { value: "KATOLIK", label: "Katolik" },
                  { value: "HINDU", label: "Hindu" },
                  { value: "BUDHA", label: "Budha" },
                  { value: "KONGHUCU", label: "Konghucu" },
                ]}
              />
            </div>

            {/* Row 3: 4 Kolom -> Alamat Domisili (span 5), Kelurahan (span 3), Kecamatan (span 2), Kewarganegaraan (span 2) */}
            <div className="col-span-5 full-mobile" style={{ gridColumn: "span 5" }}>
              <InputField
                label="9. Alamat Lengkap Domisili (Jalan / Dusun / RT / RW)"
                name="alamat"
                value={formValues.alamat}
                onChange={(e) => handleInputChange("alamat", e.target.value)}
                required
                placeholder="Nama Jalan, RT/RW, Dusun"
              />
            </div>
            <div className="col-span-3" style={{ gridColumn: "span 3" }}>
              <InputField
                label="10. Kelurahan / Desa"
                name="kelurahan"
                value={formValues.kelurahan}
                onChange={(e) => handleInputChange("kelurahan", e.target.value)}
                required
                placeholder="Kelurahan / Desa"
              />
            </div>
            <div className="col-span-2" style={{ gridColumn: "span 2" }}>
              <InputField
                label="11. Kecamatan"
                name="kecamatan"
                value={formValues.kecamatan}
                onChange={(e) => handleInputChange("kecamatan", e.target.value)}
                required
                placeholder="Kecamatan"
              />
            </div>
            <div className="col-span-2" style={{ gridColumn: "span 2" }}>
              <SelectField
                label="12. Kewarganegaraan"
                name="kewarganegaraan"
                value={formValues.kewarganegaraan}
                onChange={(e) => handleInputChange("kewarganegaraan", e.target.value)}
                required
                options={[
                  { value: "WNI", label: "WNI" },
                  { value: "WNA", label: "WNA" },
                ]}
              />
            </div>

            {/* Row 4: 2 Kolom Sejajar -> Email Aktif (span 6), Nomor HP / WhatsApp (span 6) */}
            <div className="col-span-6 full-mobile" style={{ gridColumn: "span 6" }}>
              <InputField
                label="13. Email Aktif"
                name="email"
                value={formValues.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="email@domain.com"
              />
            </div>
            <div className="col-span-6 full-mobile" style={{ gridColumn: "span 6" }}>
              <InputField
                label="14. Nomor HP / WhatsApp"
                name="no_hp"
                value={formValues.no_hp}
                onChange={(e) => handleInputChange("no_hp", e.target.value.replace(/\D/g, ""))}
                required
                placeholder="08xxxxxxxxxx"
                mono
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Berkas Dokumen (1 BARIS SAJA - 6 KOLOM) ── */}
      <div style={sectionCard}>
        {/* Header Bernuansa Hijau/Mint Khas Keuangan */}
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
              Dokumen Persyaratan
            </p>
            <h2
              style={{
                margin: "2px 0 0",
                color: "var(--md-on-surface)",
                fontSize: 16.5,
                fontWeight: 900,
              }}
            >
              Berkas Legalitas & Portofolio Pendukung
            </h2>
          </div>
          <div
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              background: "var(--md-success-container)",
              color: "var(--md-success)",
              fontSize: 10.5,
              fontWeight: 800,
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            Berkas Siap: {docsUploadedCount} dari 6 dokumen
          </div>
        </div>

        {/* Body Berkas Dokumen */}
        <div style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 11.5, color: "var(--md-on-surface-variant)", margin: "0 0 12px 0", lineHeight: 1.45 }}>
            Format dokumen: <strong>JPG, PNG, atau PDF</strong> (Maks. 2MB). Berkas yang telah diunggah saat registrasi keuangan otomatis terhubung di bawah ini.
          </p>

          {/* 1 BARIS PENUH: 6 Kolom Sejajar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            <SingleRowFileCard label="Kartu Keluarga (KK)" shortLabel="Kartu Keluarga" name="file_kk" docType="kk" accept=".jpg,.jpeg,.png,.pdf" icon="📜" />
            <SingleRowFileCard label="KTP Asli" shortLabel="KTP Asli" name="file_ktp" docType="ktp" accept=".jpg,.jpeg,.png,.pdf" icon="🪪" />
            <SingleRowFileCard label="Akta Kelahiran" shortLabel="Akta Kelahiran" name="file_akta" docType="akta" accept=".jpg,.jpeg,.png,.pdf" icon="👶" />
            <SingleRowFileCard label="Ijazah SMA/Sederajat" shortLabel="Ijazah SMA" name="file_ijazah" docType="ijazah" accept=".jpg,.jpeg,.png,.pdf" icon="🎓" />
            <SingleRowFileCard label="Dok. Pendukung Lainnya" shortLabel="Dok. Pendukung" name="file_dukung" docType="pendukung" accept=".pdf" icon="📁" />
            <SingleRowFileCard label="Tanda Tangan Digital" shortLabel="Tanda Tangan" name="file_ttd" docType="ttd" accept=".jpg,.jpeg,.png,.pdf" icon="✍️" />
          </div>
        </div>
      </div>

      {/* ── Submit Button & Navigation ── */}
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
            <span>Menyimpan Biodata...</span>
          ) : savedSuccess ? (
            <span>✓ SELURUH DATA BIODATA & BERKAS BERHASIL TERSIMPAN</span>
          ) : (
            <span>SIMPAN SELURUH DATA BIODATA & BERKAS &rarr;</span>
          )}
        </button>

        {savedSuccess && (
          <Link
            href="/dashboard/mahasiswa/cv"
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
            <span>LANJUT KE FORMULIR CV RIWAYAT HIDUP (F-07) &rarr;</span>
          </Link>
        )}
      </div>
    </form>
  );
}
