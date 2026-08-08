import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load .env manually
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const matkulSchema = new mongoose.Schema({
  kode: { type: String, required: true, trim: true, unique: true },
  namaMatkul: { type: String, required: true, trim: true },
  sks: { type: Number, required: true, default: 3 },
  semester: { type: Number, required: true, default: 1, min: 1, max: 8 },
  kelompok: { type: String, trim: true, default: "" },
  konsentrasi: { type: String, trim: true, default: "" },
  isRpl: { type: Boolean, default: true, index: true },
  deskripsi: { type: String, trim: true, default: "" },
}, { timestamps: true });

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
  const seedPath = path.join(__dirname, "seed-matkul.json");
  const raw = fs.readFileSync(seedPath, "utf-8");
  const data: any[] = JSON.parse(raw);

  console.log(`Found ${data.length} rows to import`);

  // Clear existing
  const deleted = await MataKuliah.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing rows`);

  // Insert
  const docs = data.map((d) => ({
    kode: d.kode,
    namaMatkul: d.nama_matkul,
    sks: d.sks,
    semester: d.semester,
    kelompok: d.kelompok || "",
    konsentrasi: d.konsentrasi || "-",
    isRpl: d.is_rpl === 1,
    deskripsi: d.deskripsi || "",
  }));

  const result = await MataKuliah.insertMany(docs);
  console.log(`Inserted ${result.length} mata kuliah`);

  const rplCount = result.filter(r => r.isRpl).length;
  console.log(`RPL active: ${rplCount}, non-RPL: ${result.length - rplCount}`);

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
