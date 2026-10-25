"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export function SertifikatClient({ klasterId }: { klasterId: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/mahasiswa/asesmen/${klasterId}/sertifikat`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data sertifikat.");
        return res.json();
      })
      .then((json) => {
        setData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [klasterId]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Menyiapkan sertifikat Anda...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Terjadi Kesalahan</h3>
        <p>{error || "Data tidak ditemukan."}</p>
        <button onClick={() => router.push(`/dashboard/mahasiswa/asesmen/${klasterId}`)} style={{ padding: "8px 16px", marginTop: 16 }}>
          Kembali
        </button>
      </div>
    );
  }

  const { student, klaster, certificateNumber, issuedAt, transkrip } = data;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(issuedAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  // Hitung predikat dari rata-rata transkrip
  let averageScore = 0;
  if (transkrip && transkrip.length > 0) {
    averageScore = transkrip.reduce((sum: number, t: any) => sum + (t.finalScore || 0), 0) / transkrip.length;
  }
  
  let predikat = "Perlu Penguatan";
  if (averageScore >= 85) predikat = "Sangat Baik";
  else if (averageScore >= 75) predikat = "Baik";
  else if (averageScore >= 60) predikat = "Cukup";

  const qrUrl = "https://reksa.stimi.ac.id/verify?certificate=" + encodeURIComponent(certificateNumber);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Great+Vibes&family=Inter:wght@400;500;600;700&display=swap');
        
        .cert-body {
          background: #e2e8f0;
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .print-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 20px;
          border-radius: 50px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .btn-action {
          border-radius: 50px;
          padding: 10px 24px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        
        .btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-primary { background: #0a2342; color: white; }
        .btn-secondary { background: #64748b; color: white; }

        /* A4 Landscape Size: 297mm x 210mm */
        .cert-page {
          width: 297mm;
          height: 210mm;
          background: #fdfbf7;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          padding: 8mm;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        /* The decorative outer border */
        .cert-border-outer {
          position: absolute;
          top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
          border: 2px solid #0a2342;
          pointer-events: none;
        }
        .cert-border-inner {
          position: absolute;
          top: 11.5mm; left: 11.5mm; right: 11.5mm; bottom: 11.5mm;
          border: 1px solid #c5a059;
          pointer-events: none;
        }
        
        /* Corner ornaments using pure CSS */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 30mm;
          height: 30mm;
          pointer-events: none;
        }
        .corner-tl { top: 9mm; left: 9mm; border-top: 4px solid #0a2342; border-left: 4px solid #0a2342; }
        .corner-tr { top: 9mm; right: 9mm; border-top: 4px solid #0a2342; border-right: 4px solid #0a2342; }
        .corner-bl { bottom: 9mm; left: 9mm; border-bottom: 4px solid #0a2342; border-left: 4px solid #0a2342; }
        .corner-br { bottom: 9mm; right: 9mm; border-bottom: 4px solid #0a2342; border-right: 4px solid #0a2342; }

        .shield-logo {
          position: absolute;
          top: 0;
          left: 30mm;
          width: 60px;
          height: 90px;
          background: #0a2342;
          border: 2px solid #c5a059;
          border-top: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%);
          z-index: 10;
        }
        .shield-logo-inner {
          font-family: 'Cinzel', serif;
          color: #c5a059;
          font-size: 28px;
          font-weight: 800;
          margin-top: -10px;
        }
        .shield-logo-text {
          font-family: 'Inter', sans-serif;
          color: #c5a059;
          font-size: 9px;
          letter-spacing: 1px;
          margin-top: 5px;
          text-transform: uppercase;
        }

        .kop-container {
          text-align: center;
          margin-top: 15mm;
          margin-bottom: 5mm;
        }
        .kop-title {
          font-family: 'Cinzel', serif;
          font-size: 28px;
          font-weight: 800;
          color: #0a2342;
          margin: 0;
          letter-spacing: 2px;
        }
        .kop-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #c5a059;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 4px 0 10px 0;
        }
        .kop-separator {
          width: 150px;
          height: 1px;
          background: #c5a059;
          margin: 0 auto;
          position: relative;
        }
        .kop-separator::after {
          content: '♦';
          position: absolute;
          left: 50%;
          top: -6px;
          transform: translateX(-50%);
          color: #c5a059;
          font-size: 12px;
          background: #fdfbf7;
          padding: 0 5px;
        }
        .kop-reksa {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #334155;
          margin-top: 10px;
          letter-spacing: 0.5px;
        }

        .cert-main-title {
          font-family: 'Cinzel', serif;
          font-size: 38px;
          font-weight: 800;
          color: #0a2342;
          text-align: center;
          margin: 8mm 0 4mm 0;
          letter-spacing: 4px;
        }

        .given-to {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #334155;
          text-align: center;
          margin-bottom: 2mm;
        }

        .student-name {
          font-family: 'Great Vibes', cursive;
          font-size: 64px;
          color: #0a2342;
          text-align: center;
          line-height: 1.1;
          margin: 0 auto;
          padding-bottom: 5px;
          border-bottom: 1px solid #c5a059;
          display: inline-block;
          min-width: 400px;
        }
        
        .student-name-wrapper {
          text-align: center;
          margin-bottom: 6mm;
        }

        .cert-description {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: #334155;
          text-align: center;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 8mm auto;
        }

        .info-grid {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 0 auto 12mm auto;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 0;
          width: 85%;
        }
        .info-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .info-col:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -10px;
          top: 10%;
          height: 80%;
          width: 1px;
          background: #c5a059;
        }
        .info-label {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .info-value {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          font-weight: 700;
          color: #0a2342;
          text-align: center;
        }

        .signature-area {
          display: flex;
          justify-content: space-between;
          width: 80%;
          margin: 0 auto;
          align-items: flex-end;
        }
        .sig-block {
          text-align: center;
          width: 200px;
        }
        .sig-title {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 700;
          color: #0a2342;
          margin-bottom: 45px;
        }
        .sig-name {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #0a2342;
          border-bottom: 1px solid #0a2342;
          padding-bottom: 2px;
          margin-bottom: 4px;
          display: inline-block;
          min-width: 180px;
        }
        .sig-nip {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          color: #64748b;
        }

        .qr-block {
          text-align: center;
        }
        .qr-title {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          color: #0a2342;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .qr-img {
          width: 60px;
          height: 60px;
          margin: 0 auto;
          border: 2px solid #0a2342;
          padding: 3px;
          background: white;
        }
        .qr-note {
          font-family: 'Inter', sans-serif;
          font-size: 7px;
          color: #64748b;
          margin-top: 4px;
        }

        .page-footer {
          position: absolute;
          bottom: 10mm;
          left: 0;
          width: 100%;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          color: #94a3b8;
        }

        /* Transcript Styles */
        .transcript-title-container {
          text-align: center;
          margin-top: 25mm;
          margin-bottom: 15mm;
        }
        .transcript-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #334155;
          margin-top: 6px;
        }

        .student-info-transkrip {
          display: flex;
          justify-content: space-between;
          width: 85%;
          margin: 0 auto 8mm auto;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #1e293b;
        }
        .student-info-transkrip table {
          width: 45%;
        }
        .student-info-transkrip td {
          padding: 3px 0;
        }
        .student-info-transkrip .td-label {
          width: 120px;
        }
        .student-info-transkrip .td-colon {
          width: 15px;
        }

        .transcript-table {
          width: 85%;
          margin: 0 auto;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
        }
        .transcript-table th {
          background: #0a2342;
          color: white;
          padding: 10px;
          font-family: 'Cinzel', serif;
          font-weight: 600;
          letter-spacing: 1px;
          border: 1px solid #c5a059;
        }
        .transcript-table td {
          padding: 8px 10px;
          border: 1px solid #c5a059;
          color: #1e293b;
        }
        .transcript-table tbody tr:nth-child(even) {
          background-color: #f8f6f0;
        }
        .transcript-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }

        .transcript-footer {
          display: flex;
          justify-content: space-between;
          width: 85%;
          margin: 15mm auto 0 auto;
          align-items: flex-end;
        }
        .transcript-note {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          color: #334155;
          line-height: 1.5;
          width: 60%;
        }
        .transcript-sig {
          width: 35%;
          text-align: center;
        }

        /* Print overrides */
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cert-body {
            padding: 0;
            background: transparent;
            gap: 0;
          }
          .print-controls {
            display: none !important;
          }
          .cert-page {
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .cert-page:last-child {
            page-break-after: auto;
          }
        }
      `}} />

      <div className="cert-body">
        <div className="print-controls">
          <button onClick={handlePrint} className="btn-action btn-primary">
            Cetak Dokumen
          </button>
          <button onClick={() => router.push(`/dashboard/mahasiswa/asesmen/${klasterId}`)} className="btn-action btn-secondary">
            Tutup
          </button>
        </div>

        {/* Halaman 1: Sertifikat Kompetensi */}
        <div className="cert-page">
          <div className="cert-border-outer"></div>
          <div className="cert-border-inner"></div>
          <div className="corner-tl"></div>
          <div className="corner-tr"></div>
          <div className="corner-bl"></div>
          <div className="corner-br"></div>

          <div className="shield-logo">
            <div className="shield-logo-inner">R</div>
            <div className="shield-logo-text">REKSA</div>
          </div>

          <div className="kop-container">
            <h1 className="kop-title">STIMI YAPMI MAKASSAR</h1>
            <div className="kop-subtitle">Sekolah Tinggi Ilmu Manajemen Informatika YAPMI</div>
            <div className="kop-separator"></div>
            <div className="kop-reksa">REKSA – Rekognisi Evaluasi dan Konversi Akademik STIMI</div>
          </div>

          <h2 className="cert-main-title">SERTIFIKAT KOMPETENSI</h2>

          <div className="given-to">diberikan kepada</div>

          <div className="student-name-wrapper">
            <div className="student-name">{student.fullName}</div>
          </div>

          <div className="cert-description">
            yang telah mengikuti dan dinyatakan berhasil dalam proses Rekognisi Evaluasi dan Konversi Akademik STIMI (REKSA) serta memenuhi kompetensi sesuai klaster yang ditetapkan.<br />
            Sertifikat ini diberikan sebagai pengakuan atas capaian kompetensi yang telah diperoleh.
          </div>

          <div className="info-grid">
            <div className="info-col">
              <div className="info-label">📋 NOMOR SERTIFIKAT</div>
              <div className="info-value">{certificateNumber}</div>
            </div>
            <div className="info-col">
              <div className="info-label">💻 KLASTER KOMPETENSI</div>
              <div className="info-value">{klaster.namaKlaster}</div>
            </div>
            <div className="info-col">
              <div className="info-label">⭐ NILAI / PREDIKAT</div>
              <div className="info-value">{predikat}</div>
            </div>
            <div className="info-col">
              <div className="info-label">📅 TANGGAL TERBIT</div>
              <div className="info-value">{formattedDate}</div>
            </div>
          </div>

          <div className="signature-area">
            <div className="sig-block">
              <div className="sig-title">KETUA STIMI YAPMI MAKASSAR</div>
              {/* Fake signature placeholder */}
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 24, color: "#0a2342", marginBottom: 5 }}>Dr. H. Andi Supardi</div>
              <div className="sig-name">Dr. H. Andi Supardi, S.E., M.M.</div>
              <div className="sig-nip">NIDN. 0915077001</div>
            </div>

            <div className="sig-block">
              <div className="sig-title">KETUA TIM REKSA</div>
              {/* Fake signature placeholder */}
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 24, color: "#0a2342", marginBottom: 5 }}>Nur Afifah</div>
              <div className="sig-name">Dr. Nur Afifah, S.Kom., M.T.</div>
              <div className="sig-nip">NIDN. 0922058302</div>
            </div>

            <div className="qr-block">
              <div className="qr-title">VERIFIKASI</div>
              <div className="qr-img">
                <QRCodeSVG value={qrUrl} size={50} level="M" />
              </div>
              <div className="qr-note">Pindai untuk verifikasi<br/>keaslian sertifikat</div>
            </div>
          </div>

          <div className="page-footer">
            Halaman 1 – Sertifikat Kompetensi
          </div>
        </div>

        {/* Halaman 2: Transkrip Nilai */}
        <div className="cert-page">
          <div className="cert-border-outer"></div>
          <div className="cert-border-inner"></div>
          <div className="corner-tl"></div>
          <div className="corner-tr"></div>
          <div className="corner-bl"></div>
          <div className="corner-br"></div>

          <div className="shield-logo">
            <div className="shield-logo-inner">R</div>
            <div className="shield-logo-text">REKSA</div>
          </div>

          <div className="kop-container">
            <h1 className="kop-title">STIMI YAPMI MAKASSAR</h1>
            <div className="kop-subtitle">Sekolah Tinggi Ilmu Manajemen Informatika YAPMI</div>
            <div className="kop-separator"></div>
            <div className="kop-reksa">REKSA – Rekognisi Evaluasi dan Konversi Akademik STIMI</div>
          </div>

          <div className="transcript-title-container">
            <h2 className="cert-main-title" style={{ fontSize: 26, margin: 0 }}>TRANSKRIP NILAI ASESMEN KOMPETENSI RPL</h2>
            <div className="transcript-subtitle">Bagian tak terpisahkan dari Sertifikat Kompetensi</div>
          </div>

          <div className="student-info-transkrip">
            <table>
              <tbody>
                <tr>
                  <td className="td-label">Nama Mahasiswa</td>
                  <td className="td-colon">:</td>
                  <td style={{ fontWeight: 600 }}>{student.fullName}</td>
                </tr>
                <tr>
                  <td className="td-label">NIM / Username</td>
                  <td className="td-colon">:</td>
                  <td>{student.nim}</td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr>
                  <td className="td-label">Klaster Kompetensi</td>
                  <td className="td-colon">:</td>
                  <td>{klaster.namaKlaster}</td>
                </tr>
                <tr>
                  <td className="td-label">Tahun Akademik</td>
                  <td className="td-colon">:</td>
                  <td>2025/2026</td>
                </tr>
              </tbody>
            </table>
          </div>

          <table className="transcript-table">
            <thead>
              <tr>
                <th style={{ width: "5%", textAlign: "center" }}>No</th>
                <th style={{ textAlign: "left" }}>Mata Kuliah</th>
                <th style={{ width: "15%", textAlign: "center" }}>Nilai Angka</th>
                <th style={{ width: "15%", textAlign: "center" }}>Nilai Huruf</th>
              </tr>
            </thead>
            <tbody>
              {transkrip.map((t: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{t.matkulName}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{t.finalScore}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{t.finalGrade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="transcript-footer">
            <div className="transcript-note">
              Transkrip nilai ini merupakan bagian tak terpisahkan dari Sertifikat Kompetensi<br/>
              yang diterbitkan oleh STIMI YAPMI Makassar melalui sistem REKSA STIMI.
            </div>
            <div className="transcript-sig">
              <div style={{ marginBottom: 4 }}>Makassar, {formattedDate}</div>
              <div style={{ fontWeight: 600, color: "#0a2342", marginBottom: 35 }}>Koordinator RPL / Tim REKSA</div>
              {/* Fake signature */}
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 20, color: "#0a2342", marginBottom: 0 }}>Nur Afifah</div>
              <div style={{ fontWeight: 700, borderBottom: "1px solid #0a2342", paddingBottom: 2, display: "inline-block", minWidth: 180 }}>Dr. Nur Afifah, S.Kom., M.T.</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>NIDN. 0922058302</div>
            </div>
          </div>

          <div className="page-footer">
            Halaman 2 – Transkrip Nilai
          </div>
        </div>

      </div>
    </>
  );
}
