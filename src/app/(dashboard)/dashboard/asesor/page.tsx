import { PageHero } from "@/components/dashboard/UIComponents";

export default function AsesorDashboardPage() {
  const assignments = [
    { nama: "Muh. Farhan",   nim: "RPL-2026-001", klaster: "Manajemen Pemasaran", dinilai: 2, total: 5 },
    { nama: "Siti Rahmah",   nim: "RPL-2026-014", klaster: "Manajemen SDM",        dinilai: 0, total: 4 },
    { nama: "Andi Saputra",  nim: "RPL-2026-026", klaster: "Kewirausahaan",        dinilai: 3, total: 3 },
  ];

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {/* ── Hero Banner ── */}
      <PageHero
        badgeIcon="⚖️"
        badgeText="Dashboard Penilai"
        title="Selamat Datang, Tim Penilai"
        subtitle="Kelola dan selesaikan asesmen kompetensi mahasiswa RPL"
      />

      {/* ── Summary + Search ── */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "auto 1fr", alignItems: "center", marginBottom: 24 }}>
        <div
          className="md-card animate-fade-up stagger-1"
          style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--md-primary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "var(--md-primary)",
            }}
          >
            {assignments.length}
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "var(--md-on-surface)" }}>Penugasan Aktif</p>
            <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)", marginTop: 2 }}>Antrean asesmen</p>
          </div>
        </div>

        <div
          className="md-card animate-fade-up stagger-2"
          style={{ padding: "10px 14px" }}
        >
          <input
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--md-on-surface)",
              padding: "8px 4px",
            }}
            placeholder="🔍  Cari Nama Mahasiswa atau NIM..."
          />
        </div>
      </div>

      {/* ── Section Heading ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 4, height: 20, borderRadius: 99, background: "#4f46e5" }} />
        <h2 style={{ fontWeight: 800, fontSize: 15, color: "var(--md-on-surface)" }}>Daftar Asesmen (Per Klaster)</h2>
      </div>

      {/* ── Assignment Cards ── */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {assignments.map((item, i) => {
          const pct     = Math.round((item.dinilai / item.total) * 100);
          const selesai = item.dinilai >= item.total;

          return (
            <article
              key={item.nim}
              className={`md-card animate-fade-up stagger-${Math.min(i + 2, 8)}`}
              style={{ padding: "20px" }}
            >
              {/* Status badge */}
              <div style={{ marginBottom: 14 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: selesai ? "#d1fae5" : "#fef3c7",
                    color: selesai ? "#064e3b" : "#78350f",
                  }}
                >
                  {selesai ? "✅ Selesai" : "⏳ Dalam Proses"}
                </span>
              </div>

              {/* Avatar + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.nama.slice(0, 1)}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--md-on-surface)" }}>{item.nama}</h3>
                  <p
                    style={{
                      marginTop: 3,
                      display: "inline-block",
                      background: "var(--md-surface-2)",
                      borderRadius: 999,
                      padding: "2px 10px",
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "var(--md-on-surface-variant)",
                    }}
                  >
                    {item.nim}
                  </p>
                </div>
              </div>

              {/* Klaster */}
              <div
                style={{
                  background: "var(--md-surface-2)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 14,
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-on-surface-variant)", marginBottom: 4 }}>
                  Klaster Keahlian
                </p>
                <p style={{ fontWeight: 700, fontSize: 13, color: "var(--md-primary)" }}>{item.klaster}</p>

                {/* Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 10, marginBottom: 6 }}>
                  <span style={{ color: "var(--md-on-surface-variant)", fontWeight: 600 }}>Progress Validasi</span>
                  <span style={{ fontWeight: 800, color: "var(--md-on-surface)" }}>{item.dinilai} / {item.total} Matkul</span>
                </div>
                <div style={{ height: 8, background: "var(--md-outline-variant)", borderRadius: 999, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: selesai ? "#059669" : "linear-gradient(90deg, #4f46e5, #6366f1)",
                      borderRadius: 999,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>

              {/* Action button */}
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "filter 200ms, transform 150ms",
                  border: selesai ? "1.5px solid #059669" : "none",
                  background: selesai ? "transparent" : "linear-gradient(90deg, #4f46e5, #6366f1)",
                  color: selesai ? "#059669" : "#fff",
                  boxShadow: selesai ? "none" : "0 4px 12px rgba(79,70,229,0.30)",
                }}
              >
                {selesai ? "🔍 Review Penilaian" : "▶️ Lanjutkan Asesmen"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
