import { PageHero } from "@/components/dashboard/UIComponents";

const titleMap: Record<string, string> = {
  kurikulum: "Master Kurikulum",
  "matkul-rpl": "Mata Kuliah RPL",
  klaster: "Data Klaster",
  evaluasi: "Evaluasi Pleno"
};

const toneMap = {
  kurikulum: "primary",
  "matkul-rpl": "success",
  klaster: "info",
  evaluasi: "warning",
} as const;

export default async function AkademikPlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] ?? "";
  const title = titleMap[key] ?? "Menu Akademik";
  const tone = toneMap[key as keyof typeof toneMap] ?? "primary";

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeIcon="AK"
        badgeText="Data Akademik"
        title={title}
        subtitle="Struktur route sudah mengikuti menu SIRESTI. Modul ini siap dilanjutkan pada tahap berikutnya."
        tone={tone}
      />

      <section className="md-card" style={{ padding: 18 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>
          Data dan tabel modul ini akan mengikuti warna aksen hero saat fitur detailnya diaktifkan.
        </p>
      </section>
    </div>
  );
}
