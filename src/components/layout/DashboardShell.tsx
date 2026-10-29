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
    isPaymentLocked?: boolean;
  };
};

/* ── Icon set ── */
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

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

  // Back navigation removed per user request

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
          padding: isSidebarCollapsed && !isMobile ? "16px 8px" : "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: isSidebarCollapsed && !isMobile ? "center" : "space-between",
          flexDirection: isSidebarCollapsed && !isMobile ? "column" : "row",
          gap: isSidebarCollapsed && !isMobile ? 12 : 8,
          borderBottom: "1.5px solid var(--sidebar-border)",
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

        {/* Desktop Sidebar Collapse Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            title={isSidebarCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid var(--md-outline-variant)",
              background: "var(--md-surface-2)",
              color: "var(--md-on-surface-variant)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isSidebarCollapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        )}

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

      {/* Nav Menu Items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const emoji = item.icon || getMenuIcon(item.label, item.icon);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus[item.label];

          // Strict lock for mahasiswa if registration payment is not accepted yet
          const isLocked = Boolean(
            user.role === "mahasiswa" &&
            user.isPaymentLocked &&
            item.href !== "/dashboard/mahasiswa" &&
            item.href !== "/dashboard/mahasiswa/keuangan"
          );

          const isKeuanganPending = Boolean(
            user.role === "mahasiswa" &&
            user.isPaymentLocked &&
            item.href === "/dashboard/mahasiswa/keuangan"
          );

          return (
            <div key={item.label} style={{ marginBottom: 2 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {isLocked ? (
                  <div
                    title={`${item.label} (Terkunci: Selesaikan pembayaran pendaftaran)`}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isSidebarCollapsed && !isMobile ? "center" : "space-between",
                      padding: isSidebarCollapsed && !isMobile ? "12px" : "10px 14px",
                      borderRadius: 14,
                      background: "transparent",
                      color: "var(--md-on-surface-variant)",
                      opacity: 0.45,
                      cursor: "not-allowed",
                      fontSize: 13,
                      fontWeight: 600,
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, lineHeight: 1, filter: "grayscale(1)" }}>{emoji}</span>
                      {(!isSidebarCollapsed || isMobile) && <span>{item.label}</span>}
                    </div>
                    {(!isSidebarCollapsed || isMobile) && <span style={{ fontSize: 13 }}>🔒</span>}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => { if (!hasChildren && isMobile) setIsMobileDrawerOpen(false); }}
                    title={item.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isSidebarCollapsed && !isMobile ? "center" : "space-between",
                      padding: isSidebarCollapsed && !isMobile ? "12px" : "10px 14px",
                      borderRadius: 14,
                      textDecoration: "none",
                      background: isActive ? "var(--md-primary)" : "transparent",
                      color: isActive ? "#ffffff" : "var(--md-on-surface)",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 13.5,
                      border: isActive ? "1px solid var(--md-primary)" : "1px solid transparent",
                      boxShadow: isActive ? "0 4px 14px var(--theme-glow)" : "none",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
                      {(!isSidebarCollapsed || isMobile) && <span>{item.label}</span>}
                    </div>
                    {isKeuanganPending && (!isSidebarCollapsed || isMobile) && (
                      <span style={{ fontSize: 10, fontWeight: 900, background: "var(--md-primary)", color: "#fff", padding: "2px 7px", borderRadius: 999, letterSpacing: "0.04em" }}>
                        Wajib
                      </span>
                    )}
                  </Link>
                )}

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
          padding: isSidebarCollapsed && !isMobile ? "12px 6px" : "14px 16px",
          borderTop: "1.5px solid var(--sidebar-border)",
          background: "transparent",
          display: "flex",
          flexDirection: isSidebarCollapsed && !isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: isSidebarCollapsed && !isMobile ? "center" : "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isSidebarCollapsed && !isMobile ? "center" : "flex-start",
            gap: 10,
            minWidth: 0,
            width: isSidebarCollapsed && !isMobile ? "100%" : "auto",
          }}
        >
          <div
            title={user.name}
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
          border: "1.5px solid var(--sidebar-border)",
          boxShadow: "0 12px 32px var(--theme-glow, rgba(0,0,0,0.08))",
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
          minWidth: 0,
          transition: "padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className={`dashboard-main-wrapper w-full ${isSidebarCollapsed ? "sidebar-collapsed lg:!pl-[96px]" : "sidebar-expanded lg:!pl-[284px]"}`}
      >
        {/* ─── TOP APP BAR (FLOATING ISLAND GLASS HEADER - GAYA LULUSANSTIMI) ─── */}
        <header
          style={{
            margin: "14px 14px 0 14px",
            padding: "0 20px",
            height: 64,
            borderRadius: 22,
            backgroundColor: "var(--header-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid var(--header-border)",
            boxShadow: "0 8px 24px var(--theme-glow, rgba(0,0,0,0.06))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            position: "sticky",
            top: 14,
            zIndex: 30,
          }}
        >
          {/* Left: Clean, Large, Bold Page Title */}
          <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "var(--md-on-surface)",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {currentTopMenu?.label ?? "Panel REKSA STIMI"}
            </h1>
          </div>

          {/* Right: Quick Action to Public Web, Theme Selector, Profile & Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Multi-Theme Selector */}
            <ThemeSelector />

            {/* Public Link Shortcut */}
            <Link
              href="/"
              target="_blank"
              title="Kunjungi Portal Publik REKSA di Tab Baru"
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid var(--sidebar-border)",
                background: "var(--md-surface-1)",
                color: "var(--md-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
                fontSize: 11.5,
                fontWeight: 750,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <span>🌐</span>
              <span className="hidden sm:inline">Web Publik</span>
            </Link>

            <div style={{ width: 1, height: 22, background: "var(--sidebar-border)", margin: "0 2px" }} />

            {/* User Info Label */}
            <div className="hidden md:flex" style={{ flexDirection: "column", textAlign: "right", minWidth: 0 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)", lineHeight: 1.2 }}>
                {user.name}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
                {roleLabels[user.role] ?? user.role}
              </span>
            </div>

            {/* Quick Logout Button (Gaya LULUSANSTIMI) */}
            <Link
              href="/logout"
              title="Keluar dari Sistem"
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid var(--md-error-container)",
                background: "var(--md-error-container)",
                color: "var(--md-error)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                textDecoration: "none",
                fontSize: 11.5,
                fontWeight: 800,
                boxShadow: "0 1px 3px rgba(220, 38, 38, 0.08)",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              <IconLogout />
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>
        </header>

        

        {/* ─── MAIN PAGE CONTENT ─── */}
        <main
          style={{
            flex: 1,
            padding: "16px 14px 20px 14px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>

        {/* ─── FLOATING ROUNDED FOOTER (HARMONIS DENGAN SIDEBAR & HEADER) ─── */}
        <footer
          style={{
            marginTop: "auto",
            marginBottom: 14,
            marginLeft: 14,
            marginRight: 14,
            padding: "12px 22px",
            borderRadius: 20,
            backgroundColor: "var(--header-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid var(--header-border)",
            boxShadow: "0 8px 24px var(--theme-glow, rgba(0, 0, 0, 0.05))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--md-on-surface-variant)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                color: "var(--md-primary)",
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: "0.05em",
              }}
            >
              REKSA
            </span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span style={{ fontWeight: 750, color: "var(--md-on-surface)" }}>
              Rekognisi Evaluasi dan Konversi Akademik
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                background: "var(--md-primary-container)",
                color: "var(--md-primary)",
                padding: "3px 9px",
                borderRadius: 8,
                fontSize: 10.5,
                fontWeight: 900,
                letterSpacing: "0.04em",
                border: "1px solid var(--sidebar-border)",
              }}
            >
              PUSDATIN
            </span>
            <span style={{ fontWeight: 650 }}>Pusat Data dan Informasi</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ fontWeight: 800, color: "var(--md-on-surface)" }}>STIMI YAPMI MAKASSAR</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
