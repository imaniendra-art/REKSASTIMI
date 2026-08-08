"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function MahasiswaBundlePrintPage({ params }: { params: Promise<{ mahasiswaId: string }> }) {
  const { mahasiswaId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finalizing, setFinalizing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dokumen-rpl/${mahasiswaId}/bundle`);
      if (!res.ok) throw new Error("Gagal memuat data bundle");
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mahasiswaId]);

  const handleFinalize = async () => {
    if (!confirm("Finalisasi bundle? Tindakan ini akan mengunci dokumen menjadi FINAL/ARSIP.")) return;
    try {
      setFinalizing(true);
      const res = await fetch(`/api/admin/dokumen-rpl/${mahasiswaId}/bundle`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      alert("Berhasil!");
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat Bundle...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  if (!data) return null;

  const bundleDoc = data.bundleDoc;
  const isFinal = bundleDoc?.status === "FINAL" || bundleDoc?.status === "ARSIP";
  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const verifyLink = bundleDoc?.verifiedToken ? `${originUrl}/verify/dokumen/${bundleDoc.verifiedToken}` : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { background: #f1f5f9; margin: 0; padding: 20px; font-family: "Times New Roman", Times, serif; color: #000; }
        .page-container { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto 20px auto; padding: 20mm; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
        .page-break { page-break-before: always; }
        .content-print { font-size: 12pt; line-height: 1.5; }
        .table-print { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11pt; }
        .table-print th, .table-print td { border: 1px solid #000; padding: 6px 10px; }
        .table-print th { background: #f8fafc; font-weight: bold; text-align: center; }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          color: rgba(200, 200, 200, 0.2);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          font-weight: bold;
          text-transform: uppercase;
        }

        .header-print { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; position: relative; zIndex: 1; }
        .header-print h1 { font-size: 18pt; margin: 0 0 5px 0; font-weight: bold; }
        .header-print h2 { font-size: 14pt; margin: 0; font-weight: normal; }
        
        .footer-print {
          position: absolute;
          bottom: 20mm;
          left: 20mm;
          right: 20mm;
          font-size: 9pt;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 5px;
          display: flex;
          justify-content: space-between;
          zIndex: 1;
        }

        .no-print { display: flex; gap: 10px; padding: 15px; background: #fff; border-radius: 8px; margin-bottom: 20px; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .btn-print { padding: 8px 16px; background: #1e40af; color: white; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
        .btn-action { padding: 8px 16px; background: #10b981; color: white; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }

        @media print {
          body { background: #fff; padding: 0; }
          .page-container { box-shadow: none; margin: 0; padding: 20mm; }
          .no-print { display: none; }
        }
      `}} />

      <div className="no-print">
        <button onClick={() => window.print()} className="btn-print">🖨️ Cetak Bundle</button>
        {!isFinal && bundleDoc && (
          <button onClick={handleFinalize} disabled={finalizing} className="btn-action">✅ Finalisasi & Kunci Bundle</button>
        )}
        <Link href={`/dashboard/admin/dokumen-rpl/${mahasiswaId}`} style={{ padding: "8px 16px", background: "#f1f5f9", color: "#334155", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>
          Kembali
        </Link>
      </div>

      {/* COVER BUNDLE */}
      <div className="page-container">
        {!isFinal && <div className="watermark">DRAFT - BELUM FINAL</div>}
        
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h1 style={{ fontSize: "24pt", fontWeight: "bold", textAlign: "center", marginBottom: 40 }}>
            BUNDLE DOKUMEN REKOGNISI PEMBELAJARAN LAMPAU (RPL)
          </h1>
          
          <table style={{ fontSize: "14pt", width: "80%", marginBottom: 60, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px 0", width: "200px", fontWeight: "bold" }}>Nama Lengkap</td>
                <td style={{ padding: "10px 0" }}>: {data.student.name}</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", fontWeight: "bold" }}>No. Registrasi / NIM</td>
                <td style={{ padding: "10px 0" }}>: {data.student.username}</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", fontWeight: "bold" }}>Program Studi</td>
                <td style={{ padding: "10px 0" }}>: Manajemen</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", fontWeight: "bold" }}>Periode Akademik</td>
                <td style={{ padding: "10px 0" }}>: {data.profile?.periodId?.name || "-"}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: "center", fontSize: "16pt", fontWeight: "bold" }}>
            SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI)<br/>
            YAPMI MAKASSAR<br/>
            {new Date().getFullYear()}
          </div>
        </div>

        {isFinal && (
          <div className="footer-print">
            <div>FINAL - TERVERIFIKASI REKSA (v{bundleDoc?.version || 1})</div>
            <div>Validasi Publik: <a href={verifyLink!} style={{ color: "#000" }}>{verifyLink}</a></div>
          </div>
        )}
      </div>

      {/* DAFTAR ISI BUNDLE */}
      <div className="page-container page-break">
        {!isFinal && <div className="watermark">DRAFT - BELUM FINAL</div>}
        <div className="header-print">
          <h2>STIMI YAPMI MAKASSAR</h2>
          <h1>DAFTAR ISI BUNDLE DOKUMEN RPL</h1>
        </div>
        
        <div className="content-print" style={{ position: "relative", zIndex: 1 }}>
          <ol style={{ lineHeight: "2" }}>
            <li>Formulir F01: Daftar Riwayat Hidup (CV) dan Profil Pendaftar</li>
            <li>Formulir F02: Aplikasi Asesmen RPL</li>
            <li>Formulir F03: Evaluasi Diri dan Hasil Penilaian (VATM)</li>
            <li>Surat Tugas Penilaian RPL</li>
            <li>Berita Acara Pleno RPL</li>
            <li>Surat Keputusan (SK) Hasil RPL</li>
            <li>Lampiran Daftar Mata Kuliah yang Diakui (Konversi)</li>
            <li>Surat Pernyataan Mahasiswa Menerima Hasil RPL</li>
          </ol>
        </div>

        {isFinal && (
          <div className="footer-print">
            <div>FINAL - TERVERIFIKASI REKSA</div>
            <div>Validasi Publik: <a href={verifyLink!} style={{ color: "#000" }}>{verifyLink}</a></div>
          </div>
        )}
      </div>

      {/* DAFTAR REKOGNISI RINGKAS */}
      <div className="page-container page-break">
        {!isFinal && <div className="watermark">DRAFT - BELUM FINAL</div>}
        <div className="header-print">
          <h2>STIMI YAPMI MAKASSAR</h2>
          <h1>RINGKASAN HASIL REKOGNISI</h1>
        </div>
        
        <div className="content-print" style={{ position: "relative", zIndex: 1 }}>
           <p>
             Berdasarkan proses asesmen Rekognisi Pembelajaran Lampau (RPL) untuk mahasiswa atas nama <b>{data.student.name}</b>, 
             berikut adalah daftar mata kuliah yang disetujui untuk dikonversi:
           </p>

           <table className="table-print">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>No</th>
                <th>Kode</th>
                <th>Mata Kuliah</th>
                <th>SKS</th>
                <th>Nilai Huruf</th>
                <th>Jenis Rekognisi</th>
              </tr>
            </thead>
            <tbody>
              {(data.finalResult?.recognizedCourses || []).map((c: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{c.kode}</td>
                  <td>{c.nama}</td>
                  <td style={{ textAlign: "center" }}>{c.sks}</td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>{c.nilaiHuruf}</td>
                  <td style={{ textAlign: "center" }}>{c.jenisRekognisi}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20 }}>
            <b>Total SKS Diakui:</b> {data.finalResult?.totalSksDiakui || 0} SKS
          </div>

          <div style={{ marginTop: 60, textAlign: "justify", fontStyle: "italic", fontSize: "10pt" }}>
            Catatan: Bundle ini merupakan cetakan elektronik yang digabungkan secara sistem. Lembar-lembar detail seperti F01, F02, F03 dapat dicetak terpisah atau dilampirkan secara fisik di bawah dokumen cover ini jika menggunakan pencetakan manual.
          </div>
        </div>

        {isFinal && (
          <div className="footer-print">
            <div>FINAL - TERVERIFIKASI REKSA</div>
            <div>Validasi Publik: <a href={verifyLink!} style={{ color: "#000" }}>{verifyLink}</a></div>
          </div>
        )}
      </div>

    </>
  );
}
