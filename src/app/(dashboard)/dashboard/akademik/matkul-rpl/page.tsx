import { PageHero } from "@/components/dashboard/UIComponents";
import { connectMongoDB } from "@/lib/mongodb";
import { MataKuliah } from "@/models/MataKuliah";
import { MatkulCpmk } from "@/models/MatkulCpmk";
import MatkulRplClient from "./MatkulRplClient";

export default async function MatkulRplPage() {
  await connectMongoDB();

  const matkulDoc = await MataKuliah.find({ isRpl: true }).sort({ semester: 1, namaMatkul: 1 }).lean();
  const cpmkCounts = await MatkulCpmk.aggregate([
    { $group: { _id: "$matkulId", count: { $sum: 1 } } },
  ]);

  const cpmkMap = cpmkCounts.reduce((acc, curr) => {
    if (curr._id) acc[curr._id.toString()] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  let totalSks = 0;
  const matkul = matkulDoc.map((m) => {
    totalSks += m.sks;
    return {
      id: m._id.toString(),
      kode: m.kode,
      namaMatkul: m.namaMatkul,
      sks: m.sks,
      semester: m.semester,
      cpmkCount: cpmkMap[m._id.toString()] || 0,
    };
  });

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeIcon="RPL"
        badgeText="Data Akademik"
        title="Mata Kuliah RPL"
        subtitle="Daftar mata kuliah aktif jalur RPL."
        tone="success"
        rightContent={
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span style={heroChipStyle}>Aktif: {matkul.length} Matkul</span>
            <span style={heroChipStyle}>Total SKS: {totalSks}</span>
          </div>
        }
      />

      <MatkulRplClient initialData={matkul} />
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
