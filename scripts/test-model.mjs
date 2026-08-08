import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI belum tersedia. Jalankan dengan env aktif.");
}

console.log("Menghubungkan ke MongoDB...");
await mongoose.connect(uri);
console.log("Terhubung!");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, required: true },
    status: { type: String, default: "aktif" }
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", userSchema);

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    fileName: String,
    fileUrl: String,
    validationStatus: { type: String, default: "menunggu" },
    note: String,
    uploadedAt: Date
  },
  { _id: false }
);

const applicantProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    registrationNumber: { type: String, trim: true },
    nim: { type: String, trim: true },
    periodName: { type: String, trim: true },
    program: { type: String, trim: true },
    concentration: { type: String, trim: true },
    statusRpl: { type: String, default: "PENDAFTARAN" },
    identity: {
      fullName: String,
      nik: String,
      placeOfBirth: String,
      dateOfBirth: Date
    },
    contact: {
      email: String,
      phone: String,
      address: String
    },
    work: {
      position: String
    },
    progress: {
      paymentStatus: { type: String, default: "BELUM_BAYAR" },
      f02Status: { type: String, default: "BELUM" },
      f03Status: { type: String, default: "BELUM" },
      assessmentStatus: { type: String, default: "BELUM" },
      resultStatus: { type: String, default: "BELUM" }
    },
    documents: [documentSchema],

    // Flat compatibility fields (derived fields)
    noPendaftar: { type: String, trim: true },
    nama: { type: String, trim: true },
    nik: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    whatsapp: { type: String, trim: true },
    periode: { type: String, trim: true },
    statusPembayaran: { type: String, trim: true },
    statusF02: { type: String, trim: true },
    statusF03: { type: String, trim: true },
    statusAsesmen: { type: String, trim: true },
    statusHasil: { type: String, trim: true },
    alamat: { type: String, trim: true },
    pekerjaan: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

applicantProfileSchema.pre("save", function (next) {
  // 1. Sync registrationNumber <=> noPendaftar (Source of truth: registrationNumber)
  if (this.registrationNumber) {
    this.noPendaftar = this.registrationNumber;
  } else if (this.noPendaftar) {
    this.registrationNumber = this.noPendaftar;
  }

  // 2. Sync identity.fullName <=> nama (Source of truth: identity.fullName)
  if (this.identity?.fullName) {
    this.nama = this.identity.fullName;
  } else if (this.nama) {
    if (!this.identity) this.identity = {};
    this.identity.fullName = this.nama;
  }

  // 3. Sync identity.nik <=> nik (Source of truth: identity.nik)
  if (this.identity?.nik) {
    this.nik = this.identity.nik;
  } else if (this.nik) {
    if (!this.identity) this.identity = {};
    this.identity.nik = this.nik;
  }

  // 4. Sync contact.email <=> email (Source of truth: contact.email)
  if (this.contact?.email) {
    this.email = this.contact.email;
  } else if (this.email) {
    if (!this.contact) this.contact = {};
    this.contact.email = this.email;
  }

  // 5. Sync contact.phone <=> whatsapp (Source of truth: contact.phone)
  if (this.contact?.phone) {
    this.whatsapp = this.contact.phone;
  } else if (this.whatsapp) {
    if (!this.contact) this.contact = {};
    this.contact.phone = this.whatsapp;
  }

  // 6. Sync periodName <=> periode (Source of truth: periodName)
  if (this.periodName) {
    this.periode = this.periodName;
  } else if (this.periode) {
    this.periodName = this.periode;
  }

  // 7. Sync progress.paymentStatus <=> statusPembayaran (Source of truth: progress.paymentStatus)
  if (this.progress?.paymentStatus) {
    this.statusPembayaran = this.progress.paymentStatus;
  } else if (this.statusPembayaran) {
    if (!this.progress) this.progress = {};
    this.progress.paymentStatus = this.statusPembayaran;
  }

  // 8. Sync progress.f02Status <=> statusF02 (Source of truth: progress.f02Status)
  if (this.progress?.f02Status) {
    this.statusF02 = this.progress.f02Status;
  } else if (this.statusF02) {
    if (!this.progress) this.progress = {};
    this.progress.f02Status = this.statusF02;
  }

  // 9. Sync progress.f03Status <=> statusF03 (Source of truth: progress.f03Status)
  if (this.progress?.f03Status) {
    this.statusF03 = this.progress.f03Status;
  } else if (this.statusF03) {
    if (!this.progress) this.progress = {};
    this.progress.f03Status = this.statusF03;
  }

  // 10. Sync progress.assessmentStatus <=> statusAsesmen (Source of truth: progress.assessmentStatus)
  if (this.progress?.assessmentStatus) {
    this.statusAsesmen = this.progress.assessmentStatus;
  } else if (this.statusAsesmen) {
    if (!this.progress) this.progress = {};
    this.progress.assessmentStatus = this.statusAsesmen;
  }

  // 11. Sync progress.resultStatus <=> statusHasil (Source of truth: progress.resultStatus)
  if (this.progress?.resultStatus) {
    this.statusHasil = this.progress.resultStatus;
  } else if (this.statusHasil) {
    if (!this.progress) this.progress = {};
    this.progress.resultStatus = this.statusHasil;
  }

  // 12. Sync contact.address <=> alamat (Source of truth: contact.address)
  if (this.contact?.address) {
    this.alamat = this.contact.address;
  } else if (this.alamat) {
    if (!this.contact) this.contact = {};
    this.contact.address = this.alamat;
  }

  // 13. Sync work.position <=> pekerjaan (Source of truth: work.position)
  if (this.work?.position) {
    this.pekerjaan = String(this.work.position);
  } else if (this.pekerjaan) {
    if (!this.work) this.work = {};
    this.work.position = this.pekerjaan;
  }

  // 14. Ensure isActive is initialized
  if (this.isActive === undefined) {
    this.isActive = true;
  }

  next();
});

const ApplicantProfile = mongoose.models.ApplicantProfile ?? mongoose.model("ApplicantProfile", applicantProfileSchema);

try {
  // 1. Ciptakan User dummy jika belum ada
  const username = "testmahasiswa_" + Date.now();
  console.log(`Mencoba membuat User baru: ${username}`);
  const user = await User.create({
    username,
    passwordHash: "plain:dummy123",
    name: "Test Mahasiswa RPL",
    email: `${username}@example.com`,
    role: "mahasiswa",
    status: "aktif"
  });
  console.log(`User berhasil dibuat dengan ID: ${user._id}`);

  // 2. Ciptakan ApplicantProfile dengan nested fields (Source of truth)
  console.log("Mencoba membuat ApplicantProfile dengan nested fields...");
  const profile = await ApplicantProfile.create({
    userId: user._id,
    registrationNumber: "REG-" + Date.now(),
    periodName: "Batch 1 - 2026",
    statusRpl: "PENDAFTARAN",
    identity: {
      fullName: "Test Mahasiswa RPL",
      nik: "1234567890123456"
    },
    contact: {
      email: `${username}@example.com`,
      phone: "08123456789",
      address: "Jl. Pendidikan No. 45"
    },
    progress: {
      paymentStatus: "BELUM_BAYAR"
    }
  });

  console.log("\n--- HASIL PEMBUATAN DOKUMEN ---");
  console.log("noPendaftar (flat):", profile.noPendaftar);
  console.log("nama (flat):", profile.nama);
  console.log("nik (flat):", profile.nik);
  console.log("email (flat):", profile.email);
  console.log("whatsapp (flat):", profile.whatsapp);
  console.log("periode (flat):", profile.periode);
  console.log("statusPembayaran (flat):", profile.statusPembayaran);
  console.log("isActive (flat):", profile.isActive);

  // Validasi assertion
  if (profile.nama !== "Test Mahasiswa RPL") throw new Error("Gagal sinkronisasi nama!");
  if (profile.nik !== "1234567890123456") throw new Error("Gagal sinkronisasi NIK!");
  if (profile.whatsapp !== "08123456789") throw new Error("Gagal sinkronisasi whatsapp/phone!");
  if (profile.periode !== "Batch 1 - 2026") throw new Error("Gagal sinkronisasi periode!");
  if (profile.statusPembayaran !== "BELUM_BAYAR") throw new Error("Gagal sinkronisasi statusPembayaran!");
  if (profile.isActive !== true) throw new Error("Gagal inisialisasi isActive!");

  console.log("\nSINKRONISASI PEMBUATAN BERHASIL!");

  // 3. Coba update nested fields dan panggil save()
  console.log("\nMencoba mengupdate nested fields...");
  profile.identity.fullName = "Test Mahasiswa RPL Diubah";
  profile.contact.phone = "08987654321";
  profile.progress.paymentStatus = "DITERIMA";
  await profile.save();

  console.log("\n--- HASIL SETELAH UPDATE & SAVE ---");
  console.log("nama (flat):", profile.nama);
  console.log("whatsapp (flat):", profile.whatsapp);
  console.log("statusPembayaran (flat):", profile.statusPembayaran);

  if (profile.nama !== "Test Mahasiswa RPL Diubah") throw new Error("Gagal sinkronisasi update nama!");
  if (profile.whatsapp !== "08987654321") throw new Error("Gagal sinkronisasi update whatsapp!");
  if (profile.statusPembayaran !== "DITERIMA") throw new Error("Gagal sinkronisasi update statusPembayaran!");

  console.log("\nSINKRONISASI UPDATE BERHASIL!");

  // 4. Bersihkan data dummy agar database tidak kotor
  console.log("\nMembersihkan data dummy...");
  await ApplicantProfile.deleteOne({ _id: profile._id });
  await User.deleteOne({ _id: user._id });
  console.log("Pembersihan selesai.");

} catch (error) {
  console.error("Test Gagal:", error);
} finally {
  await mongoose.disconnect();
  console.log("Koneksi ditutup.");
}
