"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import {
  Mic, Phone, Bot, MapPin, Zap, Radio,
  Volume2, CheckCircle, Sparkles,
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
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(48).fill(12));

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

    waveTimerRef.current = setInterval(() => {
      setWaveHeights(Array(48).fill(0).map(() => Math.floor(Math.random() * 80) + 10));
    }, 80);

    timerRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.round((currentStep / totalSteps) * 100);
      setCallProgress(progress);
      const charCount = Math.floor((progress / 100) * scen.transcript.length);
      setTypedTranscript(scen.transcript.slice(0, charCount));
      setAiConfidence(Math.min(98, Math.round(progress * 0.98)));

      if (currentStep >= totalSteps) {
        clearInterval(timerRef.current!);
        clearInterval(waveTimerRef.current!);
        setIsPlaying(false);
        setCallProgress(100);
        setTypedTranscript(scen.transcript);
        setAiConfidence(98);
        setWaveHeights(Array(48).fill(8));
      }
    }, stepDuration);
  };

  useEffect(() => {
    return () => {
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
          description: `[AI Voice Intake: ${activeScenario.langLabel}] ${ext.summary}`,
          type: ext.type,
          severity: ext.severity,
          source: "VOICE_DISPATCH",
          locationName: ext.locationName,
          latitude: ext.latitude,
          longitude: ext.longitude,
          affectedCount: ext.affectedCount,
          injuryCount: ext.injuryCount,
          hazards: ext.hazards,
          requiredCapabilities: ext.requiredCapabilities,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.id) {
        router.push(`/dispatch?incidentId=${json.data.id}`);
      } else {
        router.push("/incidents");
      }
    } catch {
      router.push("/incidents");
    } finally {
      setCreating(false);
    }
  };

  const ext = activeScenario.extracted;
  const isComplete = callProgress >= 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderLeft: "4px solid #3b82f6",
        borderRadius: "14px",
        padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "20px", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px",
          }}>📡</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
                VoiceDispatch AI Studio
              </h1>
              <span style={{
                background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)",
                color: "#c084fc", fontSize: "11px", fontWeight: "800",
                padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>MULTILINGUAL ASR</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, maxWidth: "600px", lineHeight: 1.6 }}>
              Autonomous emergency audio ingest, real-time vernacular NLP extraction, and 1-click dispatch escalation.
            </p>
          </div>
        </div>

        <button
          onClick={() => startCallSimulation(activeScenario)}
          disabled={isPlaying}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 24px",
            background: isPlaying
              ? "rgba(59,130,246,0.2)"
              : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            border: isPlaying ? "1px solid rgba(59,130,246,0.4)" : "none",
            borderRadius: "10px", color: "#fff",
            fontWeight: "700", fontSize: "15px", cursor: isPlaying ? "not-allowed" : "pointer",
            boxShadow: isPlaying ? "none" : "0 6px 24px rgba(37,99,235,0.45)",
            transition: "all 0.2s", flexShrink: 0,
            opacity: isPlaying ? 0.8 : 1,
          }}
        >
          <Mic size={18} style={{ animation: isPlaying ? "pulse 1s infinite" : "none" }} />
          {isPlaying ? "Stream In Progress..." : "Simulate Live Call"}
        </button>
      </div>

      {/* ── SCENARIO SELECTOR ── */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-primary)",
        borderRadius: "14px", padding: "24px 28px",
      }}>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
            Incoming Call Scenarios
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            Select an emergency call to simulate real-time multilingual audio ingest and AI field extraction.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {PRESET_SCENARIOS.map((scen) => {
            const isActive = activeScenario.id === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => startCallSimulation(scen)}
                style={{
                  padding: "22px", textAlign: "left", borderRadius: "12px",
                  border: `2px solid ${isActive ? "rgba(139,92,246,0.7)" : "var(--border-primary)"}`,
                  background: isActive ? "rgba(139,92,246,0.08)" : "var(--bg-secondary)",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: isActive ? "0 0 20px rgba(139,92,246,0.2)" : "none",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px", lineHeight: 1 }}>{scen.emoji}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: isActive ? "#c084fc" : "var(--text-primary)", marginBottom: "8px" }}>
                  {scen.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: "12px", fontWeight: "700",
                    color: isActive ? "#a78bfa" : "var(--text-muted)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    🌐 {scen.langLabel}
                  </span>
                  <span style={{
                    fontSize: "12px", fontWeight: "700",
                    color: "var(--text-muted)", background: "var(--bg-card)",
                    padding: "3px 10px", borderRadius: "6px",
                    border: "1px solid var(--border-primary)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    ⏱ {scen.audioDuration}s
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONSOLE: AUDIO + AI EXTRACTION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* LEFT: Audio Stream Panel */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-primary)",
          borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "22px",
        }}>
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Phone size={18} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Incoming Audio Stream</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Real-time speech ingest pipeline</div>
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
              fontWeight: "800", letterSpacing: "1px",
              fontFamily: "'JetBrains Mono', monospace",
              background: isPlaying ? "rgba(74,222,128,0.12)" : isComplete ? "rgba(59,130,246,0.12)" : "var(--bg-secondary)",
              border: `1px solid ${isPlaying ? "rgba(74,222,128,0.4)" : isComplete ? "rgba(59,130,246,0.4)" : "var(--border-primary)"}`,
              color: isPlaying ? "#4ade80" : isComplete ? "#60a5fa" : "var(--text-muted)",
              animation: isPlaying ? "pulse 2s infinite" : "none",
            }}>
              {isPlaying ? "● STREAMING" : isComplete ? "✓ COMPLETED" : "◯ STANDBY"}
            </div>
          </div>

          {/* Caller Info Card */}
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "16px 20px", background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)", borderRadius: "10px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Phone size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                {activeScenario.caller}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                Language: <strong style={{ color: "#c084fc" }}>{activeScenario.langLabel}</strong> ({activeScenario.language})
              </div>
            </div>
          </div>

          {/* Waveform Visualizer */}
          <div style={{
            height: "110px", background: "rgba(0,0,0,0.35)",
            borderRadius: "12px", border: "1px solid var(--border-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "3px", padding: "0 16px", overflow: "hidden",
          }}>
            {waveHeights.map((h, i) => (
              <div
                key={i}
                style={{
                  width: "4px", height: `${h}%`, borderRadius: "3px", flexShrink: 0,
                  transition: "height 0.08s ease-out",
                  background: isPlaying
                    ? `hsl(${210 + i * 3}, 85%, ${45 + h * 0.25}%)`
                    : "rgba(255,255,255,0.08)",
                  boxShadow: isPlaying ? `0 0 8px hsl(${210 + i * 3}, 85%, 55%)` : "none",
                }}
              />
            ))}
          </div>

          {/* Progress */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>
                <Volume2 size={14} /> Speech Ingest Processing
              </div>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>
                {callProgress}%
              </span>
            </div>
            <div style={{ height: "8px", background: "rgba(0,0,0,0.4)", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-primary)" }}>
              <div
                style={{
                  width: `${callProgress}%`, height: "100%", borderRadius: "6px",
                  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                  transition: "width 0.15s ease",
                  boxShadow: callProgress > 0 ? "0 0 12px rgba(124,58,237,0.6)" : "none",
                }}
              />
            </div>
          </div>

          {/* Live Transcript */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              <Radio size={13} color="#a78bfa" /> Real-Time Transcription
            </div>
            <div style={{
              padding: "16px", background: "rgba(0,0,0,0.35)",
              borderRadius: "10px", border: "1px solid var(--border-primary)",
              minHeight: "130px", fontSize: "14px", color: "var(--text-primary)",
              fontFamily: "'JetBrains Mono', monospace", lineHeight: "1.7",
            }}>
              {typedTranscript || (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Listening for emergency audio input stream...
                </span>
              )}
              {isPlaying && (
                <span style={{
                  display: "inline-block", width: "2px", height: "18px",
                  background: "#a78bfa", marginLeft: "6px", verticalAlign: "middle",
                  animation: "pulse 1s infinite",
                }} />
              )}
            </div>
          </div>

          {/* Audio tech footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", fontSize: "12px",
            color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace",
            paddingTop: "14px", borderTop: "1px solid var(--border-primary)",
          }}>
            <span>Codec: OPUS 48kHz HD</span>
            <span>Latency: 72ms</span>
            <span>Duration: {activeScenario.audioDuration}s</span>
          </div>
        </div>

        {/* RIGHT: AI Extraction Panel */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-primary)",
          borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
        }}>
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={18} color="#a78bfa" />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>AI Incident Extraction</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>NLP entity & field extraction engine</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "30px", fontWeight: "900", color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {aiConfidence}%
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "2px" }}>
                AI Confidence
              </div>
            </div>
          </div>

          {/* Extracted incident title */}
          <div style={{
            padding: "18px", background: "rgba(168,85,247,0.07)",
            border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
              Extracted CAD Incident
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <span style={{ fontSize: "32px", flexShrink: 0, lineHeight: 1 }}>
                {INCIDENT_TYPE_ICONS[ext.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}
              </span>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.4 }}>
                {ext.title}
              </div>
            </div>
          </div>

          {/* Key metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            {[
              { label: "Type", value: ext.type.replace(/_/g, " "), color: "#60a5fa" },
              { label: "Severity", isComponent: true },
              { label: "Affected / Injured", value: `${ext.affectedCount} / ${ext.injuryCount}`, color: "#f87171" },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "14px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "10px", textAlign: "center",
              }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", fontWeight: "700" }}>
                  {item.label}
                </div>
                {item.isComponent ? (
                  <Badge variant={ext.severity as any} dot pulse={ext.severity === "CRITICAL"} />
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: "800", color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Location */}
          <div style={{
            padding: "16px 18px", background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)", borderRadius: "10px",
            display: "flex", flexDirection: "column", gap: "6px",
          }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
              Geocoded Location
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              <MapPin size={16} color="#60a5fa" /> {ext.locationName}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
              {ext.latitude.toFixed(4)}°N, {ext.longitude.toFixed(4)}°E
            </div>
          </div>

          {/* Hazards & Capabilities */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                ⚠️ Hazards
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {ext.hazards.map((h, i) => (
                  <span key={i} style={{
                    fontSize: "12px", background: "rgba(239,68,68,0.1)",
                    color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)",
                    padding: "4px 10px", borderRadius: "6px",
                  }}>{h}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                🎯 Capabilities
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {ext.requiredCapabilities.map((c, i) => (
                  <span key={i} style={{
                    fontSize: "12px", background: "rgba(59,130,246,0.1)",
                    color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)",
                    padding: "4px 10px", borderRadius: "6px",
                  }}>{c}</span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div style={{
            padding: "16px 18px", background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.25)", borderRadius: "10px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <Sparkles size={13} /> AI Situation Summary
            </div>
            <div style={{ fontSize: "14px", color: "#e9d5ff", lineHeight: "1.65" }}>{ext.summary}</div>
          </div>

          {/* Dispatch CTA */}
          <button
            onClick={handleDispatchIncident}
            disabled={creating || callProgress < 50}
            style={{
              width: "100%", padding: "16px",
              background: creating || callProgress < 50
                ? "rgba(37,99,235,0.2)"
                : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              border: creating || callProgress < 50 ? "1px solid rgba(37,99,235,0.3)" : "none",
              borderRadius: "12px", color: "#fff",
              fontWeight: "800", fontSize: "16px", cursor: creating || callProgress < 50 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: creating || callProgress < 50 ? "none" : "0 8px 30px rgba(37,99,235,0.5)",
              transition: "all 0.2s",
              opacity: creating || callProgress < 50 ? 0.6 : 1,
            }}
          >
            {creating ? (
              <>Registering Incident & Opening Dispatch Studio...</>
            ) : isComplete ? (
              <><CheckCircle size={20} /> Authorize Incident & Match Responders →</>
            ) : (
              <><Zap size={20} /> {callProgress < 50 ? `Processing Audio... ${callProgress}%` : "Authorize & Launch Dispatch →"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
