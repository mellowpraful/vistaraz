"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Mic,
  Phone,
  Bot,
  MapPin,
  AlertTriangle,
  Zap,
  Users,
  Radio,
  Volume2,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  emoji: string;
  language: string;
  langLabel: string;
  caller: string;
  transcript: string;
  audioDuration: number;
  extracted: {
    title: string;
    type: string;
    severity: string;
    locationName: string;
    latitude: number;
    longitude: number;
    affectedCount: number;
    injuryCount: number;
    hazards: string[];
    requiredCapabilities: string[];
    summary: string;
  };
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "scen-1",
    title: "Sabarmati Flash Flood",
    emoji: "🌊",
    language: "gu-IN",
    langLabel: "Gujarati",
    caller: "+91 98250 XXXXX — Usmanpura Citizen",
    transcript:
      "હેલો કંટ્રોલ રૂમ! સાબરમતી નદીનું પાણી ઉસ્માનપુરા રિવરફ્રન્ટ પાસે ઘૂસી ગયું છે. 30 થી વધુ લોકો એક બિલ્ડિંગની છત પર ફસાયેલા છે! બે વૃદ્ધ લોકોને ઈજા થઈ છે અને પાણી ઝડપથી વધી રહ્યું છે. તાત્કાલિક બોટ અને રેસ્ક્યુ ટીમ મોકલો!",
    audioDuration: 12,
    extracted: {
      title: "Flash Flood & Stranded Civilians - Usmanpura Riverfront",
      type: "FLOOD",
      severity: "CRITICAL",
      locationName: "Usmanpura Riverfront, Ahmedabad",
      latitude: 23.0456,
      longitude: 72.5721,
      affectedCount: 30,
      injuryCount: 2,
      hazards: ["Fast Rising Water", "Submerged Electrical Lines", "Structural Collapse Risk"],
      requiredCapabilities: ["Water Rescue", "Inflatable Boat", "Triage Paramedic", "Evacuation"],
      summary:
        "30 civilians trapped on rooftop due to surging floodwaters near Usmanpura. 2 injured elderly reported. Urgent inflatable rescue boats required.",
    },
  },
  {
    id: "scen-2",
    title: "Vatva GIDC Chemical Blast",
    emoji: "☣️",
    language: "hi-IN",
    langLabel: "Hindi",
    caller: "+91 94280 XXXXX — Plant Supervisor",
    transcript:
      "इमरजेंसी! वटवा GIDC फेज़ 4 में केमिकल रिएक्टर में भीषण ब्लास्ट हुआ है। जहरीली क्लोरीन गैस का रिसाव हो रहा है और आसपास की फैक्ट्री में आग फैल रही है। 15 वर्कर्स अंदर फंसे हैं और सांस लेने में दिक्कत हो रही है। तुरंत हैज़मैट और एडवांस एम्बुलेंस भेजिए!",
    audioDuration: 14,
    extracted: {
      title: "Chemical Reactor Explosion & Chlorine Gas Leak - Vatva GIDC",
      type: "HAZMAT",
      severity: "CRITICAL",
      locationName: "Vatva GIDC Phase IV, Ahmedabad",
      latitude: 22.9567,
      longitude: 72.6342,
      affectedCount: 45,
      injuryCount: 15,
      hazards: ["Toxic Chlorine Cloud", "Secondary Explosion Risk", "Corrosive Chemical Spill"],
      requiredCapabilities: ["Hazmat Containment", "Chemical Suits Level A", "Advanced Life Support", "Heavy Foam Pumper"],
      summary:
        "Chemical reactor exploded releasing toxic chlorine gas cloud in industrial zone. 15 workers suffering acute respiratory distress. Hazmat containment and heavy foam suppression needed.",
    },
  },
  {
    id: "scen-3",
    title: "SG Highway Mass Casualty",
    emoji: "🚗",
    language: "en-IN",
    langLabel: "English",
    caller: "+91 99090 XXXXX — Highway Patrol 04",
    transcript:
      "Control, this is Highway Patrol 04. We have a severe 5-vehicle pileup under the Iskcon Flyover on SG Highway. A commercial tanker collided with two sedans and a passenger bus. At least 8 trapped passengers with severe trauma injuries. Traffic is blocked in both directions.",
    audioDuration: 10,
    extracted: {
      title: "Multi-Vehicle Mass Casualty Collision - Iskcon Flyover SG Highway",
      type: "ROAD_ACCIDENT",
      severity: "HIGH",
      locationName: "SG Highway under Iskcon Flyover, Ahmedabad",
      latitude: 23.0289,
      longitude: 72.5067,
      affectedCount: 22,
      injuryCount: 8,
      hazards: ["Fuel Leakage", "Trapped In Occupants", "Highway Gridlock"],
      requiredCapabilities: ["Hydraulic Cutters / Extrication", "Trauma Ambulance", "Traffic Control", "Heavy Towing Crane"],
      summary:
        "Major 5-vehicle crash involving bus and tanker on SG Highway. 8 injured with hydraulic extrication required. Heavy traffic block.",
    },
  },
];

export default function VoiceDispatchPage() {
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [callProgress, setCallProgress] = useState(0);
  const [typedTranscript, setTypedTranscript] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [creating, setCreating] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(36).fill(8));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCallSimulation = (scen: Scenario) => {
    setActiveScenario(scen);
    setIsPlaying(true);
    setCallProgress(0);
    setTypedTranscript("");
    setAiConfidence(0);

    if (timerRef.current) clearInterval(timerRef.current);
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);

    const totalSteps = 40;
    const stepDuration = (scen.audioDuration * 1000) / totalSteps;
    let currentStep = 0;

    timerRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setCallProgress(progress);
      const charIndex = Math.round((progress / 100) * scen.transcript.length);
      setTypedTranscript(scen.transcript.slice(0, charIndex));
      setAiConfidence(Math.min(96, Math.round(progress * 0.96)));

      if (currentStep >= totalSteps) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        if (waveTimerRef.current) clearInterval(waveTimerRef.current);
        setWaveHeights(Array(36).fill(4));
      }
    }, stepDuration);

    // Animate waveform
    waveTimerRef.current = setInterval(() => {
      setWaveHeights(
        Array(36)
          .fill(0)
          .map((_, i) => Math.max(4, Math.abs(Math.sin((i + Date.now() / 200) * 0.7)) * 70 + Math.random() * 30))
      );
    }, 100);
  };

  useEffect(() => {
    const initTimer = setTimeout(() => {
      startCallSimulation(PRESET_SCENARIOS[0]);
    }, 0);
    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, []);

  const handleDispatchIncident = async () => {
    setCreating(true);
    try {
      const ext = activeScenario.extracted;
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ext.title,
          description: ext.summary,
          type: ext.type,
          severity: ext.severity,
          source: "EMERGENCY_CALL",
          locationName: ext.locationName,
          latitude: ext.latitude,
          longitude: ext.longitude,
          affectedCount: ext.affectedCount,
          injuryCount: ext.injuryCount,
          hazards: ext.hazards,
          requiredCapabilities: ext.requiredCapabilities,
          originalReport: activeScenario.transcript,
          language: activeScenario.language,
          aiExtracted: true,
          confidence: aiConfidence / 100,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        router.push(`/dispatch?incidentId=${json.data.id}`);
      }
    } catch (err) {
      console.error("Failed to register incident:", err);
    } finally {
      setCreating(false);
    }
  };

  const ext = activeScenario.extracted;
  const isComplete = callProgress >= 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Mic size={20} color="#3b82f6" />
            VoiceDispatch 911 Console
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Multilingual emergency speech stream processing with real-time AI entity extraction and triage automation
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "20px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", animation: "live-pulse 1s infinite" }} />
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#f87171", letterSpacing: "1px" }}>LIVE TELECOM INTAKE</span>
          </div>
        </div>
      </div>

      {/* ── Scenario Selector ─────────────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
          Simulate Incoming Emergency Call
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {PRESET_SCENARIOS.map((scen) => {
            const isActive = activeScenario.id === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => startCallSimulation(scen)}
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderRadius: "8px",
                  border: `1px solid ${isActive ? "#6b21a8" : "var(--border-primary)"}`,
                  background: isActive ? "#1a0b2e" : "var(--bg-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-secondary)"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-primary)"; }}
              >
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>{scen.emoji}</div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: isActive ? "#e9d5ff" : "var(--text-primary)", marginBottom: "4px" }}>{scen.title}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "10px", color: isActive ? "#c084fc" : "var(--text-muted)", fontWeight: "600" }}>{scen.langLabel}</span>
                  <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{scen.audioDuration}s</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main 2-Column Console ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* LEFT: Audio Stream Panel */}
        <Card style={{ borderColor: "#1d4ed820" }}>
          <CardHeader>
            <CardTitle>
              <Phone size={14} color="#60a5fa" />
              Incoming Audio Stream
            </CardTitle>
            <div style={{
              padding: "3px 10px", borderRadius: "4px",
              background: isPlaying ? "#052e16" : "#111827",
              border: `1px solid ${isPlaying ? "#14532d" : "var(--border-primary)"}`,
              color: isPlaying ? "#4ade80" : "var(--text-muted)",
              fontSize: "9px", fontWeight: "700", letterSpacing: "1px",
              animation: isPlaying ? "pulse-critical 2s ease-in-out infinite" : undefined,
            }}>
              {isPlaying ? "STREAMING LIVE" : isComplete ? "CALL COMPLETED" : "STANDBY"}
            </div>
          </CardHeader>

          <CardContent style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Caller info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-primary)" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1e3a5f", border: "1px solid #1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Phone size={14} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-primary)" }}>{activeScenario.caller}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>Lang: {activeScenario.langLabel} · {activeScenario.language}</div>
              </div>
            </div>

            {/* Waveform Visualizer */}
            <div
              style={{
                height: "80px",
                background: "#050810",
                borderRadius: "8px",
                border: "1px solid var(--border-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "8px 12px",
                overflow: "hidden",
              }}
            >
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "3px",
                    height: `${h}%`,
                    borderRadius: "2px",
                    flexShrink: 0,
                    transition: "height 0.1s ease-out",
                    background: isPlaying
                      ? `hsl(${220 + i * 3}, 80%, ${50 + h * 0.3}%)`
                      : "var(--border-secondary)",
                    boxShadow: isPlaying ? `0 0 4px hsl(${220 + i * 3}, 80%, 50%)` : "none",
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Volume2 size={10} /> Speech Processing
                </div>
                <span>{callProgress}%</span>
              </div>
              <div style={{ height: "4px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${callProgress}%`,
                    background: "linear-gradient(90deg, #3b82f6, #c084fc)",
                    borderRadius: "2px",
                    transition: "width 0.15s ease-out",
                  }}
                />
              </div>
            </div>

            {/* Live Transcript */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                <Radio size={10} /> Real-Time Speech-to-Text
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#050810",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "8px",
                  minHeight: "100px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: "1.6",
                }}
              >
                {typedTranscript || (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Listening for emergency audio input...</span>
                )}
                {isPlaying && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "14px",
                      background: "#c084fc",
                      marginLeft: "2px",
                      verticalAlign: "middle",
                      animation: "pulse-critical 0.7s ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Audio metadata */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", borderTop: "1px solid var(--border-primary)", paddingTop: "10px" }}>
              <span>Codec: OPUS 48kHz HD</span>
              <span>Latency: 84ms</span>
              <span>Duration: {activeScenario.audioDuration}s</span>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: AI Extraction Panel */}
        <Card style={{ borderColor: "#6b21a820" }}>
          <CardHeader>
            <CardTitle>
              <Bot size={14} color="#c084fc" />
              AI Incident Extraction
            </CardTitle>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#c084fc", letterSpacing: "-0.5px", lineHeight: "1" }}>
                {aiConfidence}%
              </div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "600" }}>AI CONFIDENCE</div>
            </div>
          </CardHeader>

          <CardContent style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Confidence bar */}
            <div style={{ height: "3px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${aiConfidence}%`, background: "linear-gradient(90deg, #7c3aed, #c084fc)", borderRadius: "2px", transition: "width 0.3s ease-out" }} />
            </div>

            {/* Extracted incident title */}
            <div style={{ padding: "12px", background: "var(--bg-secondary)", border: "1px solid #6b21a820", borderRadius: "8px" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Extracted Incident</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>
                  {INCIDENT_TYPE_ICONS[ext.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
                </span>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.4" }}>{ext.title}</div>
              </div>
            </div>

            {/* Key metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Type</div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa", background: "#1e3a5f", border: "1px solid #1d4ed8", padding: "2px 8px", borderRadius: "4px" }}>
                  {ext.type.replace(/_/g, " ")}
                </span>
              </div>
              <div style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Severity</div>
                <Badge variant={ext.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"} dot pulse={ext.severity === "CRITICAL"}>
                  {ext.severity}
                </Badge>
              </div>
              <div style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Casualties</div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#f87171" }}>{ext.affectedCount} / {ext.injuryCount}inj</div>
              </div>
            </div>

            {/* Location */}
            <div style={{ padding: "10px 12px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-primary)" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Geocoded Location</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", fontWeight: "600" }}>
                <MapPin size={12} color="#60a5fa" /> {ext.locationName}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: "3px" }}>
                GPS: {ext.latitude}°N, {ext.longitude}°E
              </div>
            </div>

            {/* Hazards */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#f87171", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                ⚠️ Environmental Hazards
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {ext.hazards.map((h, i) => (
                  <span key={i} style={{ fontSize: "10px", background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", padding: "2px 8px", borderRadius: "4px" }}>{h}</span>
                ))}
              </div>
            </div>

            {/* Required Capabilities */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                🎯 Required Capabilities
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {ext.requiredCapabilities.map((c, i) => (
                  <span key={i} style={{ fontSize: "10px", background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1d4ed8", padding: "2px 8px", borderRadius: "4px" }}>{c}</span>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div style={{ padding: "10px 12px", background: "#1a0b2e", borderRadius: "6px", border: "1px solid #581c87" }}>
              <div style={{ fontSize: "10px", color: "#c084fc", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                <Bot size={10} /> AI Situation Summary
              </div>
              <div style={{ fontSize: "12px", color: "#e9d5ff", lineHeight: "1.5" }}>{ext.summary}</div>
            </div>

            {/* Dispatch CTA */}
            <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "12px" }}>
              <button
                onClick={handleDispatchIncident}
                disabled={creating || callProgress < 50}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: creating ? "#1d4ed8" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: creating || callProgress < 50 ? "not-allowed" : "pointer",
                  opacity: callProgress < 50 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: callProgress >= 50 ? "0 4px 20px rgba(37,99,235,0.4)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {creating ? (
                  <>Registering Incident & Opening Dispatch...</>
                ) : isComplete ? (
                  <><CheckCircle size={16} /> Authorize Incident & Match Responders</>
                ) : (
                  <><Zap size={16} /> {callProgress < 50 ? `Processing... ${callProgress}%` : "Authorize & Dispatch"}</>
                )}
              </button>
              {callProgress >= 50 && !isComplete && (
                <div style={{ textAlign: "center", fontSize: "10px", color: "var(--text-muted)", marginTop: "6px" }}>
                  You can authorize dispatch early — AI extraction is {aiConfidence}% complete
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
