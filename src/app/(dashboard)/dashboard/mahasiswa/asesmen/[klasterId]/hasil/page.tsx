import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { Klaster } from "@/models/Klaster";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";

export default async function MahasiswaHasilAsesmenPage({ params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedParams = await params;
  await connectMongoDB();

  const klaster = await Klaster.findById(resolvedParams.klasterId).lean() as any;
  const attempt = await AssessmentAttempt.findOne({ userId: session.id, klasterId: resolvedParams.klasterId }).lean() as any;

  if (!klaster || !attempt) {
    redirect("/dashboard/mahasiswa/asesmen");
  }

  const matkulResults = attempt.matkulResults || [];

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        tone="maroon"
        badgeText="Hasil Asesmen"
        title={klaster.namaKlaster as string}
        subtitle="Rincian hasil evaluasi kemampuan untuk rumpun ilmu ini."
      />

      <div className="md-card" style={{ padding: "24px", marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)" }}>
            Rekapitulasi Nilai Mata Kuliah
          </h2>
          <span style={{ fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534", padding: "6px 12px", borderRadius: 8 }}>
            Selesai pada {new Date(attempt.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {matkulResults.map((res: any) => (
            <div key={res.matkulId.toString()} style={{ border: "1px solid var(--md-outline-variant)", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>{res.matkulName}</h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "var(--md-primary)", lineHeight: 1 }}>{res.finalScore}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>({res.finalGrade})</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)", marginTop: 4, textTransform: "uppercase" }}>
                  Nilai Akhir
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center", display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link 
            href="/dashboard/mahasiswa/asesmen"
            style={{ 
              display: "inline-block", padding: "12px 24px", background: "#f1f5f9", 
              color: "var(--md-on-surface)", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: "none" 
            }}
          >
            &larr; Kembali ke Asesmen
          </Link>
          <Link 
            href={`/mahasiswa/cetak-sertifikat/${resolvedParams.klasterId}`}
            target="_blank"
            style={{ 
              display: "inline-block", padding: "12px 24px", background: "#d97706", 
              color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)"
            }}
          >
            🎓 Lihat & Cetak Sertifikat
          </Link>
        </div>
      </div>
    </div>
  );
}
