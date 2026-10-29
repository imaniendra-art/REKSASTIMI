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
          aria-label="Pilih Tema Warna"
          style={{
            height: 38,
            padding: "0 10px",
            borderRadius: 999,
            border: "1px solid var(--md-outline-variant)",
            background: "var(--md-surface-1)",
            color: "var(--md-on-surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: activePalette.hex,
              boxShadow: `0 0 8px ${activePalette.hex}80`,
              display: "inline-block",
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: 0.7,
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              backgroundColor: "var(--md-surface-1)",
              borderRadius: 20,
              border: "1px solid var(--md-outline-variant)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              padding: "10px 14px",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              gap: 8,
              maxWidth: "calc(100vw - 24px)",
              flexWrap: "wrap",
            }}
          >
            {THEME_PALETTES.map((palette) => {
              const isSelected = colorTheme === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => {
                    setColorTheme(palette.id);
                    setDropdownOpen(false);
                  }}
                  title={palette.name}
                  aria-label={palette.name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: isSelected ? "2.5px solid var(--md-surface-1)" : "2px solid transparent",
                    background: palette.hex,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected
                      ? `0 0 0 2px ${palette.hex}, 0 2px 8px ${palette.hex}80`
                      : "0 2px 4px rgba(0,0,0,0.12)",
                    transition: "all 0.15s ease",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    padding: 0,
                  }}
                >
                  {isSelected && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
