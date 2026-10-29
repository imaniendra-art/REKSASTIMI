import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import Link from "next/link";
import { DocumentPreviewBar } from "@/components/document/DocumentPreviewBar";

export async function generateMetadata() {
  const session = await getSession();
  const nama = session?.name || "Mahasiswa";
  return {
    title: `F07 - ${nama}`,
  };
}

export default async function CetakF07Page() {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();
  const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();

  const identity: any = profile?.identity || {};
  const contact = profile?.contact || {};
  const work = profile?.work || profile?.cv?.currentWork || {};
  const cv: any = profile?.cv || {};
  
  const mhs = {
    nama: identity.fullName || session.name || "-",
    noReg: profile?.registrationNumber || profile?.nim || "-",
    periode: profile?.periodName || profile?.periode || "2026",
  };
  
  const today = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  const pendidikan = cv.formalEducation || [];
  const pelatihan = cv.trainings || [];
  const konferensi = cv.conferences || [];
  const penghargaan = cv.achievements || [];
  const organisasi = cv.organizations || [];
  const pekerjaan = cv.workExperience || [];

  return (
    <>
      <style>{printCss}</style>
      <DocumentPreviewBar
        code="F-07"
        title="Daftar Riwayat Hidup / CV Pemohon"
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
            <div className="cover-title">DAFTAR RIWAYAT HIDUP (CURRICULUM VITAE)<br />F-07</div>
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

        <div className="title-doc">DAFTAR RIWAYAT HIDUP (CURRICULUM VITAE)<br/>(FORM 7 / F07)</div>

        <div className="section-title">I. IDENTITAS DIRI</div>
        <div className="section-content">
            <table className="table-id">
                <tbody>
                <tr>
                    <td className="label-id">Nama Lengkap</td>
                    <td style={{ width: 20 }}>:</td>
                    <td className="fw-bold" style={{ textTransform: "uppercase", fontSize: "11pt", color: "#0f172a" }}>{mhs.nama}</td>
                </tr>
                <tr>
                    <td className="label-id">Tempat dan Tanggal Lahir</td>
                    <td>:</td>
                    <td>{identity.placeOfBirth || "-"}, {formatDate(identity.dateOfBirth)}</td>
                </tr>
                <tr>
                    <td className="label-id">Jenis Kelamin</td>
                    <td>:</td>
                    <td>{identity.gender === 'Laki-laki' || identity.gender === 'L' ? 'Laki-laki' : identity.gender === 'Perempuan' || identity.gender === 'P' ? 'Perempuan' : (identity.gender || '-')}</td>
                </tr>
                <tr>
                    <td className="label-id">Status Perkawinan</td>
                    <td>:</td>
                    <td>{work.maritalStatus || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Agama</td>
                    <td>:</td>
                    <td>{identity.religion || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Institusi Tempat Bekerja</td>
                    <td>:</td>
                    <td>{work.institution || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Jabatan Saat Ini</td>
                    <td>:</td>
                    <td className="fw-bold">{work.position || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Status Pekerjaan</td>
                    <td>:</td>
                    <td>{work.employmentStatus || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Alamat Tempat Bekerja</td>
                    <td>:</td>
                    <td>{work.officeAddress || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Telp./Faks. Kantor</td>
                    <td>:</td>
                    <td>{work.officePhone || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Alamat Rumah</td>
                    <td>:</td>
                    <td>{contact.address || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Telp./HP Aktif</td>
                    <td>:</td>
                    <td>{contact.phone || "-"}</td>
                </tr>
                <tr>
                    <td className="label-id">Alamat E-mail</td>
                    <td>:</td>
                    <td>{work.officeEmail || contact.email || "-"}</td>
                </tr>
                </tbody>
            </table>
        </div>

        <div className="section-title">II. RIWAYAT PENDIDIKAN</div>
        <div className="section-content">
            <table className="table-data">
                <thead>
                    <tr>
                        <th style={{ width: 35 }}>NO</th>
                        <th>JENJANG / NAMA SEKOLAH</th>
                        <th style={{ width: 100 }}>TAHUN LULUS</th>
                        <th>JURUSAN / PRODI</th>
                    </tr>
                </thead>
                <tbody>
                    {pendidikan.length > 0 ? pendidikan.map((p: any, i: number) => (
                    <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td><strong>{p.level}</strong> - {p.institution}</td>
                        <td className="text-center">{p.graduationYear}</td>
                        <td>{p.major || "-"}</td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={4} className="text-center" style={{ fontStyle: "italic", color: "#94a3b8" }}>Tidak ada data riwayat pendidikan.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="section-title">III. PELATIHAN / SEMINAR / PENGHARGAAN</div>
        <div className="section-content">
            <table className="table-data">
                <thead>
                    <tr>
                        <th style={{ width: 70 }}>TAHUN</th>
                        <th>NAMA KEGIATAN / PELATIHAN</th>
                        <th>PENYELENGGARA / PEMBERI</th>
                    </tr>
                </thead>
                <tbody>
                    {pelatihan.map((l: any, i: number) => (
                    <tr key={"pel_"+i}>
                        <td className="text-center">{l.year}</td>
                        <td>[PELATIHAN] {l.name}</td>
                        <td>{l.organizer}</td>
                    </tr>
                    ))}
                    {konferensi.map((k: any, i: number) => (
                    <tr key={"kon_"+i}>
                        <td className="text-center">{k.year}</td>
                        <td>[SEMINAR] {k.title}</td>
                        <td>{k.organizer}</td>
                    </tr>
                    ))}
                    {penghargaan.map((h: any, i: number) => (
                    <tr key={"pen_"+i}>
                        <td className="text-center">{h.year}</td>
                        <td>[PENGHARGAAN] {h.name}</td>
                        <td>{h.issuer}</td>
                    </tr>
                    ))}
                    {(!pelatihan.length && !konferensi.length && !penghargaan.length) && (
                    <tr>
                        <td colSpan={3} className="text-center" style={{ fontStyle: "italic", color: "#94a3b8" }}>Tidak ada data pendukung.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="section-title">IV. ORGANISASI PROFESI / ILMIAH</div>
        <div className="section-content">
            <table className="table-data">
                <thead>
                    <tr>
                        <th style={{ width: 150 }}>PERIODE</th>
                        <th>NAMA ORGANISASI</th>
                        <th>JABATAN</th>
                    </tr>
                </thead>
                <tbody>
                    {organisasi.length > 0 ? organisasi.map((o: any, i: number) => (
                    <tr key={"org_"+i}>
                        <td className="text-center">{o.startYear} s/d {o.endYear || 'Sekarang'}</td>
                        <td>{o.name}</td>
                        <td className="text-center">{o.position}</td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={3} className="text-center" style={{ fontStyle: "italic", color: "#94a3b8" }}>Tidak ada data organisasi.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="section-title">V. DAFTAR RIWAYAT PEKERJAAN</div>
        <div className="section-content">
            <table className="table-data">
                <thead>
                    <tr>
                        <th style={{ width: 35 }}>NO</th>
                        <th>INSTITUSI / PERUSAHAAN</th>
                        <th style={{ width: 120 }}>PERIODE</th>
                        <th>JABATAN</th>
                        <th>URAIAN TUGAS</th>
                    </tr>
                </thead>
                <tbody>
                    {pekerjaan.length > 0 ? pekerjaan.map((w: any, i: number) => (
                    <tr key={"pek_"+i}>
                        <td className="text-center">{i + 1}</td>
                        <td><strong>{w.company}</strong></td>
                        <td className="text-center">{w.startYear} - {w.endYear || 'Sekarang'}</td>
                        <td className="text-center">{w.position}</td>
                        <td style={{ fontSize: "8pt" }}>{w.description}</td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={5} className="text-center" style={{ fontStyle: "italic", color: "#94a3b8" }}>Tidak ada data riwayat pekerjaan.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="declaration">
            Saya menyatakan bahwa semua keterangan dalam Daftar Riwayat Hidup (Curriculum Vitae) ini adalah sepenuhnya benar dan saya bertanggung-jawab atas seluruh data dalam formulir ini.
        </div>

        <div className="sig-container">
            <div className="sig-box">
                Mengetahui,<br/>Pimpinan / Atasan Langsung
                <div className="sig-space"></div>
                ( .................................................. )
            </div>
            <div className="sig-box">
                Makassar, {today}<br/>Hormat Saya,
                <div className="sig-space"></div>
                <strong style={{ textTransform: "uppercase", textDecoration: "underline" }}>{mhs.nama}</strong>
            </div>
        </div>
        <div style={{ marginTop: "80px", fontSize: "8.5pt", color: "#94a3b8", textAlign: "center", fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
            Dokumen ini dibuat dan dicetak secara otomatis melalui sistem REKSA STIMI YAPMI Makassar
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

const printCss = `
:root {
  --blue-header: #f0fdfa;
  --blue-dark: #0f766e;
  --slate-border: #1e293b;
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

.section-title {
  background: linear-gradient(to right, #ccfbf1, #f0fdfa) !important;
  color: #0f766e;
  font-weight: 900;
  padding: 10px 18px;
  border-left: 5px solid #0d9488;
  border-bottom: 2px solid #0d9488;
  font-size: 11.5pt;
  margin-top: 30px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  display: block;
  border-radius: 4px 10px 0 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.section-title::after {
  content: "";
  display: block;
  height: 1.5px;
  background: rgba(3, 105, 161, 0.4);
  margin-top: 3px;
}

.section-content {
  padding: 0 5px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.document-container th,
.document-container td {
  border: 1px solid #1e293b;
  padding: 6px 12px;
  vertical-align: middle;
}

.table-id {
  border: none !important;
}

.table-id td {
  border: none !important;
  padding: 5px 0;
  font-size: 10.5pt;
}

.label-id {
  font-weight: 700;
  width: 32%;
  color: #1e293b;
}

.table-data th {
  background-color: #f0f9ff !important;
  color: #0f766e;
  text-align: center;
  font-weight: 800;
  font-size: 9pt;
  border: 1.5px solid #1e293b !important;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.table-data td {
  font-size: 9.5pt;
  color: #1e293b;
  border: 1.2px solid #1e293b;
}

.declaration {
  margin-top: 35px;
  padding: 15px;
  background: #fffbeb !important;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  font-size: 10pt;
  color: #92400e;
  text-align: justify;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.sig-container {
  width: 100%;
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}

.sig-box {
  width: 45%;
  text-align: center;
  font-size: 10.5pt;
}

.sig-space {
  height: 80px;
}

.fw-bold { font-weight: bold; }
.text-center { text-align: center; }

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
  html, body, body:not(.dark), .dark body, [data-mode="dark"] body {
    background: #ffffff !important;
    background-color: #ffffff !important;
    background-image: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .document-container {
    background: #ffffff !important;
    background-color: #ffffff !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
  }
  .no-print, .print-controls { display: none !important; }
}
`;
