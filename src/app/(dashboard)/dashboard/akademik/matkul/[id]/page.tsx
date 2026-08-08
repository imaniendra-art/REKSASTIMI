import { notFound } from "next/navigation";
import { PageHero } from "@/components/dashboard/UIComponents";
import { connectMongoDB } from "@/lib/mongodb";
import { MataKuliah } from "@/models/MataKuliah";
import { MatkulCpmk } from "@/models/MatkulCpmk";
import MatkulDetailClient from "./MatkulDetailClient";

export default async function MatkulDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connectMongoDB();

  const { id } = await params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const matkulDoc = await MataKuliah.findById(id).lean();
  if (!matkulDoc) {
    notFound();
  }

  const cpmkDocs = await MatkulCpmk.find({ matkulId: matkulDoc._id }).sort({ nomorUrut: 1 }).lean();

  const matkul = {
    id: matkulDoc._id.toString(),
    kode: matkulDoc.kode,
    namaMatkul: matkulDoc.namaMatkul,
    sks: matkulDoc.sks,
    semester: matkulDoc.semester,
    deskripsi: matkulDoc.deskripsi || "",
  };

  const initialCpmkList = cpmkDocs.map((c) => ({
    id: c._id.toString(),
    nomorUrut: c.nomorUrut,
    deskripsiCpmk: c.deskripsiCpmk,
  }));

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeIcon="CPMK"
        badgeText="Data Akademik"
        title="Detail & CPMK"
        subtitle="Profil dan capaian pembelajaran mata kuliah jalur RPL."
        tone="success"
        rightContent={
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span style={heroChipStyle}>{matkul.kode}</span>
            <span style={heroChipStyle}>{matkul.sks} SKS</span>
            <span style={heroChipStyle}>SMT {matkul.semester}</span>
            <span style={heroChipStyle}>{initialCpmkList.length} CPMK</span>
          </div>
        }
      />

      <MatkulDetailClient matkul={matkul} initialCpmkList={initialCpmkList} />
    </div>
  );
}

const heroChipStyle: React.CSSProperties = {
  borderRadius: 999,
  background: "rgba(255,255,255,0.18)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.28)",
  padding: "7px 11px",
  fontSize: 10,
  fontWeight: 900,
  whiteSpace: "nowrap",
};
