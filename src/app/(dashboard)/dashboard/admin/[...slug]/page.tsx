const titleMap: Record<string, string> = {
  mahasiswa: "Manajemen Mahasiswa",
  asesor: "Manajemen Penilai",
  lms: "Manajemen Asesmen (LMS)",
  sk: "Dokumen & SK",
  periode: "Periode",
  users: "Pusat Akun"
};

export default async function AdminPlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] ?? "";
  const title = titleMap[key] ?? "Menu Admin";

  return (
    <section>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6efd]">Placeholder Modul</p>
        <h1 className="mt-3 text-2xl font-black uppercase">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Halaman ini sudah disiapkan mengikuti menu lama SIRESTI. Implementasi fitur lengkap akan dikerjakan pada tahap modul berikutnya.
        </p>
      </div>
    </section>
  );
}
