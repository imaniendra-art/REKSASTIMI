import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia. Jalankan dari project dengan env aktif.");
}

const roles = ["admin", "akademik", "keuangan", "asesor", "mahasiswa"];

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, enum: roles, required: true, index: true },
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif", index: true },
    lastLoginAt: Date
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", userSchema);

const seedUsers = [
  { username: "admin", name: "Admin SIRESTI", role: "admin" },
  { username: "akademik", name: "Admin Akademik", role: "akademik" },
  { username: "keuangan", name: "Admin Keuangan", role: "keuangan" },
  { username: "asesor", name: "Tim Penilai", role: "asesor" },
  { username: "mahasiswa", name: "Mahasiswa RPL", role: "mahasiswa" }
];

await mongoose.connect(uri, { bufferCommands: false });

for (const user of seedUsers) {
  await User.updateOne(
    { username: user.username },
    {
      $set: {
        email: `${user.username}@reksa.local`,
        passwordHash: "plain:admin123",
        status: "aktif"
      },
      $setOnInsert: {
        ...user
      }
    },
    { upsert: true }
  );
}

await mongoose.disconnect();

console.log("Seed user selesai. Password semua akun: admin123");
