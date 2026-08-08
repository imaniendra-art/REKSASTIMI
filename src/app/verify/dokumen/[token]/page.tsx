"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function VerifyDokumenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/public/verify/${token}`);
        const json = await res.json();
        if (res.ok) {
          setData(json.data);
        } else {
          setError(json.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memverifikasi dokumen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">REKSA STIMI YAPMI</h2>
          <p className="text-slate-600">Pusat Verifikasi Dokumen Elektronik</p>
        </div>

        {error ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>❌</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Verifikasi Gagal</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link href="/" className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        ) : data ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`p-6 text-center ${data.statusValiditas === "VALID" ? "bg-green-50 border-b border-green-100" : "bg-orange-50 border-b border-orange-100"}`}>
              {data.statusValiditas === "VALID" ? (
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
              ) : (
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${data.statusValiditas === "VALID" ? "text-green-800" : "text-orange-800"}`}>
                {data.statusValiditas}
              </h3>
              <p className={data.statusValiditas === "VALID" ? "text-green-700" : "text-orange-700"}>
                {data.message}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center" style={{ fontSize: "24px" }}>
                  📄
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{data.title}</h4>
                  <p className="text-sm text-slate-500">Jenis: {data.documentType.replace(/_/g, " ")}</p>
                </div>
              </div>

              <dl className="space-y-4">
                {data.documentNumber !== "-" && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Nomor Dokumen</dt>
                    <dd className="mt-1 text-slate-900 font-medium">{data.documentNumber}</dd>
                  </div>
                )}
                
                {data.mahasiswaName && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Atas Nama</dt>
                    <dd className="mt-1 text-slate-900 font-medium">{data.mahasiswaName}</dd>
                    {data.mahasiswaIdentifier && <dd className="text-sm text-slate-500">{data.mahasiswaIdentifier}</dd>}
                  </div>
                )}

                {data.periodName && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Periode Akademik</dt>
                    <dd className="mt-1 text-slate-900">{data.periodName}</dd>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Versi Dokumen</dt>
                    <dd className="mt-1 text-slate-900">v{data.version}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Status Penyimpanan</dt>
                    <dd className="mt-1 text-slate-900">{data.status}</dd>
                  </div>
                </div>

                {data.finalizedAt && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Tanggal Pengesahan/Cetak</dt>
                    <dd className="mt-1 text-slate-900">
                      {new Date(data.finalizedAt).toLocaleDateString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4">
                Halaman ini adalah bukti verifikasi sah yang dikeluarkan secara sistem oleh STIMI YAPMI Makassar. 
                Data nilai detail bersifat rahasia dan tidak ditampilkan untuk publik.
              </p>
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Pelajari tentang RPL STIMI YAPMI &rarr;
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
