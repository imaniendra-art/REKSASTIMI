"use client";

import React from "react";
import Link from "next/link";

export default function F03CetakClient({ data }: { data: any }) {
  const { student, klaster, attempt, matkuls, existingF03 } = data;

  const today = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printCss }} />
      <div className="print-controls no-print">
        <button type="button" className="btn-print-action btn-primary" dangerouslySetInnerHTML={{ __html: `<span onclick="window.print()">Cetak Dokumen</span>` }} />
        <Link href={`/dashboard/mahasiswa/f03/${klaster._id}`} className="btn-print-action btn-secondary">
          Tutup
        </Link>
      </div>

      <div className="document-container">
        {/* Cover Page */}
        <div className="cover-page">
          <img src="/logo_stimi.png" alt="Logo STIMI" className="cover-logo" />

          <div className="cover-univ">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA YAPMI</div>
          <div className="cover-prodi">PROGRAM STUDI S1 MANAJEMEN</div>

          <div className="cover-title-box">
            <div className="cover-title">FORMULIR EVALUASI DIRI (F-03)</div>
            <div className="cover-subtitle">REKOGNISI PEMBELAJARAN LAMPAU</div>
          </div>

          <div className="cover-identity">
            <div><strong>Pemohon:</strong></div>
            <table>
              <tbody>
                <tr>
                  <td>Nama Lengkap</td>
                  <td>:</td>
                  <td style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "14pt" }}>
                    {student.namaLengkap}
                  </td>
                </tr>
                <tr>
                  <td>Nomor Registrasi (No. Reg)</td>
                  <td>:</td>
                  <td style={{ fontWeight: "bold", fontSize: "14pt" }}>
                    {student.nim || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="cover-footer">
            MAKASSAR<br />
            {new Date().getFullYear()}
          </div>
        </div>

        <div className="title-doc">FORMULIR EVALUASI DIRI CALON ASESI RPL (FORM 3 / F03)</div>

        <table className="header-table" style={{ textAlign: "left", fontSize: "10.5pt", fontWeight: "bold" }}>
            <tbody>
                <tr>
                    <td style={{ width: "180px" }}>Program Studi</td>
                    <td style={{ width: "15px" }}>:</td>
                    <td>S1 Manajemen</td>
                </tr>
                <tr>
                    <td>Perguruan Tinggi</td>
                    <td>:</td>
                    <td>STIMI YAPMI Makassar</td>
                </tr>
                <tr>
                    <td>Nama Calon Asesi</td>
                    <td>:</td>
                    <td>{student.namaLengkap}</td>
                </tr>
                <tr>
                    <td>Nomor Registrasi</td>
                    <td>:</td>
                    <td>{student.nim || "-"}</td>
                </tr>
                <tr>
                    <td>Klaster Kompetensi</td>
                    <td>:</td>
                    <td>{klaster.namaKlaster}</td>
                </tr>
            </tbody>
        </table>

        <div className="content">
          <div className="section-title">BAGIAN 1: PENGANTAR</div>
          <p style={{ textAlign: "justify", marginBottom: "12px", fontSize: "10.5pt", lineHeight: 1.4 }}>
            Tujuan pengisian Formulir Evaluasi Diri ini adalah agar calon dapat secara mandiri menilai tingkat
            profesiensi dari setiap kriteria unjuk kerja capaian pembelajaran mata kuliah atau modul pembelajaran dan
            menyampaikan bukti yang diperlukan untuk mendukung klaim tingkat profesiensinya.
            <br /><br />
            Isilah setiap kriteria unjuk kerja atau capaian pembelajaran pada halaman-halaman berikut sesuai dengan
            tingkat profesiansi yang saudara miliki. Saudara harus jujur dalam melakukan penilaian ini.
            <br /><br />
            <strong>Catatan:</strong> Jika saudara merasa yakin dengan kemampuan yang saudara miliki atas pencapaian
            profesiensi setiap kriteria unjuk kerja atau capaian pembelajaran yang dideskripsikan pada halaman berikut,
            dimohon saudara dapat melampirkan bukti yang valid, autentik, terkini, dan memadai untuk mendukung klaim
            saudara atas pencapaian profesiensi yang baik, dan/atau sangat baik tersebut.
          </p>

          <div className="section-title">BAGIAN 2: IDENTIFIKASI TINGKAT PROFISIENSI</div>
          <p style={{ textAlign: "justify", marginBottom: "12px", fontSize: "10.5pt", lineHeight: 1.4 }}>
            Identifikasi tingkat profesiensi pencapaian saudara dalam kriteria unjuk kerja atau capaian pembelajaran
            dengan menggunakan jawaban berikut ini:
          </p>
          <table className="table-matkul" style={{ marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Profisiensi/kemampuan</th>
                <th>Uraian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold" }}>Sangat baik</td>
                <td>
                  • Saya melakukan tugas ini dengan sangat baik, atau<br />
                  • Saya menguasai bahan kajian ini dengan sangat baik, atau<br />
                  • Saya memiliki keterampilan ini, selalu digunakan dalam pekerjaan dengan tepat tanpa ada kesalahan
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Baik</td>
                <td>
                  • Saya melakukan tugas ini dengan baik, atau<br />
                  • Saya menguasai bahan kajian ini dengan baik, atau<br />
                  • Saya memiliki keterampilan ini, dan kadang-kadang digunakan dalam pekerjaan
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Tidak pernah</td>
                <td>
                  • Saya tidak pernah melakukan tugas ini, atau<br />
                  • Saya tidak menguasai bahan kajian ini, atau<br />
                  • Saya tidak memiliki keterampilan ini
                </td>
              </tr>
            </tbody>
          </table>

          <div className="section-title">BAGIAN 3: DAFTAR BUKTI PORTOFOLIO</div>
          <p style={{ textAlign: "justify", marginBottom: "12px", fontSize: "10.5pt", lineHeight: 1.4 }}>
            Bukti yang dapat digunakan untuk mendukung klaim saudara atas pencapaian profesiensi yang baik dan atau sangat baik tersebut antara lain:
          </p>
          <div style={{ display: "flex", gap: "30px", fontSize: "9.5pt", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              1. Ijazah dan/atau Transkrip Nilai dari PT sebelumnya;<br />
              2. Daftar riwayat pekerjaan dan rincian tugas pekerjaan;<br />
              3. Sertifikat Kompetensi dari lembaga sertifikasi;<br />
              4. Sertifikat pengoperasian/lisensi yang sesuai;<br />
              5. Dokumentasi pekerjaan (Foto/Deskripsi pekerjaan);<br />
              6. Buku harian (logbook) kerja atau Harian Kerja;<br />
              7. Lembar tugas atau lembar kerja perusahaan;
            </div>
            <div style={{ flex: 1 }}>
              8. Dokumen analisis, perancangan, atau produk kerja;<br />
              9. Logbook Pelatihan atau Sertifikat Pelatihan;<br />
              10. Catatan pelatihan di lokasi kerja (On-job training);<br />
              11. Keanggotaan asosiasi profesi yang relevan;<br />
              12. Referensi atau surat keterangan kerja dari atasan;<br />
              13. Piagam penghargaan dari industri/masyarakat;<br />
              14. Hasil penilaian kinerja dari perusahaan;<br />
              15. Dokumen lain yang mendukung klaim kompetensi.
            </div>
          </div>

          <div className="section-title">BAGIAN 4: PRINSIP VALIDASI BUKTI (VATM)</div>
          <p style={{ textAlign: "justify", marginBottom: "12px", fontSize: "10.5pt", lineHeight: 1.4 }}>
            Bukti (portofolio) untuk mendukung klaim calon atas pernyataan kriteria capaian pembelajaran mata kuliah
            atau modul pembelajaran yang dilampirkan calon pada saat mengajukan lamaran akan diverifikasi dan divalidasi
            oleh Penilai sesuai prinsip bukti, yaitu, sahih/valid (V), autentik (A), terkini (T) dan cukup/memadai (M),
            yaitu:
          </p>
          <ul style={{ paddingLeft: "24px", marginLeft: 0, lineHeight: 1.4, fontSize: "10.5pt", marginBottom: "30px", listStyleType: "disc" }}>
              <li style={{ marginBottom: "6px" }}><strong>Valid/Sahih:</strong> ada hubungan yang jelas antara persyaratan bukti dari unit kompetensi/mata kuliah yang akan dinilai dengan bukti yang menjadi dasar penilaian;</li>
              <li style={{ marginBottom: "6px" }}><strong>Autentik/Asli:</strong> dapat dibuktikan bahwa buktinya adalah karya calon sendiri.</li>
              <li style={{ marginBottom: "6px" }}><strong>Terkini:</strong> bukti menunjukkan pengetahuan dan keterampilan kandidat saat ini;</li>
              <li style={{ marginBottom: "6px" }}><strong>Memadai/Cukup:</strong> kriteria mengacu kepada kriteria unjuk kerja dan panduan bukti: mendemonstrasikan kompetensi selama periode waktu tertentu; mengacu kepada semua dimensi kompetensi; dan mendemonstrasikan kompetensi dalam konteks yang berbeda;</li>
          </ul>

          <div className="section-title" style={{ pageBreakBefore: "always", background: "#f8fafc" }}>BAGIAN 5: TABEL EVALUASI DIRI & VERIFIKASI PENILAI</div>
          
          {matkuls.map((mk: any) => {
            const entry = existingF03.find((e: any) => e.courseId?.toString() === mk._id.toString()) || {};
            const result = attempt?.matkulResults?.find((r: any) => r.matkulId?.toString() === mk._id.toString()) || {};
            
            const tk = entry.tingkatKemampuan?.toLowerCase() || "";
            const isSangatBaik = tk === "sangat baik";
            const isBaik = tk === "baik";
            const isTidakPernah = tk === "kurang" || tk === "tidak pernah";

            // VATM status from F03Evaluasi
            const vatm = entry.statusValidasi || [];
            const hasV = vatm.includes("V");
            const hasA = vatm.includes("A");
            const hasT = vatm.includes("T");
            const hasM = vatm.includes("M");

            return (
              <div key={mk._id} style={{ marginBottom: "40px", pageBreakInside: "avoid" }}>
                <div style={{ background: "#f1f5f9", padding: "10px 15px", border: "1px solid var(--slate-border)", borderBottom: "none" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11pt" }}>Mata Kuliah: {mk.kode} – {mk.namaMatkul}</div>
                  <div style={{ fontSize: "9.5pt", color: "#64748b", marginTop: "2px" }}>
                    {mk.deskripsi || 'Mata kuliah ini mempelajari kompetensi utama sesuai standar kurikulum program studi Manajemen.'}
                  </div>
                </div>

                <table className="table-matkul" style={{ marginTop: 0 }}>
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: "35%", verticalAlign: "middle" }}>CAPAIAN PEMBELAJARAN (CP)</th>
                      <th colSpan={3} style={{ width: "15%", fontSize: "8pt" }}>KLAIM ASESI</th>
                      <th colSpan={4} style={{ width: "16%", fontSize: "8pt" }}>VERIFIKASI VATM</th>
                      <th colSpan={2} style={{ width: "34%", fontSize: "8pt" }}>BUKTI PORTOFOLIO</th>
                    </tr>
                    <tr>
                      <th style={{ width: "5%", fontSize: "8pt" }}>Sgt Baik</th>
                      <th style={{ width: "5%", fontSize: "8pt" }}>Baik</th>
                      <th style={{ width: "5%", fontSize: "8pt" }}>Tdk Pernah</th>
                      <th style={{ width: "4%", fontSize: "8pt" }}>V</th>
                      <th style={{ width: "4%", fontSize: "8pt" }}>A</th>
                      <th style={{ width: "4%", fontSize: "8pt" }}>T</th>
                      <th style={{ width: "4%", fontSize: "8pt" }}>M</th>
                      <th style={{ width: "9%", fontSize: "8pt" }}>No. Dok</th>
                      <th style={{ width: "25%", fontSize: "8pt" }}>Link Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mk.cpmkList?.map((cpmk: string, idx: number) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "justify", fontSize: "8.5pt" }}>{cpmk}</td>

                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: isSangatBaik ? "#dcfce7" : "transparent" }}>{isSangatBaik && "✓"}</td>
                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: isBaik ? "#dcfce7" : "transparent" }}>{isBaik && "✓"}</td>
                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: isTidakPernah ? "#dcfce7" : "transparent" }}>{isTidakPernah && "✓"}</td>

                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: hasV ? "#dcfce7" : "transparent" }}>{hasV && "✓"}</td>
                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: hasA ? "#dcfce7" : "transparent" }}>{hasA && "✓"}</td>
                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: hasT ? "#dcfce7" : "transparent" }}>{hasT && "✓"}</td>
                        <td className="text-center fw-bold" style={{ color: "#15803d", backgroundColor: hasM ? "#dcfce7" : "transparent" }}>{hasM && "✓"}</td>

                        <td className="text-center fw-bold">
                          {entry.jenisBukti?.map((num: number) => num.toString().padStart(2, "0")).join(", ") || "-"}
                        </td>
                        <td className="text-center">
                          {entry.buktiFileUrl ? (
                            <a href={entry.buktiFileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontSize: "9pt", fontWeight: "bold" }}>
                              Link Drive
                            </a>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ background: "#fff7ed", padding: "12px", border: "1px solid var(--slate-border)", borderTop: "none" }}>
                   <div style={{ fontWeight: "bold", color: "#c2410c", fontSize: "9pt", marginBottom: "8px" }}>INFORMASI & JUSTIFIKASI PENILAIAN:</div>
                   <div style={{ fontSize: "9.5pt", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", color: "#334155" }}>
                      <div><strong>Tanggal:</strong> {entry.tanggalPenilaian ? new Date(entry.tanggalPenilaian).toLocaleDateString("id-ID") : "-"}</div>
                      <div><strong>Waktu:</strong> {entry.waktuPenilaian || "-"}</div>
                      <div><strong>Tempat:</strong> {entry.lokasiPenilaian || "-"}</div>
                      <div><strong>Penilai:</strong> {entry.penilai1 || "-"} {entry.penilai2 ? `& ${entry.penilai2}` : ""}</div>
                   </div>
                   <div style={{ fontSize: "10pt", marginTop: "10px", fontStyle: "italic", borderTop: "1px dashed #fdba74", paddingTop: "8px", color: "#1e293b" }}>
                     {entry.nilaiHuruf ? (
                      <>
                        <div style={{ marginBottom: "6px" }}>
                          {entry.catatanAsesor || "Berdasarkan verifikasi VATM, asesi dinyatakan kompeten."}
                        </div>
                        <div>
                          Nilai Akhir: <strong style={{ background: "#1e293b", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>{entry.nilaiHuruf}</strong>
                        </div>
                      </>
                     ) : (
                       <span style={{ color: "#94a3b8" }}>Belum ada catatan justifikasi penilai.</span>
                     )}
                   </div>
                </div>
              </div>
            );
          })}


          <div style={{ marginTop: "40px", fontSize: "10.5pt" }}>
              <p style={{ textAlign: "justify", marginBottom: "8px", fontWeight: "bold" }}>
                  Saya telah membaca dan mengisi Formulir Evaluasi Diri ini untuk mengikuti asesmen RPL dan dengan ini saya menyatakan:
              </p>
              <ol style={{ textAlign: "justify", paddingLeft: "16px", marginLeft: 0, lineHeight: 1.4, listStyleType: "decimal" }}>
                  <li style={{ marginBottom: "8px" }}>Semua informasi yang saya tuliskan adalah sepenuhnya benar dan saya bertanggung-jawab atas seluruh data dalam formulir ini. Apabila di kemudian hari ternyata informasi yang saya sampaikan tersebut adalah tidak benar, maka saya bersedia menerima sanksi sesuai dengan ketentuan yang berlaku;</li>
                  <li style={{ marginBottom: "8px" }}>Saya memberikan izin kepada pihak pengelola program RPL, untuk melakukan pemeriksaan kebenaran informasi yang saya berikan dalam formulir evaluasi diri ini kepada seluruh pihak yang terkait dengan data akademik sebelumnya dan kepada perusahaan tempat saya bekerja sebelumnya dan atau saat ini saya bekerja; dan</li>
                  <li style={{ marginBottom: "8px" }}>Saya bersedia untuk mengikuti asesmen lanjutan untuk membuktikan kompetensi saya, sesuai waktu dan tempat/platform daring yang ditentukan oleh unit RPL.</li>
              </ol>

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
                  <div style={{ width: "280px", textAlign: "left" }}>
                      <strong>Penilai</strong>
                      <div style={{ height: "70px" }}></div>
                      <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                          ( Tim Penilai RPL )
                      </div>
                  </div>
                  <div style={{ width: "280px", textAlign: "left" }}>
                      Makassar, {today}<br />
                      <strong>Calon Asesi / Pemohon</strong>
                      <div style={{ height: "70px" }}></div>
                      <div style={{ fontWeight: "bold", textTransform: "uppercase", textDecoration: "underline" }}>
                          {student.namaLengkap}
                      </div>
                  </div>
              </div>
          </div>

          <div style={{ marginTop: "60px", fontSize: "8.5pt", color: "#94a3b8", textAlign: "center", fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
            Dokumen ini dibuat dan dicetak secara otomatis melalui sistem REKSA STIMI YAPMI Makassar
          </div>
        </div>
      </div>
    </>
  );
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
`;;
