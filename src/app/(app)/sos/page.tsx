"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Flame,
  HeartPulse,
  Building,
  Waves,
  Car,
  LifeBuoy,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  XCircle,
  ChevronRight,
  Send,
  Volume2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import MapWrapper from "@/components/map/MapWrapper";

interface SOSCategory {
  type: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  color: string;
  defaultDescription: string;
}

const SOS_CATEGORIES: SOSCategory[] = [
  {
    type: "MEDICAL",
    label: "Medical Emergency",
    icon: HeartPulse,
    color: "#ef4444",
    defaultDescription: "Immediate life-saving medical assistance and trauma care required.",
  },
  {
    type: "FIRE",
    label: "Fire / Explosion",
    icon: Flame,
    color: "#f97316",
    defaultDescription: "Active structural or chemical fire with danger to human life.",
  },
  {
    type: "BUILDING_COLLAPSE",
    label: "Trapped / Structural Collapse",
    icon: Building,
    color: "#eab308",
    defaultDescription: "Civilians trapped in collapsed structure or debris. Urgent extraction needed.",
  },
  {
    type: "FLOOD",
    label: "Flood / Stranded in Water",
    icon: Waves,
    color: "#3b82f6",
    defaultDescription: "Rising floodwaters, civilians cut off or stranded needing boat evacuation.",
  },
  {
    type: "ROAD_ACCIDENT",
    label: "Severe Road Crash",
    icon: Car,
    color: "#a855f7",
    defaultDescription: "Major vehicular collision with severe injuries and entrapment.",
  },
  {
    type: "SEARCH_RESCUE",
    label: "Search & Rescue / Disaster",
    icon: LifeBuoy,
    color: "#06b6d4",
    defaultDescription: "Person missing or trapped in hazardous area requiring specialized search team.",
  },
];

interface ActiveIncident {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  assignments?: Array<{
    id: string;
    status: string;
    resource: {
      name: string;
      type: string;
      agency?: { name?: string };
    };
  }>;
  events?: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export default function EmergencySOSPage() {
  const [selectedCategory, setSelectedCategory] = useState<SOSCategory>(SOS_CATEGORIES[0]);
  const [step, setStep] = useState<"SELECT" | "CONFIRM" | "ACTIVATING" | "ACTIVE">("SELECT");
  const [customNotes, setCustomNotes] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [locationName, setLocationName] = useState("Ahmedabad Metropolitan Area");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [activeIncident, setActiveIncident] = useState<ActiveIncident | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Auto-detect GPS location on mount
  const detectLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocError("Geolocation not supported by device/browser.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setAccuracy(Math.round(pos.coords.accuracy));
        setLocationName(`GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (±${Math.round(pos.coords.accuracy)}m)`);
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation prompt skipped or denied:", err.message);
        setLocError("Location access unavailable. Using default EOC zone.");
        // Fallback default coordinates (Ahmedabad Center)
        setCoords({ lat: 23.0225, lng: 72.5714 });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  // Check for existing active SOS from localStorage
  useEffect(() => {
    detectLocation();
    const savedSosId = localStorage.getItem("crisisos_active_sos");
    if (savedSosId) {
      fetchActiveSOS(savedSosId);
    }
  }, [detectLocation]);

  const fetchActiveSOS = async (incidentId: string) => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/incidents/${incidentId}`);
      if (!res.ok) throw new Error("Incident not found");
      const json = await res.json();
      if (json.success && json.data) {
        setActiveIncident(json.data);
        setStep("ACTIVE");
      }
    } catch {
      // If incident cannot be loaded, clear stale local SOS
      localStorage.removeItem("crisisos_active_sos");
    } finally {
      setRefreshing(false);
    }
  };

  // Poll active SOS status every 6 seconds when in active state
  useEffect(() => {
    if (step !== "ACTIVE" || !activeIncident?.id) return;
    const interval = setInterval(() => {
      fetchActiveSOS(activeIncident.id);
    }, 6000);
    return () => clearInterval(interval);
  }, [step, activeIncident?.id]);

  // Activate SOS with anti-duplicate debounce
  const handleActivateSOS = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStep("ACTIVATING");
    setErrorMsg(null);

    const lat = coords?.lat ?? 23.0225;
    const lng = coords?.lng ?? 72.5714;
    const notesContent = customNotes.trim() ? ` Reporter Note: ${customNotes.trim()}` : "";
    const contactInfo = reporterName || reporterPhone ? ` [Contact: ${reporterName || "Anonymous"} | ${reporterPhone || "No phone"}]` : "";

    const payload = {
      title: `EMERGENCY SOS: ${selectedCategory.label}`,
      description: `${selectedCategory.defaultDescription}${notesContent}${contactInfo}`,
      type: selectedCategory.type,
      severity: "CRITICAL",
      source: "CITIZEN_REPORT",
      locationName: locationName || "Gujarat EOC Grid",
      latitude: lat,
      longitude: lng,
      affectedCount: 1,
      injuryCount: selectedCategory.type === "MEDICAL" || selectedCategory.type === "ROAD_ACCIDENT" ? 1 : 0,
      hazards: ["IMMEDIATE_THREAT_TO_LIFE"],
      requiredCapabilities: [
        selectedCategory.type === "MEDICAL"
          ? "TRAUMA_CARE"
          : selectedCategory.type === "FIRE"
          ? "FIRE_SUPPRESSION"
          : selectedCategory.type === "FLOOD"
          ? "WATER_RESCUE"
          : "SEARCH_RESCUE",
      ],
      originalReport: `EMERGENCY SOS ACTIVATION via CrisisOS Portal. Category: ${selectedCategory.label}. Notes: ${customNotes || "None"}. Phone: ${reporterPhone || "None"}`,
    };

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to trigger emergency dispatch.");
      }

      const created = json.data || json.incident;
      setActiveIncident(created);
      setStep("ACTIVE");

      // Save to localStorage
      localStorage.setItem("crisisos_active_sos", created.id);

      // Save to user's incident history
      try {
        const historyRaw = localStorage.getItem("crisisos_my_incidents");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const newRecord = {
          id: created.id,
          title: created.title,
          type: created.type,
          severity: created.severity,
          status: created.status || "REPORTED",
          locationName: created.locationName,
          createdAt: created.createdAt || new Date().toISOString(),
          isSos: true,
        };
        const updated = [newRecord, ...history.filter((h: any) => h.id !== created.id)];
        localStorage.setItem("crisisos_my_incidents", JSON.stringify(updated.slice(0, 30)));
      } catch (err) {
        console.warn("Failed to store incident history:", err);
      }
    } catch (err: any) {
      console.error("SOS Activation Error:", err);
      setErrorMsg(err.message || "Failed to trigger emergency beacon. Please call 112 directly.");
      setStep("CONFIRM");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleClearActiveSOS = () => {
    localStorage.removeItem("crisisos_active_sos");
    setActiveIncident(null);
    setStep("SELECT");
    setCustomNotes("");
  };

  // Helper for status progress mapping
  const getStatusStage = (status?: string) => {
    switch (status) {
      case "CLOSED":
      case "RESOLVED":
        return 4;
      case "ASSIGNED":
      case "IN_PROGRESS":
        return 3;
      case "VERIFIED":
        return 2;
      case "REPORTED":
      default:
        return 1;
    }
  };

  const statusStage = getStatusStage(activeIncident?.status);

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* ── Active SOS Telemetry HUD ────────────────────────────────────────── */}
      {step === "ACTIVE" && activeIncident && (
        <div className="animate-slide-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
              border: "2px solid #ef4444",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 0 30px rgba(239,68,68,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  className="animate-glow-pulse"
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Radio size={28} color="#fff" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      LIVE SOS BEACON ACTIVE
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "12px",
                        color: "#fca5a5",
                        fontWeight: "700",
                      }}
                    >
                      ID: {activeIncident.id}
                    </span>
                  </div>
                  <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
                    {activeIncident.title}
                  </h1>
                  <p style={{ fontSize: "12px", color: "#fecaca", marginTop: "2px" }}>
                    Broadcasted to State Emergency Operations Center · Auto-updating every 6s
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchActiveSOS(activeIncident.id)}
                disabled={refreshing}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid #b91c1c",
                  borderRadius: "6px",
                  color: "#fca5a5",
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Syncing..." : "Sync"}
              </button>
            </div>

            {/* Status Stepper Progression */}
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                borderRadius: "8px",
                padding: "16px",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#fca5a5", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                Emergency Dispatch Lifecycle
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", position: "relative" }}>
                {[
                  { stage: 1, label: "1. Reported", desc: "Beacon Broadcasted" },
                  { stage: 2, label: "2. Accepted", desc: "Verified by EOC" },
                  { stage: 3, label: "3. In Progress", desc: "Units En Route" },
                  { stage: 4, label: "4. Resolved", desc: "Danger Cleared" },
                ].map((s) => {
                  const isDone = statusStage >= s.stage;
                  const isCurrent = statusStage === s.stage;
                  return (
                    <div
                      key={s.stage}
                      style={{
                        background: isCurrent ? "#7f1d1d" : isDone ? "#064e3b" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isCurrent ? "#ef4444" : isDone ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "6px",
                        padding: "10px 8px",
                        textAlign: "center",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: isCurrent ? "#ffffff" : isDone ? "#6ee7b7" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: isCurrent ? "#fca5a5" : isDone ? "#a7f3d0" : "rgba(255,255,255,0.3)",
                          marginTop: "2px",
                        }}
                      >
                        {s.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geolocation & Telemetry Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
                fontSize: "12px",
              }}
            >
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span style={{ color: "#fca5a5", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Location Landmark</span>
                <strong style={{ color: "#fff", fontSize: "13px" }}>{activeIncident.locationName || "Scene Location"}</strong>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span style={{ color: "#fca5a5", fontSize: "10px", textTransform: "uppercase", display: "block" }}>GPS Coordinates</span>
                <strong style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                  {activeIncident.latitude?.toFixed(4)}° N, {activeIncident.longitude?.toFixed(4)}° E
                </strong>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span style={{ color: "#fca5a5", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Elapsed Time</span>
                <strong style={{ color: "#fff", fontSize: "12px" }}>
                  {formatRelativeTime(activeIncident.createdAt)}
                </strong>
              </div>
            </div>
          </div>

          {/* Assigned Units Card */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <ShieldCheck size={16} color="#22c55e" />
              Assigned Emergency Units & Fleet Telemetry
            </h3>

            {activeIncident.assignments && activeIncident.assignments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeIncident.assignments.map((as) => (
                  <div
                    key={as.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{as.resource.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {as.resource.agency?.name || "Emergency Rapid Response"} · Type: {as.resource.type}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#064e3b",
                        color: "#6ee7b7",
                        border: "1px solid #059669",
                        textTransform: "uppercase",
                      }}
                    >
                      {as.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(234,179,8,0.06)",
                  border: "1px dashed rgba(234,179,8,0.3)",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#fde047",
                }}
              >
                📡 Dispatch algorithms analyzing nearby fleet units. Live unit assignment will appear here shortly.
              </div>
            )}
          </div>

          {/* Quick Action Navigation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Link
              href={`/emergency-status?id=${activeIncident.id}`}
              style={{
                padding: "12px",
                background: "var(--accent-blue)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                textAlign: "center",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              Full Live SITREP & Tracking →
            </Link>

            <button
              onClick={handleClearActiveSOS}
              style={{
                padding: "12px",
                background: "transparent",
                border: "1px solid var(--border-secondary)",
                borderRadius: "8px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <XCircle size={15} />
              Stand Down / Register New Request
            </button>
          </div>
        </div>
      )}

      {/* ── SOS Trigger & Confirmation Screens ──────────────────────────────── */}
      {step !== "ACTIVE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Title Banner */}
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "12px",
              }}
            >
              <span className="live-dot" style={{ background: "#ef4444" }} />
              Rapid Emergency Dispatch Portal
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              Emergency SOS Activation
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "560px", margin: "8px auto 0" }}>
              Trigger an instant critical distress beacon with your real-time GPS location to the Central Emergency Operations Center.
            </p>
          </div>

          {/* Direct Hotlines Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "10px",
              padding: "12px",
            }}
          >
            <a
              href="tel:112"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "8px",
                color: "#f87171",
              }}
            >
              <Phone size={18} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>National Emergency</div>
                <div style={{ fontSize: "15px", fontWeight: "800" }}>Dial 112</div>
              </div>
            </a>
            <a
              href="tel:108"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: "8px",
                color: "#60a5fa",
              }}
            >
              <HeartPulse size={18} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Ambulance Dispatch</div>
                <div style={{ fontSize: "15px", fontWeight: "800" }}>Dial 108</div>
              </div>
            </a>
            <a
              href="tel:101"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.25)",
                borderRadius: "8px",
                color: "#fb923c",
              }}
            >
              <Flame size={18} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Fire & Rescue</div>
                <div style={{ fontSize: "15px", fontWeight: "800" }}>Dial 101</div>
              </div>
            </a>
          </div>

          {/* Main Selection & Confirmation Card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Step 1: Select Category */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                1. Select Emergency Type
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                {SOS_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.type === cat.type;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setStep("SELECT");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px",
                        background: isSelected ? `${cat.color}18` : "var(--bg-secondary)",
                        border: `2px solid ${isSelected ? cat.color : "var(--border-secondary)"}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          background: `${cat.color}25`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} color={cat.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: isSelected ? "#fff" : "var(--text-primary)" }}>
                          {cat.label}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cat.defaultDescription}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Location Telemetry */}
            <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  2. Incident Scene Location (GPS)
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--accent-blue-bright)",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <RefreshCw size={11} className={locating ? "animate-spin" : ""} />
                  {locating ? "Acquiring GPS..." : "Re-detect GPS"}
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              >
                <MapPin size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter landmark, road, or city..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
                {coords && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      color: "#4ade80",
                      background: "rgba(34,197,94,0.1)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      flexShrink: 0,
                    }}
                  >
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                )}
              </div>
              
              <div style={{ marginTop: "12px", height: "300px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
                <MapWrapper 
                  latitude={coords?.lat || 23.0225} 
                  longitude={coords?.lng || 72.5714} 
                  onChange={(lat, lng) => setCoords({ lat, lng })}
                />
              </div>

              {locError && <div style={{ fontSize: "11px", color: "#f87171", marginTop: "4px" }}>⚠️ {locError}</div>}
            </div>

            {/* Step 3: Optional Contact & Scene Notes */}
            <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "18px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                3. Additional Details (Optional)
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "8px", padding: "8px 12px" }}>
                  <User size={15} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "12px", outline: "none", width: "100%" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "8px", padding: "8px 12px" }}>
                  <Phone size={15} color="var(--text-muted)" />
                  <input
                    type="tel"
                    placeholder="Contact Phone (optional)"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "12px", outline: "none", width: "100%" }}
                  />
                </div>
              </div>

              <textarea
                placeholder="Specific situation details (e.g. 3 people trapped on 2nd floor, smoke visible, need oxygen)..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div style={{ padding: "12px", background: "#7f1d1d", border: "1px solid #b91c1c", borderRadius: "8px", color: "#fecaca", fontSize: "12px" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Confirmation Protection Step */}
            {step === "CONFIRM" ? (
              <div
                className="animate-slide-in"
                style={{
                  background: "linear-gradient(135deg, #450a0a, #1f2937)",
                  border: "2px solid #ef4444",
                  borderRadius: "10px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#f87171", fontSize: "15px", fontWeight: "800" }}>
                  <AlertTriangle size={20} />
                  CONFIRM EMERGENCY ACTIVATION
                </div>
                <p style={{ fontSize: "12px", color: "#fca5a5" }}>
                  Are you sure you want to broadcast a <strong>CRITICAL {selectedCategory.label.toUpperCase()}</strong> beacon at{" "}
                  <strong>{locationName}</strong>? False alarms impact genuine life-saving operations.
                </p>

                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => setStep("SELECT")}
                    style={{
                      padding: "10px 20px",
                      background: "transparent",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "6px",
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleActivateSOS}
                    style={{
                      padding: "10px 28px",
                      background: "#dc2626",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 0 15px rgba(220,38,38,0.5)",
                    }}
                  >
                    <Radio size={16} />
                    YES — ACTIVATE SOS NOW
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep("CONFIRM")}
                disabled={step === "ACTIVATING"}
                className="animate-glow-pulse"
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  border: "2px solid #ef4444",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "900",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.15s",
                }}
              >
                {step === "ACTIVATING" ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    BROADCASTING CRITICAL BEACON...
                  </>
                ) : (
                  <>
                    <Radio size={22} />
                    ACTIVATE EMERGENCY SOS BEACON
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
