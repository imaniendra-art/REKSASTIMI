"use client";

import React from "react";

type PageHeroProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badgeText?: string;
  badgeIcon?: string;
  rightContent?: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "dark" | "secondary" | "maroon";
  withSparkles?: boolean;
};

export function PageHero({
  title,
  subtitle,
  badgeText,
  badgeIcon,
  rightContent,
  tone = "primary",
  withSparkles = false,
}: PageHeroProps) {
  const heroGradient = {
    primary: "linear-gradient(135deg, var(--md-primary) 0%, var(--md-secondary, var(--md-primary)) 100%)",
    secondary: "linear-gradient(135deg, var(--md-secondary, var(--md-primary)) 0%, var(--md-primary) 100%)",
    info: "linear-gradient(135deg, var(--md-primary) 0%, var(--md-secondary, var(--md-primary)) 100%)",
    success: "linear-gradient(135deg, #047857 0%, #059669 58%, #10b981 100%)",
    warning: "linear-gradient(135deg, #b45309 0%, #d97706 58%, #f59e0b 100%)",
    danger: "linear-gradient(135deg, #b91c1c 0%, #dc2626 58%, #ef4444 100%)",
    dark: "linear-gradient(135deg, #0f172a 0%, #1e293b 58%, #334155 100%)",
    maroon: "linear-gradient(135deg, var(--md-primary) 0%, var(--md-secondary, var(--md-primary)) 100%)",
  }[tone];

  return (
    <div
      className="flex flex-col md:flex-row items-center justify-between gap-6 w-full"
      style={{
        background: heroGradient,
        borderRadius: 24,
        padding: "36px 40px",
        marginBottom: 28,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 36px var(--theme-glow, rgba(0,0,0,0.15))",
      }}
    >
      {/* Decorative orbs */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -20,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: "20%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Left Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 850, flex: 1 }}>
        {badgeText && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "4px 14px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {badgeIcon} {badgeText}
          </div>
        )}
        <h1
          style={{
            fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 42px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: subtitle ? 16 : 0,
            textShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              opacity: 0.9,
              lineHeight: 1.6,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right Content / Animation */}
      {rightContent ? (
        <div style={{ position: "relative", zIndex: 1 }}>{rightContent}</div>
      ) : withSparkles ? (
        <div className="hidden md:flex relative z-10 items-center justify-center w-32 h-32 mr-6 shrink-0">
          <div
            className="absolute inset-0 bg-white/20 rounded-full opacity-20"
          ></div>
          <div
            className="absolute inset-0 bg-white/10 rounded-full"
          ></div>
          <div
            className="relative text-[5rem]"
            style={{
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.3))",
            }}
          >
            ✨
          </div>
        </div>
      ) : null}
    </div>
  );
}

type AlertNoticeProps = {
  title?: string;
  message: React.ReactNode;
  tone?: "success" | "error" | "warning" | "info" | "neutral";
  icon?: string;
};

export function AlertNotice({ title, message, tone = "info", icon }: AlertNoticeProps) {
  const styles = {
    success: { bg: "#d1fae5", border: "#34d399", text: "#065f46", defaultIcon: "✅" },
    error: { bg: "#fee2e2", border: "#f87171", text: "#991b1b", defaultIcon: "⚠️" },
    warning: { bg: "#fef3c7", border: "#fbbf24", text: "#92400e", defaultIcon: "⏳" },
    info: { bg: "#e0f2fe", border: "#38bdf8", text: "#075985", defaultIcon: "ℹ️" },
    neutral: { bg: "#f1f5f9", border: "#cbd5e1", text: "#334155", defaultIcon: "📌" },
  };

  const { bg, border, text, defaultIcon } = styles[tone];
  const displayIcon = icon ?? defaultIcon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 24, lineHeight: 1 }}>{displayIcon}</div>
      <div>
        {title && (
          <h3 style={{ fontWeight: 800, fontSize: 14, color: text, marginBottom: 4 }}>
            {title}
          </h3>
        )}
        <p style={{ fontSize: 13, color: text, lineHeight: 1.5, opacity: 0.9 }}>
          {message}
        </p>
      </div>
    </div>
  );
}
