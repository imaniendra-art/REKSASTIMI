import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { MataKuliah } from "@/models/MataKuliah";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import Link from "next/link";
import { DocumentPreviewBar } from "@/components/document/DocumentPreviewBar";

export async function generateMetadata() {
  const session = await getSession();
  const nama = session?.name || "Mahasiswa";
  return {
    title: `F02 - ${nama}`,
  };
}

export default async function CetakF02Page() {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();

  const [profile, f02List, matkulDocs] = await Promise.all([
    ApplicantProfile.findOne({ userId: session.id }).lean(),
    F02Pengajuan.find({ userId: session.id }).lean(),
    MataKuliah.find().sort({ semester: 1, kode: 1 }).lean(),
  ]);

  const identity: any = profile?.identity || {};
  const contact = profile?.contact || {};
  const mhs = {
    nama: identity.fullName || session.name || "-",
    noReg: profile?.registrationNumber || profile?.nim || "-",
    periode: profile?.periodName || profile?.periode || "2026",
  };
  
  let edu = null;
  if (profile?.cv?.formalEducation && profile.cv.formalEducation.length > 0) {
    const sortedEdu = [...profile.cv.formalEducation].sort((a, b) => {
      const yearA = parseInt(a.graduationYear || "") || 0;
      const yearB = parseInt(b.graduationYear || "") || 0;
      return yearB - yearA; // Sort descending
    });
    edu = sortedEdu[0];
  }
  const work = profile?.work || profile?.cv?.currentWork || {};

  // Map requested courses
  const requestedMatkulIds = new Map();
  f02List.forEach((f02: any) => {
    requestedMatkulIds.set(String(f02.matkulId), f02.jenisPengajuan);
  });

  const matkul = matkulDocs
    .filter(mk => requestedMatkulIds.has(String(mk._id)))
    .map((mk) => ({
      id: String(mk._id),
      semester: Number(mk.semester || 0),
      kode: mk.kode || "-",
      namaMatkul: mk.namaMatkul || "-",
      sks: Number(mk.sks || 0),
      jenisPengajuan: requestedMatkulIds.get(String(mk._id)),
    }));
    
  const today = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <>
      <style>{printCss}</style>
      <DocumentPreviewBar
        code="F-02"
        title="Formulir Aplikasi Asesmen RPL"
        studentName={mhs.nama}
        registrationNumber={mhs.noReg}
      />

      <div className="document-container">
        {/* Cover Page */}
        <div className="cover-page">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_stimi.png" alt="Logo STIMI" className="cover-logo" />

          <div className="cover-univ">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA YAPMI</div>
          <div className="cover-prodi">PROGRAM STUDI S1 MANAJEMEN</div>

          <div className="cover-title-box">
            <div className="cover-title">FORMULIR APLIKASI ASESMEN RPL (F-02)</div>
            <div className="cover-subtitle">REKOGNISI PEMBELAJARAN LAMPAU</div>
          </div>

          <div className="cover-identity">
            <div><strong>Pemohon:</strong></div>
            <table>
              <tbody>
                <tr>
                  <td>Nama Lengkap</td>
                  <td>:</td>
                  <td style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "14pt" }}>{mhs.nama}</td>
                </tr>
                <tr>
                  <td>Nomor Registrasi (No. Reg)</td>
                  <td>:</td>
                  <td style={{ fontWeight: "bold", fontSize: "14pt" }}>{mhs.noReg}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cover-footer">
            MAKASSAR<br />
            {mhs.periode.toUpperCase()}
          </div>
        </div>

        <div className="title-doc">FORMULIR APLIKASI ASESMEN RPL (F-02)</div>

        <table className="header-table" style={{ textAlign: "left", fontSize: "10.5pt", fontWeight: "bold" }}>
            <tbody>
                <tr>
                    <td style={{ width: "180px" }}>Program Studi</td>
                    <td style={{ width: "15px" }}>:</td>
                    <td>Manajemen</td>
                </tr>
                <tr>
                    <td>Jenjang</td>
                    <td>:</td>
                    <td>Sarjana (S1)</td>
                </tr>
                <tr>
                    <td>Nama Perguruan Tinggi</td>
                    <td>:</td>
                    <td>STIMI YAPMI Makassar</td>
                </tr>
            </tbody>
        </table>

        <div className="content">
          <div className="section-title">BAGIAN 1: RINCIAN DATA CALON MAHASISWA</div>
          
          <table className="data-table">
            <tbody>
                <tr>
                    <td style={{ width: "30%" }}>Nama Lengkap</td>
                    <td style={{ width: "3%" }}>:</td>
                    <td className="fw-bold" style={{ textTransform: "uppercase" }}>{mhs.nama}</td>
                </tr>
                <tr>
                    <td>Tempat / Tanggal Lahir</td>
                    <td>:</td>
                    <td>{identity.placeOfBirth || "-"}, {formatDate(identity.dateOfBirth)}</td>
                </tr>
                <tr>
                    <td>Jenis Kelamin / Status</td>
                    <td>:</td>
                    <td>{identity.gender === 'Laki-laki' || identity.gender === 'L' ? 'Laki-laki' : identity.gender === 'Perempuan' || identity.gender === 'P' ? 'Perempuan' : (identity.gender || '-')} / {work.maritalStatus || "-"}</td>
                </tr>
                <tr>
                    <td>Alamat Rumah</td>
                    <td>:</td>
                    <td>{contact.address || "-"}</td>
                </tr>
                <tr>
                    <td>Kontak (HP / Email)</td>
                    <td>:</td>
                    <td>{contact.phone || "-"} / {contact.email || "-"}</td>
                </tr>
                <tr>
                    <td>Pendidikan Terakhir</td>
                    <td>:</td>
                    <td>
                        {edu ? `${edu.level} - ${edu.institution}${edu.major ? ` (${edu.major})` : ""} (Lulus: ${edu.graduationYear})` : "-"}
                    </td>
                </tr>
            </tbody>
          </table>

          <div className="section-title">BAGIAN 2: DAFTAR MATA KULIAH PADA PROGRAM STUDI S1 MANAJEMEN</div>
          <p style={{ textAlign: "justify", marginBottom: "12px", fontSize: "10.5pt", lineHeight: 1.4 }}>
            Saya mengajukan permohonan asesmen Rekognisi Pembelajaran Lampau (RPL) untuk mata kuliah pada Program Studi S1 Manajemen sebagaimana tercantum pada daftar di bawah ini. Pengakuan ini didasarkan pada kompetensi yang saya peroleh baik dari pendidikan formal sebelumnya (<b>Transfer SKS</b>), maupun dari pendidikan nonformal, informal, atau pengalaman kerja (<b>Perolehan SKS</b>). Mohon berikan tanda (✓) pada pilihan <b>Ya</b> atau <b>Tidak</b>.
          </p>

          <table className="table-matkul">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>NO</th>
                <th style={{ width: "8%" }}>SMT</th>
                <th style={{ width: "12%" }}>KODE</th>
                <th style={{ width: "35%" }}>MATA KULIAH</th>
                <th style={{ width: "5%" }}>SKS</th>
                <th style={{ width: "17%" }}>MENGAJUKAN RPL</th>
                <th style={{ width: "18%" }}>KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              {matkul.length > 0 ? renderRows(matkul) : (
                <tr>
                    <td colSpan={7} className="text-center" style={{ padding: "12px", fontStyle: "italic" }}>
                        Belum ada mata kuliah yang diajukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: "25px", fontSize: "10.5pt" }}>
              <p style={{ textAlign: "justify", marginBottom: "8px", fontWeight: "bold" }}>
                  Bersama ini saya mengajukan permohonan untuk dapat mengikuti Rekognisi Pembelajaran Lampau (RPL) dan dengan ini saya menyatakan bahwa:
              </p>
              <ol style={{ textAlign: "justify", paddingLeft: "16px", marginLeft: 0, lineHeight: 1.4, listStyleType: "decimal" }}>
                  <li style={{ marginBottom: "8px" }}>Semua informasi yang saya tuliskan adalah sepenuhnya benar and saya bertanggung-jawab atas seluruh data dalam formulir ini. Apabila di kemudian hari ternyata informasi yang saya sampaikan tersebut adalah tidak benar, maka saya bersedia menerima sanksi sesuai dengan ketentuan yang berlaku;</li>
                  <li style={{ marginBottom: "8px" }}>Saya memberikan izin kepada pihak pengelola program RPL untuk melakukan pemeriksaan kebenaran informasi yang saya berikan dalam formulir aplikasi ini kepada seluruh pihak yang terkait dengan jenjang akademik sebelumnya dan kepada perusahaan tempat saya bekerja sebelumnya dan/atau saat ini saya bekerja; dan</li>
                  <li style={{ marginBottom: "8px" }}>Saya akan mengikuti proses asesmen sesuai dengan jadwal dan waktu yang ditetapkan oleh Perguruan Tinggi.</li>
              </ol>

              <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: "280px", textAlign: "left" }}>
                      Makassar, {today}<br />
                      Tanda tangan Pemohon,
                      <div style={{ height: "70px" }}></div>
                      <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                          ( {mhs.nama} )
                      </div>
                  </div>
              </div>
          </div>

          <div style={{ marginTop: "80px", fontSize: "8.5pt", color: "#94a3b8", textAlign: "center", fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
            Dokumen ini dibuat dan dicetak secara otomatis melalui sistem REKSA STIMI YAPMI Makassar
          </div>
        </div>
      </div>
    </>
  );
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function renderRows(matkul: Array<{ id: string; semester: number; kode: string; namaMatkul: string; sks: number; jenisPengajuan: string }>) {
  let number = 1;
  const rows: ReactNode[] = [];

  matkul.forEach((mk) => {
    rows.push(
      <tr key={mk.id}>
        <td className="text-center">{number}</td>
        <td className="text-center">{mk.semester}</td>
        <td className="text-center">{mk.kode}</td>
        <td>{mk.namaMatkul}</td>
        <td className="text-center fw-bold">{mk.sks}</td>
        <td className="text-center" style={{ whiteSpace: "nowrap", fontSize: "8pt", verticalAlign: "middle" }}>
            <span style={{ display: "inline-block", marginRight: "12px", color: "#15803d", fontSize: "11pt" }}>☑ Ya</span>
            <span style={{ display: "inline-block", fontSize: "11pt" }}>☐ Tidak</span>
        </td>
        <td className="text-center" style={{ fontSize: "8.5pt" }}>
            {mk.jenisPengajuan === 'Perolehan' || mk.jenisPengajuan === 'Perolehan SKS' ? 'Perolehan SKS' : 
             mk.jenisPengajuan === 'Transfer' || mk.jenisPengajuan === 'Transfer SKS' ? 'Transfer SKS' : mk.jenisPengajuan}
        </td>
      </tr>
    );
    number += 1;
  });

  return rows;
}

const printCss = `
:root {
  --blue-header: #f0fdfa;
  --blue-dark: #0f766e;
  --slate-border: #e2e8f0;
  --ghost-white: #f8fafc;
}

html, body, body:not(.dark), .dark body, [data-mode="dark"] body {
  margin: 0 !important;
  padding: 0 !important;
  background: #334155 !important;
  background-color: #334155 !important;
  background-image: none !important;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  line-height: 1.5;
  font-size: 10.5pt;
  display: flex;
  justify-content: center;
}

@page {
  size: A4 portrait;
  margin: 0.75in;
}

.document-container {
  background: #ffffff !important;
  background-color: #ffffff !important;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 28px auto 48px auto !important;
  padding: 0.75in;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.35) !important;
  border-radius: 4px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  display: block;
}

/* Cover CSS */
.cover-page {
  width: 100%;
  min-height: 250mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  page-break-after: always;
  padding: 10mm 0;
  box-sizing: border-box;
}

.cover-logo {
  width: 120px;
  height: auto;
  margin-bottom: 20px;
}

.cover-univ {
  font-size: 16pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 5px;
  letter-spacing: 1px;
}

.cover-prodi {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 30px;
}

.cover-title-box {
  margin: 40px 0 60px 0;
  padding: 15px 30px;
  border-top: 3px solid #000;
  border-bottom: 3px solid #000;
}

.cover-title {
  font-size: 18pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.cover-subtitle {
  font-size: 14pt;
  font-weight: bold;
  letter-spacing: 2px;
}

.cover-identity {
  font-size: 13pt;
  margin-top: auto;
  margin-bottom: 60px;
}

.cover-identity table {
  margin: 15px auto 0 auto;
  text-align: left;
  border: none !important;
}

.cover-identity td {
  padding: 6px 15px;
  vertical-align: middle;
  border: none !important;
}

.cover-footer {
  font-size: 12pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Document CSS */
.title-doc {
  text-align: center;
  font-weight: 900;
  color: var(--blue-dark);
  font-size: 14pt;
  margin-top: 10px;
  margin-bottom: 25px;
  text-decoration: underline;
  text-transform: uppercase;
}

.content-wrapper {
  padding: 0;
}

.section-title {
  background-color: #bae6fd !important;
  color: var(--blue-dark);
  font-weight: 800;
  padding: 8px 15px;
  border-bottom: 2px solid var(--blue-dark);
  font-size: 11pt;
  margin-top: 25px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
  border-radius: 4px 4px 0 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.section-title::after {
  content: "";
  display: block;
  height: 1px;
  background: rgba(3, 105, 161, 0.2);
  margin-top: 2px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.data-table td {
  padding: 4px 0;
  vertical-align: top;
  border: none !important;
}

.header-table {
  width: auto;
  margin: 0 auto;
  border-collapse: collapse;
}

.header-table td {
  border: none !important;
  padding: 2px 4px;
}

.table-matkul {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 9pt;
}

.table-matkul th,
.table-matkul td {
  border: 1px solid #334155;
  padding: 4px 8px;
  vertical-align: middle;
}

.table-matkul th {
  background-color: var(--ghost-white) !important;
  color: var(--blue-dark);
  text-align: center;
  font-weight: 800;
  font-size: 9pt;
  border: 1.5px solid #334155 !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.text-center { text-align: center; }
.fw-bold { font-weight: bold; }

/* Controls */
.print-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-print-action {
  border-radius: 50px;
  padding: 10px 24px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.9rem;
  line-height: 1 !important;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary { background: #2563eb !important; color: white !important; }
.btn-secondary { background: #64748b !important; color: white !important; }

@media print {
  body { background: white !important; }
  .document-container {
    box-shadow: none !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
  }
  .no-print { display: none !important; }
  
  .table-matkul th {
    background-color: #f2f2f2 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`;
