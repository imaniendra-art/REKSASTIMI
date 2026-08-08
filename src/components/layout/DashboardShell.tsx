"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Role } from "@/types/roles";
import { roleMenu, getMenuIcon } from "@/lib/dashboard-data";
import { roleLabels } from "@/lib/roles";

type DashboardShellProps = {
  children: ReactNode;
  user: {
    name: string;
    role: Role;
  };
};

/* ── Icon set (simple SVG inline) ── */
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  );
}

// Removed toneIcon mapping since we use getMenuIcon

const notificationTextByRole: Record<Role, string> = {
  admin: "Selamat datang Admin REKSA. Pantau pendaftaran RPL, validasi berkas, plotting penilai, dan finalisasi proses akademik secara berkala.",
  akademik: "Notifikasi Akademik REKSA. Periksa kurikulum, mata kuliah RPL, klaster, dan hasil evaluasi akademik yang perlu ditindaklanjuti.",
  keuangan: "Notifikasi Keuangan REKSA. Periksa antrean validasi pembayaran dan pastikan status pembayaran mahasiswa selalu diperbarui.",
  penilai: "Notifikasi Penilai REKSA. Periksa daftar asesmen, riwayat penilaian, dan tindak lanjuti proses evaluasi mahasiswa RPL.",
  mahasiswa: "Notifikasi Mahasiswa REKSA. Lengkapi biodata, unggah dokumen, pantau pembayaran, dan ikuti alur asesmen RPL sesuai jadwal.",
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Manajemen Mahasiswa": true // Auto expand for convenience if it's the active focus
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems = roleMenu[user.role] ?? [];
  const dashboardHome = navItems[0]?.href ?? "/dashboard";
  const currentTopMenu = navItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const currentChildMenu = navItems
    .flatMap((item) => (item.children ?? []).map((child) => ({ child, parent: item })))
    .find(({ child }) => pathname === child.href || pathname.startsWith(`${child.href}/`));
  const isAdminMahasiswaDetail = /^\/dashboard\/admin\/mahasiswa\/[a-f0-9]{24}$/i.test(pathname);
  const isAkademikMatkulDetail = /^\/dashboard\/akademik\/matkul\/[a-f0-9]{24}$/i.test(pathname);
  const isAkademikKlasterDetail = /^\/dashboard\/akademik\/klaster\/[a-f0-9]{24}$/i.test(pathname);
  const backTarget = isAdminMahasiswaDetail
    ? { href: "/dashboard/admin/mahasiswa/data-pendaftar", label: "Daftar Pendaftar Mahasiswa" }
    : isAkademikMatkulDetail
    ? { href: "/dashboard/akademik/matkul-rpl", label: "Mata Kuliah RPL" }
    : isAkademikKlasterDetail
    ? { href: "/dashboard/akademik/klaster", label: "Data Klaster" }
    : currentChildMenu && currentChildMenu.parent.href !== pathname
    ? { href: currentChildMenu.parent.href, label: currentChildMenu.parent.label }
    : currentTopMenu && pathname !== currentTopMenu.href
    ? { href: currentTopMenu.href, label: currentTopMenu.label }
    : currentTopMenu && currentTopMenu.href !== dashboardHome
      ? { href: dashboardHome, label: navItems[0]?.label || "Dashboard" }
      : null;
  const notificationText = notificationTextByRole[user.role];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="dashboard-shell"
      style={{
        minHeight: "100vh",
        background: "var(--md-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── DRAWER SIDEBAR ─── */}
      {isDrawerOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999,
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      <aside
        style={{
          position: "fixed", top: 0, left: isDrawerOpen ? 0 : -280, bottom: 0, width: 280,
          backgroundColor: "var(--md-surface)", zIndex: 1000,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          transition: "left 0.3s ease",
          display: "flex", flexDirection: "column"
        }}
      >
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--md-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", border: "1px solid var(--md-outline-variant)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src="/icon-logo-reksa.png" alt="Logo REKSA" style={{ width: 32, height: 32, objectFit: "contain" }} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--md-primary)", letterSpacing: "-0.02em" }}>Menu Navigasi</h2>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} style={{ minWidth: 72, height: 34, borderRadius: 999, border: "1px solid var(--md-outline-variant)", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 900, color: "var(--md-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tutup</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const emoji = getMenuIcon(item.label);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.label];

            return (
              <div key={item.label} style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Link
                    className="dashboard-nav-item"
                    href={item.href}
                    onClick={() => { if (!hasChildren) setIsDrawerOpen(false); }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.background = "var(--md-primary-container)";
                      e.currentTarget.style.color = "var(--md-primary)";
                      e.currentTarget.style.boxShadow = "inset 3px 0 0 var(--md-primary), 0 6px 14px rgba(26,86,219,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.background = isActive ? "var(--md-primary-container)" : "transparent";
                      e.currentTarget.style.color = isActive ? "var(--md-primary)" : "var(--md-on-surface)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 12, textDecoration: "none",
                        background: isActive ? "var(--md-primary-container)" : "transparent",
                        color: isActive ? "var(--md-primary)" : "var(--md-on-surface)",
                      fontWeight: isActive ? 700 : 600, transition: "transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease"
                    }}
                  >
                    <span className="dashboard-nav-icon">{emoji}</span>
                    <span style={{ fontSize: 14 }}>{item.label}</span>
                  </Link>
                  {hasChildren && (
                    <button
                      className="dashboard-nav-toggle"
                      onClick={() => toggleMenu(item.label)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--md-primary-container)";
                        e.currentTarget.style.color = "var(--md-primary)";
                        e.currentTarget.style.transform = "scale(1.06)";
                        e.currentTarget.style.borderRadius = "999px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--md-on-surface-variant)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      style={{
                        background: "transparent", border: "none", padding: "8px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--md-on-surface-variant)",
                        transition: "transform 180ms ease, background 180ms ease, color 180ms ease"
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  )}
                </div>
                
                {hasChildren && isExpanded && (
                  <div style={{ paddingLeft: 44, paddingTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          className="dashboard-subnav-item"
                          key={child.label}
                          href={child.href}
                          onClick={() => setIsDrawerOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(4px)";
                            e.currentTarget.style.background = "rgba(26,86,219,0.10)";
                            e.currentTarget.style.color = "var(--md-primary)";
                            e.currentTarget.style.boxShadow = "inset 2px 0 0 var(--md-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.background = childActive ? "rgba(26,86,219,0.08)" : "transparent";
                            e.currentTarget.style.color = childActive ? "var(--md-primary)" : "var(--md-on-surface-variant)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          style={{
                            padding: "8px 12px", borderRadius: 8, textDecoration: "none", fontSize: 13,
                            fontWeight: childActive ? 700 : 500,
                            color: childActive ? "var(--md-primary)" : "var(--md-on-surface-variant)",
                            background: childActive ? "rgba(26,86,219,0.08)" : "transparent",
                            transition: "transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease",
                          }}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      {/* ─── TOP APP BAR (Material Design 3) ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--md-outline-variant)",
          boxShadow: "0 1px 0 0 var(--md-outline-variant), 0 2px 12px rgba(26,86,219,0.06)",
          padding: "0 16px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Brand & Hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flexShrink: 0 }}>
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--md-primary)", padding: 4, display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <IconMenu />
          </button>
          <Link className="dashboard-brand" href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", minWidth: 0 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "#fff",
                border: "1px solid var(--md-outline-variant)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
                flexShrink: 0,
              }}
            >
              <img src="/icon-logo-reksa.png" alt="Logo REKSA" style={{ width: 42, height: 42, objectFit: "contain" }} />
            </div>
          <div className="dashboard-brand-copy">
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "var(--md-primary)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              REKSA : Rekognisi, Evaluasi, Konversi Akademik
            </p>
            <p
              style={{
                fontWeight: 600,
                fontSize: 10,
                color: "var(--md-on-surface-variant)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              STIMI YAPMI Makassar
            </p>
          </div>
        </Link>
        </div>

        {/* Running notification */}
        <div className="dashboard-running-notice" aria-label="Notifikasi REKSA">
          <span className="dashboard-notice-label">Notifikasi</span>
          <div className="dashboard-notice-window">
            <div className="dashboard-notice-track">
              <span>{notificationText}</span>
              <span aria-hidden="true">{notificationText}</span>
            </div>
          </div>
        </div>

        {/* Right side: user chip + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* User chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--md-surface-2)",
              border: "1.5px solid var(--md-outline-variant)",
              borderRadius: 999,
              padding: "5px 14px 5px 5px",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a56db 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--md-on-surface)",
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 10,
                  color: "var(--md-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {roleLabels[user.role]}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <Link
            href="/logout"
            title="Keluar Sistem"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--md-error-container)",
              color: "var(--md-error)",
              border: "1px solid rgba(220,38,38,0.15)",
              transition: "background 200ms, transform 150ms",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--md-error-container)";
            }}
          >
            <IconLogout />
          </Link>
        </div>
      </header>

      {backTarget && (
        <div className="dashboard-backbar">
          <Link href={backTarget.href} className="dashboard-back-button">
            <span aria-hidden="true">{"<"}</span>
            Kembali ke {backTarget.label}
          </Link>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main
        className="dashboard-main"
        style={{
          flex: 1,
          padding: "24px 5% 32px", // 5% padding gives roughly 5cm margins on desktop
          maxWidth: "100%",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {children}
      </main>

      {/* ─── BOTTOM NAVIGATION BAR (Material Design 3) ─── */}
      <footer
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--md-outline-variant)",
          background: "rgba(255,255,255,0.82)",
          color: "var(--md-on-surface-variant)",
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        PUSDATIN STIMI 2026
      </footer>
    </div>
  );
}
