"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("COMMANDER");

  const DEMO_ROLES = [
    { id: "demo-commander", role: "COMMANDER", name: "Cmdr. Rajesh Sharma", color: "#c084fc", icon: "⭐" },
    { id: "demo-operator", role: "OPERATOR", name: "Op. Priya Patel", color: "#60a5fa", icon: "📡" },
    { id: "demo-dispatcher", role: "DISPATCHER", name: "Dispatcher Anil Kumar", color: "#34d399", icon: "🚨" },
  ];

  function handleDemoAccess(userId: string, role: string) {
    setLoading(true);
    // Store demo session
    localStorage.setItem("crisisos_user_id", userId);
    localStorage.setItem("crisisos_role", role);
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06090f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
        pointerEvents: "none",
      }} />

      {/* Cyber radar glow effects */}
      <div style={{
        position: "absolute", top: "15%", left: "25%",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "20%",
        width: "400px", height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back to Landing Page Link */}
      <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 10 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
            color: "#94a3b8",
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={14} /> Back to Overview
        </Link>
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "500px" }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "16px",
          }}>
            <div style={{
              width: "56px", height: "56px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #dc2626 100%)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              boxShadow: "0 0 35px rgba(37,99,235,0.45), 0 4px 12px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              🚨
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #93c5fd 0%, #f87171 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.8px",
                lineHeight: "1.1",
              }}>
                Vistaraz
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: "600" }}>
                Emergency Intelligence Platform
              </div>
            </div>
          </div>

          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              background: "rgba(5, 46, 22, 0.75)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              borderRadius: "20px",
              fontSize: "11px",
              color: "#4ade80",
              fontWeight: "700",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              boxShadow: "0 0 12px rgba(34, 197, 94, 0.2)",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
              Live Simulation • Gujarat Metro EOC
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: "linear-gradient(145deg, rgba(15, 22, 35, 0.9) 0%, rgba(10, 14, 23, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "32px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(37, 99, 235, 0.1)",
        }}>
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.3px", marginBottom: "6px" }}>
              Select Operational Role
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Authenticate into the Emergency Operations Command Grid
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {DEMO_ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.role)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  background: selectedRole === r.role
                    ? `linear-gradient(90deg, ${r.color}20 0%, rgba(15, 22, 35, 0.8) 100%)`
                    : "rgba(15, 22, 35, 0.5)",
                  border: `1px solid ${selectedRole === r.role ? r.color : "rgba(255, 255, 255, 0.08)"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  textAlign: "left",
                  boxShadow: selectedRole === r.role ? `0 0 16px ${r.color}25` : "none",
                }}
              >
                <span style={{ fontSize: "22px" }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>{r.name}</div>
                  <div style={{ fontSize: "11px", color: r.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    {r.role}
                  </div>
                </div>
                {selectedRole === r.role && (
                  <div style={{
                    width: "22px", height: "22px",
                    borderRadius: "50%",
                    background: r.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", color: "#06090f", fontWeight: "800",
                    boxShadow: `0 0 10px ${r.color}`,
                  }}>✓</div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const role = DEMO_ROLES.find(r => r.role === selectedRole)!;
              handleDemoAccess(role.id, role.role);
            }}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#1e293b" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "10px",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.5px",
              boxShadow: loading ? "none" : "0 0 25px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {loading ? "Initializing Telemetry Stream..." : "Authorize & Launch EOC →"}
          </button>

          <div style={{ marginTop: "18px", padding: "10px 14px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
              <strong style={{ color: "#fb923c" }}>⚡ Evaluation Sandbox:</strong> Telemetry streams and map overlays reflect disaster scenarios for judges review.
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "24px" }}>
          {[
            { icon: "📡", label: "VoiceDispatch", desc: "Multilingual AI intake" },
            { icon: "🗺️", label: "CrisisOS", desc: "Command center" },
            { icon: "🚑", label: "RapidAid", desc: "Smart dispatch" },
          ].map((f) => (
            <div key={f.label} style={{
              background: "rgba(15, 22, 35, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{f.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{f.label}</div>
              <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
