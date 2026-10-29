import { ensureRegistrationPayment } from "@/lib/payment-guard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { Payment } from "@/models/Payment";

type DownloadItem = {
  title: string;
  desc: string;
  status: "available" | "locked" | "pending";
  actionLabel: string;
  href?: string;
  tone: string;
  meta?: string;
};

export const metadata = {
  title: "Pusat Unduhan & Dokumen RPL - REKSA STIMI",
};

export default async function MahasiswaDownloadPage() {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }
  await ensureRegistrationPayment(session.id);

  await connectMongoDB();

  const [profile, f02Count, payments] = await Promise.all([
    ApplicantProfile.findOne({ userId: session.id }).lean(),
    F02Pengajuan.countDocuments({ userId: session.id }),
    Payment.find({ userId: session.id }).sort({ tanggalBayar: -1 }).lean(),
  ]);

  const acceptedPayments = payments.filter((payment) => payment.statusVerifikasi === "Diterima");
  const latestPayment = payments[0];
  const fullName = (profile?.identity?.fullName || session.name || "MAHASISWA RPL").toUpperCase();
  const registrationNumber = profile?.registrationNumber || profile?.nim || "-";
  const statusRpl = profile?.statusRpl || "PENDAFTARAN";
  const canDownloadFinal = ["SIAP_PLENO", "LULUS"].includes(statusRpl);

  const adminItems: DownloadItem[] = [
    {
      title: "Aplikasi RPL (F-01)",
      desc: "Formulir pendaftaran resmi & identitas biodata mahasiswa RPL.",
      status: profile ? "available" : "locked",
      actionLabel: profile ? "Buka F01" : "Lengkapi Biodata",
      href: profile ? "/mahasiswa/cetak-f01" : "/dashboard/mahasiswa/biodata",
      tone: "var(--md-primary)",
      meta: registrationNumber !== "-" ? `No. Reg: ${registrationNumber}` : "Tersinkronisasi Neo Feeder",
    },
    {
      title: "Asesmen RPL (F-02)",
      desc: "Formulir daftar mata kuliah konversi & jalur pengajuan RPL.",
      status: f02Count > 0 ? "available" : "pending",
      actionLabel: f02Count > 0 ? "Buka F02" : "Isi F02",
      href: f02Count > 0 ? "/mahasiswa/cetak-f02" : "/dashboard/mahasiswa/f02",
      tone: f02Count > 0 ? "var(--md-primary)" : "#dc2626",
      meta: f02Count > 0 ? `${f02Count} mata kuliah diajukan` : "Belum simpan pengajuan F02",
    },
    {
      title: "Riwayat Hidup (F-07)",
      desc: "Curriculum Vitae resmi, pendidikan, pelatihan, organisasi & kerja.",
      status: "available",
      actionLabel: "Buka F07",
      href: "/mahasiswa/cetak-f07",
      tone: "var(--md-primary)",
      meta: "Formulir CV lengkap terintegrasi",
    },
    {
      title: "Surat Sanggahan Hasil",
      desc: "Format resmi konfirmasi atau sanggahan hasil asesmen konversi.",
      status: canDownloadFinal ? "available" : "locked",
      actionLabel: canDownloadFinal ? "Tersedia" : "Terkunci",
      tone: "#d97706",
      meta: canDownloadFinal ? "Status siap pleno / lulus" : "Tersedia saat pengumuman hasil",
    },
  ];

  const existingF03Klasters = await import("@/models/F03Evaluasi").then(m => m.F03Evaluasi.distinct("klasterId", { userId: session.id }));
  const Klaster = await import("@/models/Klaster").then(m => m.Klaster);
  const userKlasters = await Klaster.find({ _id: { $in: existingF03Klasters } }).lean();

  const f03Items: DownloadItem[] = userKlasters.length > 0 
    ? userKlasters.map((k: any) => ({
        title: `F-03: ${k.namaKlaster}`,
        desc: `Formulir evaluasi diri & bukti portofolio asesi klaster.`,
        status: "available" as const,
        actionLabel: "Buka F03",
        href: `/mahasiswa/cetak-f03/${k._id}`,
        tone: "var(--md-primary)",
        meta: `Dokumen portofolio klaster`,
      }))
    : [
        {
          title: "Form Evaluasi Diri (F-03)",
          desc: "Formulir evaluasi diri berdasarkan mata kuliah konversi RPL.",
          status: statusRpl === "EVALUASI_F03" || f02Count > 0 ? "available" : "locked",
          actionLabel: statusRpl === "EVALUASI_F03" || f02Count > 0 ? "Buka F03" : "Terkunci",
          href: "/dashboard/mahasiswa/f03",
          tone: "var(--md-primary)",
          meta: f02Count > 0 ? "Siap pengisian berkas portofolio" : "Selesaikan F-02 terlebih dahulu",
        }
      ];

  const evaluationItems: DownloadItem[] = [
    ...f03Items,
    {
      title: "Berita Acara Asesmen",
      desc: "Rekapitulasi nilai dan hasil evaluasi setelah divalidasi asesor.",
      status: canDownloadFinal ? "available" : "locked",
      actionLabel: canDownloadFinal ? "Tersedia" : "Terkunci",
      tone: "#059669",
      meta: canDownloadFinal ? "Dokumen resmi siap cetak" : "Menunggu verifikasi asesor",
    },
  ];

  const AssessmentAttemptModel = await import("@/models/AssessmentAttempt").then(m => m.AssessmentAttempt);
  const userAttempts = await AssessmentAttemptModel.find({ userId: session.id, status: "Completed" }).populate("klasterId", "namaKlaster").lean();

  const kompetensiCertItems: DownloadItem[] = userAttempts.map((attempt: any) => ({
    title: `Sertifikat: ${attempt.klasterId?.namaKlaster || "Klaster"}`,
    desc: `Sertifikat kelulusan uji asesmen mandiri klaster kompetensi.`,
    status: "available" as const,
    actionLabel: "Lihat",
    href: `/mahasiswa/cetak-sertifikat/${attempt.klasterId?._id || attempt.klasterId}`,
    tone: "#d97706",
    meta: `No: ${attempt.certificateNumber || "-"}`,
  }));

  const certificateItems: DownloadItem[] = [
    ...kompetensiCertItems,
    {
      title: "Sertifikat Kelulusan RPL (SK Akhir)",
      desc: "Sertifikat dan Surat Keputusan (SK) kelulusan konversi akademik.",
      status: statusRpl === "LULUS" ? "available" : "locked",
      actionLabel: statusRpl === "LULUS" ? "Tersedia" : "Terkunci",
      tone: "#059669",
      meta: statusRpl === "LULUS" ? "Kelulusan telah disahkan" : "Menunggu rapat pleno akhir",
    },
  ];

  const paymentItems: DownloadItem[] = acceptedPayments.length
    ? acceptedPayments.map((payment) => ({
        title: payment.jenisPembayaran,
        desc: "Bukti kwitansi resmi yang telah divalidasi oleh Bagian Keuangan.",
        status: "available" as const,
        actionLabel: payment.buktiBayar ? "Lihat Bukti" : "Terverifikasi",
        href: payment.buktiBayar || undefined,
        tone: "#059669",
        meta: `${formatDate(payment.tanggalBayar)} • Rp ${Number(payment.nominal || 0).toLocaleString("id-ID")}`,
      }))
    : [
        {
          title: "Riwayat Kwitansi",
          desc: "Bukti kwitansi pembayaran akan muncul setelah divalidasi.",
          status: latestPayment ? "pending" : "locked",
          actionLabel: latestPayment ? "Menunggu Validasi" : "Belum Ada",
          href: "/dashboard/mahasiswa/keuangan",
          tone: "#64748b",
          meta: latestPayment ? `Status terbaru: ${latestPayment.statusVerifikasi}` : "Kirim konfirmasi pembayaran dahulu",
        },
      ];

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40, marginTop: 14 }}>

      {/* ── 4 Kolom Dokumen ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <DownloadColumn title="Administrasi & Penilai" color="var(--md-primary)" items={adminItems} />
        <DownloadColumn title="Evaluasi Klaster" color="#059669" items={evaluationItems} />
        <DownloadColumn title="Sertifikat Lulus" color="#d97706" items={certificateItems} />
        <DownloadColumn title="Riwayat Kwitansi" color="#64748b" items={paymentItems} />
      </div>
    </div>
  );
}

function DownloadColumn({ title, color, items }: { title: string; color: string; items: DownloadItem[] }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          borderRadius: 12,
          background: "var(--md-surface-2)",
          border: "1px solid var(--md-outline-variant)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color }}>
          {title}
        </h2>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            borderRadius: 999,
            padding: "2px 8px",
            background: "var(--md-surface-1)",
            border: "1px solid var(--md-outline-variant)",
            color: "var(--md-on-surface-variant)",
          }}
        >
          {items.length} Berkas
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <DownloadCard key={`${title}-${item.title}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function DownloadCard({ item }: { item: DownloadItem }) {
  const isExternal = Boolean(item.href && !item.href.startsWith("/dashboard"));
  const isClickable = Boolean(item.href);

  const content = (
    <>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: item.status === "available" ? "rgba(14, 165, 164, 0.12)" : "var(--md-surface-2)",
          color: item.status === "available" ? "var(--md-primary)" : "var(--md-on-surface-variant)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 900,
          flexShrink: 0,
          border: `1px solid ${item.status === "available" ? "rgba(14, 165, 164, 0.3)" : "var(--md-outline-variant)"}`,
        }}
      >
        {statusLabel(item.status)}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 12.5,
            fontWeight: 900,
            color: item.status === "locked" ? "var(--md-on-surface-variant)" : "var(--md-on-surface)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.title}
        </h3>
        <p style={{ margin: "2px 0 0", fontSize: 11, lineHeight: 1.4, fontWeight: 600, color: "var(--md-on-surface-variant)" }}>
          {item.desc}
        </p>
        {item.meta && (
          <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 800, color: item.tone }}>
            {item.meta}
          </p>
        )}
      </div>

      <div style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 2 }}>
        <span
          style={{
            borderRadius: 999,
            padding: "5px 12px",
            background: item.status === "available" ? "var(--md-primary)" : "var(--md-surface-2)",
            border: `1px solid ${item.status === "available" ? "var(--md-primary)" : "var(--md-outline-variant)"}`,
            color: item.status === "available" ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
            fontSize: 10.5,
            fontWeight: 900,
            whiteSpace: "nowrap",
            display: "inline-block",
            boxShadow: item.status === "available" ? "0 2px 8px var(--theme-glow)" : "none",
          }}
        >
          {item.actionLabel}
        </span>
      </div>
    </>
  );

  const style = {
    padding: "12px 14px",
    borderRadius: 14,
    background: "var(--md-surface-1)",
    border: "1px solid var(--md-outline-variant)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    transition: "all 0.16s ease",
    opacity: item.status === "locked" ? 0.65 : 1,
  };

  if (!item.href) {
    return (
      <div style={{ ...style, cursor: "default" }}>
        {content}
      </div>
    );
  }

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        style={{ ...style, cursor: "pointer" }}
        className="hover:border-teal-400 hover:shadow-sm"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      style={{ ...style, cursor: "pointer" }}
      className="hover:border-teal-400 hover:shadow-sm"
    >
      {content}
    </Link>
  );
}

function statusLabel(status: DownloadItem["status"]) {
  if (status === "available") return "✓";
  if (status === "pending") return "⏳";
  return "🔒";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}
