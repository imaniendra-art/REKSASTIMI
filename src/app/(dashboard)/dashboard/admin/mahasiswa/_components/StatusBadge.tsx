/* ── MD3 StatusBadge — warna sesuai status RPL ── */

type BadgeConfig = { bg: string; text: string; emoji: string };

const toneByValue: Record<string, BadgeConfig> = {
  PENDAFTARAN:         { bg: "#f1f5f9", text: "#475569",  emoji: "📋" },
  LENGKAPI_CV:         { bg: "#fef3c7", text: "#78350f",  emoji: "✏️" },
  PEMBAYARAN:          { bg: "#dbeafe", text: "#1e3a8a",  emoji: "💳" },
  ASESMEN_F02:         { bg: "#e0f2fe", text: "#0c4a6e",  emoji: "📝" },
  ASESMEN_KOMPETENSI:  { bg: "#ede9fe", text: "#3730a3",  emoji: "🎯" },
  EVALUASI_F03:        { bg: "#f3e8ff", text: "#6b21a8",  emoji: "📊" },
  EVALUASI_ASESOR:     { bg: "#e0f2fe", text: "#0369a1",  emoji: "⚖️" },
  KONFIRMASI_HASIL:    { bg: "#fef9c3", text: "#713f12",  emoji: "🔔" },
  SIAP_PLENO:          { bg: "#d1fae5", text: "#064e3b",  emoji: "✅" },
  LULUS:               { bg: "#059669", text: "#ffffff",  emoji: "🎓" },
  DITERIMA:            { bg: "#d1fae5", text: "#064e3b",  emoji: "✅" },
  DITOLAK:             { bg: "#fee2e2", text: "#7f1d1d",  emoji: "❌" },
  PROSES:              { bg: "#fef3c7", text: "#78350f",  emoji: "⏳" },
  BELUM_BAYAR:         { bg: "#f1f5f9", text: "#475569",  emoji: "⏸️" },
  BELUM:               { bg: "#f1f5f9", text: "#475569",  emoji: "—"  },
  DRAFT:               { bg: "#fef3c7", text: "#78350f",  emoji: "📄" },
  SUBMITTED:           { bg: "#dbeafe", text: "#1e3a8a",  emoji: "📨" },
  DINILAI:             { bg: "#d1fae5", text: "#064e3b",  emoji: "✔️" },
  SELESAI:             { bg: "#d1fae5", text: "#064e3b",  emoji: "🏁" },
  KONFIRMASI:          { bg: "#fef9c3", text: "#713f12",  emoji: "🔔" },
  SIAP_PLENO_RESULT:   { bg: "#d1fae5", text: "#064e3b",  emoji: "📋" },
};

const defaultConfig: BadgeConfig = { bg: "#f1f5f9", text: "#475569", emoji: "•" };

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace("ASESOR", "PENILAI");
}

export function StatusBadge({ value }: { value: string }) {
  const config = toneByValue[value] ?? defaultConfig;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 999,
        background: config.bg,
        color: config.text,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: 12 }}>{config.emoji}</span>
      {formatLabel(value)}
    </span>
  );
}
