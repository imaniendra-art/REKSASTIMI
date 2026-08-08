"use client";

import { useEffect, useState, use } from "react";

export default function PreviewLampiranKonversi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/finalisasi-rpl/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat...</div>;
  if (!data) return <div style={{ padding: 40, color: "red" }}>Data tidak ditemukan</div>;

  const courses = data.recognizedCourses || [];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { background: #f1f5f9; margin: 0; padding: 20px; font-family: "Times New Roman", Times, serif; color: #000; }
        .page-container { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto 20px auto; padding: 20mm; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .content-print { font-size: 12pt; line-height: 1.5; }
        .table-print { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11pt; }
        .table-print th, .table-print td { border: 1px solid #000; padding: 6px 10px; }
        .table-print th { background: #f8fafc; font-weight: bold; text-align: center; }
        .sign-area { margin-top: 50px; display: flex; justify-content: flex-end; }
        .sign-box { width: 300px; text-align: center; }
        @media print {
          body { background: #fff; padding: 0; }
          .page-container { box-shadow: none; margin: 0; padding: 0; }
          .no-print { display: none; }
        }
      `}} />
      <div className="print-body">
        <div className="no-print" style={{ padding: "10px", background: "#f1f5f9", textAlign: "center", borderBottom: "1px solid #cbd5e1" }}>
          <button onClick={() => window.print()} style={{ padding: "8px 16px", background: "#1e40af", color: "white", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
            Cetak Lampiran Konversi
          </button>
        </div>

      <div className="page-container">
        <div className="content-print">
          <div className="kop-surat" style={{ textAlign: "center", borderBottom: "3px solid black", paddingBottom: "10px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0", fontSize: "16pt" }}>SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA</h2>
            <h1 style={{ margin: "5px 0", fontSize: "20pt", fontWeight: "bold" }}>STIMI YAPMI MAKASSAR</h1>
            <p style={{ margin: "0", fontSize: "11pt" }}>Jl. Perintis Kemerdekaan Km. 9, Makassar</p>
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: "0", fontSize: "14pt", textDecoration: "underline" }}>LAMPIRAN HASIL KONVERSI NILAI RPL</h3>
            <p style={{ margin: "5px 0 0 0" }}>Status Finalisasi: <b>{data.statusFinalisasi}</b></p>
          </div>

          <table style={{ marginBottom: "20px", fontSize: "12pt", border: "none" }}>
            <tbody>
              <tr>
                <td style={{ width: "200px" }}>Nama Mahasiswa</td>
                <td>: {data.mahasiswa?.name}</td>
              </tr>
              <tr>
                <td>No Registrasi / NIM</td>
                <td>: {data.mahasiswa?.username}</td>
              </tr>
              <tr>
                <td>Total SKS Diakui</td>
                <td>: {data.totalSksDiakui} SKS (Transfer: {data.totalSksTransfer}, Perolehan: {data.totalSksPerolehan})</td>
              </tr>
            </tbody>
          </table>

          <table className="table-print">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>No</th>
                <th>Kode</th>
                <th>Mata Kuliah</th>
                <th>SKS</th>
                <th>Nilai Huruf</th>
                <th>Jenis Rekognisi</th>
                <th>Asal Sumber</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{c.kode}</td>
                  <td>{c.nama}</td>
                  <td style={{ textAlign: "center" }}>{c.sks}</td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>{c.nilaiHuruf}</td>
                  <td style={{ textAlign: "center" }}>{c.jenisRekognisi}</td>
                  <td>{c.sumber || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sign-area" style={{ marginTop: "40px" }}>
            <div className="sign-box">
              <br/>
              <b>Ketua Program Studi</b>
              <br/><br/><br/><br/>
              <b>( .................................... )</b>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
