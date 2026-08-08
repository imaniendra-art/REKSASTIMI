import { connectMongoDB } from "@/lib/mongodb";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/dashboard/UIComponents";
import DetailKlasterClient from "./DetailKlasterClient";

export default async function DetailKlasterPage({ params }: { params: Promise<{ id: string }> }) {
  await connectMongoDB();
  const { id } = await params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const klasterDoc = await Klaster.findById(id).lean();
  if (!klasterDoc) {
    notFound();
  }

  // Get all mata kuliah that belongs to this klaster
  const kmDocs = await KlasterMatkul.find({ klasterId: id }).lean();
  const matkulIds = kmDocs.map((km) => km.matkulId);

  const matkulIsiDocs = await MataKuliah.find({ _id: { $in: matkulIds } }).sort({ kode: 1 }).lean();

  // Get all mata kuliah that doesn't belong to ANY klaster
  const allKmDocs = await KlasterMatkul.find().lean();
  const allUsedMatkulIds = allKmDocs.map((km) => km.matkulId.toString());
  
  const matkulTersediaDocs = await MataKuliah.find({
    isRpl: true,
    _id: { $nin: allUsedMatkulIds }
  }).sort({ kode: 1 }).lean();

  const klaster = {
    id: klasterDoc._id.toString(),
    nama: klasterDoc.namaKlaster,
    deskripsi: klasterDoc.deskripsi || ""
  };

  const matkulIsi = matkulIsiDocs.map(m => ({
    id: m._id.toString(),
    kode: m.kode,
    nama: m.namaMatkul,
    sks: m.sks
  }));

  const matkulTersedia = matkulTersediaDocs.map(m => ({
    id: m._id.toString(),
    kode: m.kode,
    nama: m.namaMatkul,
    sks: m.sks
  }));

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeIcon="ATUR"
        badgeText="Data Akademik"
        title="Pengaturan Klaster"
        subtitle="Pemetaan Mata Kuliah Dalam Rumpun Ilmu"
        tone="info"
        rightContent={
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span style={heroChipStyle}>Klaster: {klaster.nama}</span>
            <span style={heroChipStyle}>{matkulIsi.length} Matkul</span>
          </div>
        }
      />

      <div style={{ marginTop: 24 }}>
        <DetailKlasterClient klaster={klaster} matkulIsi={matkulIsi} matkulTersedia={matkulTersedia} />
      </div>
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
