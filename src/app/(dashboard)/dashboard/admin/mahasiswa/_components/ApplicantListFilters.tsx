"use client";

import { useState, type CSSProperties } from "react";
import type { ApplicantListResponse } from "./types";

type FiltersProps = {
  q: string;
  setQ: (value: string) => void;
  period: string;
  setPeriod: (value: string) => void;
  statusRpl: string;
  setStatusRpl: (value: string) => void;
  resetToFirstPage: (cb: () => void) => void;
  data?: ApplicantListResponse;
};

export function ApplicantListFilters({
  q,
  setQ,
  period,
  setPeriod,
  statusRpl,
  setStatusRpl,
  resetToFirstPage,
  data,
}: FiltersProps) {
  const [openFilter, setOpenFilter] = useState<"period" | "status" | null>(null);
  const periodOptions = [
    { value: "", label: "Semua Periode" },
    ...(data?.filters.periods.map((item) => ({ value: item, label: item })) ?? []),
  ];
  const statusOptions = [
    { value: "", label: "Semua Status RPL" },
    ...(data?.filters.statuses.map((item) => ({ value: item, label: item.replace(/_/g, " ").replace("ASESOR", "PENILAI") })) ?? []),
  ];

  return (
    <div
      className="md-card animate-fade-up"
      style={{
        padding: 12,
        marginBottom: 8,
        display: "grid",
        gap: 8,
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        alignItems: "stretch",
      }}
    >
      <div style={controlShellStyle}>
        <span style={iconStyle}>C</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <label style={controlLabelStyle}>Pencarian</label>
          <input
            style={inputStyle}
            onChange={(e) => resetToFirstPage(() => setQ(e.target.value))}
            placeholder="Nama, NIK, email, atau no. pendaftar..."
            value={q}
            onFocus={(e) => focusShell(e.currentTarget.parentElement?.parentElement)}
            onBlur={(e) => blurShell(e.currentTarget.parentElement?.parentElement)}
          />
        </div>
      </div>

      <FilterDropdown
        icon="P"
        label="Periode"
        value={period}
        options={periodOptions}
        open={openFilter === "period"}
        onToggle={() => setOpenFilter((current) => (current === "period" ? null : "period"))}
        onClose={() => setOpenFilter(null)}
        onSelect={(value) => resetToFirstPage(() => setPeriod(value))}
      />

      <FilterDropdown
        icon="S"
        label="Status"
        value={statusRpl}
        options={statusOptions}
        open={openFilter === "status"}
        onToggle={() => setOpenFilter((current) => (current === "status" ? null : "status"))}
        onClose={() => setOpenFilter(null)}
        onSelect={(value) => resetToFirstPage(() => setStatusRpl(value))}
      />
    </div>
  );
}

function FilterDropdown({
  icon,
  label,
  value,
  options,
  open,
  onToggle,
  onClose,
  onSelect,
}: {
  icon: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      style={{ position: "relative" }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          ...controlShellStyle,
          width: "100%",
          cursor: "pointer",
          borderColor: open ? "var(--md-primary)" : "var(--md-outline-variant)",
          boxShadow: open ? "0 0 0 3px rgba(26,86,219,0.12)" : controlShellStyle.boxShadow,
          background: open ? "#fff" : controlShellStyle.background,
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span style={iconStyle}>{icon}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={controlLabelStyle}>{label}</span>
          <span style={selectedValueStyle}>{selected?.label}</span>
        </span>
        <span style={{ ...chevronStyle, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>v</span>
      </button>

      {open && (
        <div style={dropdownPanelStyle}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={`${label}-${option.value || "all"}`}
                type="button"
                onClick={() => {
                  onSelect(option.value);
                  onClose();
                }}
                style={{
                  ...dropdownOptionStyle,
                  background: active ? "#eff6ff" : "transparent",
                  color: active ? "var(--md-primary)" : "var(--md-on-surface)",
                  borderColor: active ? "#bfdbfe" : "transparent",
                }}
              >
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {option.label}
                </span>
                {active ? <span style={activeDotStyle} /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const controlShellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 54,
  borderRadius: 18,
  border: "1px solid var(--md-outline-variant)",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "8px 12px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  transition: "border-color 180ms, box-shadow 180ms, background 180ms",
};

const iconStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eff6ff",
  color: "var(--md-primary)",
  fontSize: 10,
  fontWeight: 950,
  flexShrink: 0,
};

const controlLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 2,
  fontSize: 9,
  fontWeight: 950,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const fieldBaseStyle: CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: 0,
  fontSize: 12,
  fontWeight: 800,
  color: "var(--md-on-surface)",
  outline: "none",
  fontFamily: "inherit",
};

const inputStyle: CSSProperties = {
  ...fieldBaseStyle,
};

const chevronStyle: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  border: "1px solid var(--md-outline-variant)",
  color: "#64748b",
  fontSize: 10,
  fontWeight: 950,
  flexShrink: 0,
  transition: "transform 160ms",
};

const selectedValueStyle: CSSProperties = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 850,
  color: "var(--md-on-surface)",
};

const dropdownPanelStyle: CSSProperties = {
  position: "absolute",
  zIndex: 30,
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  maxHeight: 260,
  overflowY: "auto",
  borderRadius: 18,
  border: "1px solid var(--md-outline-variant)",
  background: "#fff",
  boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
  padding: 6,
};

const dropdownOptionStyle: CSSProperties = {
  width: "100%",
  minHeight: 36,
  borderRadius: 12,
  border: "1px solid transparent",
  padding: "8px 10px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  fontWeight: 850,
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "inherit",
};

const activeDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "var(--md-primary)",
  boxShadow: "0 0 0 3px rgba(26,86,219,0.12)",
  flexShrink: 0,
};

function focusShell(element?: Element | null) {
  if (!(element instanceof HTMLElement)) return;
  element.style.borderColor = "var(--md-primary)";
  element.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.12)";
  element.style.background = "#fff";
}

function blurShell(element?: Element | null) {
  if (!(element instanceof HTMLElement)) return;
  element.style.borderColor = "var(--md-outline-variant)";
  element.style.boxShadow = "0 1px 2px rgba(15,23,42,0.04)";
  element.style.background = "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)";
}
