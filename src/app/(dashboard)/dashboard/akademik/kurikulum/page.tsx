import { connectMongoDB } from "@/lib/mongodb";
import { MataKuliah } from "@/models/MataKuliah";
import KurikulumClient from "./KurikulumClient";

export default async function MasterKurikulumPage() {
  await connectMongoDB();

  const matkulDoc = await MataKuliah.find().sort({ semester: 1, namaMatkul: 1 }).lean();
  const rplCount = await MataKuliah.countDocuments({ isRpl: true });

  const matkul = matkulDoc.map((m) => ({
    id: m._id.toString(),
    kode: m.kode,
    namaMatkul: m.namaMatkul,
    sks: m.sks,
    semester: m.semester,
    kelompok: m.kelompok || "-",
    konsentrasi: m.konsentrasi || "",
    isRpl: m.isRpl ?? true,
  }));

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <KurikulumClient initialData={matkul} initialRplCount={rplCount} />
    </div>
  );
}
