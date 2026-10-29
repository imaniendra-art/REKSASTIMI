"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveBiodata } from "./actions";
import { compressImageIfNeeded } from "@/lib/image-compressor";

/* ── Compact Style Helpers ── */
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--md-surface-1)",
  border: "1px solid var(--md-outline)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--md-on-surface)",
  outline: "none",
  transition: "all 0.15s ease",
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

const requiredStar: React.CSSProperties = {
  color: "var(--md-error)",
  marginLeft: 3,
};

const sectionCard: React.CSSProperties = {
  background: "var(--md-surface-1)",
  borderRadius: 16,
  padding: "18px 20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  border: "1px solid var(--md-outline-variant)",
  position: "relative",
  overflow: "hidden",
};

const accentBar = (color: string): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: 4,
  height: "100%",
  background: color,
  borderRadius: "16px 0 0 16px",
});

const sectionTitle = (color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 900,
  fontSize: 13,
  color: color,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: 0,
});

export default function BiodataForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [compressing, setCompressing] = useState<Record<string, boolean>>({});

  const ident = initialData?.identity || {};
  const cont = initialData?.contact || {};

  const formattedDateOfBirth = ident.dateOfBirth
    ? new Date(ident.dateOfBirth).toISOString().split("T")[0]
    : "";

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
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    
    if (selectedFiles.kk) formData.set("file_kk", selectedFiles.kk);
    if (selectedFiles.ktp) formData.set("file_ktp", selectedFiles.ktp);
    if (selectedFiles.akta) formData.set("file_akta", selectedFiles.akta);
    if (selectedFiles.ijazah) formData.set("file_ijazah", selectedFiles.ijazah);
    if (selectedFiles.pendukung) formData.set("file_dukung", selectedFiles.pendukung);
    if (selectedFiles.ttd) formData.set("file_ttd", selectedFiles.ttd);

    const result = await saveBiodata(formData);

    if (result.success) {
      setSavedSuccess(true);
      setMessage({ type: "success", text: "Data biodata dan seluruh berkas berhasil disimpan ke sistem!" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan data biodata." });
    }
    setLoading(false);
  };

  /* ── Field renderers ── */
  function InputField({
    label,
    name,
    defaultValue,
    required,
    type = "text",
    placeholder,
    maxLength,
    minLength,
    mono,
  }: {
    label: string;
    name: string;
    defaultValue?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    mono?: boolean;
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
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          style={{
            ...inputBase,
            fontFamily: mono ? "monospace" : "inherit",
          }}
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

  function SelectField({
    label,
    name,
    defaultValue,
    required,
    options,
  }: {
    label: string;
    name: string;
    defaultValue?: string;
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
          defaultValue={defaultValue || ""}
          required={required}
          style={{
            ...inputBase,
            cursor: "pointer",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--md-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--md-outline)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <option value="" disabled style={{ color: "var(--md-on-surface-variant)" }}>
            -- Pilih Opsi --
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
      {/* Toast Message */}
      {message.text && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 14,
            fontSize: 12.5,
            fontWeight: 800,
            background: message.type === "success" ? "var(--md-success-container)" : "var(--md-error-container)",
            color: message.type === "success" ? "var(--md-success)" : "var(--md-error)",
            border: `1.5px solid ${message.type === "success" ? "var(--md-success)" : "var(--md-error)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{message.type === "success" ? "✓" : "⚠️"}</span>
            <span>{message.text}</span>
          </div>

          {savedSuccess && (
            <Link
              href="/dashboard/mahasiswa"
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: 999,
                background: "var(--md-surface-1)",
                color: "var(--md-on-surface)",
                textDecoration: "none",
                border: "1px solid var(--md-outline)",
              }}
            >
              Kembali ke Dashboard &rarr;
            </Link>
          )}
        </div>
      )}

      {/* ── Section 1: Data Pokok Mahasiswa (Standar Feeder PDDIKTI) ── */}
      <div style={sectionCard}>
        <div style={accentBar("var(--md-primary)")} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <div style={sectionTitle("var(--md-primary)")}>
            Identitas Calon Mahasiswa (Standar Neo Feeder PDDIKTI)
          </div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--md-primary-container)",
              color: "var(--md-primary)",
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            13 Field Standar Feeder
          </div>
        </div>

        {/* 4-Column Balanced Grid with ZERO dangling single items */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {/* Row 1: Nama (2), Tempat Lahir (1), Jenis Kelamin (1) -> Total 4 */}
          <div style={{ gridColumn: "span 2" }}>
            <InputField
              label="1. Nama Lengkap (KTP)"
              name="nama_lengkap"
              defaultValue={ident.fullName}
              required
              placeholder="Nama lengkap sesuai identitas"
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <InputField
              label="2. Tempat Lahir"
              name="tempat_lahir"
              defaultValue={ident.placeOfBirth}
              required
              placeholder="Kota / Kab. Lahir"
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <SelectField
              label="3. Jenis Kelamin"
              name="jenis_kelamin"
              defaultValue={ident.gender}
              required
              options={[
                { value: "L", label: "Laki-laki (L)" },
                { value: "P", label: "Perempuan (P)" },
              ]}
            />
          </div>

          {/* Row 2: Nama Ibu (2), Tanggal Lahir (1), Agama (1) -> Total 4 */}
          <div style={{ gridColumn: "span 2" }}>
            <InputField
              label="4. Nama Ibu Kandung"
              name="nama_ibu"
              defaultValue={ident.motherName}
              required
              placeholder="Wajib untuk Feeder PDDIKTI"
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <InputField
              label="5. Tanggal Lahir"
              name="tanggal_lahir"
              defaultValue={formattedDateOfBirth}
              type="date"
              required
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <SelectField
              label="6. Agama"
              name="agama"
              defaultValue={ident.religion}
              required
              options={[
                { value: "Islam", label: "Islam" },
                { value: "Kristen", label: "Kristen (Protestan)" },
                { value: "Katolik", label: "Katolik" },
                { value: "Hindu", label: "Hindu" },
                { value: "Budha", label: "Budha" },
                { value: "Konghucu", label: "Konghucu" },
              ]}
            />
          </div>

          {/* Row 3: NIK (2), NISN (1), Kewarganegaraan (1) -> Total 4 */}
          <div style={{ gridColumn: "span 2" }}>
            <InputField
              label="7. NIK (Nomor KTP)"
              name="nik"
              defaultValue={ident.nik}
              required
              maxLength={16}
              placeholder="16 Digit Angka NIK"
              mono
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <InputField
              label="8. NISN (Sekolah)"
              name="nisn"
              defaultValue={ident.nisn}
              required
              maxLength={10}
              minLength={10}
              placeholder="10 Digit NISN"
              mono
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <SelectField
              label="9. Kewarganegaraan"
              name="kewarganegaraan"
              defaultValue={ident.citizenship || "Indonesia"}
              required
              options={[
                { value: "Indonesia", label: "WNI" },
                { value: "WNA", label: "WNA" },
              ]}
            />
          </div>

          {/* Row 4: Alamat Domisili (2), Kelurahan (1), Kecamatan (1) -> Total 4 (Semua Alamat 1 Baris!) */}
          <div style={{ gridColumn: "span 2" }}>
            <InputField
              label="10. Alamat Lengkap Domisili (Jalan / Dusun / RT / RW)"
              name="alamat"
              defaultValue={cont.address}
              required
              placeholder="Nama Jalan, RT/RW, Dusun"
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <InputField
              label="11. Kelurahan / Desa"
              name="kelurahan"
              defaultValue={cont.village}
              required
              placeholder="Kelurahan / Desa"
            />
          </div>
          <div style={{ gridColumn: "span 1" }}>
            <InputField
              label="12. Kecamatan"
              name="kecamatan"
              defaultValue={cont.district}
              required
              placeholder="Kecamatan"
            />
          </div>

          {/* Row 5: Email (2), Nomor HP / WhatsApp (2) -> Total 4 (Kedua Kontak Sejajar 1 Baris!) */}
          <div style={{ gridColumn: "span 2" }}>
            <InputField
              label="13. Email Aktif"
              name="email"
              defaultValue={cont.email}
              type="email"
              required
              placeholder="email@domain.com"
            />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <InputField
              label="14. Nomor HP / WhatsApp"
              name="no_hp"
              defaultValue={cont.phone}
              required
              placeholder="08xxxxxxxxxx"
              mono
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Berkas Dokumen (1 BARIS SAJA - 6 KOLOM) ── */}
      <div style={sectionCard}>
        <div style={accentBar("var(--md-success)")} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <div style={sectionTitle("var(--md-success)")}>
            Berkas Legalitas & Portofolio Pendukung
          </div>
          <div
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--md-success-container)",
              color: "var(--md-success)",
              fontSize: 10,
              fontWeight: 800,
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            Berkas Siap: {docsUploadedCount} dari 6 dokumen
          </div>
        </div>

        <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)", margin: "0 0 10px 0", lineHeight: 1.45 }}>
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

      {/* ── Submit Button & Navigation ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "var(--md-primary)",
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
          ) : (
            <span>Simpan Seluruh Data Biodata & Berkas &rarr;</span>
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
            <span>Lanjut ke Formulir CV Riwayat Hidup (F-07) &rarr;</span>
          </Link>
        )}
      </div>
    </form>
  );
}
