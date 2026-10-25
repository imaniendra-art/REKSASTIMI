"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Role } from "@/types/roles";
import { roleMenu, getMenuIcon } from "@/lib/dashboard-data";
import { roleLabels } from "@/lib/roles";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

type DashboardShellProps = {
  children: ReactNode;
  user: {
    name: string;
    role: Role;
  };
};

/* ── Icon set ── */
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

const notificationTextByRole: Record<Role, string> = {
  admin: "Selamat datang di REKSA STIMI. Pantau pendaftaran RPL, validasi berkas, plotting penilai, dan finalisasi proses akademik secara berkala.",
  akademik: "Pusat Akademik REKSA STIMI. Kelola kurikulum, mata kuliah RPL, klaster, dan hasil evaluasi konversi yang perlu ditindaklanjuti.",
  keuangan: "Pusat Keuangan REKSA STIMI. Verifikasi bukti pembayaran pendaftaran dan konversi SKS mahasiswa secara real-time.",
  penilai: "Portal Penilai RPL STIMI. Periksa penugasan evaluasi diri mahasiswa, input nilai kriteria VATM, dan terbitkan berita acara.",
  mahasiswa: "Selamat datang Mahasiswa RPL STIMI. Ikuti pembelajaran singkat bersertifikat, lengkapi formulir evaluasi diri, dan pantau pengakuan SKS Anda.",
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Manajemen Mahasiswa": true,
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

  // Reusable Sidebar Content
  const renderSidebarContent = (isMobile = false) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--md-outline-variant)",
        }}
      >
        <Link
          href="/dashboard"
          onClick={() => { if (isMobile) setIsMobileDrawerOpen(false); }}
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", minWidth: 0 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#fff",
              border: "1.5px solid var(--md-outline-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 4px 12px var(--theme-glow)",
              flexShrink: 0,
            }}
          >
            <img src="/icon-logo-reksa.png" alt="Logo REKSA" style={{ width: 36, height: 36, objectFit: "contain" }} />
          </div>
          {(!isSidebarCollapsed || isMobile) && (
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "var(--md-primary)" }}>REKSA</span>{" "}
                <span style={{ color: "var(--md-on-surface)" }}>STIMI</span>
              </h1>
            </div>
          )}
        </Link>

        {isMobile && (
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            style={{
              background: "var(--md-surface-2)",
              border: "1px solid var(--md-outline-variant)",
              color: "var(--md-on-surface)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Role Pill */}
      {(!isSidebarCollapsed || isMobile) && (
        <div style={{ padding: "12px 18px 6px" }}>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--md-primary)" }} />
            <span>Portal {roleLabels[user.role]}</span>
          </div>
        </div>
      )}

      {/* Nav Menu Items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const emoji = getMenuIcon(item.label);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus[item.label];

          return (
            <div key={item.label} style={{ marginBottom: 2 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  href={item.href}
                  onClick={() => { if (!hasChildren && isMobile) setIsMobileDrawerOpen(false); }}
                  title={item.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: isSidebarCollapsed && !isMobile ? "12px" : "10px 14px",
                    borderRadius: 14,
                    textDecoration: "none",
                    background: isActive ? "var(--md-primary-container)" : "transparent",
                    color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface)",
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 13.5,
                    border: isActive ? "1px solid var(--md-primary)" : "1px solid transparent",
                    boxShadow: isActive ? "0 4px 14px var(--theme-glow)" : "none",
                    transition: "all 0.18s ease",
                    justifyContent: isSidebarCollapsed && !isMobile ? "center" : "flex-start",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
                  {(!isSidebarCollapsed || isMobile) && <span>{item.label}</span>}
                </Link>

                {hasChildren && (!isSidebarCollapsed || isMobile) && (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--md-on-surface-variant)",
                      transition: "transform 0.18s ease",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                )}
              </div>

              {hasChildren && isExpanded && (!isSidebarCollapsed || isMobile) && (
                <div style={{ paddingLeft: 34, paddingTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => { if (isMobile) setIsMobileDrawerOpen(false); }}
                        style={{
                          padding: "7px 12px",
                          borderRadius: 10,
                          textDecoration: "none",
                          fontSize: 12.5,
                          fontWeight: childActive ? 700 : 500,
                          color: childActive ? "var(--md-primary)" : "var(--md-on-surface-variant)",
                          background: childActive ? "var(--md-primary-container)" : "transparent",
                          borderLeft: childActive ? "3px solid var(--md-primary)" : "3px solid transparent",
                          transition: "all 0.15s ease",
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

      {/* User Profile & Logout Footer */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid var(--md-outline-variant)",
          background: "var(--md-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--md-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
              boxShadow: "0 2px 8px var(--theme-glow)",
            }}
          >
            {initials}
          </div>
          {(!isSidebarCollapsed || isMobile) && (
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--md-on-surface)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "var(--md-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {roleLabels[user.role]}
              </p>
            </div>
          )}
        </div>

        <Link
          href="/logout"
          title="Keluar dari Sistem"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--md-error-container)",
            color: "var(--md-error)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          <IconLogout />
        </Link>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--md-surface)",
        color: "var(--md-on-surface)",
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.2s ease",
      }}
    >
      {/* ─── DESKTOP FLOATING ROUNDED SIDEBAR ─── */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "fixed",
          top: 14,
          left: 14,
          bottom: 14,
          width: isSidebarCollapsed ? 82 : 270,
          backgroundColor: "var(--sidebar-bg)",
          borderRadius: 24,
          border: "1px solid var(--sidebar-border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 40,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 998,
          }}
        />
      )}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 12,
          bottom: 12,
          left: isMobileDrawerOpen ? 12 : -320,
          width: 290,
          backgroundColor: "var(--sidebar-bg)",
          borderRadius: 24,
          border: "1px solid var(--sidebar-border)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 999,
          transition: "left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        {renderSidebarContent(true)}
      </div>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingLeft: isSidebarCollapsed ? 96 : 0,
          transition: "padding-left 0.25s ease",
        }}
        className={`w-full ${isSidebarCollapsed ? "lg:pl-[104px]" : "lg:pl-[298px]"}`}
      >
        {/* ─── TOP APP BAR (FLOATING GLASS HEADER) ─── */}
        <header
          style={{
            margin: "14px 14px 0 14px",
            padding: "0 18px",
            height: 64,
            borderRadius: 20,
            backgroundColor: "var(--sidebar-bg)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid var(--sidebar-border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            position: "sticky",
            top: 14,
            zIndex: 30,
          }}
        >
          {/* Left: Mobile Hamburger & Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: "1px solid var(--md-outline-variant)",
                background: "var(--md-surface-1)",
                color: "var(--md-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconMenu />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex"
              title={isSidebarCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--md-outline-variant)",
                background: "var(--md-surface-1)",
                color: "var(--md-on-surface-variant)",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {isSidebarCollapsed ? (
                  <polyline points="13 17 18 12 13 7" />
                ) : (
                  <polyline points="11 17 6 12 11 7" />
                )}
              </svg>
            </button>

            {/* Section Title */}
            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--md-on-surface)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {currentTopMenu?.label ?? "Dashboard Utama"}
              </span>
            </div>
          </div>

          {/* Center: Running Notification Marquee */}
          <div
            className="hidden md:flex"
            style={{
              flex: 1,
              maxWidth: 480,
              height: 34,
              borderRadius: 999,
              backgroundColor: "var(--md-surface-2)",
              border: "1px solid var(--md-outline-variant)",
              padding: "0 14px",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--md-primary)",
                marginRight: 10,
                flexShrink: 0,
              }}
            >
              Info
            </span>
            <div className="dashboard-notice-track" style={{ fontSize: 12, color: "var(--md-on-surface-variant)" }}>
              <span>{notificationText}</span>
            </div>
          </div>

          {/* Right: Theme Controls + User Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Multi-Theme Selector (5 Colors + Dark/Light Mode) */}
            <ThemeSelector />

            {/* Public Link Shortcut */}
            <Link
              href="/"
              target="_blank"
              title="Kunjungi Portal Publik REKSA"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "1px solid var(--md-outline-variant)",
                background: "var(--md-surface-1)",
                color: "var(--md-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontSize: 14,
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              🌐
            </Link>
          </div>
        </header>

        {/* Back navigation bar if present */}
        {backTarget && (
          <div style={{ margin: "10px 14px 0" }}>
            <Link
              href={backTarget.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "var(--md-surface-1)",
                border: "1px solid var(--md-outline-variant)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--md-primary)",
                textDecoration: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              ← Kembali ke {backTarget.label}
            </Link>
          </div>
        )}

        {/* ─── MAIN PAGE CONTENT ─── */}
        <main
          style={{
            flex: 1,
            padding: "20px 14px 36px 14px",
            width: "100%",
            maxWidth: 1440,
            margin: "0 auto",
          }}
        >
          {children}
        </main>

        {/* ─── FOOTER ─── */}
        <footer
          style={{
            padding: "16px 20px",
            textAlign: "center",
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--md-on-surface-variant)",
            borderTop: "1px solid var(--md-outline-variant)",
            marginTop: "auto",
          }}
        >
          REKSA STIMI YAPMI MAKASSAR © 2026 — SISTEM INFORMASI REKOGNISI PEMBELAJARAN LAMPAU
        </footer>
      </div>
    </div>
  );
}
