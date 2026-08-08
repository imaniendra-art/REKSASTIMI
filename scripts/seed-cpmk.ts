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

const matkulSchema = new mongoose.Schema({
  kode: { type: String, required: true, trim: true, unique: true },
});

const matkulCpmkSchema = new mongoose.Schema(
  {
    matkulId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nomorUrut: { type: Number, required: true },
    deskripsiCpmk: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const MataKuliah = mongoose.models.MataKuliah || mongoose.model("MataKuliah", matkulSchema);
const MatkulCpmk = mongoose.models.MatkulCpmk || mongoose.model("MatkulCpmk", matkulCpmkSchema);

async function main() {
  const uri = envVars.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Read seed data
  const seedPath = path.join(__dirname, "seed-cpmk.json");
  const raw = fs.readFileSync(seedPath, "utf-8");
  const data: any[] = JSON.parse(raw);

  console.log(`Found ${data.length} CPMK rows to import`);

  // Clear existing CPMKs
  const deleted = await MatkulCpmk.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing CPMK rows`);

  // Map kode to ObjectIds
  const matkuls = await MataKuliah.find({}, { kode: 1 }).lean();
  const kodeToId: Record<string, string> = {};
  matkuls.forEach((m: any) => {
    kodeToId[m.kode] = m._id.toString();
  });

  // Prepare insert
  const docs = [];
  let skipped = 0;

  for (const d of data) {
    const matkulId = kodeToId[d.kode];
    if (!matkulId) {
      skipped++;
      continue;
    }
    docs.push({
      matkulId,
      nomorUrut: d.nomor_urut,
      deskripsiCpmk: d.deskripsi_cpmk,
    });
  }

  const result = await MatkulCpmk.insertMany(docs);
  console.log(`Inserted ${result.length} CPMK records. Skipped ${skipped} due to unknown kode.`);

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
