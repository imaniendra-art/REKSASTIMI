import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const documentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["ktp", "kk", "ijazah", "akta", "pendukung", "ttd"],
      required: true
    },
    fileName: String,
    fileUrl: String,
    validationStatus: {
      type: String,
      enum: ["menunggu", "valid", "ditolak"],
      default: "menunggu"
    },
    note: String,
    uploadedAt: Date
  },
  {
    _id: false
  }
);

const applicantProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    registrationNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    nim: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    periodId: {
      type: Schema.Types.ObjectId,
      ref: "Period"
    },
    periodName: {
      type: String,
      trim: true,
      index: true
    },
    program: {
      type: String,
      trim: true
    },
    concentration: {
      type: String,
      trim: true
    },
    statusRpl: {
      type: String,
      enum: [
        "PENDAFTARAN",
        "LENGKAPI_CV",
        "PEMBAYARAN",
        "ASESMEN_F02",
        "ASESMEN_KOMPETENSI",
        "EVALUASI_F03",
        "EVALUASI_ASESOR",
        "KONFIRMASI_HASIL",
        "SIAP_PLENO",
        "LULUS"
      ],
      default: "PENDAFTARAN",
      index: true
    },
    identity: {
      fullName: String,
      nameOnCertificate: String,
      nik: String,
      nisn: String,
      placeOfBirth: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["L", "P", ""],
        default: ""
      },
      religion: String,
      citizenship: String,
      motherName: String
    },
    contact: {
      email: String,
      phone: String,
      address: String,
      village: String,
      district: String
    },
    work: {
      maritalStatus: String,
      employmentStatus: String,
      institution: String,
      position: String,
      officeAddress: String,
      officePhone: String,
      officeEmail: String
    },
    cv: {
      currentWork: {
        maritalStatus: String,
        employmentStatus: String,
        institution: String,
        position: String,
        officeAddress: String,
        officePhone: String,
        officeEmail: String
      },
      formalEducation: [
        {
          level: String,
          institution: String,
          major: String,
          graduationYear: String
        }
      ],
      nonFormalEducation: [
        {
          name: String,
          organizer: String,
          year: String,
          duration: String
        }
      ],
      workExperience: [
        {
          company: String,
          companyAddress: String,
          position: String,
          startYear: String,
          endYear: String,
          startDate: String,
          endDate: String,
          description: String
        }
      ],
      trainings: [
        {
          name: String,
          organizer: String,
          year: String
        }
      ],
      conferences: [
        {
          title: String,
          organizer: String,
          year: String,
          status: String
        }
      ],
      achievements: [
        {
          name: String,
          issuer: String,
          year: String
        }
      ],
      organizations: [
        {
          name: String,
          position: String,
          startYear: String,
          endYear: String
        }
      ]
    },
    progress: {
      paymentStatus: {
        type: String,
        enum: ["BELUM_BAYAR", "PROSES", "DITERIMA", "DITOLAK"],
        default: "BELUM_BAYAR"
      },
      f02Status: {
        type: String,
        enum: ["BELUM", "DRAFT", "SUBMITTED"],
        default: "BELUM"
      },
      f03Status: {
        type: String,
        enum: ["BELUM", "DRAFT", "SUBMITTED", "DINILAI"],
        default: "BELUM"
      },
      assessmentStatus: {
        type: String,
        enum: ["BELUM", "PROSES", "SELESAI"],
        default: "BELUM"
      },
      resultStatus: {
        type: String,
        enum: ["BELUM", "KONFIRMASI", "SIAP_PLENO", "LULUS"],
        default: "BELUM"
      }
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
  {
    timestamps: true
  }
);

applicantProfileSchema.pre("save", function (next) {
  const self = this as any;

  // 1. Sync registrationNumber <=> noPendaftar (Source of truth: registrationNumber)
  if (self.registrationNumber) {
    self.noPendaftar = self.registrationNumber;
  } else if (self.noPendaftar) {
    self.registrationNumber = self.noPendaftar;
  }

  // 2. Sync identity.fullName <=> nama (Source of truth: identity.fullName)
  if (self.identity?.fullName) {
    self.nama = self.identity.fullName;
  } else if (self.nama) {
    if (!self.identity) self.identity = {};
    self.identity.fullName = self.nama;
  }

  // 3. Sync identity.nik <=> nik (Source of truth: identity.nik)
  if (self.identity?.nik) {
    self.nik = self.identity.nik;
  } else if (self.nik) {
    if (!self.identity) self.identity = {};
    self.identity.nik = self.nik;
  }

  // 4. Sync contact.email <=> email (Source of truth: contact.email)
  if (self.contact?.email) {
    self.email = self.contact.email;
  } else if (self.email) {
    if (!self.contact) self.contact = {};
    self.contact.email = self.email;
  }

  // 5. Sync contact.phone <=> whatsapp (Source of truth: contact.phone)
  if (self.contact?.phone) {
    self.whatsapp = self.contact.phone;
  } else if (self.whatsapp) {
    if (!self.contact) self.contact = {};
    self.contact.phone = self.whatsapp;
  }

  // 6. Sync periodName <=> periode (Source of truth: periodName)
  if (self.periodName) {
    self.periode = self.periodName;
  } else if (self.periode) {
    self.periodName = self.periode;
  }

  // 7. Sync progress.paymentStatus <=> statusPembayaran (Source of truth: progress.paymentStatus)
  if (self.progress?.paymentStatus) {
    self.statusPembayaran = self.progress.paymentStatus;
  } else if (self.statusPembayaran) {
    if (!self.progress) self.progress = {};
    self.progress.paymentStatus = self.statusPembayaran;
  }

  // 8. Sync progress.f02Status <=> statusF02 (Source of truth: progress.f02Status)
  if (self.progress?.f02Status) {
    self.statusF02 = self.progress.f02Status;
  } else if (self.statusF02) {
    if (!self.progress) self.progress = {};
    self.progress.f02Status = self.statusF02;
  }

  // 9. Sync progress.f03Status <=> statusF03 (Source of truth: progress.f03Status)
  if (self.progress?.f03Status) {
    self.statusF03 = self.progress.f03Status;
  } else if (self.statusF03) {
    if (!self.progress) self.progress = {};
    self.progress.f03Status = self.statusF03;
  }

  // 10. Sync progress.assessmentStatus <=> statusAsesmen (Source of truth: progress.assessmentStatus)
  if (self.progress?.assessmentStatus) {
    self.statusAsesmen = self.progress.assessmentStatus;
  } else if (self.statusAsesmen) {
    if (!self.progress) self.progress = {};
    self.progress.assessmentStatus = self.statusAsesmen;
  }

  // 11. Sync progress.resultStatus <=> statusHasil (Source of truth: progress.resultStatus)
  if (self.progress?.resultStatus) {
    self.statusHasil = self.progress.resultStatus;
  } else if (self.statusHasil) {
    if (!self.progress) self.progress = {};
    self.progress.resultStatus = self.statusHasil;
  }

  // 12. Sync contact.address <=> alamat (Source of truth: contact.address)
  if (self.contact?.address) {
    self.alamat = self.contact.address;
  } else if (self.alamat) {
    if (!self.contact) self.contact = {};
    self.contact.address = self.alamat;
  }

  // 13. Sync work.position <=> pekerjaan (Source of truth: work.position)
  if (self.work?.position) {
    self.pekerjaan = String(self.work.position);
  } else if (self.pekerjaan) {
    if (!self.work) self.work = {};
    self.work.position = self.pekerjaan;
  }

  // 14. Ensure isActive is initialized
  if (self.isActive === undefined) {
    self.isActive = true;
  }

  next();
});

export type ApplicantProfileDocument = InferSchemaType<typeof applicantProfileSchema>;

export const ApplicantProfile =
  (models.ApplicantProfile as Model<ApplicantProfileDocument> | undefined) ??
  model<ApplicantProfileDocument>("ApplicantProfile", applicantProfileSchema);
