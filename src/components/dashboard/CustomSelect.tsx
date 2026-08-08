"use client";

import { useState, type CSSProperties, useRef, useEffect } from "react";

type CustomSelectProps = {
  icon?: string;
  label?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
};

export function CustomSelect({
  icon = "S",
  label = "Filter",
  value,
  options,
  onChange,
  placeholder,
  style,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value) || (placeholder ? null : options[0]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
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
        {icon && <span style={iconStyle}>{icon}</span>}
        <span style={{ minWidth: 0, flex: 1 }}>
          {label && <span style={controlLabelStyle}>{label}</span>}
          <span style={selectedValueStyle}>{selected ? selected.label : placeholder || ""}</span>
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
                  onChange(option.value);
                  setOpen(false);
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

export function CustomInput({
  icon = "C",
  label = "Pencarian",
  value,
  onChange,
  placeholder = "Pencarian...",
  style,
}: {
  icon?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
}) {
  return (
    <div style={{ ...controlShellStyle, ...style }}>
      {icon && <span style={iconStyle}>{icon}</span>}
      <div style={{ minWidth: 0, flex: 1 }}>
        {label && <label style={controlLabelStyle}>{label}</label>}
        <input
          style={inputStyle}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          value={value}
          onFocus={(e) => focusShell(e.currentTarget.parentElement?.parentElement)}
          onBlur={(e) => blurShell(e.currentTarget.parentElement?.parentElement)}
        />
      </div>
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
