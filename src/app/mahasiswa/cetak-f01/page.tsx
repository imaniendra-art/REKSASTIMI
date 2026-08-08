import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { MataKuliah } from "@/models/MataKuliah";
import Link from "next/link";

export async function generateMetadata() {
  const session = await getSession();
  const nama = session?.name || "Mahasiswa";
  return {
    title: `F01 - ${nama}`,
  };
}

export default async function CetakF01Page() {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();

  const [profile, matkulDocs] = await Promise.all([
    ApplicantProfile.findOne({ userId: session.id }).lean(),
    MataKuliah.find().sort({ semester: 1, kode: 1 }).lean(),
  ]);

  const identity: any = profile?.identity || {};
  const mhs = {
    nama: identity.fullName || session.name || "-",
    noReg: profile?.registrationNumber || profile?.nim || "-",
    periode: profile?.periodName || profile?.periode || "2026",
  };

  const matkul = matkulDocs.map((mk) => ({
    id: String(mk._id),
    semester: Number(mk.semester || 0),
    kode: mk.kode || "-",
    namaMatkul: mk.namaMatkul || "-",
    sks: Number(mk.sks || 0),
    isRpl: mk.isRpl !== false,
  }));

  return (
    <>
      <style>{printCss}</style>
      <div className="print-controls no-print">
        <button type="button" className="btn-print-action btn-primary" dangerouslySetInnerHTML={{ __html: `<span onclick="window.print()">Cetak Dokumen</span>` }} />
        <Link href="/dashboard/mahasiswa/download" className="btn-print-action btn-secondary">
          Tutup
        </Link>
      </div>

      <div className="document-container">
        <div className="cover-page">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_stimi.png" alt="Logo STIMI" className="cover-logo" />

          <div className="cover-univ">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA YAPMI</div>
          <div className="cover-prodi">PROGRAM STUDI S1 MANAJEMEN</div>

          <div className="cover-title-box">
            <div className="cover-title">FORMULIR PETUNJUK PEMOHON (F-01)</div>
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

        <div className="title-doc">PETUNJUK BAGI PEMOHON (F-01)</div>
        <div className="content">
          <div className="section-title">A. PENDAHULUAN</div>
          <p>
            Rekognisi Pembelajaran Lampau (RPL) adalah pengakuan atas capaian pembelajaran seseorang yang
            diperoleh dari pendidikan nonformal, informal, dan/atau pengalaman kerja sebagai dasar untuk
            melanjutkan pendidikan formal dan untuk melakukan penyetaraan dengan kualifikasi tertentu. Bagi
            masyarakat lulusan SMA atau sederajat, atau yang pernah menempuh kuliah namun terputus, RPL
            memberikan kesempatan emas untuk mendapatkan pengakuan atas pengalaman kerja mandiri, di perusahaan,
            maupun lembaga pemerintahan sebagai kredit akademik.
          </p>
          <p>
            Melalui skema ini, kompetensi yang diperoleh dari pengalaman tersebut disetarakan dengan capaian
            pembelajaran mata kuliah di <strong>Program Studi S1 Manajemen STIMI YAPMI Makassar</strong>.
            Dokumen ini merincikan daftar mata kuliah, Capaian Pembelajaran Lulusan (CPL), dan jumlah SKS yang
            harus ditempuh untuk menyelesaikan pendidikan.
          </p>

          <div className="section-title">B. TATA CARA PENGAJUAN</div>
          <p>Seluruh proses pengajuan RPL di STIMI YAPMI dilakukan secara digital melalui sistem <strong>REKSA (Sistem Informasi RPL STIMI)</strong> dengan langkah-langkah berikut:</p>
          <ol className="list-petunjuk">
            <li>Calon mahasiswa membuat akun pada portal REKSA dan melengkapi <strong>Biodata</strong> serta <strong>Unggah Dokumen Administrasi</strong> (KTP, KK, Ijazah).</li>
            <li>Pemohon memilih Mata Kuliah yang diajukan untuk direkognisi melalui pengisian <strong>Formulir Aplikasi RPL (F-02)</strong>.</li>
            <li>Pemohon menyusun portofolio dan mengisi <strong>Formulir Evaluasi Diri (F-03)</strong> dengan melampirkan bukti pendukung yang valid (Sertifikat, Surat Tugas, Dokumen Kerja, dll).</li>
            <li>Tim Penilai akan melakukan verifikasi dokumen dan validasi kompetensi melalui proses asesmen.</li>
          </ol>

          <div className="section-title">C. DAFTAR MATA KULIAH PROGRAM STUDI S1 MANAJEMEN</div>
          <p>Berikut adalah daftar mata kuliah pada kurikulum S1 Manajemen. Mata kuliah dengan tanda centang (✔) pada kolom status RPL dapat diajukan untuk proses rekognisi:</p>

          <table className="table-matkul">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>NO</th>
                <th style={{ width: "15%" }}>KODE</th>
                <th style={{ width: "50%" }}>NAMA MATA KULIAH</th>
                <th style={{ width: "5%" }}>SKS</th>
                <th style={{ width: "12%" }}>RPL</th>
                <th style={{ width: "13%" }}>TIDAK</th>
              </tr>
            </thead>
            <tbody>
              {renderRows(matkul)}
            </tbody>
          </table>

          <div className="section-title">D. TAHAPAN PENDAFTARAN RPL</div>
          <p>STIMI YAPMI Makassar telah menggunakan sistem REKSA untuk pelaksanaan RPL yang transparan dan akuntabel. Tahapan utamanya adalah:</p>
          <ol className="list-petunjuk">
            <li><strong>Konsultasi & Pendaftaran:</strong> Konsultasi awal dengan pengelola RPL dan pendaftaran akun.</li>
            <li><strong>Penyusunan Portofolio:</strong> Menyiapkan dokumen bukti pengetahuan/keterampilan yang relevan dengan mata kuliah yang diajukan.</li>
            <li><strong>Asesmen & Wawancara:</strong> Pemeriksaan validitas dokumen oleh tim penilai dan wawancara jika diperlukan.</li>
            <li><strong>Penetapan Hasil:</strong> Institusi menetapkan jumlah SKS yang direkognisi berdasarkan hasil asesmen.</li>
            <li><strong>Registrasi Kuliah:</strong> Mahasiswa melakukan registrasi untuk mengikuti perkuliahan pada sisa mata kuliah yang tidak/belum diakui.</li>
          </ol>

          <div className="section-title">E. PENGAKUAN HASIL ASESMEN</div>
          <p>Pengakuan hasil asesmen berupa <strong>Perolehan SKS</strong> (untuk rekognisi dari pendidikan nonformal, informal atau pengalaman kerja) dan/atau <strong>Transfer SKS</strong> (untuk rekognisi dari pendidikan formal di Perguruan Tinggi sebelumnya). Mahasiswa tidak perlu menempuh perkuliahan untuk mata kuliah yang telah direkognisi.</p>

          <div className="diagram-container">
            <div className="d-flex-center">
              <div style={{ flex: 1 }}>
                <div className="d-box">Capaian Pembelajaran dari Pendidikan Formal</div>
                <div className="d-arrow">↓</div>
                <div className="d-box">Asesmen Ekivalensi Capaian Pembelajaran</div>
                <div className="d-arrow">↓</div>
                <div className="d-box"><b>TRANSFER SKS</b></div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="d-box">Capaian Pembelajaran Nonformal/Informal/Kerja</div>
                <div className="d-arrow">↓</div>
                <div className="d-box">Asesmen RPL (Portofolio)</div>
                <div className="d-arrow">↓</div>
                <div className="d-box"><b>PEROLEHAN SKS</b></div>
              </div>
            </div>
            <div className="d-arrow">↓</div>
            <div className="d-box d-box-wide d-box-success">
              PT menetapkan daftar mata kuliah yang direkognisi.<br />
              (Tidak perlu menempuh kuliah untuk MK tersebut)
            </div>
            <div className="diagram-caption">Gambar 1: Skema rekognisi capaian pembelajaran</div>
          </div>

          <div className="section-title">F. PERSYARATAN CALON MAHASISWA</div>
          <p>Calon peserta RPL pada Program Studi S1 Manajemen STIMI YAPMI harus memenuhi persyaratan berikut:</p>
          <ol className="list-petunjuk">
            <li>Lulusan SMA/SMK/MA atau sederajat, dan/atau pernah mengikuti kuliah jenjang Diploma atau Sarjana namun tidak tamat/terputus.</li>
            <li>Memiliki pengalaman kerja yang relevan dengan Capaian Pembelajaran (CP) program studi yang menunjukkan penguasaan kompetensi secara parsial atau keseluruhan.</li>
            <li>Memiliki bukti pendukung yang sah seperti sertifikat pelatihan, surat keterangan kerja, porto folio hasil karya, atau dokumen pendukung lainnya.</li>
            <li>Memenuhi persyaratan administrasi yang ditentukan oleh Panitia PMB STIMI YAPMI.</li>
          </ol>

          <div className="section-title">G. PENDAFTARAN KULIAH DAN BIAYA KULIAH</div>
          <p>Setelah selesai mengikuti proses asesmen dan disepakati hasilnya, tahap selanjutnya adalah mendaftarkan diri secara resmi sebagai mahasiswa untuk menempuh sisa SKS. Biaya operasional dan administrasi mengikuti ketentuan yang ditetapkan oleh <strong>Wakil Ketua II (WK II) Bagian Keuangan STIMI YAPMI Makassar</strong> sesuai dengan tabel biaya yang berlaku pada periode berjalan.</p>

          <div className="section-title">H. DIAGRAM ALUR TAHAPAN PROSES</div>
          <div className="diagram-container">
            <div className="d-box d-box-wide">PEMOHON / CALON (PERORANGAN)</div>
            <div className="d-arrow">↓</div>
            <div className="d-box d-box-wide">Pendaftaran & Konsultasi Online (REKSA)</div>
            <div className="d-arrow">↓</div>
            <div className="d-box d-box-wide">Menyiapkan Laporan Evaluasi Diri & Bukti Portofolio</div>
            <div className="d-arrow">↓</div>
            <div className="d-box d-box-highlight d-box-wide">Pemeriksaan Validitas & Penilaian Capaian Pembelajaran (ASESMEN)</div>
            <div className="d-arrow">↓</div>
            <div className="d-box d-box-wide">Penetapan Hasil Asesmen & Jumlah SKS Direkognisi</div>
            <div className="d-arrow">↓</div>
            <div className="d-box d-box-success d-box-wide">REGISTRASI & MENEMPUH PERKULIAHAN SISA</div>
            <div className="diagram-caption">Gambar 2: Skema Alur Tahapan Proses RPL STIMI YAPMI</div>
          </div>

          <div style={{ marginTop: "80px", fontSize: "8.5pt", color: "#94a3b8", textAlign: "center", fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
            Dokumen ini dibuat dan dicetak secara otomatis melalui sistem REKSA STIMI YAPMI Makassar
          </div>
        </div>
      </div>
    </>
  );
}

function renderRows(matkul: Array<{ id: string; semester: number; kode: string; namaMatkul: string; sks: number; isRpl: boolean }>) {
  let lastSemester: number | null = null;
  let number = 1;
  const rows: ReactNode[] = [];

  matkul.forEach((mk) => {
    if (mk.semester !== lastSemester) {
      rows.push(
        <tr key={`semester-${mk.semester}`}>
          <td colSpan={6} className="row-grup">SEMESTER {mk.semester || "-"}</td>
        </tr>
      );
      lastSemester = mk.semester;
    }

    rows.push(
      <tr key={mk.id}>
        <td className="text-center">{number}</td>
        <td className="text-center">{mk.kode}</td>
        <td>{mk.namaMatkul}</td>
        <td className="text-center text-bold">{mk.sks}</td>
        <td className="text-center checkmark">{mk.isRpl ? "✔" : ""}</td>
        <td className="text-center checkmark">{mk.isRpl ? "" : "✖"}</td>
      </tr>
    );
    number += 1;
  });

  return rows;
}

const printCss = `
:root {
  --blue-header: #e0f2fe;
  --blue-dark: #0369a1;
  --slate-border: #e2e8f0;
  --ghost-white: #f8fafc;
}

html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #0369a1;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #334155;
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
  background: white;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 40px auto;
  padding: 0.75in;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
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
  background: linear-gradient(to right, #bae6fd, #e0f2fe) !important;
  color: #0369a1;
  font-weight: 900;
  padding: 10px 18px;
  border-left: 5px solid #0369a1;
  border-bottom: 2px solid #0369a1;
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

.content {
  text-align: justify;
}

.list-petunjuk {
  padding-left: 16px;
  margin-left: 0;
  margin-bottom: 15px;
  list-style-type: decimal;
}

.list-petunjuk li {
  margin-bottom: 5px;
}

.table-matkul {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 9pt;
}

.table-matkul th,
.table-matkul td {
  border: 1px solid #334155;
  padding: 4px 8px;
  vertical-align: middle;
}

.table-matkul th {
  background-color: #f0f9ff !important;
  color: #0369a1;
  text-align: center;
  font-weight: 800;
  border: 1.5px solid #334155 !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.row-grup {
  background-color: #f1f5f9 !important;
  color: var(--blue-dark);
  font-weight: 800;
  text-align: center;
  letter-spacing: 1px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.text-center { text-align: center; }
.text-bold { font-weight: bold; }

.checkmark {
  font-family: Arial, sans-serif;
  font-weight: bold;
  font-size: 11pt;
  color: #15803d;
}

.diagram-container {
  width: 100%;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e2e8f0;
  background-color: #fcfdfe;
  text-align: center;
  font-size: 8.5pt;
  page-break-inside: avoid;
  box-sizing: border-box;
  border-radius: 8px;
}

.d-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.d-box {
  border: 1.5px solid #475569;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-weight: bold;
  line-height: 1.3;
  min-width: 120px;
}

.d-box-wide {
  min-width: 200px;
  max-width: 350px;
  margin: 0 auto;
}

.d-arrow {
  font-size: 16pt;
  margin: 5px 0;
  font-weight: bold;
  color: #64748b;
}

.d-box-highlight {
  background: var(--blue-dark) !important;
  color: white !important;
  border: none;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.d-box-success {
  border-color: #15803d;
  background-color: #dcfce7 !important;
  color: #15803d;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.diagram-caption {
  font-size: 8.5pt;
  font-style: italic;
  margin-top: 15px;
  color: #64748b;
}

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
}
`;
