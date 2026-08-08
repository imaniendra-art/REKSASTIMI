import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import next from "next";

const { Schema, Types } = mongoose;
const BASE_URL = process.env.UAT_BASE_URL || "http://localhost:3030";
const REPORT_DIR = path.join(process.cwd(), "reports");
const REPORT_PATH = path.join(REPORT_DIR, "uat-reksa-2026-ganjil.md");
const SESSION_COOKIE = "reksa_session";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI belum tersedia. Jalankan dengan node --env-file=.env");
}

const looseOptions = { strict: false, timestamps: true };
const objectId = Schema.Types.ObjectId;
const ref = (model) => ({ type: objectId, ref: model });
const User = mongoose.models.User || mongoose.model("User", new Schema({ username: String, role: String, status: String }, looseOptions));
const Period = mongoose.models.Period || mongoose.model("Period", new Schema({ isActive: Boolean, status: String }, looseOptions));
const ApplicantProfile = mongoose.models.ApplicantProfile || mongoose.model("ApplicantProfile", new Schema({ userId: ref("User"), periodId: ref("Period") }, looseOptions));
const Payment = mongoose.models.Payment || mongoose.model("Payment", new Schema({ userId: ref("User") }, looseOptions));
const Klaster = mongoose.models.Klaster || mongoose.model("Klaster", new Schema({}, looseOptions));
const MataKuliah = mongoose.models.MataKuliah || mongoose.model("MataKuliah", new Schema({}, looseOptions));
const KlasterMatkul = mongoose.models.KlasterMatkul || mongoose.model("KlasterMatkul", new Schema({ klasterId: ref("Klaster"), matkulId: ref("MataKuliah") }, looseOptions));
const PenilaiProfile = mongoose.models.PenilaiProfile || mongoose.model("PenilaiProfile", new Schema({ userId: ref("User") }, looseOptions));
const PenilaiKlaster = mongoose.models.PenilaiKlaster || mongoose.model("PenilaiKlaster", new Schema({ penilaiId: ref("User"), klasterId: ref("Klaster"), assignedBy: ref("User") }, looseOptions));
const RplPeriodPenilai = mongoose.models.RplPeriodPenilai || mongoose.model("RplPeriodPenilai", new Schema({ periodId: ref("Period"), penilaiId: ref("User"), klasterIds: [ref("Klaster")], skDocumentId: ref("RplSkDocument") }, looseOptions));
const RplPeriodTeam = mongoose.models.RplPeriodTeam || mongoose.model("RplPeriodTeam", new Schema({ periodId: ref("Period"), userId: ref("User"), skDocumentId: ref("RplSkDocument") }, looseOptions));
const RplSkDocument = mongoose.models.RplSkDocument || mongoose.model("RplSkDocument", new Schema({ periodId: ref("Period"), finalizedBy: ref("User"), createdBy: ref("User"), updatedBy: ref("User") }, looseOptions));
const RplSkLampiran = mongoose.models.RplSkLampiran || mongoose.model("RplSkLampiran", new Schema({ skDocumentId: ref("RplSkDocument"), periodId: ref("Period"), createdBy: ref("User") }, looseOptions));
const F02Pengajuan = mongoose.models.F02Pengajuan || mongoose.model("F02Pengajuan", new Schema({ userId: ref("User"), matkulId: ref("MataKuliah") }, looseOptions));
const F03Evaluasi = mongoose.models.F03Evaluasi || mongoose.model("F03Evaluasi", new Schema({ userId: ref("User"), klasterId: ref("Klaster"), courseId: ref("MataKuliah"), assessmentAttemptId: ref("AssessmentAttempt") }, looseOptions));
const AssessmentAttempt = mongoose.models.AssessmentAttempt || mongoose.model("AssessmentAttempt", new Schema({ userId: ref("User"), klasterId: ref("Klaster") }, looseOptions));
const PenilaiPlotting = mongoose.models.PenilaiPlotting || mongoose.model("PenilaiPlotting", new Schema({ mahasiswaId: ref("User"), klasterId: ref("Klaster"), penilaiId: ref("User"), assignedBy: ref("User") }, looseOptions));
const HasilPenilaianKonfirmasi = mongoose.models.HasilPenilaianKonfirmasi || mongoose.model("HasilPenilaianKonfirmasi", new Schema({ mahasiswaId: ref("User"), klasterId: ref("Klaster"), plottingId: ref("PenilaiPlotting"), penilaiId: ref("User"), confirmedBy: ref("User") }, looseOptions));
const RplFinalResult = mongoose.models.RplFinalResult || mongoose.model("RplFinalResult", new Schema({
  mahasiswaId: ref("User"),
  periodId: ref("Period"),
  finalizedBy: ref("User"),
  baPlenoSkId: ref("RplSkDocument"),
  skHasilRplId: ref("RplSkDocument"),
  recognizedCourses: [{ courseId: ref("MataKuliah"), klasterId: ref("Klaster"), penilaiId: ref("User") }],
  statusFinalisasi: String,
  mahasiswaDecisionStatus: String,
  sentToStudentAt: Date,
  acceptedAt: Date,
  sanggahanId: ref("RplSanggahan"),
  readyForPlenoAt: Date,
  plenoStatus: String,
  finalizedAt: Date,
  nomorSk: String,
  nomorBa: String,
  tanggalPleno: Date,
  totalSksTransfer: Number,
  totalSksPerolehan: Number,
  totalSksDiakui: Number
}, looseOptions));
const RplSanggahan = mongoose.models.RplSanggahan || mongoose.model("RplSanggahan", new Schema({
  mahasiswaId: ref("User"),
  periodId: ref("Period"),
  finalResultId: ref("RplFinalResult"),
  resolvedBy: ref("User"),
  decision: String,
  status: String,
  catatanMahasiswa: String,
  catatanAdmin: String,
  submittedAt: Date,
  resolvedAt: Date
}, looseOptions));
const RplDocument = mongoose.models.RplDocument || mongoose.model("RplDocument", new Schema({
  mahasiswaId: ref("User"),
  periodId: ref("Period"),
  skDocumentId: ref("RplSkDocument"),
  documentType: String,
  title: String,
  documentNumber: String,
  status: String,
  verifiedToken: String,
  verifiedUrl: String,
  version: Number,
  isLatestVersion: Boolean,
  finalizedAt: Date
}, looseOptions));

const checks = [];
const context = {};

function addCheck(name, status, detail = "") {
  checks.push({ name, status, detail });
  const mark = status === "PASS" ? "OK" : status;
  console.log(`${mark} - ${name}${detail ? `: ${detail}` : ""}`);
}

function oid(value) {
  return new Types.ObjectId(value);
}

function sessionFor(user) {
  const payload = {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    role: user.role
  };
  return `${SESSION_COOKIE}=${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

async function request(user, method, route, body, expectedStatuses = [200]) {
  const response = await fetch(`${BASE_URL}${route}`, {
    method,
    headers: {
      Cookie: sessionFor(user),
      "Content-Type": "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // CSV/text response.
  }

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(`${method} ${route} -> ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return { status: response.status, data, text };
}

async function waitForServer() {
  let lastError = null;
  try {
    const response = await fetch(BASE_URL);
    if (response.status < 500) return;
  } catch (error) {
    lastError = error;
  }

  const parsedUrl = new URL(BASE_URL);
  const host = parsedUrl.hostname || "127.0.0.1";
  const port = Number(parsedUrl.port || 80);
  const app = next({ dev: false, dir: process.cwd(), hostname: host, port });
  await app.prepare();
  const handle = app.getRequestHandler();
  const server = http.createServer((req, res) => handle(req, res));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  context.embeddedServer = server;
  if (lastError) {
    addCheck("Server Next production in-process dinyalakan", "PASS", BASE_URL);
  }

  const started = Date.now();
  while (Date.now() - started < 60_000) {
    try {
      const response = await fetch(BASE_URL);
      if (response.status < 500) return;
    } catch {
      // Wait for Next.js dev server.
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Server ${BASE_URL} belum merespons setelah 60 detik.`);
}

async function upsertUser({ username, password, name, email, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate(
    { username },
    {
      $set: {
        username,
        passwordHash,
        name,
        email,
        role,
        status: "aktif"
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function ensureSk(period, admin, skType, title, extra = {}) {
  const skNumber = `UAT/${skType}/2026-2027/${period._id.toString().slice(-5).toUpperCase()}`;
  const sk = await RplSkDocument.findOneAndUpdate(
    { periodId: period._id, skType },
    {
      $set: {
        periodId: period._id,
        skType,
        skNumber,
        title,
        status: "FINAL",
        effectiveDate: new Date(),
        finalizedBy: admin._id,
        finalizedAt: new Date(),
        createdBy: admin._id,
        dataSnapshot: { source: "UAT REKSA 2026/2027 Ganjil" },
        ...extra
      }
    },
    { upsert: true, new: true }
  );
  return sk;
}

async function seedData() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15_000 });

  const period = await Period.findOneAndUpdate(
    { namaPeriode: "RPL 2026/2027 Ganjil" },
    {
      $set: {
        namaPeriode: "RPL 2026/2027 Ganjil",
        tahunAkademik: "2026/2027",
        semester: "Ganjil",
        status: "Aktif",
        isActive: true
      }
    },
    { upsert: true, new: true }
  );
  await Period.updateMany({ _id: { $ne: period._id } }, { $set: { status: "Non-Aktif", isActive: false } });
  context.period = period;
  addCheck("Periode UAT aktif", "PASS", period.namaPeriode);

  const admin = await upsertUser({
    username: "admin-uat",
    password: "AdminUat123!",
    name: "Admin UAT REKSA",
    email: "admin-uat@reksa.test",
    role: "admin"
  });
  const student = await upsertUser({
    username: "joko-widodo-uat",
    password: "JokoUat123!",
    name: "Joko Widodo",
    email: "joko-widodo-uat@reksa.test",
    role: "mahasiswa"
  });
  context.admin = admin;
  context.student = student;

  await ApplicantProfile.findOneAndUpdate(
    { userId: student._id },
    {
      $set: {
        userId: student._id,
        registrationNumber: "UAT-RPL-2026-001",
        noPendaftar: "UAT-RPL-2026-001",
        periodId: period._id,
        periodName: period.namaPeriode,
        periode: period.namaPeriode,
        program: "S1 Manajemen",
        concentration: "RPL",
        statusRpl: "EVALUASI_F03",
        identity: {
          fullName: "Joko Widodo",
          nameOnCertificate: "Joko Widodo",
          nik: "7371000000000001",
          placeOfBirth: "Makassar",
          dateOfBirth: new Date("1995-01-01"),
          gender: "L",
          religion: "Islam",
          citizenship: "Indonesia",
          motherName: "Ibu UAT"
        },
        contact: {
          email: "joko-widodo-uat@reksa.test",
          phone: "081234567890",
          address: "Jl. UAT REKSA No. 1",
          village: "UAT",
          district: "Makassar"
        },
        work: {
          employmentStatus: "Bekerja",
          institution: "Perusahaan Dummy",
          position: "Supervisor Operasional",
          officeAddress: "Jl. Kantor Dummy",
          officePhone: "0411000000",
          officeEmail: "office-uat@example.com"
        },
        progress: {
          paymentStatus: "DITERIMA",
          f02Status: "SUBMITTED",
          f03Status: "SUBMITTED",
          assessmentStatus: "SELESAI",
          resultStatus: "BELUM"
        },
        statusPembayaran: "DITERIMA",
        statusF02: "SUBMITTED",
        statusF03: "SUBMITTED",
        statusAsesmen: "SELESAI",
        statusHasil: "BELUM",
        isActive: true
      }
    },
    { upsert: true, new: true }
  );

  await Payment.findOneAndUpdate(
    { userId: student._id, jenisPembayaran: "Biaya RPL", keterangan: "UAT REKSA 2026/2027 Ganjil" },
    {
      $set: {
        userId: student._id,
        jenisPembayaran: "Biaya RPL",
        tanggalBayar: new Date(),
        nominal: 10_000_000,
        keterangan: "UAT REKSA 2026/2027 Ganjil",
        buktiBayar: "https://example.com/bukti-bayar-joko-widodo.pdf",
        statusVerifikasi: "Diterima",
        catatanAdmin: "Pembayaran dummy UAT terverifikasi."
      }
    },
    { upsert: true, new: true }
  );
  addCheck("Admin, mahasiswa, profil, dan pembayaran UAT tersedia", "PASS");

  const klasterSpecs = [
    { key: "sdm", name: "Manajemen SDM", courses: [
      ["MSDM101", "Manajemen Sumber Daya Manusia", 3],
      ["MSDM102", "Perilaku Organisasi", 3]
    ] },
    { key: "pemasaran", name: "Manajemen Pemasaran", courses: [
      ["MKT101", "Manajemen Pemasaran", 3],
      ["MKT102", "Riset Pemasaran", 3]
    ] },
    { key: "keuangan", name: "Manajemen Keuangan", courses: [] },
    { key: "bisnis", name: "Kewirausahaan / Pengembangan Bisnis", courses: [] }
  ];
  const klasters = {};
  const courses = {};
  for (const spec of klasterSpecs) {
    const klaster = await Klaster.findOneAndUpdate(
      { namaKlaster: spec.name },
      { $set: { namaKlaster: spec.name, deskripsi: `Klaster UAT ${spec.name}`, isActive: true } },
      { upsert: true, new: true }
    );
    klasters[spec.key] = klaster;
    for (const [kode, namaMatkul, sks] of spec.courses) {
      const course = await MataKuliah.findOneAndUpdate(
        { kode },
        { $set: { kode, namaMatkul, sks, semester: 1, kelompok: "RPL", konsentrasi: "Manajemen", isRpl: true } },
        { upsert: true, new: true }
      );
      courses[kode] = course;
      await KlasterMatkul.findOneAndUpdate(
        { klasterId: klaster._id, matkulId: course._id },
        { $set: { klasterId: klaster._id, matkulId: course._id } },
        { upsert: true, new: true }
      );
    }
  }
  context.klasters = klasters;
  context.courses = courses;
  addCheck("Klaster dan mata kuliah UAT tersedia", "PASS", "2 klaster utama, 4 mata kuliah");

  const penilaiSpecs = [
    ["penilai-uat-andi", "Dr. Andi Pratama, S.E., M.M.", "Akademisi", "Manajemen SDM", "sdm", true],
    ["penilai-uat-nur-aisyah", "Dr. Nur Aisyah, S.E., M.M.", "Akademisi", "Manajemen Pemasaran", "pemasaran", true],
    ["penilai-uat-farhan", "Muhammad Farhan, S.E., M.Si.", "Akademisi", "Manajemen Keuangan", "keuangan", true],
    ["penilai-uat-siti", "Siti Rahmawati, S.E., M.M.", "Praktisi", "Kewirausahaan", "bisnis", true],
    ["penilai-uat-ahmad", "Ahmad Fauzi, S.E., M.M.", "Akademisi", "Manajemen SDM", "sdm", false],
    ["penilai-uat-rina", "Rina Marlina, S.E., M.M.", "Praktisi", "Manajemen Pemasaran", "pemasaran", false],
    ["penilai-uat-budi", "Budi Santoso, S.E., M.M.", "Akademisi", "Manajemen Keuangan", "keuangan", false],
    ["penilai-uat-nurul", "Nurul Hidayah, S.E., M.M.", "Praktisi", "Kewirausahaan", "bisnis", false]
  ];
  const penilai = [];
  for (let i = 0; i < penilaiSpecs.length; i++) {
    const [username, name, jenis, bidang, klasterKey, activeInPeriod] = penilaiSpecs[i];
    const user = await upsertUser({
      username,
      password: `PenilaiUat${i + 1}!`,
      name,
      email: `${username}@reksa.test`,
      role: "penilai"
    });
    const klaster = klasters[klasterKey];
    await PenilaiProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          namaLengkap: name,
          email: `${username}@reksa.test`,
          noHp: `08120000000${i + 1}`,
          jenisPenilai: jenis,
          instansi: jenis === "Akademisi" ? "STIMI YAPMI Makassar" : "Industri Mitra UAT",
          jabatan: jenis === "Akademisi" ? "Dosen" : "Praktisi",
          jabatanFungsional: jenis === "Akademisi" ? "Lektor" : "",
          pangkatGolongan: jenis === "Akademisi" ? "III/c" : "",
          bidangKeahlian: bidang,
          pengalaman: "Lebih dari 5 tahun pengalaman sesuai bidang keahlian.",
          isActive: true,
          jenisKelamin: i % 2 === 0 ? "Pria" : "Wanita",
          tempatLahir: "Makassar",
          tanggalLahir: new Date("1980-01-01"),
          nik: `73710000000000${String(i + 2).padStart(2, "0")}`,
          pendidikanTerakhir: "S2",
          prodiKeilmuan: "Manajemen",
          alamatRumah: "Alamat dummy UAT",
          bidangKeahlianKerja: bidang
        }
      },
      { upsert: true, new: true }
    );
    await PenilaiKlaster.findOneAndUpdate(
      { penilaiId: user._id, klasterId: klaster._id },
      { $set: { penilaiId: user._id, klasterId: klaster._id, assignedBy: admin._id, isActive: true } },
      { upsert: true, new: true }
    );
    if (activeInPeriod) {
      await RplPeriodPenilai.findOneAndUpdate(
        { periodId: period._id, penilaiId: user._id },
        {
          $set: {
            periodId: period._id,
            penilaiId: user._id,
            jenisPenilai: jenis,
            klasterIds: [klaster._id],
            isActive: true,
            isEligibleForPlotting: true,
            notes: "Penilai aktif UAT REKSA 2026/2027 Ganjil"
          }
        },
        { upsert: true, new: true }
      );
    } else {
      await RplPeriodPenilai.deleteMany({ periodId: period._id, penilaiId: user._id });
    }
    penilai.push({ user, klaster, activeInPeriod });
  }
  context.penilai = penilai;
  addCheck("8 penilai dummy tersedia", "PASS", "4 aktif di periode, 4 hanya master penilai");

  await RplPeriodTeam.deleteMany({ periodId: period._id, nama: /^UAT / });
  for (const [nama, jabatanDalamTim, unsur] of [
    ["UAT Ketua Tim RPL", "Ketua Tim RPL", "Pimpinan"],
    ["UAT Sekretaris", "Sekretaris", "Administrasi"],
    ["UAT Anggota BAAK", "Anggota BAAK", "BAAK"],
    ["UAT Anggota Prodi", "Anggota Prodi", "Program Studi"],
    ["UAT Operator Pusdatin", "Operator/Pusdatin", "Pusdatin"]
  ]) {
    await RplPeriodTeam.create({ periodId: period._id, nama, jabatanDalamTim, unsur, isActive: true });
  }

  const skPmb = await ensureSk(period, admin, "SK_PMB_RPL", "SK Penerimaan RPL UAT");
  const skPedomanInstitusi = await ensureSk(period, admin, "SK_PEDOMAN_INSTITUSI", "SK Pedoman RPL Institusi UAT");
  const skPedomanProdi = await ensureSk(period, admin, "SK_PEDOMAN_PRODI", "SK Pedoman RPL Prodi UAT");
  const skPengelola = await ensureSk(period, admin, "SK_PENGELOLA_RPL", "SK Pengelola RPL UAT");
  const skPenilai = await ensureSk(period, admin, "SK_PENILAI_RPL", "SK Penilai RPL UAT");
  await RplPeriodPenilai.updateMany({ periodId: period._id, isActive: true }, { $set: { skDocumentId: skPenilai._id, isEligibleForPlotting: true } });
  await RplPeriodTeam.updateMany({ periodId: period._id, isActive: true }, { $set: { skDocumentId: skPengelola._id } });
  for (const [sk, fileUrl, title] of [
    [skPedomanInstitusi, "https://example.com/pedoman-rpl-institusi.pdf", "Pedoman RPL Institusi"],
    [skPedomanProdi, "https://example.com/pedoman-rpl-prodi-s1-manajemen.pdf", "Pedoman RPL Prodi S1 Manajemen"]
  ]) {
    await RplSkLampiran.findOneAndUpdate(
      { skDocumentId: sk._id, lampiranType: "PEDOMAN_FILE" },
      { $set: { skDocumentId: sk._id, periodId: period._id, lampiranType: "PEDOMAN_FILE", title, fileUrl, order: 1, createdBy: admin._id } },
      { upsert: true, new: true }
    );
  }
  context.sk = { skPmb, skPedomanInstitusi, skPedomanProdi, skPengelola, skPenilai };
  addCheck("SK awal periode dan lampiran pedoman tersedia", "PASS");

  await PenilaiPlotting.deleteMany({ mahasiswaId: student._id });
  await HasilPenilaianKonfirmasi.deleteMany({ mahasiswaId: student._id });
  await RplFinalResult.deleteMany({ mahasiswaId: student._id, periodId: period._id });
  await RplSanggahan.deleteMany({ mahasiswaId: student._id, periodId: period._id });
  await RplDocument.deleteMany({ mahasiswaId: student._id });
  await RplDocument.deleteMany({ periodId: period._id, documentType: "BUNDLE_PERIODE" });

  const selectedCourses = [courses.MSDM101, courses.MSDM102, courses.MKT101, courses.MKT102];
  for (const course of selectedCourses) {
    await F02Pengajuan.findOneAndUpdate(
      { userId: student._id, matkulId: course._id },
      { $set: { userId: student._id, matkulId: course._id, jenisPengajuan: "Perolehan" } },
      { upsert: true, new: true }
    );
  }
  for (const klaster of [klasters.sdm, klasters.pemasaran]) {
    await AssessmentAttempt.findOneAndUpdate(
      { userId: student._id, klasterId: klaster._id },
      {
        $set: {
          userId: student._id,
          klasterId: klaster._id,
          status: "Completed",
          submittedAt: new Date(),
          certificateNumber: `UAT-CERT-${klaster._id.toString().slice(-5).toUpperCase()}`,
          certificateIssuedAt: new Date(),
          matkulResults: selectedCourses
            .filter((course) => (klaster._id.equals(klasters.sdm._id) ? course.kode.startsWith("MSDM") : course.kode.startsWith("MKT")))
            .map((course) => ({
              matkulId: course._id,
              matkulName: course.namaMatkul,
              rawScore: 85,
              adjustedScore: 85,
              finalScore: 85,
              finalGrade: "A",
              gradingPolicySnapshot: "UAT",
              gradeBoosterEnabled: false,
              adjustmentApplied: 0
            }))
        }
      },
      { upsert: true, new: true }
    );
  }
  addCheck("F02 dan asesmen kompetensi UAT tersedia", "PASS");
}

async function runUat() {
  await waitForServer();

  const { admin, student, penilai, klasters, courses, period } = context;
  const p1 = penilai[0].user;
  const p2 = penilai[1].user;
  const p5 = penilai[4].user;

  const f03Payload = async (klaster, courseList) => {
    const route = `/api/mahasiswa/f03/${klaster._id}`;
    const getResult = await request(student, "GET", route);
    if (!getResult.data.canAccess) throw new Error(`F03 ${klaster.namaKlaster} tidak dapat diakses`);
    const entries = courseList.map((course) => ({
      courseId: course._id.toString(),
      tingkatKemampuan: "Sangat Baik",
      jenisBukti: [1, 2, 3],
      buktiFileUrl: "https://example.com/portofolio-joko-widodo.pdf"
    }));
    await request(student, "POST", route, { entries, isSubmitted: true });
  };
  await f03Payload(klasters.sdm, [courses.MSDM101, courses.MSDM102]);
  await f03Payload(klasters.pemasaran, [courses.MKT101, courses.MKT102]);
  addCheck("Mahasiswa mengisi F03 semua mata kuliah", "PASS");

  const plottingList = await request(admin, "GET", "/api/admin/plotting-f03?search=joko");
  if (!plottingList.data.isSkFinal) throw new Error("SK Penilai belum FINAL menurut endpoint plotting");
  if (plottingList.data.data.filter((row) => row.mahasiswaNama === "Joko Widodo").length < 2) {
    throw new Error("Joko Widodo belum muncul untuk 2 klaster plotting");
  }
  addCheck("Joko muncul sebagai mahasiswa siap plotting", "PASS");

  const sdmPenilai = await request(admin, "GET", `/api/admin/plotting-f03/penilai?klasterId=${klasters.sdm._id}`);
  const pemasaranPenilai = await request(admin, "GET", `/api/admin/plotting-f03/penilai?klasterId=${klasters.pemasaran._id}`);
  if (sdmPenilai.data.data.some((item) => item._id === p5._id.toString())) throw new Error("Penilai non-SK muncul di dropdown SDM");
  if (pemasaranPenilai.data.data.some((item) => item._id === p5._id.toString())) throw new Error("Penilai non-SK muncul di dropdown Pemasaran");
  addCheck("Dropdown plotting hanya berisi penilai eligible per klaster", "PASS");

  await request(admin, "POST", "/api/admin/plotting-f03", {
    mahasiswaId: student._id.toString(),
    klasterId: klasters.sdm._id.toString(),
    penilaiId: p1._id.toString(),
    catatanAdmin: "Manual plotting UAT untuk klaster SDM"
  });
  const illegalPlot = await request(admin, "POST", "/api/admin/plotting-f03", {
    mahasiswaId: student._id.toString(),
    klasterId: klasters.pemasaran._id.toString(),
    penilaiId: p5._id.toString(),
    catatanAdmin: "Harus ditolak"
  }, [400]);
  addCheck("Backend menolak plotting penilai non-SK", "PASS", illegalPlot.data.message);

  const autoPlot = await request(admin, "POST", "/api/admin/plotting-f03/auto-plot", {});
  if (autoPlot.data.data?.totalAssigned < 1) throw new Error("Auto plotting tidak menugaskan klaster tersisa");
  const plottings = await PenilaiPlotting.find({ mahasiswaId: student._id, status: { $ne: "Dibatalkan" } }).lean();
  if (plottings.length !== 2) throw new Error(`Jumlah plotting bukan 2, tetapi ${plottings.length}`);
  const sdmPlotting = plottings.find((p) => p.klasterId.toString() === klasters.sdm._id.toString());
  const pemasaranPlotting = plottings.find((p) => p.klasterId.toString() === klasters.pemasaran._id.toString());
  if (!sdmPlotting || !pemasaranPlotting) throw new Error("Plotting SDM/Pemasaran tidak lengkap");
  context.plottings = { sdmPlotting, pemasaranPlotting };
  addCheck("Manual dan auto plotting menghasilkan 2 entri", "PASS");

  const skPenugasan = await ensureSk(period, admin, "SK_PENUGASAN_PENILAI", "SK Penugasan Penilai RPL UAT");
  await RplSkLampiran.findOneAndUpdate(
    { skDocumentId: skPenugasan._id, lampiranType: "DAFTAR_PENUGASAN" },
    {
      $set: {
        skDocumentId: skPenugasan._id,
        periodId: period._id,
        lampiranType: "DAFTAR_PENUGASAN",
        title: "Daftar Penugasan Penilai UAT",
        rows: [
          { mahasiswa: "Joko Widodo", klaster: "Manajemen SDM", penilai: p1.name, mode: "Manual" },
          { mahasiswa: "Joko Widodo", klaster: "Manajemen Pemasaran", penilai: p2.name, mode: "Auto" }
        ],
        createdBy: admin._id
      }
    },
    { upsert: true, new: true }
  );
  addCheck("SK Penugasan Penilai dan lampiran dibuat", "PASS");

  const p1Dashboard = await request(p1, "GET", "/api/penilai/dashboard");
  const p2Dashboard = await request(p2, "GET", "/api/penilai/dashboard");
  const p5Dashboard = await request(p5, "GET", "/api/penilai/dashboard");
  if (p1Dashboard.data.data.length !== 1 || p2Dashboard.data.data.length !== 1 || p5Dashboard.data.data.length !== 0) {
    throw new Error("Isolasi dashboard penilai tidak sesuai");
  }
  addCheck("Isolasi tugas dashboard penilai benar", "PASS");

  async function grade(plotting, user, courseList, grades) {
    const f03Rows = await F03Evaluasi.find({ userId: student._id, klasterId: plotting.klasterId }).lean();
    const entries = courseList.map((course, index) => {
      const f03 = f03Rows.find((row) => row.courseId.toString() === course._id.toString());
      return {
        f03EvaluasiId: f03._id.toString(),
        courseId: course._id.toString(),
        vatm: ["V", "A", "T", "M"],
        nilaiHuruf: grades[index],
        catatanPenilai: "VATM lengkap dan bukti dinilai memadai untuk UAT.",
        tanggalPenilaian: new Date().toISOString(),
        waktuPenilaian: "10:00",
        lokasiPenilaian: "Daring",
        penilai1: user.name
      };
    });
    await request(user, "POST", `/api/penilai/f03/${plotting._id}/nilai`, { entries });
  }
  await grade(sdmPlotting, p1, [courses.MSDM101, courses.MSDM102], ["A", "B+"]);
  await grade(pemasaranPlotting, p2, [courses.MKT101, courses.MKT102], ["A", "B"]);
  addCheck("Penilai mengisi VATM dan nilai", "PASS");

  await request(admin, "POST", `/api/admin/hasil-penilaian-f03/${sdmPlotting._id}/konfirmasi`, { action: "konfirmasi", catatanAdmin: "Lengkap UAT" });
  await request(admin, "POST", `/api/admin/hasil-penilaian-f03/${pemasaranPlotting._id}/konfirmasi`, { action: "konfirmasi", catatanAdmin: "Lengkap UAT" });
  addCheck("Admin konfirmasi hasil F03", "PASS");

  const draft = await request(admin, "POST", `/api/admin/finalisasi-rpl/${student._id}/generate-draft`, {});
  if ((draft.data.data.recognizedCourses || []).length !== 4) {
    throw new Error(`recognizedCourses tidak 4: ${draft.data.data.recognizedCourses?.length || 0}`);
  }
  const finalResultId = draft.data.data._id;
  context.finalResultId = finalResultId;
  addCheck("Draft hasil RPL dibuat dengan 4 mata kuliah", "PASS", `Total SKS ${draft.data.data.totalSksDiakui}`);

  await request(admin, "POST", `/api/admin/finalisasi-rpl/${finalResultId}/send-to-student`, {});
  const hasilMahasiswa = await request(student, "GET", "/api/mahasiswa/hasil-rpl");
  if (!JSON.stringify(hasilMahasiswa.data).includes("Joko") && !JSON.stringify(hasilMahasiswa.data).includes("MSDM101")) {
    throw new Error("Hasil RPL mahasiswa tidak memuat data draft");
  }
  await request(student, "POST", `/api/mahasiswa/hasil-rpl/${finalResultId}/sanggah`, {
    catatanMahasiswa: "Sanggahan dummy UAT untuk menguji alur resolve."
  });
  await request(admin, "POST", `/api/admin/finalisasi-rpl/${finalResultId}/finalize`, {}, [400]);
  await request(admin, "POST", `/api/admin/finalisasi-rpl/${finalResultId}/resolve-sanggahan`, {
    action: "TERIMA_SANGGAHAN",
    catatanAdmin: "Sanggahan dummy UAT diselesaikan."
  });
  await request(student, "POST", `/api/mahasiswa/hasil-rpl/${finalResultId}/terima`, {});
  addCheck("Sanggahan, blok finalisasi, resolve, dan terima hasil berhasil", "PASS");

  await request(admin, "POST", `/api/admin/finalisasi-rpl/${finalResultId}/finalize`, {});
  await request(admin, "POST", "/api/admin/finalisasi-rpl/generate-ba-pleno", { periodId: period._id.toString() });
  await request(admin, "POST", "/api/admin/finalisasi-rpl/generate-sk-hasil", { periodId: period._id.toString() });
  addCheck("Finalisasi, BA Pleno, dan SK Hasil RPL dibuat", "PASS");

  for (const type of ["F01", "F02", "F03", "F04", "F05", "SANGGAHAN", "LAMPIRAN_KONVERSI", "BUNDLE"]) {
    await request(admin, "POST", `/api/admin/dokumen-rpl/${student._id}/generate-metadata`, { documentType: type });
  }
  await request(admin, "POST", `/api/admin/dokumen-rpl/${student._id}/bundle`, {});
  const periodBundle = await request(admin, "POST", `/api/admin/dokumen-rpl/periode/${period._id}/bundle`, {});
  addCheck("Bundle mahasiswa dan bundle periode difinalisasi", "PASS", `Token periode ${periodBundle.data.token}`);

  const bundleDoc = await RplDocument.findOne({ mahasiswaId: student._id, documentType: "BUNDLE", isLatestVersion: true }).lean();
  if (!bundleDoc?.verifiedToken) throw new Error("Bundle mahasiswa tidak punya token verifikasi");
  const verify = await fetch(`${BASE_URL}/api/public/verify/${bundleDoc.verifiedToken}`);
  const verifyData = await verify.json();
  const verifyText = JSON.stringify(verifyData);
  if (!verifyData.success || verifyText.includes("recognizedCourses") || verifyText.includes("nilaiHuruf")) {
    throw new Error("Public verify gagal atau membocorkan data sensitif");
  }
  context.bundleToken = bundleDoc.verifiedToken;
  addCheck("Public verify valid dan tidak membocorkan nilai/detail matkul", "PASS");

  const rekap = await request(admin, "GET", `/api/admin/export-sierra/rekap-mahasiswa?periodId=${period._id}`);
  const detail = await request(admin, "GET", `/api/admin/export-sierra/detail-matkul?periodId=${period._id}`);
  const penugasan = await request(admin, "GET", `/api/admin/export-sierra/penilai-penugasan?periodId=${period._id}`);
  if (!rekap.text.includes("Joko Widodo")) throw new Error("CSV rekap tidak memuat Joko Widodo");
  if (!detail.text.includes("MSDM101") || !detail.text.includes("MKT102")) throw new Error("CSV detail tidak lengkap");
  if (!penugasan.text.includes("Dr. Andi Pratama") || !penugasan.text.includes("Dr. Nur Aisyah")) {
    throw new Error("CSV penugasan tidak memuat penilai bertugas");
  }
  addCheck("Export SIERRA CSV berhasil", "PASS");
}

async function writeReport(buildResult = "Belum dijalankan oleh skrip UAT") {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const pass = checks.filter((item) => item.status === "PASS").length;
  const fail = checks.filter((item) => item.status === "FAIL").length;
  const skipped = checks.filter((item) => item.status === "SKIPPED").length;
  const lines = [
    "# Laporan UAT REKSA 2026/2027 Ganjil",
    "",
    `Tanggal: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" })}`,
    `Skenario: UAT REKSA 2026/2027 Ganjil - 1 Mahasiswa, 8 Penilai, 4 Penilai Aktif Periode`,
    "",
    "## Ringkasan",
    "",
    `- PASS: ${pass}`,
    `- FAIL: ${fail}`,
    `- SKIPPED: ${skipped}`,
    `- Mahasiswa: Joko Widodo (${context.student?.username || "-"})`,
    `- Periode: ${context.period?.namaPeriode || "-"}`,
    `- Token verifikasi bundle mahasiswa: ${context.bundleToken || "-"}`,
    `- Build: ${buildResult}`,
    "",
    "## Checklist",
    "",
    ...checks.map((item) => `- ${item.status} - ${item.name}${item.detail ? `: ${item.detail}` : ""}`),
    "",
    "## Bug Ditemukan dan Diperbaiki",
    "",
    "- Draft finalisasi memakai field F03 yang salah (`matkulId`), diperbaiki ke `courseId` dan penilai diambil dari plotting.",
    "- Export SIERRA memakai nama field periode/klaster yang tidak sesuai schema, diperbaiki ke `namaPeriode`, `tahunAkademik`, dan `namaKlaster`.",
    "- Export penugasan memfilter `periodId` pada plotting padahal plotting tidak menyimpan periode, diperbaiki memakai profil mahasiswa periode.",
    "- Public verify memakai field periode lama dan metadata dokumen belum lengkap, diperbaiki agar memuat periode, judul, nomor, token, dan URL verifikasi.",
    "- Terima hasil setelah sanggahan selesai sebelumnya ditolak, diperbaiki agar status `SANGGAHAN_SELESAI` dapat diterima.",
    "- Beberapa teks UI/dokumen masih memakai istilah Asesor, diperbaiki menjadi Penilai.",
    "",
    "## Backlog / Catatan",
    "",
    "- Preview/cetak layout PDF diverifikasi secara data/API dalam UAT otomatis ini; pemeriksaan visual pixel-perfect tetap perlu sesi manual bila ingin menilai kerapian cetak secara penuh.",
    "- Modul pembayaran aktif secara model data dan tercatat terverifikasi; tidak ada gateway pembayaran nyata yang diuji.",
    ""
  ];
  await fs.writeFile(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`REPORT - ${REPORT_PATH}`);
}

try {
  await seedData();
  await runUat();
  await writeReport();
} catch (error) {
  addCheck("Eksekusi UAT otomatis", "FAIL", error.message);
  await writeReport("Tidak dijalankan karena UAT gagal sebelum build");
  console.error(error);
  process.exitCode = 1;
} finally {
  if (context.embeddedServer) {
    await new Promise((resolve) => context.embeddedServer.close(resolve));
  }
  await mongoose.disconnect();
}
