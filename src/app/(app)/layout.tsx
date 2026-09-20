"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Mic,
  Shield,
  Zap,
  Bot,
  Activity,
  BarChart3,
  Building2,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Radio,
  Clock,
  Wifi,
  User,
  Bell,
  Menu,
  X,
  Flame,
  PlusCircle,
  History,
  Sun,
  Moon,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "EMERGENCY",
    items: [
      { href: "/sos", icon: Flame, label: "Emergency SOS" },
      { href: "/register-incident", icon: PlusCircle, label: "Register Incident" },
      { href: "/my-incidents", icon: History, label: "My Incidents" },
      { href: "/emergency-status", icon: Activity, label: "Emergency Status" },
    ],
  },
  {
    label: "COMMAND",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/incidents", icon: AlertTriangle, label: "Incidents" },
      { href: "/map", icon: MapPin, label: "Situation Map" },
    ],
  },
  {
    label: "RESPONSE",
    items: [
      { href: "/voicedispatch", icon: Mic, label: "VoiceDispatch" },
      { href: "/resources", icon: Shield, label: "Resources" },
      { href: "/dispatch", icon: Zap, label: "Dispatch Studio" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { href: "/ai-commander", icon: Bot, label: "AI Commander" },
      { href: "/simulation", icon: Activity, label: "Simulation" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { href: "/hospitals", icon: Building2, label: "Hospitals & Shelters" },
      { href: "/audit", icon: FileText, label: "Audit Log" },
    ],
  },
];

const ROLES = ["COMMANDER", "DISPATCHER", "OPERATOR", "FIELD"] as const;
type Role = (typeof ROLES)[number];

const ROLE_COLORS: Record<Role, { text: string; bg: string; border: string }> = {
  COMMANDER: { text: "#f87171", bg: "#450a0a", border: "#7f1d1d" },
  DISPATCHER: { text: "#fb923c", bg: "#431407", border: "#7c2d12" },
  OPERATOR:   { text: "#60a5fa", bg: "#1e3a5f", border: "#1d4ed8" },
  FIELD:      { text: "#4ade80", bg: "#052e16", border: "#14532d" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<Role>("OPERATOR");
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const userId = localStorage.getItem("crisisos_user_id");
    const role = localStorage.getItem("crisisos_role");
    if (!userId) { router.push("/"); return; }
    setUserRole((role as Role) ?? "OPERATOR");
    const nameMap: Record<string, string> = {
      "demo-commander": "Cmdr. Rajesh Sharma",
      "demo-operator": "Op. Priya Patel",
      "demo-dispatcher": "Disp. Anil Kumar",
    };
    setUserName(nameMap[userId] ?? "Demo User");
  }, [router]);
  const handleRoleSwitch = (role: Role) => {
    setUserRole(role);
    localStorage.setItem("crisisos_role", role);
  };

  const sidebarW = collapsed ? "64px" : "224px";
  const roleStyle = ROLE_COLORS[userRole] ?? ROLE_COLORS.OPERATOR;

  // Find current page label
  const currentLabel =
    NAV_GROUPS.flatMap((g) => g.items).find(
      (n) => pathname === n.href || pathname.startsWith(n.href + "/")
    )?.label ?? "CrisisOS";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 95,
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <nav
        className={`eoc-sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width: sidebarW,
          minWidth: sidebarW,
          background: "linear-gradient(180deg, rgba(6, 11, 22, 0.96) 0%, rgba(3, 7, 18, 0.98) 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "0 14px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minHeight: "62px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "34px",
              minWidth: "34px",
              height: "34px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #dc2626 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px #2563eb40, 0 2px 8px rgba(0,0,0,0.4)",
              flexShrink: 0,
            }}
          >
            <Radio size={16} color="#fff" />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.4px",
                  whiteSpace: "nowrap",
                }}
              >
                CrisisOS
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "var(--text-muted)",
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Emergency Platform
              </div>
            </div>
          )}
        </div>

        {/* Live Status Strip */}
        {!collapsed && (
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid var(--border-primary)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="live-dot" />
              <span style={{ fontSize: "10px", color: "#4ade80", fontWeight: "700", letterSpacing: "0.8px" }}>
                LIVE — Gujarat EOC
              </span>
            </div>
            <div
              suppressHydrationWarning
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {mounted && currentTime ? currentTime.toLocaleTimeString("en-IN", { hour12: false }) : "--:--:--"}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <div style={{ flex: 1, padding: "8px 6px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: "6px" }}>
              {/* Group label */}
              {!collapsed && (
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "var(--text-muted)",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "8px 8px 4px",
                  }}
                >
                  {group.label}
                </div>
              )}

              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: collapsed ? "10px" : "8px 12px",
                      borderRadius: "7px",
                      marginBottom: "2px",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: isActive ? "600" : "500",
                      color: isActive ? "#93c5fd" : "var(--text-secondary)",
                      background: isActive
                        ? "linear-gradient(90deg, rgba(37, 99, 235, 0.22) 0%, rgba(37, 99, 235, 0.04) 100%)"
                        : "transparent",
                      borderStyle: "solid",
                      borderTopWidth: "1px",
                      borderRightWidth: "1px",
                      borderBottomWidth: "1px",
                      borderLeftWidth: "3px",
                      borderTopColor: isActive ? "rgba(59, 130, 246, 0.25)" : "transparent",
                      borderRightColor: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      borderBottomColor: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      borderLeftColor: isActive ? "#3b82f6" : "transparent",
                      transition: "all 0.18s ease",
                      justifyContent: collapsed ? "center" : "flex-start",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      position: "relative",
                      boxShadow: isActive ? "0 0 16px rgba(37, 99, 235, 0.18)" : "none",
                    }}
                    className={`nav-item-link ${isActive ? "active" : ""}`}
                  >
                    <IconComponent
                      size={16}
                      color={isActive ? "#60a5fa" : "#94a3b8"}
                      style={{ flexShrink: 0 }}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}

              {/* Group separator */}
              {!collapsed && (
                <div
                  style={{
                    height: "1px",
                    background: "var(--border-primary)",
                    margin: "6px 8px",
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Role Switcher (bottom) */}
        {!collapsed && (
          <div
            style={{
              borderTop: "1px solid var(--border-primary)",
              padding: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                color: "var(--text-muted)",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                marginBottom: "6px",
                padding: "0 2px",
              }}
            >
              Active Role
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "8px" }}>
              {ROLES.map((role) => {
                const s = ROLE_COLORS[role];
                const isActive = userRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    style={{
                      padding: "4px 0",
                      borderRadius: "4px",
                      border: `1px solid ${isActive ? s.border : "var(--border-primary)"}`,
                      background: isActive ? s.bg : "transparent",
                      color: isActive ? s.text : "var(--text-muted)",
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      transition: "all 0.15s",
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>

            {/* User identity */}
            {userName && (
              <div
                style={{
                  padding: "8px",
                  background: "var(--bg-card)",
                  borderRadius: "6px",
                  border: "1px solid var(--border-primary)",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: roleStyle.bg,
                    border: `1px solid ${roleStyle.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={12} color={roleStyle.text} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userName}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: roleStyle.text,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {userRole}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => { localStorage.clear(); router.push("/login"); }}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  background: "transparent",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "6px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#7f1d1d";
                  (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-primary)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                }}
              >
                <LogOut size={12} />
                Sign Out
              </button>

              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                style={{
                  padding: "7px 10px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-primary)";
                }}
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={12} color="#f59e0b" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={12} color="#3b82f6" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Rail Footer */}
        {collapsed && (
          <div
            style={{
              borderTop: "1px solid var(--border-primary)",
              padding: "10px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "6px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-primary)";
              }}
            >
              {theme === "dark" ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#3b82f6" />}
            </button>
            <button
              onClick={() => { localStorage.clear(); router.push("/login"); }}
              title="Sign Out"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "6px",
                background: "transparent",
                border: "1px solid var(--border-primary)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#7f1d1d";
                (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-primary)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            right: "-12px",
            top: "72px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-secondary)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "all 0.15s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
          title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div
        className="eoc-main-content"
        style={{
          marginLeft: sidebarW,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          minWidth: 0,
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            height: "56px",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            position: "sticky",
            top: 0,
            zIndex: 50,
            flexShrink: 0,
            transition: "background-color 0.25s ease, border-color 0.25s ease",
          }}
        >
          {/* Left: Hamburger & breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth <= 768) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
                borderRadius: "6px",
                padding: "6px 8px",
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: "500",
              }}
            >
              CrisisOS
            </span>
            <span style={{ color: "var(--border-secondary)", fontSize: "12px" }}>/</span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text-primary)",
              }}
            >
              {currentLabel}
            </span>
          </div>

          {/* Right: status indicators & controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* System status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                background: "rgba(5, 46, 22, 0.8)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                borderRadius: "20px",
                fontSize: "10px",
                color: "#4ade80",
                fontWeight: "700",
                letterSpacing: "0.6px",
                boxShadow: "0 0 10px rgba(34, 197, 94, 0.2)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 6px #4ade80",
                }}
              />
              DEFCON 2 • ACTIVE
            </div>

            {/* Region */}
            <div
              className="hidden sm:block"
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                fontWeight: "600",
                letterSpacing: "0.2px",
                padding: "3px 8px",
                background: "var(--bg-elevated)",
                borderRadius: "4px",
                border: "1px solid var(--border-primary)",
              }}
            >
              GUJARAT METRO EOC
            </div>

            {/* Clock */}
            <div
              suppressHydrationWarning
              className="hidden md:flex"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                color: "var(--text-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: "600",
              }}
            >
              <Clock size={12} color="#60a5fa" />
              {mounted && currentTime
                ? currentTime.toLocaleTimeString("en-IN", { hour12: false }) + " IST"
                : "--:--:--"}
            </div>

            {/* Role badge */}
            <div
              style={{
                padding: "3px 10px",
                borderRadius: "4px",
                background: roleStyle.bg,
                border: `1px solid ${roleStyle.border}`,
                color: roleStyle.text,
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {userRole}
            </div>

            {/* Top Bar Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-primary)";
              }}
            >
              {theme === "dark" ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#3b82f6" />}
            </button>

            {/* Notifications placeholder */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
              title="Notifications"
            >
              <Bell size={14} color="var(--text-secondary)" />
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "1.5px solid var(--bg-secondary)",
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
