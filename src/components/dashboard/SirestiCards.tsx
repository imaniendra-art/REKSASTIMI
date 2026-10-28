"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { type MenuItem, getMenuIcon } from "@/lib/dashboard-data";

type StatCardProps = {
  label: string;
  value: string;
  note: string;
  tone: MenuItem["tone"];
  index?: number;
  isTextValue?: boolean;
};

/* ── Tone → Color mapping (MD3 style) ── */
const toneTokens: Record<MenuItem["tone"], { bg: string; text: string; accent: string; icon: string }> = {
  primary:   { bg: "var(--md-primary)", text: "var(--md-on-primary)", accent: "rgba(255,255,255,0.2)", icon: "📊" },
  success:   { bg: "#059669", text: "#fff",     accent: "rgba(255,255,255,0.2)", icon: "✅" },
  warning:   { bg: "#d97706", text: "#fff",     accent: "rgba(255,255,255,0.2)", icon: "⏳" },
  danger:    { bg: "#dc2626", text: "#fff",     accent: "rgba(255,255,255,0.2)", icon: "🔔" },
  info:      { bg: "#0284c7", text: "#fff",     accent: "rgba(255,255,255,0.2)", icon: "ℹ️" },
  dark:      { bg: "#1e293b", text: "#fff",     accent: "rgba(255,255,255,0.15)", icon: "🗂️" },
  secondary: { bg: "var(--md-secondary, var(--md-primary))", text: "var(--md-on-secondary, #fff)", accent: "rgba(255,255,255,0.2)", icon: "📋" },
};

const menuToneTokens: Record<MenuItem["tone"], { bg: string; text: string; border: string; label: string }> = {
  primary:   { bg: "var(--md-primary-container)", text: "var(--md-on-primary-container)", border: "var(--md-primary)", label: "Utama" },
  success:   { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7", label: "Akademik" },
  warning:   { bg: "#fef3c7", text: "#78350f", border: "#fcd34d", label: "Dokumen" },
  danger:    { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5", label: "Penting" },
  info:      { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc", label: "Informasi" },
  dark:      { bg: "#f1f5f9", text: "#0f172a", border: "#94a3b8", label: "Sistem" },
  secondary: { bg: "var(--md-secondary-container, var(--md-primary-container))", text: "var(--md-secondary, var(--md-primary))", border: "var(--md-secondary, var(--md-primary))", label: "Lainnya" },
};

/* ── STAT CARD ── */
export function StatCard({ label, value, note, tone, index = 0, isTextValue = false }: StatCardProps) {
  const { bg, text, accent, icon } = toneTokens[tone];
  return (
    <div
      className="dashboard-stat-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 34px rgba(15,23,42,0.14), 0 8px 18px var(--theme-glow, rgba(0,0,0,0.12))";
        e.currentTarget.style.filter = "saturate(1.05) brightness(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)";
        e.currentTarget.style.filter = "none";
      }}
      style={{
        background: bg,
        borderRadius: 16,
        padding: "18px 16px",
        color: text,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
        cursor: "default",
        transition: "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: -16,
          right: -16,
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: accent,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -24,
          left: -8,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: accent,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, minHeight: 48 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: 0.8,
              lineHeight: 1.3,
              flex: 1,
              paddingRight: 8,
            }}
          >
            {label}
          </p>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
        </div>
        <div style={{ minHeight: 42, display: "flex", alignItems: "center", marginBottom: 6 }}>
          <p
            style={{
              fontSize: isTextValue ? 18 : 42,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {value}
          </p>
        </div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            opacity: 0.7,
            lineHeight: 1.4,
          }}
        >
          {note}
        </p>
      </div>
    </div>
  );
}

/* ── MENU CARD ── */
export function MenuCard({ item, disabled = true, index = 0 }: { item: MenuItem; disabled?: boolean; index?: number }) {
  const { bg, text, border, label } = menuToneTokens[item.tone];
  const cardContent = (
    <div
      className="md-card dashboard-menu-card"
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 16px 34px rgba(15,23,42,0.13), 0 6px 16px var(--theme-glow, rgba(0,0,0,0.10))";
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.background = `linear-gradient(180deg, #ffffff 0%, ${bg} 100%)`;
        const icon = e.currentTarget.querySelector<HTMLElement>(".dashboard-menu-card-icon");
        const title = e.currentTarget.querySelector<HTMLElement>(".dashboard-menu-card-title");
        const action = e.currentTarget.querySelector<HTMLElement>(".dashboard-menu-card-action");
        if (icon) icon.style.transform = "translateY(-2px) scale(1.12)";
        if (title) title.style.color = text;
        if (action) {
          action.style.transform = "translateX(4px)";
          action.style.color = text;
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "var(--md-shadow-1)";
        e.currentTarget.style.borderColor = "var(--md-outline-variant)";
        e.currentTarget.style.background = "var(--md-surface-1)";
        const icon = e.currentTarget.querySelector<HTMLElement>(".dashboard-menu-card-icon");
        const title = e.currentTarget.querySelector<HTMLElement>(".dashboard-menu-card-title");
        const action = e.currentTarget.querySelector<HTMLElement>(".dashboard-menu-card-action");
        if (icon) icon.style.transform = "translateY(0) scale(1)";
        if (title) title.style.color = "var(--md-on-surface)";
        if (action) {
          action.style.transform = "translateX(0)";
          action.style.color = "var(--md-primary)";
        }
      }}
      style={{
        "--menu-bg": bg,
        "--menu-text": text,
        "--menu-border": border,
        padding: "24px 20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        opacity: disabled ? 0.7 : 1,
        filter: disabled ? "grayscale(0.6)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
      } as CSSProperties}
    >
      {/* Decorative Gradient Blob */}
      <div
        className="dashboard-menu-card-blob"
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: `radial-gradient(circle at center, ${bg} 0%, transparent 70%)`,
          opacity: 0.6,
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      {/* Title */}
      <h3
        className="dashboard-menu-card-title"
        style={{
          fontWeight: 800,
          fontSize: 22,
          color: "var(--md-on-surface)",
          lineHeight: 1.3,
          marginBottom: 10,
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <span className="icon-box dashboard-menu-card-icon" style={{ fontSize: 26 }}>{getMenuIcon(item.label)}</span>
        {item.label}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 12,
          color: "var(--md-on-surface-variant)",
          lineHeight: 1.5,
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {item.description}
      </p>

      {/* Footer */}
      <div
        className="dashboard-menu-card-footer"
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        {disabled ? (
          <span
            className="dashboard-menu-card-action"
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--md-on-surface-variant)",
              background: "var(--md-outline-variant)",
              padding: "4px 10px",
              borderRadius: 999,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            🔒 Segera hadir
          </span>
        ) : (
          <span
            className="dashboard-menu-card-action"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--md-primary)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Akses Fitur <span style={{ fontSize: 14 }}>→</span>
          </span>
        )}
      </div>
    </div>
  );

  if (disabled) return cardContent;

  return (
    <Link href={item.href} style={{ display: "block", height: "100%", textDecoration: "none" }}>
      {cardContent}
    </Link>
  );
}

/* ── SECTION HEADING ── */
export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div
            style={{
              width: 4,
              height: 20,
              borderRadius: 99,
              background: "var(--md-primary)",
            }}
          />
          <h2
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: "var(--md-on-surface)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", fontWeight: 500, marginLeft: 12 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
