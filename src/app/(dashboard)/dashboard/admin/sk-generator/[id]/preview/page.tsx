"use client";

import { useEffect, useState, use } from "react";

export default function PreviewSkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [penilai, setPenilai] = useState<any[]>([]);
  const [plotting, setPlotting] = useState<any[]>([]);
  const [finalResults, setFinalResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/sk-generator/${id}`);
      if (!res.ok) throw new Error("Gagal load SK");
      const json = await res.json();
      setData(json.data);

      const skType = json.data.sk.skType;
      const periodId = json.data.sk.periodId;

      if (skType === "SK_PENGELOLA_RPL") {
        const tr = await fetch(`/api/admin/rpl-period-team?periodId=${periodId}`);
        if (tr.ok) setTeam((await tr.json()).data);
      }
      if (skType === "SK_PENILAI_RPL") {
        const pr = await fetch(`/api/admin/rpl-period-penilai?periodId=${periodId}`);
        if (pr.ok) setPenilai((await pr.json()).data);
      }
      if (skType === "SK_PENUGASAN_PENILAI") {
        const pl = await fetch(`/api/admin/plotting-f03?statusPlotting=Sudah Diplotting`);
        if (pl.ok) {
          const jsonPl = await pl.json();
          setPlotting(jsonPl.data.filter((d: any) => d.plottingStatus === "Sudah Diplotting" && d.penilaiId));
        }
      }
      if (skType === "BA_PLENO" || skType === "SK_HASIL_RPL") {
        const fr = await fetch(`/api/admin/finalisasi-rpl?periodId=${periodId}&statusFinalisasi=FINAL`);
        if (fr.ok) {
          const jsonFr = await fr.json();
          // Filter yg sudah pleno atau siap pleno
          const target = jsonFr.data.filter((d:any) => d.plenoStatus === "SIAP_PLENO" || d.plenoStatus === "SUDAH_PLENO");
          // But we need detailed course data, so let's fetch detail for each if needed? 
          // For SK_HASIL_RPL we need course list, so let's fetch each detail
          if (skType === "SK_HASIL_RPL") {
            const detailed = await Promise.all(target.map(async (t:any) => {
               const detReq = await fetch(`/api/admin/finalisasi-rpl/${t._id}`);
               if (detReq.ok) return (await detReq.json()).data;
               return t;
            }));
            setFinalResults(detailed);
          } else {
            setFinalResults(target);
          }
        }
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Menyiapkan dokumen...</div>;
  if (!data) return <div style={{ padding: 40, color: "red" }}>Data tidak ditemukan</div>;

  const sk = data.sk;
  const lampiran = data.lampiran;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body { background: #f1f5f9; margin: 0; padding: 20px; font-family: "Times New Roman", Times, serif; color: #000; }
        .page-container {
          background: #fff;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px auto;
          padding: 20mm;
          box-sizing: border-box;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .table-print th { background: #f8fafc; font-weight: bold; text-align: center; }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(200, 200, 200, 0.2);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          font-weight: bold;
          text-transform: uppercase;
        }

        .header-print {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
          position: relative;
          zIndex: 1;
        }
        
        .print-btn {
          position: fixed; top: 20px; right: 20px;
          padding: 12px 24px; background: #1d4ed8; color: #fff;
          border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        @media print {
          body { background: #fff; padding: 0; }
          .page-container { box-shadow: none; margin: 0; padding: 0; }
          .print-btn { display: none; }
        }
      `}} />

      <button className="print-btn" onClick={handlePrint}>🖨️ Cetak Dokumen</button>

      {/* HALAMAN UTAMA SK */}
      <div className="page-container" style={{ position: "relative" }}>
        {sk.status !== "FINAL" && <div className="watermark">DRAFT - BELUM FINAL</div>}
        <div className="header-print">
          <h1>SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR</h1>
          <h2>Panitia Penyelenggara Rekognisi Pembelajaran Lampau (RPL)</h2>
        </div>

        <div className="content-print">
          <div className="title-sk">
            SURAT KEPUTUSAN KETUA STIMI YAPMI MAKASSAR<br/>
            NOMOR: {sk.skNumber}<br/><br/>
            TENTANG<br/>
            {sk.title}
          </div>

          <div style={{ marginTop: 30 }}>
            <div className="section-row">
              <div className="section-label">Menimbang :</div>
              <div className="section-content">
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {sk.konsideranMenimbang.map((item: string, idx: number) => <li key={idx} style={{ marginBottom: 5 }}>{item}</li>)}
                </ol>
              </div>
            </div>

            <div className="section-row" style={{ marginTop: 15 }}>
              <div className="section-label">Mengingat :</div>
              <div className="section-content">
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {sk.dasarHukum.map((item: string, idx: number) => <li key={idx} style={{ marginBottom: 5 }}>{item}</li>)}
                </ol>
              </div>
            </div>

            <div style={{ textAlign: "center", fontWeight: "bold", margin: "20px 0" }}>MEMUTUSKAN</div>

            <div className="section-row">
              <div className="section-label">Menetapkan :</div>
              <div className="section-content">
                <div style={{ fontWeight: "bold", marginBottom: 10, textTransform: "uppercase" }}>{sk.title}</div>
                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                  {sk.diktumMenetapkan.map((item: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: 5, display: "flex" }}>
                      {item.startsWith("KESATU:") || item.startsWith("KEDUA:") || item.startsWith("KETIGA:") ? (
                        <>
                          <span style={{ width: 80, fontWeight: "bold" }}>{item.split(":")[0]}:</span>
                          <span style={{ flex: 1 }}>{item.substring(item.indexOf(":") + 1).trim()}</span>
                        </>
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="sign-area">
            <div className="sign-box">
              Ditetapkan di: Makassar<br/>
              Pada tanggal: {sk.effectiveDate ? new Date(sk.effectiveDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              <br/><br/><br/><br/><br/>
              <b>Ketua STIMI YAPMI Makassar</b>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: 80, fontSize: "9pt", textAlign: "center", color: "#666" }}>
          Dokumen ini di-generate melalui REKSA STIMI (Rekognisi Cerdas Sistem Akademik)
        </div>
      </div>

      {/* LAMPIRAN PENGELOLA */}
      {sk.skType === "SK_PENGELOLA_RPL" && team.length > 0 && (
        <div className="page-container page-break" style={{ position: "relative" }}>
          {sk.status !== "FINAL" && <div className="watermark">DRAFT - BELUM FINAL</div>}
          <div className="content-print" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <b>LAMPIRAN SURAT KEPUTUSAN</b><br/>
              Nomor: {sk.skNumber}<br/>
              Tentang: {sk.title}
            </div>

            <table className="table-print">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Nama Lengkap</th>
                  <th>Jabatan dalam Tim</th>
                  <th>Unsur Perwakilan</th>
                </tr>
              </thead>
              <tbody>
                {team.map((t, idx) => (
                  <tr key={t._id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>{t.nama}</td>
                    <td style={{ textAlign: "center" }}>{t.jabatanDalamTim}</td>
                    <td style={{ textAlign: "center" }}>{t.unsur || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sign-area">
              <div className="sign-box">
                <b>Ketua STIMI YAPMI Makassar</b>
                <br/><br/><br/><br/><br/>
                <b>(...)</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAMPIRAN PENILAI */}
      {sk.skType === "SK_PENILAI_RPL" && penilai.length > 0 && (
        <div className="page-container page-break" style={{ position: "relative" }}>
          {sk.status !== "FINAL" && <div className="watermark">DRAFT - BELUM FINAL</div>}
          <div className="content-print" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <b>LAMPIRAN SURAT KEPUTUSAN</b><br/>
              Nomor: {sk.skNumber}<br/>
              Tentang: {sk.title}
            </div>

            <table className="table-print">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Nama Penilai</th>
                  <th>Jenis Penilai</th>
                  <th>Klaster Keahlian (Plotting)</th>
                </tr>
              </thead>
              <tbody>
                {penilai.map((p, idx) => (
                  <tr key={p._id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>{p.penilaiId?.name}</td>
                    <td style={{ textAlign: "center" }}>{p.jenisPenilai}</td>
                    <td>
                      {p.klasterIds?.map((k:any, i:number) => (
                        <div key={k._id}>{i+1}. {k.nama}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sign-area">
              <div className="sign-box">
                <b>Ketua STIMI YAPMI Makassar</b>
                <br/><br/><br/><br/><br/>
                <b>(...)</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAMPIRAN PEDOMAN - LISTING ONLY FOR PREVIEW */}
      {(sk.skType === "SK_PEDOMAN_INSTITUSI" || sk.skType === "SK_PEDOMAN_PRODI") && lampiran.length > 0 && (
        <div className="page-container page-break">
          <div className="content-print">
            <div style={{ marginBottom: 20 }}>
              <b>LAMPIRAN DOKUMEN PEDOMAN (TAUTAN/REFERENSI)</b><br/>
              Nomor: {sk.skNumber}<br/>
              Tentang: {sk.title}
            </div>

            <ul>
              {lampiran.map((l:any, idx:number) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  <b>{l.title}</b><br/>
                  <a href={l.fileUrl} target="_blank" rel="noreferrer" style={{ color: "blue", textDecoration: "underline" }}>{l.fileUrl}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* LAMPIRAN PENUGASAN PENILAI */}
      {sk.skType === "SK_PENUGASAN_PENILAI" && plotting.length > 0 && (
        <div className="page-container page-break">
          <div className="content-print">
            <div style={{ marginBottom: 20 }}>
              <b>LAMPIRAN SURAT KEPUTUSAN</b><br/>
              Nomor: {sk.skNumber}<br/>
              Tentang: {sk.title}
            </div>

            <table className="table-print">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Nama Mahasiswa</th>
                  <th>Klaster yang Diujikan</th>
                  <th>Nama Penilai Ditugaskan</th>
                </tr>
              </thead>
              <tbody>
                {plotting.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>
                      <div><b>{p.mahasiswaNama}</b></div>
                      <div style={{ fontSize: "10pt", color: "#666" }}>NIM/User: {p.username}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>{p.klasterName}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{p.penilaiNama}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sign-area">
              <div className="sign-box">
                <b>Ketua STIMI YAPMI Makassar</b>
                <br/><br/><br/><br/><br/>
                <b>(...)</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAMPIRAN BA PLENO */}
      {sk.skType === "BA_PLENO" && finalResults.length > 0 && (
        <div className="page-container page-break" style={{ position: "relative" }}>
          {sk.status !== "FINAL" && <div className="watermark">DRAFT - BELUM FINAL</div>}
          <div className="content-print" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <b>LAMPIRAN BERITA ACARA PLENO</b><br/>
              Nomor: {sk.skNumber}<br/>
              Tentang: {sk.title}
            </div>

            <table className="table-print">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Nama Mahasiswa</th>
                  <th>NIM / No. Reg</th>
                  <th>SKS Transfer</th>
                  <th>SKS Perolehan</th>
                  <th>Total SKS Diakui</th>
                </tr>
              </thead>
              <tbody>
                {finalResults.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td><b>{r.mahasiswa?.name}</b></td>
                    <td style={{ textAlign: "center" }}>{r.mahasiswa?.username}</td>
                    <td style={{ textAlign: "center" }}>{r.totalSksTransfer}</td>
                    <td style={{ textAlign: "center" }}>{r.totalSksPerolehan}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{r.totalSksDiakui}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sign-area" style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
              <div className="sign-box" style={{ width: "200px" }}>
                <b>Anggota Pleno (Penilai)</b>
                <br/><br/><br/><br/><br/>
                <b>(...)</b>
              </div>
              <div className="sign-box" style={{ width: "200px" }}>
                <b>Ketua STIMI YAPMI Makassar</b>
                <br/><br/><br/><br/><br/>
                <b>(...)</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAMPIRAN SK HASIL RPL */}
      {sk.skType === "SK_HASIL_RPL" && finalResults.length > 0 && (
        <div className="page-container page-break" style={{ position: "relative" }}>
          {sk.status !== "FINAL" && <div className="watermark">DRAFT - BELUM FINAL</div>}
          <div className="content-print" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <b>LAMPIRAN SURAT KEPUTUSAN</b><br/>
              Nomor: {sk.skNumber}<br/>
              Tentang: {sk.title}
            </div>

            {finalResults.map((r, idx) => (
              <div key={idx} style={{ marginBottom: 30, pageBreakInside: "avoid" }}>
                <table style={{ width: "100%", marginBottom: 10, fontSize: "11pt", border: "none" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: 150 }}>Nama Mahasiswa</td>
                      <td>: <b>{r.mahasiswa?.name}</b></td>
                    </tr>
                    <tr>
                      <td>No Registrasi / NIM</td>
                      <td>: {r.mahasiswa?.username}</td>
                    </tr>
                    <tr>
                      <td>Total SKS Diakui</td>
                      <td>: {r.totalSksDiakui} SKS</td>
                    </tr>
                  </tbody>
                </table>
                <table className="table-print" style={{ marginTop: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>No</th>
                      <th>Mata Kuliah</th>
                      <th style={{ width: 60 }}>SKS</th>
                      <th style={{ width: 80 }}>Nilai Huruf</th>
                      <th style={{ width: 120 }}>Jenis Rekognisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(r.recognizedCourses || []).map((c: any, cidx: number) => (
                      <tr key={cidx}>
                        <td style={{ textAlign: "center" }}>{cidx + 1}</td>
                        <td>{c.nama}</td>
                        <td style={{ textAlign: "center" }}>{c.sks}</td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{c.nilaiHuruf}</td>
                        <td style={{ textAlign: "center" }}>{c.jenisRekognisi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="sign-area">
              <div className="sign-box">
                <b>Ketua STIMI YAPMI Makassar</b>
                <br/><br/><br/><br/><br/>
                <b>(...)</b>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
