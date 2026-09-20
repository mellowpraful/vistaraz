"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

const TYPES_FOR_FORM = ["FLOOD", "FIRE", "ROAD_ACCIDENT", "INDUSTRIAL", "MEDICAL", "BUILDING_COLLAPSE", "HAZMAT", "SEARCH_RESCUE"];
const SEVERITIES_FOR_FORM = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

interface CreateIncidentFormData {
  title: string;
  description: string;
  type: string;
  severity: string;
  source: string;
  locationName: string;
  latitude: number;
  longitude: number;
  affectedCount: number;
  injuryCount: number;
  hazards: string[];
  requiredCapabilities: string[];
}

interface CreateIncidentModalProps {
  onClose: () => void;
  onSubmit: (data: CreateIncidentFormData, rawText: string) => Promise<void>;
  creating: boolean;
}

export function CreateIncidentModal({ onClose, onSubmit, creating }: CreateIncidentModalProps) {
  const [formRawText, setFormRawText] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);
  const [formData, setFormData] = useState<CreateIncidentFormData>({
    title: "", description: "", type: "FLOOD", severity: "HIGH",
    source: "MANUAL", locationName: "", latitude: 23.0225, longitude: 72.5714,
    affectedCount: 0, injuryCount: 0, hazards: [], requiredCapabilities: [],
  });

  const handleAiExtract = async () => {
    if (!formRawText.trim()) return;
    setAiExtracting(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EXTRACT_REPORT", text: formRawText }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setFormData((prev) => ({
          ...prev,
          title: d.title || prev.title,
          description: d.summary || formRawText,
          type: d.type || prev.type,
          severity: d.severity || prev.severity,
          locationName: d.locationName || prev.locationName,
          latitude: d.latitude || prev.latitude,
          longitude: d.longitude || prev.longitude,
          affectedCount: d.affectedCount || prev.affectedCount,
          injuryCount: d.injuryCount || prev.injuryCount,
          hazards: d.hazards || prev.hazards,
          requiredCapabilities: d.requiredCapabilities || prev.requiredCapabilities,
        }));
      }
    } catch (err) {
      console.error("AI extraction failed:", err);
    } finally {
      setAiExtracting(false);
    }
  };

  const labelStyle = {
    display: "block", fontSize: "12px", fontWeight: "700",
    color: "var(--text-secondary)", textTransform: "uppercase" as const,
    letterSpacing: "0.5px", marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
    borderRadius: "8px", color: "var(--text-primary)", fontSize: "14px",
    fontFamily: "inherit", boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", overflowY: "auto",
    }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-secondary)",
        borderRadius: "16px", maxWidth: "680px", width: "100%",
        padding: "32px", boxShadow: "0 25px 80px rgba(0,0,0,0.6)", margin: "auto",
      }}>
        {/* Modal Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--border-primary)", paddingBottom: "18px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "10px",
              background: "#450a0a", border: "1px solid #7f1d1d",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={20} color="#f87171" />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                Log New Emergency Incident
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Use AI triage for fast form fill, or enter details manually
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid var(--border-primary)",
              borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer",
              padding: "6px 10px",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* AI Fast Intake Box */}
        <div style={{
          padding: "18px", background: "#1a0b2e",
          border: "1px solid #581c87", borderRadius: "10px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#c084fc", display: "flex", alignItems: "center", gap: "8px" }}>
              ✨ Fast AI Triage Auto-Fill
            </span>
            <button
              type="button"
              onClick={handleAiExtract}
              disabled={aiExtracting || !formRawText.trim()}
              style={{
                padding: "7px 16px", background: aiExtracting ? "#4c1d95" : "#7c3aed",
                border: "none", borderRadius: "8px", color: "#e9d5ff",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                opacity: !formRawText.trim() ? 0.5 : 1,
              }}
            >
              {aiExtracting ? "Analyzing..." : "Auto-Extract with AI"}
            </button>
          </div>
          <textarea
            rows={3}
            placeholder="Paste raw caller transcript, radio chatter, or notes..."
            value={formRawText}
            onChange={(e) => setFormRawText(e.target.value)}
            style={{
              ...inputStyle, background: "#0d0221",
              border: "1px solid #581c87", resize: "vertical",
            }}
          />
        </div>

        {/* Structured Form */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData, formRawText); }} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Incident Title */}
          <div>
            <label style={labelStyle}>Incident Title *</label>
            <input
              type="text" required value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Flash Flood – Sabarmati Riverfront Sector 4"
              style={inputStyle}
            />
          </div>

          {/* Type + Severity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Incident Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                {TYPES_FOR_FORM.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Severity Level</label>
              <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} style={inputStyle}>
                {SEVERITIES_FOR_FORM.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea
              required rows={3} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe scene conditions, hazards, access routes, and trapped victims..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location</label>
            <input
              type="text" value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              placeholder="e.g. Near Sabarmati Ashram, Vadaj Road"
              style={inputStyle}
            />
          </div>

          {/* Affected + Injuries */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Affected People</label>
              <input
                type="number" min="0" value={formData.affectedCount}
                onChange={(e) => setFormData({ ...formData, affectedCount: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Injuries Reported</label>
              <input
                type="number" min="0" value={formData.injuryCount}
                onChange={(e) => setFormData({ ...formData, injuryCount: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            gap: "12px", paddingTop: "18px", borderTop: "1px solid var(--border-primary)",
          }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: "10px 20px", background: "transparent",
                border: "1px solid var(--border-primary)", borderRadius: "8px",
                color: "var(--text-muted)", cursor: "pointer", fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={creating}
              style={{
                padding: "10px 24px", background: "var(--accent-blue)",
                border: "none", borderRadius: "8px", color: "#fff",
                cursor: "pointer", fontSize: "14px", fontWeight: "700",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              }}
            >
              <AlertTriangle size={15} />
              {creating ? "Submitting..." : "Register Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
