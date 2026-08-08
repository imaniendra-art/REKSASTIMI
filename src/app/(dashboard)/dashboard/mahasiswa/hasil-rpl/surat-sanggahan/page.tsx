"use client";

import { useEffect, useState } from "react";

export default function PreviewSuratSanggahanPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/mahasiswa/hasil-rpl`);
      const json = await res.json();
      if (res.ok && json.data && json.data.length > 0) {
        // We pick the first one for MVP
        setData(json.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat...</div>;
  if (!data) return <div style={{ padding: 40, color: "red" }}>Data tidak ditemukan</div>;

  const tanggal = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { background: #f1f5f9; margin: 0; padding: 20px; font-family: "Times New Roman", Times, serif; color: #000; }
        .page-container { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto 20px auto; padding: 20mm; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .content-print { font-size: 12pt; line-height: 1.5; }
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
            Cetak Surat Pernyataan
          </button>
        </div>

      <div className="page-container">
        <div className="content-print" style={{ lineHeight: "1.6" }}>
          
          <div style={{ textAlign: "center", marginBottom: "30px", marginTop: "20px" }}>
            <h3 style={{ margin: "0", fontSize: "14pt", textDecoration: "underline", textTransform: "uppercase" }}>SURAT PERNYATAAN HASIL REKOGNISI PEMBELAJARAN LAMPAU</h3>
          </div>

          <p>Yang bertanda tangan di bawah ini:</p>
          <table style={{ marginBottom: "20px", fontSize: "12pt", border: "none", width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ width: "200px" }}>Nama Lengkap</td>
                <td>: <b>{data.mahasiswaId?.name || "..."}</b></td>
              </tr>
              <tr>
                <td>No Registrasi / Username</td>
                <td>: {data.mahasiswaId?.username || "..."}</td>
              </tr>
              <tr>
                <td>Program Studi</td>
                <td>: Manajemen</td>
              </tr>
            </tbody>
          </table>

          <p style={{ textAlign: "justify" }}>
            Dengan ini menyatakan bahwa saya telah membaca, memahami, dan menyetujui draf hasil konversi nilai Rekognisi Pembelajaran Lampau (RPL) yang telah ditetapkan oleh Tim Penilai RPL STIMI YAPMI Makassar.
          </p>
          
          <p style={{ textAlign: "justify" }}>
            Adapun total SKS yang diakui dari hasil penilaian tersebut adalah sejumlah <b>{data.totalSksDiakui} SKS</b>.
          </p>

          <p style={{ textAlign: "justify" }}>
            Berdasarkan hasil tersebut, saya menyatakan bahwa saya <b>MENERIMA HASIL</b> dan 
            {data.sanggahans?.length > 0 ? (
               <span> <b>TELAH MENYELESAIKAN PROSES SANGGAHAN</b> yang saya ajukan sebelumnya. </span>
            ) : (
               <span> <b>TIDAK MENGAJUKAN SANGGAHAN</b>. </span>
            )} 
            Keputusan ini saya buat dalam keadaan sadar dan tanpa paksaan dari pihak manapun.
          </p>

          <p style={{ textAlign: "justify" }}>
            Demikian surat pernyataan ini dibuat agar dapat dipergunakan sebagaimana mestinya untuk proses Pleno dan penerbitan SK Hasil RPL.
          </p>

          <div className="sign-area" style={{ marginTop: "60px", display: "flex", justifyContent: "flex-end" }}>
            <div className="sign-box" style={{ width: "300px", textAlign: "center" }}>
              Makassar, {tanggal}
              <br/>Yang Membuat Pernyataan,
              <br/><br/><br/><br/><br/>
              <b>( {data.mahasiswaId?.name || "................................"} )</b>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
