"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";

interface Scenario {
  id: string;
  title: string;
  language: string;
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
    title: "🌊 Sabarmati Flash Flood Emergency (Gujarati/Hindi)",
    language: "gu-IN",
    caller: "+91 98250 XXXXX (Citizen, Usmanpura)",
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
      summary: "30 civilians trapped on rooftop due to surging floodwaters near Usmanpura. 2 injured elderly reported. Urgent inflatable rescue boats required.",
    },
  },
  {
    id: "scen-2",
    title: "☣️ Vatva GIDC Chemical Reactor Explosion (Hindi)",
    language: "hi-IN",
    caller: "+91 94280 XXXXX (Plant Supervisor)",
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
      summary: "Chemical reactor exploded releasing toxic chlorine gas cloud in industrial zone. 15 workers suffering acute respiratory distress. Hazmat containment and heavy foam suppression needed.",
    },
  },
  {
    id: "scen-3",
    title: "🚗 SG Highway Multi-Vehicle Pileup (English)",
    language: "en-IN",
    caller: "+91 99090 XXXXX (Highway Patrol)",
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
      summary: "Major 5-vehicle crash involving bus and tanker on SG Highway. 8 injured with hydraulic extrication required. Heavy traffic block.",
    },
  },
];

export default function VoiceDispatchPage() {
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [callProgress, setCallProgress] = useState(0); // 0 to 100
  const [typedTranscript, setTypedTranscript] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [creating, setCreating] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCallSimulation = (scen: Scenario) => {
    setActiveScenario(scen);
    setIsPlaying(true);
    setCallProgress(0);
    setTypedTranscript("");
    setAiConfidence(0);

    if (timerRef.current) clearInterval(timerRef.current);

    const totalSteps = 40;
    const stepDuration = (scen.audioDuration * 1000) / totalSteps;
    let currentStep = 0;

    timerRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setCallProgress(progress);

      // Typing effect
      const charIndex = Math.round((progress / 100) * scen.transcript.length);
      setTypedTranscript(scen.transcript.slice(0, charIndex));

      // AI confidence ramp
      setAiConfidence(Math.min(96, Math.round(progress * 0.96)));

      if (currentStep >= totalSteps) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
      }
    }, stepDuration);
  };

  useEffect(() => {
    startCallSimulation(PRESET_SCENARIOS[0]);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>🎙️</span> VoiceDispatch 911 / Citizen Voice Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multilingual emergency speech stream processing with real-time AI entity extraction and triage automation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-critical text-xs px-3 py-1 rounded-full font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            LIVE TELECOM INTAKE
          </span>
        </div>
      </div>

      {/* Scenario Selector Bar */}
      <div className="card p-4 space-y-2 bg-slate-900 border-slate-800">
        <span className="text-xs font-bold uppercase font-mono text-slate-400">
          Simulate Incoming Emergency Call:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {PRESET_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => startCallSimulation(scen)}
              className={`p-3 text-left rounded-lg border transition-all text-xs space-y-1 ${
                activeScenario.id === scen.id
                  ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="font-bold text-slate-200">{scen.title}</div>
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>🗣️ {scen.language}</span>
                <span className="font-mono text-slate-500">{scen.caller}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Audio Stream Left vs AI Structured Extraction Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Live Audio Frequency & Speech Stream */}
        <div className="card p-6 space-y-5 border-slate-800 bg-slate-900/90 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📞</span>
                <div>
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Incoming Audio Stream
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeScenario.caller}</div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  isPlaying
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isPlaying ? "STREAMING (LIVE)" : "CALL COMPLETED"}
              </span>
            </div>

            {/* Oscillating Audio Waveform Canvas / Bars */}
            <div className="h-28 bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-center justify-center gap-1.5 overflow-hidden">
              {[...Array(32)].map((_, i) => {
                const height = isPlaying
                  ? Math.max(15, Math.sin((i + callProgress) * 0.5) * 80 + Math.random() * 20)
                  : 8;
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-1.5 rounded-full transition-all duration-100 ${
                      isPlaying
                        ? "bg-gradient-to-t from-blue-600 via-purple-500 to-red-400 shadow-sm shadow-purple-500/50"
                        : "bg-slate-800"
                    }`}
                  />
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Live Speech Processing</span>
                <span>{callProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${callProgress}%` }}
                  className="h-full bg-purple-500 transition-all duration-150"
                />
              </div>
            </div>

            {/* Live Typewriter Transcript */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Real-Time Speech-to-Text Stream:</span>
                <span className="font-mono text-purple-400">Lang: {activeScenario.language}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 min-h-[120px] text-sm text-slate-200 font-mono leading-relaxed">
                {typedTranscript || (
                  <span className="text-slate-600 italic">Listening for emergency audio input...</span>
                )}
                {isPlaying && <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse" />}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Audio Codec: OPUS 48kHz HD</span>
            <span>Latency: 84ms</span>
          </div>
        </div>

        {/* Right Column: AI Extraction & Triage Preview */}
        <div className="card p-6 space-y-5 border-purple-900/60 bg-slate-900/90 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Real-Time AI Incident Extraction
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-purple-400 font-mono">
                  {aiConfidence}% Confidence
                </div>
              </div>
            </div>

            {/* Extracted Structured Card */}
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Generated Incident Title</span>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{INCIDENT_TYPE_ICONS[activeScenario.extracted.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}</span>
                  {activeScenario.extracted.title}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Type</div>
                  <div className="text-xs font-bold text-blue-400 mt-0.5">{activeScenario.extracted.type}</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Severity</div>
                  <div className="text-xs font-bold text-red-400 mt-0.5">{activeScenario.extracted.severity}</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Casualties / Injured</div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {activeScenario.extracted.affectedCount} Aff / {activeScenario.extracted.injuryCount} Inj
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Geocoded Location</span>
                <div className="text-xs text-slate-200">📍 {activeScenario.extracted.locationName}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  GPS: {activeScenario.extracted.latitude}, {activeScenario.extracted.longitude}
                </div>
              </div>

              {/* Hazards Identified */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Flagged Environmental Hazards:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeScenario.extracted.hazards.map((h, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-950/70 text-red-300 border border-red-900 px-2 py-0.5 rounded"
                    >
                      ⚠️ {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capabilities needed */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Recommended Response Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeScenario.extracted.requiredCapabilities.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-950/70 text-blue-300 border border-blue-900 px-2 py-0.5 rounded"
                    >
                      🎯 {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Dispatch Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleDispatchIncident}
              disabled={creating || callProgress < 50}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {creating ? (
                "Registering Incident & Opening Dispatch..."
              ) : (
                <>
                  <span>🚨</span> Authorize Incident & Match Responders
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
