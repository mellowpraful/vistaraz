"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";

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
      background: "#080b12",
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
        backgroundImage: "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Glow effects */}
      <div style={{
        position: "absolute", top: "20%", left: "30%",
        width: "400px", height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "25%",
        width: "300px", height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "480px" }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}>
            <div style={{
              width: "52px", height: "52px",
              background: "linear-gradient(135deg, #1d4ed8, #dc2626)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 0 30px rgba(37,99,235,0.4)",
            }}>
              🚨
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontSize: "28px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #60a5fa, #f87171)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}>
                CrisisOS
              </div>
              <div style={{ fontSize: "12px", color: "#475569", letterSpacing: "2px", textTransform: "uppercase" }}>
                Emergency Response Platform
              </div>
            </div>
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            background: "#451a03",
            border: "1px solid #78350f",
            borderRadius: "20px",
            fontSize: "11px",
            color: "#fb923c",
            fontWeight: "600",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}>
            <span className="live-dot" style={{ width: "6px", height: "6px" }} />
            Demo Mode — Gujarat EOC
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: "rgba(17, 24, 39, 0.9)",
          border: "1px solid #1f2937",
          borderRadius: "16px",
          padding: "32px",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9", marginBottom: "8px" }}>
              Select Demo Access Role
            </div>
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>
              Choose a role to access the emergency operations center
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {DEMO_ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.role)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  background: selectedRole === r.role ? `${r.color}15` : "#0d1117",
                  border: `1px solid ${selectedRole === r.role ? r.color + "60" : "#1f2937"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "24px" }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>{r.name}</div>
                  <div style={{ fontSize: "12px", color: r.color, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {r.role}
                  </div>
                </div>
                {selectedRole === r.role && (
                  <div style={{
                    width: "20px", height: "20px",
                    borderRadius: "50%",
                    background: r.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", color: "white",
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
              background: loading ? "#1f2937" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.5px",
              boxShadow: loading ? "none" : "0 0 25px rgba(37,99,235,0.4)",
            }}
          >
            {loading ? "Accessing Command Center..." : "🚀 Enter Command Center"}
          </button>

          <div style={{ marginTop: "20px", padding: "12px", background: "#111827", borderRadius: "8px", border: "1px solid #1f2937" }}>
            <div style={{ fontSize: "11px", color: "#6b7280", textAlign: "center" }}>
              <strong style={{ color: "#fb923c" }}>⚠️ Demo Mode:</strong> This platform uses synthetic data only.
              No real emergency data or personal information is used.
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
              background: "rgba(17,24,39,0.6)",
              border: "1px solid #1f2937",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{f.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#f1f5f9" }}>{f.label}</div>
              <div style={{ fontSize: "10px", color: "#6b7280" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
