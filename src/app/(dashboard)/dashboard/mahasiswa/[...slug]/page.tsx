const titleMap: Record<string, string> = {
  biodata: "Biodata",
  cv: "CV Riwayat",
  keuangan: "Keuangan",
  f02: "Form F02",
  matrikulasi: "Test Kompetensi RPL",
  f03: "Form F03",
  download: "Pusat Download"
};

export default async function MahasiswaPlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const title = titleMap[slug[0] ?? ""] ?? "Menu Mahasiswa";

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6efd]">Placeholder Modul Mahasiswa</p>
      <h1 className="mt-3 text-2xl font-black uppercase">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Route sudah mengikuti menu SIRESTI. Form dan alur lengkap belum dibuat pada tahap fondasi dashboard ini.
      </p>
    </section>
  );
}
