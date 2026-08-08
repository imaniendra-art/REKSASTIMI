import type { ApplicantListResponse } from "./types";

type PaginationProps = {
  page: number;
  setPage: (value: number | ((prev: number) => number)) => void;
  data?: ApplicantListResponse;
};

export function ApplicantListPagination({ page, setPage, data }: PaginationProps) {
  const currentPage  = data?.meta.page ?? page;
  const totalPages   = data?.meta.totalPages ?? 1;
  const total        = data?.meta.total ?? 0;
  const hasPrev      = currentPage > 1;
  const hasNext      = currentPage < totalPages;

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 20px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 200ms, border-color 200ms, opacity 200ms",
    border: "1.5px solid var(--md-outline-variant)",
    background: "var(--md-surface-1)",
    color: "var(--md-on-surface)",
    fontFamily: "inherit",
  };

  return (
    <div
      className="md-card"
      style={{
        marginTop: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--md-on-surface-variant)" }}>
        Total <span style={{ fontWeight: 800, color: "var(--md-on-surface)" }}>{total}</span> data
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{ ...btnBase, opacity: hasPrev ? 1 : 0.4, cursor: hasPrev ? "pointer" : "not-allowed" }}
          disabled={!hasPrev}
          onClick={() => setPage((v) => Math.max(v - 1, 1))}
          type="button"
        >
          ← Sebelumnya
        </button>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 80,
            padding: "8px 14px",
            borderRadius: 999,
            background: "var(--md-primary-container)",
            color: "var(--md-on-primary-container)",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {currentPage} / {totalPages}
        </span>

        <button
          style={{ ...btnBase, opacity: hasNext ? 1 : 0.4, cursor: hasNext ? "pointer" : "not-allowed" }}
          disabled={!hasNext}
          onClick={() => setPage((v) => v + 1)}
          type="button"
        >
          Berikutnya →
        </button>
      </div>
    </div>
  );
}
