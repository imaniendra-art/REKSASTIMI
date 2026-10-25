import fs from "fs";

let css = fs.readFileSync("src/app/globals.css", "utf-8");

const themeVariables = `:root {
  color-scheme: light;

  /* Surfaces (Light) */
  --md-surface: #f8fafc;
  --md-surface-1: #ffffff;
  --md-surface-2: #f1f5f9;
  --md-on-surface: #0f172a;
  --md-on-surface-variant: #475569;
  --md-outline: #cbd5e1;
  --md-outline-variant: #e2e8f0;
  --sidebar-bg: rgba(255, 255, 255, 0.88);
  --sidebar-border: rgba(226, 232, 240, 0.8);

  /* Primary Accent: Default Teal */
  --md-primary: #0d9488;
  --md-primary-container: #ccfbf1;
  --md-on-primary: #ffffff;
  --md-on-primary-container: #115e59;
  --theme-ring: rgba(13, 148, 136, 0.25);
  --theme-glow: rgba(13, 148, 136, 0.15);

  --md-secondary: #0284c7;
  --md-secondary-container: #e0f2fe;
  --md-on-secondary: #ffffff;

  --md-error: #dc2626;
  --md-error-container: #fee2e2;
  --md-success: #059669;
  --md-success-container: #d1fae5;
  --md-warning: #d97706;
  --md-warning-container: #fef3c7;
  --md-info: #0284c7;
  --md-info-container: #e0f2fe;

  /* Elevation shadows */
  --md-shadow-1: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
  --md-shadow-2: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --md-shadow-3: 0 12px 28px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06);

  /* Shape */
  --md-radius-sm: 8px;
  --md-radius-md: 12px;
  --md-radius-lg: 16px;
  --md-radius-xl: 24px;
  --md-radius-full: 999px;
}

/* ─── 5 Color Palettes (Light Mode) ─── */
[data-theme="teal"] {
  --md-primary: #0d9488;
  --md-primary-container: #ccfbf1;
  --md-on-primary: #ffffff;
  --md-on-primary-container: #115e59;
  --theme-ring: rgba(13, 148, 136, 0.25);
  --theme-glow: rgba(13, 148, 136, 0.15);
}

[data-theme="burgundy"] {
  --md-primary: #9f1239;
  --md-primary-container: #ffe4e6;
  --md-on-primary: #ffffff;
  --md-on-primary-container: #881337;
  --theme-ring: rgba(159, 18, 57, 0.25);
  --theme-glow: rgba(159, 18, 57, 0.15);
}

[data-theme="dusty-rose"] {
  --md-primary: #be185d;
  --md-primary-container: #fce7f3;
  --md-on-primary: #ffffff;
  --md-on-primary-container: #831843;
  --theme-ring: rgba(190, 24, 93, 0.25);
  --theme-glow: rgba(190, 24, 93, 0.15);
}

[data-theme="charcoal"] {
  --md-primary: #334155;
  --md-primary-container: #f1f5f9;
  --md-on-primary: #ffffff;
  --md-on-primary-container: #0f172a;
  --theme-ring: rgba(51, 65, 85, 0.25);
  --theme-glow: rgba(51, 65, 85, 0.15);
}

[data-theme="orange-burn"] {
  --md-primary: #c2410c;
  --md-primary-container: #ffedd5;
  --md-on-primary: #ffffff;
  --md-on-primary-container: #7c2d12;
  --theme-ring: rgba(194, 65, 12, 0.25);
  --theme-glow: rgba(194, 65, 12, 0.15);
}

/* ─── Dark Mode Base ─── */
[data-mode="dark"],
.dark {
  color-scheme: dark;
  --md-surface: #0b0f19;
  --md-surface-1: #111827;
  --md-surface-2: #1e293b;
  --md-on-surface: #f8fafc;
  --md-on-surface-variant: #94a3b8;
  --md-outline: #334155;
  --md-outline-variant: #1e293b;
  --sidebar-bg: rgba(17, 24, 39, 0.88);
  --sidebar-border: rgba(51, 65, 85, 0.6);

  --md-shadow-1: 0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2);
  --md-shadow-2: 0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
  --md-shadow-3: 0 12px 28px rgba(0,0,0,0.6), 0 4px 10px rgba(0,0,0,0.3);
}

/* ─── 5 Color Palettes (Dark Mode) ─── */
[data-mode="dark"][data-theme="teal"],
.dark[data-theme="teal"] {
  --md-primary: #14b8a6;
  --md-primary-container: #134e4a;
  --md-on-primary: #042f2e;
  --md-on-primary-container: #99f6e4;
  --theme-ring: rgba(20, 184, 166, 0.35);
  --theme-glow: rgba(20, 184, 166, 0.25);
}

[data-mode="dark"][data-theme="burgundy"],
.dark[data-theme="burgundy"] {
  --md-primary: #fb7185;
  --md-primary-container: #4c0519;
  --md-on-primary: #4c0519;
  --md-on-primary-container: #fecdd3;
  --theme-ring: rgba(251, 113, 133, 0.35);
  --theme-glow: rgba(251, 113, 133, 0.25);
}

[data-mode="dark"][data-theme="dusty-rose"],
.dark[data-theme="dusty-rose"] {
  --md-primary: #f472b6;
  --md-primary-container: #500724;
  --md-on-primary: #500724;
  --md-on-primary-container: #fbcfe8;
  --theme-ring: rgba(244, 114, 182, 0.35);
  --theme-glow: rgba(244, 114, 182, 0.25);
}

[data-mode="dark"][data-theme="charcoal"],
.dark[data-theme="charcoal"] {
  --md-primary: #94a3b8;
  --md-primary-container: #1e293b;
  --md-on-primary: #0f172a;
  --md-on-primary-container: #f8fafc;
  --theme-ring: rgba(148, 163, 184, 0.35);
  --theme-glow: rgba(148, 163, 184, 0.25);
}

[data-mode="dark"][data-theme="orange-burn"],
.dark[data-theme="orange-burn"] {
  --md-primary: #fb923c;
  --md-primary-container: #7c2d12;
  --md-on-primary: #431407;
  --md-on-primary-container: #fed7aa;
  --theme-ring: rgba(251, 146, 60, 0.35);
  --theme-glow: rgba(251, 146, 60, 0.25);
}`;

const startIdx = css.indexOf(":root {");
const endMatch = css.indexOf("* {", startIdx);
const sliceBeforeAsterisk = css.slice(startIdx, endMatch);
const lastBrace = sliceBeforeAsterisk.lastIndexOf("}");
const fullTarget = css.slice(startIdx, startIdx + lastBrace + 1);

css = css.replace(fullTarget, themeVariables);
fs.writeFileSync("src/app/globals.css", css, "utf-8");
console.log("Successfully updated src/app/globals.css with multi-theme support!");
