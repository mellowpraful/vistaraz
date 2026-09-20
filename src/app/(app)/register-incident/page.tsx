"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  MapPin,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  Phone,
  User,
  CheckCircle2,
  RefreshCw,
  Plus,
  ChevronRight,
  Send,
  LifeBuoy,
} from "lucide-react";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import MapWrapper from "@/components/map/MapWrapper";

const INCIDENT_CATEGORIES = [
  { value: "FLOOD", label: "Flood / Water Inundation", icon: "🌊" },
  { value: "FIRE", label: "Structural / Chemical Fire", icon: "🔥" },
  { value: "ROAD_ACCIDENT", label: "Vehicular Crash / Road Transit", icon: "🚗" },
  { value: "MEDICAL", label: "Mass Medical / Casualty", icon: "🏥" },
  { value: "INDUSTRIAL", label: "Industrial / Gas Leak", icon: "🏭" },
  { value: "BUILDING_COLLAPSE", label: "Structural Collapse / Trapped", icon: "🏢" },
  { value: "HAZMAT", label: "Hazardous Materials / Toxic", icon: "☣️" },
  { value: "SEARCH_RESCUE", label: "Search & Rescue / Missing", icon: "🛟" },
  { value: "OTHER", label: "Other General Emergency", icon: "⚠️" },
];

const SEVERITIES = [
  { value: "CRITICAL", label: "Critical — Immediate Threat to Life", color: "#ef4444" },
  { value: "HIGH", label: "High — Major Escalation Risk", color: "#f97316" },
  { value: "MEDIUM", label: "Medium — Moderate Local Impact", color: "#eab308" },
  { value: "LOW", label: "Low — Controlled Incident", color: "#3b82f6" },
];

const COMMON_HAZARDS = [
  "LIVE_POWER_LINES",
  "CHEMICAL_SPILL",
  "RISING_WATER",
  "STRUCTURAL_INSTABILITY",
  "BLOCKED_EVAC_ROUTE",
  "SMOKE_INHALATION",
  "GAS_LEAK",
];

export default function RegisterIncidentPage() {
  const [formData, setFormData] = useState({
    title: "",
    type: "FLOOD",
    severity: "HIGH",
    description: "",
    dateTime: new Date().toISOString().slice(0, 16),
    locationName: "",
    latitude: 23.0225,
    longitude: 72.5714,
    affectedCount: 0,
    injuryCount: 0,
    reporterName: "",
    reporterPhone: "",
    hazards: [] as string[],
  });

  const [locating, setLocating] = useState(false);
  const [locDetected, setLocDetected] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdIncident, setCreatedIncident] = useState<any | null>(null);

  // Address search autocomplete (Nominatim API)
  useEffect(() => {
    if (!addressSearchQuery.trim() || addressSearchQuery.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearchQuery)}&limit=5&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          setAddressSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn("Address search failed:", err);
      } finally {
        setSearchingAddress(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [addressSearchQuery]);

  // Reverse geocode coordinates to real address name
  const reverseGeocode = async (lat: number, lng: number) => {
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setFormData((prev) => ({
            ...prev,
            locationName: data.display_name,
            latitude: lat,
            longitude: lng,
          }));
          setAddressSearchQuery(data.display_name);
        }
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Auto detect location on click
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser. Please select location on the map or search address.");
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setLocDetected(true);
        setLocating(false);
        reverseGeocode(lat, lng);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setErrorMsg("Unable to retrieve GPS position. Please enter address or tap on the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle selecting address from suggestion
  const handleSelectAddressSuggestion = (item: any) => {
    const lat = parseFloat(parseFloat(item.lat).toFixed(6));
    const lng = parseFloat(parseFloat(item.lon).toFixed(6));
    setFormData((prev) => ({
      ...prev,
      locationName: item.display_name,
      latitude: lat,
      longitude: lng,
    }));
    setAddressSearchQuery(item.display_name);
    setShowSuggestions(false);
    setLocDetected(true);
  };

  // Map pin tap callback
  const handleMapLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    reverseGeocode(lat, lng);
  };

  const handleHazardToggle = (hazard: string) => {
    setFormData((prev) => ({
      ...prev,
      hazards: prev.hazards.includes(hazard)
        ? prev.hazards.filter((h) => h !== hazard)
        : [...prev.hazards, hazard],
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = "Title is required (minimum 3 characters)";
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = "Description is required (minimum 10 characters)";
    }
    if (!formData.locationName.trim()) {
      errs.locationName = "Location name or landmark is required";
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setErrorMsg("Validation required: " + Object.values(errs).join(". "));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrorMsg(null);

    const reporterNote = formData.reporterName || formData.reporterPhone
      ? ` [Reporter: ${formData.reporterName || "Anonymous"} | Tel: ${formData.reporterPhone || "None"}]`
      : "";

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      severity: formData.severity,
      description: `${formData.description.trim()}${reporterNote}`,
      source: "CITIZEN_REPORT",
      locationName: formData.locationName.trim() || `Coordinates: ${formData.latitude}, ${formData.longitude}`,
      latitude: formData.latitude || 23.0225,
      longitude: formData.longitude || 72.5714,
      affectedCount: formData.affectedCount > 0 ? formData.affectedCount : undefined,
      injuryCount: formData.injuryCount >= 0 ? formData.injuryCount : undefined,
      hazards: formData.hazards,
      originalReport: `Manual Incident Registration at ${formData.dateTime}. Details: ${formData.description}. Contact: ${formData.reporterPhone || "N/A"}`,
    };

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to register incident.");
      }

      const created = json.data || json.incident;
      setCreatedIncident(created);

      // Save to My Incidents local history
      try {
        const historyRaw = localStorage.getItem("crisisos_my_incidents");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const newEntry = {
          id: created.id,
          title: created.title,
          type: created.type,
          severity: created.severity,
          status: created.status || "REPORTED",
          locationName: created.locationName,
          createdAt: created.createdAt || new Date().toISOString(),
          isSos: false,
        };
        const updated = [newEntry, ...history.filter((h: any) => h.id !== created.id)];
        localStorage.setItem("crisisos_my_incidents", JSON.stringify(updated.slice(0, 30)));
      } catch (saveErr) {
        console.warn("Error caching incident history:", saveErr);
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "An unexpected error occurred while saving your report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedIncident(null);
    setFormData({
      title: "",
      type: "FLOOD",
      severity: "HIGH",
      description: "",
      dateTime: new Date().toISOString().slice(0, 16),
      locationName: "",
      latitude: 23.0225,
      longitude: 72.5714,
      affectedCount: 0,
      injuryCount: 0,
      reporterName: "",
      reporterPhone: "",
      hazards: [],
    });
    setFieldErrors({});
    setErrorMsg(null);
  };

  // ── Success State Receipt ───────────────────────────────────────────────────
  if (createdIncident) {
    return (
      <div style={{ maxWidth: "680px", margin: "20px auto" }} className="animate-slide-in">
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "14px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(34,197,94,0.15)",
              border: "2px solid #22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckCircle2 size={32} color="#22c55e" />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "6px" }}>
            Incident Successfully Registered
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Your incident report has been securely transmitted to the Emergency Command Center.
          </p>

          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-secondary)",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "left",
              marginBottom: "24px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Incident Reference ID:</span>
              <strong style={{ color: "#60a5fa" }}>{createdIncident.id}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Title:</span>
              <strong style={{ color: "var(--text-primary)" }}>{createdIncident.title}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Category & Severity:</span>
              <span style={{ color: "#f87171" }}>{createdIncident.type} · {createdIncident.severity}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Status:</span>
              <span style={{ color: "#34d399", fontWeight: "700" }}>{createdIncident.status || "REPORTED"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Location:</span>
              <span style={{ color: "var(--text-primary)" }}>{createdIncident.locationName}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Link
              href={`/emergency-status?id=${createdIncident.id}`}
              style={{
                padding: "12px",
                background: "var(--accent-blue)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              Track Emergency Status →
            </Link>

            <Link
              href={`/incidents/${createdIncident.id}`}
              style={{
                padding: "12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-secondary)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              View Full Incident SITREP
            </Link>
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link href="/my-incidents" style={{ color: "var(--text-secondary)", fontSize: "12px", textDecoration: "underline" }}>
              View in My Incidents History
            </Link>
            <button
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-blue-bright)",
                fontSize: "12px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              + Register Another Incident
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Registration Form ─────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "20px" }}>📝</span>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            Manual Incident Registration
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Official citizen & field reporting intake portal. Submissions are queued directly for operator triage.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {errorMsg && (
          <div style={{ padding: "12px", background: "#7f1d1d", border: "1px solid #b91c1c", borderRadius: "8px", color: "#fecaca", fontSize: "12px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. General Classification Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
            1. Incident Classification
          </h3>

          {/* Title */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Incident Headline / Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Flash Flood Submerging Usmanpura Underpass"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-secondary)",
                border: `1px solid ${fieldErrors.title ? "#ef4444" : "var(--border-secondary)"}`,
                borderRadius: "6px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            {fieldErrors.title && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{fieldErrors.title}</div>}
          </div>

          {/* Category & Severity Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Incident Category <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {INCIDENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Severity Assessment <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {SEVERITIES.map((sev) => (
                  <option key={sev.value} value={sev.value}>
                    {sev.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Detailed Description & Current Scene Conditions <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the incident, immediate hazards, trapped individuals, and access conditions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-secondary)",
                border: `1px solid ${fieldErrors.description ? "#ef4444" : "var(--border-secondary)"}`,
                borderRadius: "6px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                resize: "vertical",
              }}
            />
            {fieldErrors.description && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{fieldErrors.description}</div>}
          </div>
        </div>

        {/* 2. Geolocation & Timestamp Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
              2. Location & Time Details
            </h3>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating || reverseGeocoding}
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.3)",
                borderRadius: "6px",
                color: "#60a5fa",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <MapPin size={13} />
              {locating ? "Detecting GPS..." : reverseGeocoding ? "Geocoding Address..." : locDetected ? "GPS Location Active" : "Detect Current GPS"}
            </button>
          </div>

          {/* Location Autocomplete Search */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Search Address or Enter Location Landmark <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Search real address (e.g. Ashram Road, Ahmedabad, Gujarat)..."
                value={formData.locationName}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, locationName: val }));
                  setAddressSearchQuery(val);
                }}
                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-secondary)",
                  border: `1px solid ${fieldErrors.locationName ? "#ef4444" : "var(--border-secondary)"}`,
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            {fieldErrors.locationName && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>{fieldErrors.locationName}</div>}

            {/* Address Autocomplete Suggestions Dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  marginTop: "4px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                  overflow: "hidden",
                }}
              >
                {addressSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAddressSuggestion(item)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderBottom: idx < addressSuggestions.length - 1 ? "1px solid #1e293b" : "none",
                      color: "#e2e8f0",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                    className="hover:bg-slate-800 transition-colors"
                  >
                    <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div style={{ fontWeight: "600", color: "#f8fafc" }}>{item.display_name}</div>
                      <div style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace" }}>
                        Lat: {parseFloat(item.lat).toFixed(4)}, Lng: {parseFloat(item.lon).toFixed(4)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Confirmation Badge */}
          {formData.locationName && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#22c55e" className="shrink-0" />
                <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "600" }}>
                  Location Confirmed: {formData.locationName}
                </span>
              </div>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#a7f3d0", background: "rgba(6,78,59,0.5)", padding: "2px 8px", borderRadius: "4px" }}>
                {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </span>
            </div>
          )}

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Pinpoint Location on Map (Click anywhere to update coordinates)
            </label>
            <div style={{ height: "300px", width: "100%", marginBottom: "12px" }}>
              <MapWrapper 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                onChange={handleMapLocationChange}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                readOnly
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                readOnly
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Incident Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Casualties & Scene Hazards */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
            3. Casualties & Scene Hazards (Optional)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Estimated Affected People
              </label>
              <input
                type="number"
                min="0"
                value={formData.affectedCount}
                onChange={(e) => setFormData({ ...formData, affectedCount: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Injuries Reported
              </label>
              <input
                type="number"
                min="0"
                value={formData.injuryCount}
                onChange={(e) => setFormData({ ...formData, injuryCount: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              Identified Threat Factors
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {COMMON_HAZARDS.map((hz) => {
                const active = formData.hazards.includes(hz);
                return (
                  <button
                    key={hz}
                    type="button"
                    onClick={() => handleHazardToggle(hz)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                      border: `1px solid ${active ? "#ef4444" : "var(--border-secondary)"}`,
                      background: active ? "rgba(239,68,68,0.15)" : "var(--bg-secondary)",
                      color: active ? "#fca5a5" : "var(--text-muted)",
                      transition: "all 0.15s",
                    }}
                  >
                    {active ? "✓ " : "+ "}
                    {hz.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Contact Information */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
            4. Reporter Contact (Optional)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Full Name / Agency Call Sign
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Shah"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.reporterPhone}
                onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        {errorMsg && (
          <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
          <Link
            href="/my-incidents"
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--border-secondary)",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 28px",
              background: submitting ? "var(--bg-secondary)" : "var(--accent-blue)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: submitting ? "none" : "0 0 15px rgba(37,99,235,0.4)",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin text-blue-400" />
                <span>Submitting Incident Report...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Incident Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
