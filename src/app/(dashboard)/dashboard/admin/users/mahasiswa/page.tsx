import { PageHero } from "@/components/dashboard/UIComponents";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { User } from "@/models/User";
import Link from "next/link";
import { createStudentUser, deleteStudentUser, resetStudentPassword } from "./actions";

type PageProps = {
  searchParams?: Promise<{ q?: string | string[]; status?: string | string[]; message?: string | string[]; create?: string | string[] }>;
};

const formInputStyle = {
  width: "100%",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  background: "#fff",
} as const;

const primaryButtonStyle = {
  border: 0,
  borderRadius: 14,
  padding: "12px 18px",
  background: "var(--md-primary)",
  color: "#fff",
  fontWeight: 800,
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const;

const warningButtonStyle = {
  border: 0,
  borderRadius: 12,
  padding: "9px 12px",
  background: "#f59e0b",
  color: "#fff",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const;

const dangerButtonStyle = {
  border: 0,
  borderRadius: 12,
  padding: "9px 12px",
  background: "#dc2626",
  color: "#fff",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function statusBadge(status: string) {
  const isActive = status === "aktif";

  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: 999,
        padding: "5px 10px",
        background: isActive ? "#d1fae5" : "#fee2e2",
        color: isActive ? "#065f46" : "#991b1b",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}

export default async function StudentAccountsPage({ searchParams }: PageProps) {
  await connectMongoDB();
  const params = searchParams ? await searchParams : {};
  const q = getParam(params.q).trim();
  const status = getParam(params.status);
  const message = getParam(params.message);
  const showCreate = getParam(params.create) === "1";
  const regex = q ? new RegExp(escapeRegex(q), "i") : null;

  const users = await User.find({
    role: "mahasiswa",
    ...(regex
      ? {
          $or: [{ name: regex }, { username: regex }, { email: regex }],
        }
      : {}),
  })
    .sort({ name: 1 })
    .lean();

  const profiles = await ApplicantProfile.find({
    userId: { $in: users.map((user: any) => user._id) },
  }).lean();

  const profileByUser = new Map(profiles.map((profile: any) => [String(profile.userId), profile]));
  const activeTotal = users.filter((user: any) => user.status === "aktif").length;
  const inactiveTotal = users.length - activeTotal;

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeText="Pusat Akun"
        title="Daftar Akun Mahasiswa"
        subtitle="Daftar akun mahasiswa RPL STIMI YAPMI Makassar beserta ringkasan profil pendaftaran yang terhubung di REKSA."
        tone="secondary"
        rightContent={
          <Link className="hero-action-button" href="/dashboard/admin/users/mahasiswa?create=1#form-mahasiswa">
            Tambah Akun
          </Link>
        }
      />

      {message && (
        <div
          className="md-card"
          style={{
            padding: "14px 16px",
            marginBottom: 18,
            borderColor: status === "success" ? "#86efac" : "#fecaca",
            background: status === "success" ? "#f0fdf4" : "#fef2f2",
            color: status === "success" ? "#166534" : "#991b1b",
            fontWeight: 800,
          }}
        >
          {message}
        </div>
      )}

      {showCreate && (
      <div id="form-mahasiswa" style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(15,23,42,0.48)", backdropFilter: "blur(4px)" }}>
        <div style={{ width: "100%", maxWidth: 600, padding: 0, overflow: "hidden", background: "#fff", borderRadius: 20, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#0284c7" }}>
                Tambah Akun Mahasiswa
              </h2>
              <p style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                Buat akun mahasiswa dan profil awal pendaftaran.
              </p>
            </div>
            <Link href="/dashboard/admin/users/mahasiswa" style={{ minWidth: 72, height: 34, borderRadius: 999, border: "1px solid #bae6fd", background: "#f0f9ff", color: "#0284c7", fontSize: 12, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Tutup
            </Link>
          </div>
        <form action={createStudentUser} style={{ padding: 24 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="name" placeholder="Nama lengkap mahasiswa" required style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", fontSize: 12, fontWeight: 700, outline: "none", background: "#f8fafc", color: "#1e293b" }} />
            <input name="username" placeholder="Username / email login" required style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", fontSize: 12, fontWeight: 700, outline: "none", background: "#f8fafc", color: "#1e293b" }} />
            <input name="email" type="email" placeholder="Email aktif" style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", fontSize: 12, fontWeight: 700, outline: "none", background: "#f8fafc", color: "#1e293b" }} />
            <input name="phone" placeholder="No. WhatsApp" style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", fontSize: 12, fontWeight: 700, outline: "none", background: "#f8fafc", color: "#1e293b" }} />
            <input name="password" type="password" placeholder="Password awal" required minLength={6} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", fontSize: 12, fontWeight: 700, outline: "none", background: "#f8fafc", color: "#1e293b" }} />
          </div>
          <div style={{ marginTop: 16, padding: "16px 0 0", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: "#0ea5e9", fontWeight: 800, color: "#fff", fontSize: 12, cursor: "pointer" }}>
              Simpan Mahasiswa
            </button>
          </div>
        </form>
        </div>
      </div>
      )}

      <div className="md-card" style={{ padding: 20, marginBottom: 20 }}>
        <form className="flex flex-col md:flex-row gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama, username, atau email mahasiswa"
            style={formInputStyle}
          />
          <button
            className="account-primary-button"
            type="submit"
            style={primaryButtonStyle}
          >
            Cari Akun
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full" style={{ marginBottom: 20 }}>
        <div className="md-card account-stat-card" style={{ padding: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--md-on-surface-variant)" }}>
            Total Mahasiswa
          </p>
          <strong style={{ display: "block", marginTop: 8, fontSize: 30, color: "var(--md-on-surface)" }}>
            {users.length}
          </strong>
        </div>
        <div className="md-card account-stat-card" style={{ padding: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--md-on-surface-variant)" }}>
            Akun Aktif
          </p>
          <strong style={{ display: "block", marginTop: 8, fontSize: 30, color: "var(--md-on-surface)" }}>
            {activeTotal}
          </strong>
        </div>
        <div className="md-card account-stat-card" style={{ padding: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--md-on-surface-variant)" }}>
            Akun Nonaktif
          </p>
          <strong style={{ display: "block", marginTop: 8, fontSize: 30, color: "var(--md-on-surface)" }}>
            {inactiveTotal}
          </strong>
        </div>
      </div>

      <div className="md-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1160 }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Nama Mahasiswa", "Username", "Email/Kontak", "No. Pendaftar", "Periode", "Status RPL", "Status Akun", "Aksi"].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      textTransform: "uppercase",
                      color: "var(--md-on-surface-variant)",
                      borderBottom: "1px solid var(--md-outline-variant)",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const profile = profileByUser.get(String(user._id));
                const displayName = profile?.identity?.fullName || profile?.nama || user.name;
                const email = profile?.contact?.email || profile?.email || user.email || "-";
                const contact = profile?.contact?.phone || profile?.whatsapp;
                const registrationNumber = profile?.registrationNumber || profile?.noPendaftar || profile?.nim || "-";
                const period = profile?.periodName || profile?.periode || "-";
                const statusRpl = profile?.statusRpl || "-";

                return (
                  <tr className="account-table-row" key={String(user._id)}>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", fontWeight: 800 }}>
                      {displayName}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", color: "#475569" }}>
                      {user.username}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", color: "#475569" }}>
                      <div>{email}</div>
                      {contact && <small style={{ color: "var(--md-on-surface-variant)" }}>{contact}</small>}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", color: "#475569" }}>
                      {registrationNumber}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", color: "#475569" }}>
                      {period}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", color: "#475569" }}>
                      {statusRpl}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7" }}>
                      {statusBadge(user.status)}
                    </td>
                    <td style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", minWidth: 300 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
                        <form action={resetStudentPassword} style={{ display: "contents" }}>
                          <input type="hidden" name="id" value={String(user._id)} />
                          <input
                            name="password"
                            type="password"
                            placeholder="Password baru"
                            minLength={6}
                            required
                            style={{ ...formInputStyle, minHeight: 38, padding: "9px 10px" }}
                          />
                          <button className="account-warning-button" type="submit" style={warningButtonStyle}>
                            Reset
                          </button>
                        </form>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                        <form action={deleteStudentUser} style={{ display: "contents" }}>
                          <input type="hidden" name="id" value={String(user._id)} />
                          <input
                            name="confirmation"
                            placeholder="Ketik HAPUS"
                            required
                            style={{ ...formInputStyle, minHeight: 38, padding: "9px 10px" }}
                          />
                          <button className="account-danger-button" type="submit" style={dangerButtonStyle}>
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
                    Tidak ada akun mahasiswa yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
