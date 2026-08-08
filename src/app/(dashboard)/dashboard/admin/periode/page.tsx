import { PeriodeClient } from "./PeriodeClient";
import { connectMongoDB } from "@/lib/mongodb";
import { Period } from "@/models/Period";

export const metadata = {
  title: "Manajemen Periode | REKSA",
};

export default async function PeriodePage() {
  await connectMongoDB();
  const activePeriod = await Period.findOne({ isActive: true }).lean();
  const activePeriodName = activePeriod?.namaPeriode || "Belum Ada Periode Aktif";

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <PeriodeClient activePeriodName={activePeriodName} />
    </div>
  );
}
