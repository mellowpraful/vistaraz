"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⚡", label: "Dashboard", short: "CMD" },
  { href: "/incidents", icon: "🚨", label: "Incidents", short: "INC" },
  { href: "/voicedispatch", icon: "📡", label: "VoiceDispatch", short: "VD" },
  { href: "/map", icon: "🗺️", label: "Situation Map", short: "MAP" },
  { href: "/resources", icon: "🚑", label: "Resources", short: "RES" },
  { href: "/dispatch", icon: "✅", label: "Dispatch", short: "DSP" },
  { href: "/ai-commander", icon: "🤖", label: "AI Commander", short: "AI" },
  { href: "/simulation", icon: "🧪", label: "Simulation", short: "SIM" },
  { href: "/hospitals", icon: "🏥", label: "Hospitals & Shelters", short: "HSP" },
  { href: "/analytics", icon: "📊", label: "Analytics", short: "ANL" },
  { href: "/audit", icon: "📋", label: "Audit Log", short: "AUD" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const userId = localStorage.getItem("crisisos_user_id");
    const role = localStorage.getItem("crisisos_role");
    if (!userId) { router.push("/"); return; }
    setUserRole(role ?? "OPERATOR");
    const nameMap: Record<string, string> = {
      "demo-commander": "Cmdr. Rajesh Sharma",
      "demo-operator": "Op. Priya Patel",
      "demo-dispatcher": "Dispatcher Anil Kumar",
    };
    setUserName(nameMap[userId] ?? "Demo User");
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sidebarW = collapsed ? "64px" : "220px";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080b12" }}>
      {/* Sidebar */}
      <nav style={{
        width: sidebarW,
        minWidth: sidebarW,
        background: "#0d1117",
        borderRight: "1px solid #1f2937",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s",
        overflow: "hidden",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{
          padding: "16px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minHeight: "64px",
        }}>
          <div style={{
            width: "32px", minWidth: "32px", height: "32px",
            background: "linear-gradient(135deg, #1d4ed8, #dc2626)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px",
            boxShadow: "0 0 15px rgba(37,99,235,0.4)",
            flexShrink: 0,
          }}>🚨</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.3px" }}>
                CrisisOS
              </div>
              <div style={{ fontSize: "9px", color: "#4b5563", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Emergency Platform
              </div>
            </div>
          )}
        </div>

        {/* Live Status */}
        {!collapsed && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #1f2937" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="live-dot" />
              <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: "600" }}>LIVE — Gujarat EOC</span>
            </div>
            <div style={{ fontSize: "11px", color: "#4b5563", marginTop: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
              {currentTime.toLocaleTimeString("en-IN", { hour12: false })}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div style={{ flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: collapsed ? "10px" : "9px 10px",
                  borderRadius: "6px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  fontSize: "13.5px",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#60a5fa" : "#6b7280",
                  background: isActive ? "rgba(37,99,235,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(37,99,235,0.25)" : "1px solid transparent",
                  transition: "all 0.15s",
                  justifyContent: collapsed ? "center" : "flex-start",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ fontSize: "15px", flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>

        {/* User + Collapse */}
        <div style={{ borderTop: "1px solid #1f2937", padding: "12px" }}>
          {!collapsed && userName && (
            <div style={{ marginBottom: "8px", padding: "8px", background: "#111827", borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#f1f5f9" }}>{userName}</div>
              <div style={{ fontSize: "10px", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>{userRole}</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: "100%",
              padding: "6px",
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "6px",
              color: "#6b7280",
              cursor: "pointer",
              fontSize: "12px",
              transition: "all 0.15s",
            }}
          >
            {collapsed ? "→" : "← Collapse"}
          </button>
          {!collapsed && (
            <button
              onClick={() => { localStorage.clear(); router.push("/"); }}
              style={{
                width: "100%", marginTop: "6px",
                padding: "6px",
                background: "transparent",
                border: "1px solid #1f2937",
                borderRadius: "6px",
                color: "#6b7280",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ marginLeft: sidebarW, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.2s" }}>
        {/* Top Bar */}
        <header style={{
          height: "56px",
          background: "#0d1117",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "#4b5563" }}>
              {NAV_ITEMS.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "CrisisOS"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 10px",
              background: "#052e16",
              border: "1px solid #14532d",
              borderRadius: "20px",
              fontSize: "11px",
              color: "#4ade80",
            }}>
              <span className="live-dot" style={{ width: "6px", height: "6px" }} />
              All Systems Operational
            </div>
            <div style={{ fontSize: "12px", color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>
              {currentTime.toLocaleDateString("en-IN")}
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
