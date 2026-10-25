import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI belum diset di .env");
  process.exit(1);
}

const periodSchema = new mongoose.Schema({
  namaPeriode: { type: String, required: true },
  semester: String,
  tahunAkademik: String,
  status: { type: String, enum: ["Aktif", "Non-Aktif"], default: "Aktif" },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const matkulSchema = new mongoose.Schema({
  kode: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  sks: { type: Number, required: true },
  semester: { type: Number, default: 1 },
  jenis: { type: String, default: "Wajib" },
  statusRpl: { type: String, default: "Bisa" },
  keterangan: String,
}, { timestamps: true });

const klasterSchema = new mongoose.Schema({
  namaKlaster: { type: String, required: true },
  deskripsi: String,
  status: { type: String, default: "Aktif" },
}, { timestamps: true });

const klasterMatkulSchema = new mongoose.Schema({
  klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster", required: true },
  matkulId: { type: mongoose.Schema.Types.ObjectId, ref: "MataKuliah", required: true },
}, { timestamps: true });

const Period = mongoose.models.Period || mongoose.model("Period", periodSchema);
const MataKuliah = mongoose.models.MataKuliah || mongoose.model("MataKuliah", matkulSchema);
const Klaster = mongoose.models.Klaster || mongoose.model("Klaster", klasterSchema);
const KlasterMatkul = mongoose.models.KlasterMatkul || mongoose.model("KlasterMatkul", klasterMatkulSchema);

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  // 1. Seed Active Period
  const activePeriod = await Period.findOneAndUpdate(
    { namaPeriode: "RPL 2026/2027 Ganjil" },
    {
      $set: {
        namaPeriode: "RPL 2026/2027 Ganjil",
        semester: "Ganjil",
        tahunAkademik: "2026/2027",
        status: "Aktif",
        isActive: true,
      }
    },
    { upsert: true, new: true }
  );
  console.log("Active Period set:", activePeriod.namaPeriode);

  // 2. Seed Matkul
  const matkulRaw = fs.readFileSync(path.join(__dirname, "seed-matkul.json"), "utf-8");
  const matkulData = JSON.parse(matkulRaw);
  console.log(`Found ${matkulData.length} Mata Kuliah in JSON`);

  const codeToId = new Map();
  for (const m of matkulData) {
    const doc = await MataKuliah.findOneAndUpdate(
      { kode: m.kode },
      {
        $set: {
          nama: m.nama,
          sks: m.sks,
          semester: m.semester || 1,
          jenis: m.jenis || "Wajib",
          statusRpl: m.statusRpl || "Bisa",
          keterangan: m.keterangan || "",
        }
      },
      { upsert: true, new: true }
    );
    codeToId.set(m.kode, doc._id);
  }
  console.log(`Mata Kuliah seeded: ${codeToId.size}`);

  // 3. Seed Klaster & KlasterMatkul
  const klasterRaw = fs.readFileSync(path.join(__dirname, "seed-klaster.json"), "utf-8");
  const klasterData = JSON.parse(klasterRaw);
  console.log(`Found ${klasterData.klaster.length} Klasters in JSON`);

  for (const k of klasterData.klaster) {
    const klasterDoc = await Klaster.findOneAndUpdate(
      { namaKlaster: k.namaKlaster },
      { $set: { namaKlaster: k.namaKlaster, status: "Aktif" } },
      { upsert: true, new: true }
    );

    // Map relations
    const rels = klasterData.klaster_matkul.filter((km) => km.klaster_nama === k.namaKlaster);
    for (const rel of rels) {
      const matkulId = codeToId.get(rel.matkul_kode);
      if (matkulId) {
        await KlasterMatkul.findOneAndUpdate(
          { klasterId: klasterDoc._id, matkulId },
          { $set: { klasterId: klasterDoc._id, matkulId } },
          { upsert: true }
        );
      }
    }
  }
  console.log("Klasters & Relations seeded successfully!");

  await mongoose.disconnect();
  console.log("Master Data seeding complete.");
}

run().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
