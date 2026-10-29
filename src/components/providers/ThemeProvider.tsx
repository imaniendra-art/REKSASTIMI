"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorTheme = "teal" | "burgundy" | "plum" | "dusty-rose" | "charcoal" | "orange-burn" | "deep-blue";
export type ModeTheme = "light" | "dark";

interface ThemeContextType {
  colorTheme: ColorTheme;
  modeTheme: ModeTheme;
  setColorTheme: (color: ColorTheme) => void;
  setModeTheme: (mode: ModeTheme) => void;
  toggleMode: () => void;
}

export const THEME_PALETTES: { id: ColorTheme; name: string; hex: string; bgClass: string }[] = [
  { id: "teal", name: "Teal (Toska)", hex: "#0d9488", bgClass: "bg-teal-600" },
  { id: "burgundy", name: "Burgundy (Marun)", hex: "#9f1239", bgClass: "bg-rose-900" },
  { id: "plum", name: "Plum (Ungu)", hex: "#7e22ce", bgClass: "bg-purple-700" },
  { id: "dusty-rose", name: "Dusty Rose (Pink)", hex: "#be185d", bgClass: "bg-pink-700" },
  { id: "charcoal", name: "Charcoal (Arang)", hex: "#334155", bgClass: "bg-slate-700" },
  { id: "orange-burn", name: "Orange Burn (Bata)", hex: "#c2410c", bgClass: "bg-orange-700" },
  { id: "deep-blue", name: "Deep Blue (Safir)", hex: "#1d4ed8", bgClass: "bg-blue-700" },
];

const ThemeContext = createContext<ThemeContextType>({
  colorTheme: "teal",
  modeTheme: "light",
  setColorTheme: () => {},
  setModeTheme: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("teal");
  const [modeTheme, setModeThemeState] = useState<ModeTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage if available
    const savedColor = localStorage.getItem("reksa_color_theme") as ColorTheme;
    const savedMode = localStorage.getItem("reksa_mode_theme") as ModeTheme;

    const initialColor = (savedColor && THEME_PALETTES.some(p => p.id === savedColor)) ? savedColor : "teal";
    const initialMode = (savedMode === "dark" || savedMode === "light") ? savedMode : "light";

    setColorThemeState(initialColor);
    setModeThemeState(initialMode);
    applyTheme(initialColor, initialMode);
    setMounted(true);
  }, []);

  const applyTheme = (color: ColorTheme, mode: ModeTheme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", color);
    root.setAttribute("data-mode", mode);
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    localStorage.setItem("reksa_color_theme", color);
    applyTheme(color, modeTheme);
  };

  const setModeTheme = (mode: ModeTheme) => {
    setModeThemeState(mode);
    localStorage.setItem("reksa_mode_theme", mode);
    applyTheme(colorTheme, mode);
  };

  const toggleMode = () => {
    const nextMode = modeTheme === "light" ? "dark" : "light";
    setModeTheme(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, modeTheme, setColorTheme, setModeTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
