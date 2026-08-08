import { connectMongoDB } from "@/lib/mongodb";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import Link from "next/link";
import DataKlasterClient from "./DataKlasterClient";

export default async function DataKlasterPage() {
  await connectMongoDB();

  const klasters = await Klaster.find().sort({ namaKlaster: 1 }).lean();
  const klasterMatkuls = await KlasterMatkul.find().lean();
  const matkuls = await MataKuliah.find().lean();

  const matkulMap = new Map();
  matkuls.forEach(m => matkulMap.set(m._id.toString(), m));

  const klasterData = klasters.map(k => {
    const kMatkuls = klasterMatkuls.filter(km => km.klasterId.toString() === k._id.toString());
    const totalSks = kMatkuls.reduce((sum, km) => {
      const matkul = matkulMap.get(km.matkulId.toString());
      return sum + (matkul ? matkul.sks : 0);
    }, 0);

    return {
      id: k._id.toString(),
      nama: k.namaKlaster,
      jmlMatkul: kMatkuls.length,
      totalSks
    };
  });

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <DataKlasterClient initialData={klasterData} />
    </div>
  );
}
