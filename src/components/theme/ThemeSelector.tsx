"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, THEME_PALETTES, type ColorTheme } from "@/components/providers/ThemeProvider";

export function ThemeSelector() {
  const { colorTheme, modeTheme, setColorTheme, toggleMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePalette = THEME_PALETTES.find((p) => p.id === colorTheme) || THEME_PALETTES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      {/* Dark / Light Toggle */}
      <button
        onClick={toggleMode}
        title={modeTheme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1px solid var(--md-outline-variant)",
          background: "var(--md-surface-1)",
          color: "var(--md-on-surface)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          transition: "all 0.2s ease",
        }}
      >
        {modeTheme === "light" ? (
          // Moon icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        ) : (
          // Sun icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#facc15" }}>
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        )}
      </button>

      {/* Color Palette Dropdown Button */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          title={`Tema Warna: ${activePalette.name}`}
          style={{
            height: 38,
            padding: "0 12px",
            borderRadius: 999,
            border: "1px solid var(--md-outline-variant)",
            background: "var(--md-surface-1)",
            color: "var(--md-on-surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: activePalette.hex,
              boxShadow: `0 0 8px ${activePalette.hex}80`,
              display: "inline-block",
            }}
          />
          <span style={{ display: "none" }} className="sm:inline-block">
            {activePalette.name.split(" ")[0]}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 210,
              backgroundColor: "var(--md-surface-1)",
              borderRadius: 16,
              border: "1px solid var(--md-outline-variant)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              padding: 8,
              zIndex: 1050,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ padding: "6px 10px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--md-on-surface-variant)" }}>
              Pilih Aksen Warna
            </div>
            {THEME_PALETTES.map((palette) => {
              const isSelected = colorTheme === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => {
                    setColorTheme(palette.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: isSelected ? "var(--md-primary-container)" : "transparent",
                    color: isSelected ? "var(--md-on-primary-container)" : "var(--md-on-surface)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: palette.hex,
                      boxShadow: isSelected ? `0 0 8px ${palette.hex}` : "none",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>{palette.name}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
