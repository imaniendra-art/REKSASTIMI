import { ensureRegistrationPayment } from "@/lib/payment-guard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/dashboard/UIComponents";
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
  const fullName = profile?.identity?.fullName || session.name || "Mahasiswa";
  const registrationNumber = profile?.registrationNumber || profile?.nim || "-";
  const statusRpl = profile?.statusRpl || "PENDAFTARAN";
  const canDownloadFinal = ["SIAP_PLENO", "LULUS"].includes(statusRpl);

  const adminItems: DownloadItem[] = [
    {
      title: "Aplikasi RPL (F-01)",
      desc: "Data pendaftaran dan identitas mahasiswa RPL.",
      status: profile ? "available" : "locked",
      actionLabel: profile ? "Buka F01" : "Lengkapi Biodata",
      href: profile ? "/mahasiswa/cetak-f01" : "/dashboard/mahasiswa/biodata",
      tone: "var(--md-primary)",
      meta: registrationNumber !== "-" ? `No. Reg: ${registrationNumber}` : "Belum ada nomor registrasi",
    },
    {
      title: "Asesmen RPL (F-02)",
      desc: "Daftar mata kuliah dan jenis RPL yang diajukan.",
      status: f02Count > 0 ? "available" : "pending",
      actionLabel: f02Count > 0 ? "Buka F02" : "Isi F02",
      href: f02Count > 0 ? "/mahasiswa/cetak-f02" : "/dashboard/mahasiswa/f02",
      tone: "#dc2626",
      meta: `${f02Count} mata kuliah diajukan`,
    },
    {
      title: "Riwayat Hidup (F-07)",
      desc: "CV, riwayat pendidikan, pekerjaan, pelatihan, dan organisasi.",
      status: "available",
      actionLabel: "Buka F07",
      href: "/mahasiswa/cetak-f07",
      tone: "var(--md-primary)",
      meta: "Form CV mahasiswa",
    },
    {
      title: "Surat Sanggahan",
      desc: "Surat untuk konfirmasi atau sanggahan hasil asesmen RPL.",
      status: canDownloadFinal ? "available" : "locked",
      actionLabel: canDownloadFinal ? "Tersedia" : "Terkunci",
      tone: "#d97706",
      meta: canDownloadFinal ? "Status sudah siap pleno/lulus" : "Menunggu konfirmasi hasil",
    },
    {
      title: "Surat Beda Nama",
      desc: "Pernyataan kesamaan nama untuk kebutuhan administrasi.",
      status: "pending",
      actionLabel: "Belum Tersedia",
      tone: "#334155",
      meta: "Generator dokumen belum tersedia",
    },
  ];

  const existingF03Klasters = await import("@/models/F03Evaluasi").then(m => m.F03Evaluasi.distinct("klasterId", { userId: session.id }));
  const Klaster = await import("@/models/Klaster").then(m => m.Klaster);
  const userKlasters = await Klaster.find({ _id: { $in: existingF03Klasters } }).lean();

  const f03Items: DownloadItem[] = userKlasters.length > 0 
    ? userKlasters.map((k: any) => ({
        title: `F03: ${k.namaKlaster}`,
        desc: `Form evaluasi diri dan dokumen portofolio asesi.`,
        status: "available" as const,
        actionLabel: "Buka",
        href: `/mahasiswa/cetak-f03/${k._id}`,
        tone: "var(--md-secondary, var(--md-primary))",
        meta: `Siap cetak`,
      }))
    : [
        {
          title: "Form Evaluasi Diri (F-03)",
          desc: "Form evaluasi diri berdasarkan mata kuliah RPL.",
          status: statusRpl === "EVALUASI_F03" || f02Count > 0 ? "available" : "locked",
          actionLabel: statusRpl === "EVALUASI_F03" || f02Count > 0 ? "Buka" : "Terkunci",
          href: "/dashboard/mahasiswa/f03",
          tone: "var(--md-secondary, var(--md-primary))",
          meta: f02Count > 0 ? "Belum isi F03" : "Isi F02 dahulu",
        }
      ];

  const evaluationItems: DownloadItem[] = [
    ...f03Items,
    {
      title: "Berita Acara Asesmen",
      desc: "Hasil asesmen setelah diverifikasi penilai.",
      status: canDownloadFinal ? "available" : "locked",
      actionLabel: canDownloadFinal ? "Tersedia" : "Terkunci",
      tone: "#059669",
      meta: canDownloadFinal ? "Siap cetak" : "Belum selesai",
    },
  ];

  const AssessmentAttemptModel = await import("@/models/AssessmentAttempt").then(m => m.AssessmentAttempt);
  const userAttempts = await AssessmentAttemptModel.find({ userId: session.id, status: "Completed" }).populate("klasterId", "namaKlaster").lean();

  const kompetensiCertItems: DownloadItem[] = userAttempts.map((attempt: any) => ({
    title: `Sertifikat: ${attempt.klasterId?.namaKlaster || "Klaster"}`,
    desc: `Bukti telah lulus tes uji kompetensi klaster.`,
    status: "available" as const,
    actionLabel: "Lihat",
    href: `/mahasiswa/cetak-sertifikat/${attempt.klasterId?._id || attempt.klasterId}`,
    tone: "#d97706",
    meta: `No: ${attempt.certificateNumber || "-"}`,
  }));

  const certificateItems: DownloadItem[] = [
    ...kompetensiCertItems,
    {
      title: "Sertifikat Kelulusan RPL (Akhir)",
      desc: "Sertifikat kelulusan RPL jika seluruh proses telah disahkan.",
      status: statusRpl === "LULUS" ? "available" : "locked",
      actionLabel: statusRpl === "LULUS" ? "Tersedia" : "Terkunci",
      tone: "#059669",
      meta: statusRpl === "LULUS" ? "Status lulus" : "Menunggu pleno akhir",
    },
  ];

  const paymentItems: DownloadItem[] = acceptedPayments.length
    ? acceptedPayments.map((payment) => ({
        title: payment.jenisPembayaran,
        desc: "Bukti pembayaran yang sudah divalidasi keuangan.",
        status: "available" as const,
        actionLabel: payment.buktiBayar ? "Lihat Bukti" : "Terverifikasi",
        href: payment.buktiBayar || undefined,
        tone: "#64748b",
        meta: `${formatDate(payment.tanggalBayar)} | Rp ${Number(payment.nominal || 0).toLocaleString("id-ID")}`,
      }))
    : [
        {
          title: "Riwayat Kwitansi",
          desc: "Bukti pembayaran akan tampil setelah divalidasi keuangan.",
          status: latestPayment ? "pending" : "locked",
          actionLabel: latestPayment ? "Menunggu Validasi" : "Belum Ada",
          href: "/dashboard/mahasiswa/keuangan",
          tone: "#64748b",
          meta: latestPayment ? `Status terbaru: ${latestPayment.statusVerifikasi}` : "Kirim konfirmasi pembayaran dahulu",
        },
      ];

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 36 }}>
      <PageHero
        title="Pusat Unduhan Dokumen"
        subtitle={`${fullName} | No. Reg: ${registrationNumber}`}
        tone="dark"
        rightContent={
          <div style={{ minWidth: 230, border: "1px solid rgba(255,255,255,0.22)", borderRadius: 16, background: "rgba(255,255,255,0.12)", padding: 16 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.72 }}>Status RPL</p>
            <p style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 950 }}>{statusRpl.replace(/_/g, " ")}</p>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
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
    <section>
      <h2 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.1em", color }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
      <div style={{ width: 38, height: 38, borderRadius: 12, background: `${item.tone}1a`, color: item.tone, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 950, flexShrink: 0 }}>
        {statusLabel(item.status)}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 950, color: item.status === "locked" ? "#64748b" : "var(--md-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</h3>
        <p style={{ margin: "3px 0 0", fontSize: 11, lineHeight: 1.45, fontWeight: 650, color: "var(--md-on-surface-variant)" }}>{item.desc}</p>
        {item.meta && <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 850, color: item.tone }}>{item.meta}</p>}
      </div>
      <div style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 2 }}>
        <span style={{ borderRadius: 8, padding: "6px 10px", background: item.status === "locked" ? "var(--md-surface-2)" : item.status === "pending" ? "var(--md-warning-container)" : "var(--md-surface-1)", border: `1px solid ${item.status === "locked" ? "var(--md-outline-variant)" : item.status === "pending" ? "var(--md-warning)" : item.tone}`, color: item.status === "locked" ? "var(--md-on-surface-variant)" : item.status === "pending" ? "var(--md-warning)" : item.tone, fontSize: 10, fontWeight: 900, whiteSpace: "nowrap", display: "inline-block" }}>
          {item.actionLabel}
        </span>
      </div>
    </>
  );

  const baseClass = "md-card flex items-center gap-3 no-underline transition-all duration-300";
  const interactiveClass = isClickable 
    ? "hover:-translate-y-1 hover:shadow-md cursor-pointer hover:border-slate-300" 
    : "cursor-default";

  const style = {
    padding: "12px 14px",
    opacity: item.status === "locked" ? 0.72 : 1,
    border: "1px solid var(--md-outline-variant)",
  };

  if (!item.href) {
    return <div className={`${baseClass} ${interactiveClass}`} style={style}>{content}</div>;
  }

  if (isExternal) {
    return <a className={`${baseClass} ${interactiveClass}`} href={item.href} target="_blank" rel="noreferrer" style={style}>{content}</a>;
  }

  return <Link className={`${baseClass} ${interactiveClass}`} href={item.href} style={style}>{content}</Link>;
}

function statusLabel(status: DownloadItem["status"]) {
  if (status === "available") return "OK";
  if (status === "pending") return "...";
  return "LOCK";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}
