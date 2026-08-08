import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load .env manually
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const klasterSchema = new mongoose.Schema({
  namaKlaster: { type: String, required: true },
});
const klasterMatkulSchema = new mongoose.Schema({
  klasterId: { type: mongoose.Schema.Types.ObjectId, required: true },
  matkulId: { type: mongoose.Schema.Types.ObjectId, required: true },
});
const matkulSchema = new mongoose.Schema({
  kode: { type: String, required: true },
});

const Klaster = mongoose.models.Klaster || mongoose.model("Klaster", klasterSchema);
const KlasterMatkul = mongoose.models.KlasterMatkul || mongoose.model("KlasterMatkul", klasterMatkulSchema);
const MataKuliah = mongoose.models.MataKuliah || mongoose.model("MataKuliah", matkulSchema);

async function main() {
  const uri = envVars.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Read seed data
  const seedPath = path.join(__dirname, "seed-klaster.json");
  const raw = fs.readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw);

  console.log(`Found ${data.klaster.length} Klasters and ${data.klaster_matkul.length} Relations`);

  // Clear existing
  await Klaster.deleteMany({});
  await KlasterMatkul.deleteMany({});
  console.log(`Cleared existing Klaster data`);

  // Insert Klaster and build mapping from SIRESTI id -> MongoDB id
  const idMap: Record<number, string> = {};
  for (const k of data.klaster) {
    const doc = await Klaster.create({ namaKlaster: k.nama_klaster });
    idMap[k.id] = doc._id.toString();
  }

  // Get matkul kode -> id mapping
  const matkuls = await MataKuliah.find({}, { kode: 1 }).lean();
  const kodeToId: Record<string, string> = {};
  matkuls.forEach((m: any) => {
    kodeToId[m.kode] = m._id.toString();
  });

  // Insert relations
  const relationDocs = [];
  let skipped = 0;
  for (const r of data.klaster_matkul) {
    const klasterId = idMap[r.klaster_id];
    const matkulId = kodeToId[r.kode];
    if (klasterId && matkulId) {
      relationDocs.push({ klasterId, matkulId });
    } else {
      skipped++;
    }
  }

  const result = await KlasterMatkul.insertMany(relationDocs);
  console.log(`Inserted ${result.length} Relations. Skipped ${skipped}.`);

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
