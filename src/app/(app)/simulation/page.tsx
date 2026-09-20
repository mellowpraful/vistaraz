"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity, Play, Pause, RotateCcw, FastForward, Rewind,
  Plus, ShieldCheck, AlertTriangle, Layers, BarChart2,
  CheckCircle, Compass, X, Lock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import type { SimulatedResourceState } from "@/app/api/simulation/route";

interface SimulationEvent {
  id: string;
  timeOffset: number;
  type: string;
  description: string;
  data: string | null;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  config: string | null;
  events: SimulationEvent[];
}

type TabId = "SIMULATION" | "FLEET_STATE" | "CASCADE_RISKS" | "COMPARISON";

const CASCADE_EVENTS = [
  {
    step: 1,
    title: "Monsoon Surge Cloudburst Initiation",
    desc: "Rainfall exceeds 110mm in 90 minutes. Sabarmati water gauge exceeds Danger Mark by 0.8m.",
    tag: "METEOROLOGICAL",
    color: "#60a5fa",
  },
  {
    step: 2,
    title: "Underpass Inundation & Traffic Arterial Severed",
    desc: "Akhbarnagar underpass submerged in 2.2m of water. 4 public transport buses stranded.",
    tag: "INFRASTRUCTURE",
    color: "#f97316",
  },
  {
    step: 3,
    title: "Civil Hospital Substation Power Trip",
    desc: "Emergency diesel generators activated. ICU life-support operating on secondary backup power.",
    tag: "CRITICAL_FACILITY",
    color: "#ef4444",
  },
  {
    step: 4,
    title: "Secondary Industrial Chemical Tank Seepage",
    desc: "Floodwaters breach chemical retention basin at Narol GIDC. Low-grade organic solvent leak detected.",
    tag: "HAZMAT_ESCALATION",
    color: "#a855f7",
  },
];

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("SIMULATION");

  const [metrics, setMetrics] = useState({
    affectedCount: 150, casualtyCount: 12,
    hospitalStrain: 35, roadsBlocked: 2, powerOutageZones: 1,
  });

  const [simulatedResources, setSimulatedResources] = useState<SimulatedResourceState[]>([
    { type: "Inflatable Rescue Boats", total: 6, available: 5, deployed: 1, exhaustedOrDamaged: 0 },
    { type: "ALS Ambulances", total: 10, available: 8, deployed: 2, exhaustedOrDamaged: 0 },
    { type: "Fire Suppression Engines", total: 8, available: 7, deployed: 1, exhaustedOrDamaged: 0 },
    { type: "Hazmat Containment Units", total: 3, available: 2, deployed: 1, exhaustedOrDamaged: 0 },
  ]);

  const [cascadeRisks, setCascadeRisks] = useState([
    { subsystem: "Urban Drainage & Sluice Gates", status: "SURGING", riskScore: 55, timeToBreach: "45 mins" },
    { subsystem: "Regional Grid Substations", status: "ELEVATED_RISK", riskScore: 42, timeToBreach: "70 mins" },
    { subsystem: "Hospital Emergency Trauma Surge", status: "STRETCHED", riskScore: 52, timeToBreach: "45 mins" },
  ]);

  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenName, setNewScenName] = useState("");
  const [newScenType, setNewScenType] = useState("FLOOD");
  const [newScenDesc, setNewScenDesc] = useState("");
  const [newWeather, setNewWeather] = useState("Severe Torrential Rain — 90mm/hr");
  const [newWind, setNewWind] = useState("SSW 22 km/h");
  const [creatingScen, setCreatingScen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/simulation");
      const json = await res.json();
      if (json.success && json.data) {
        setScenarios(json.data);
        if (json.data.length > 0) setSelectedScenario(json.data[0]);
      }
    } catch (err) {
      console.error("Failed to load scenarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScenarios(); }, [fetchScenarios]);

  const advanceStep = useCallback(async (targetStep: number) => {
    setCurrentStep(targetStep);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "STEP", step: targetStep, scenarioId: selectedScenario?.id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data.metrics);
        setSimulatedResources(json.data.simulatedResources);
        setCascadeRisks(json.data.cascadeRisks);
      }
    } catch (err) {
      console.error("Step advance error:", err);
    }
  }, [selectedScenario]);

  const fetchComparison = useCallback(async () => {
    setLoadingComparison(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPARE" }),
      });
      const json = await res.json();
      if (json.success && json.data) setComparisonData(json.data);
    } catch (err) {
      console.error("Failed to load comparison data:", err);
    } finally {
      setLoadingComparison(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "COMPARISON") fetchComparison();
  }, [activeTab, fetchComparison]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 6) { setIsPlaying(false); return prev; }
          const next = prev + 1;
          advanceStep(next);
          return next;
        });
      }, 3500 / playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, playSpeed, advanceStep]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
    setMetrics({ affectedCount: 150, casualtyCount: 12, hospitalStrain: 35, roadsBlocked: 2, powerOutageZones: 1 });
    setSimulatedResources([
      { type: "Inflatable Rescue Boats", total: 6, available: 5, deployed: 1, exhaustedOrDamaged: 0 },
      { type: "ALS Ambulances", total: 10, available: 8, deployed: 2, exhaustedOrDamaged: 0 },
      { type: "Fire Suppression Engines", total: 8, available: 7, deployed: 1, exhaustedOrDamaged: 0 },
      { type: "Hazmat Containment Units", total: 3, available: 2, deployed: 1, exhaustedOrDamaged: 0 },
    ]);
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenName.trim()) return;
    setCreatingScen(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE", name: newScenName, scenarioType: newScenType,
          description: newScenDesc || "User-configured disaster simulation sandbox",
          initialConditions: { weather: newWeather, wind: newWind, populationDensity: "High Urban Sector" },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setScenarios((prev) => [json.data, ...prev]);
        setSelectedScenario(json.data);
        handleReset();
        setShowCreateModal(false);
        setNewScenName(""); setNewScenDesc("");
      }
    } catch (err) {
      console.error("Failed to create scenario:", err);
    } finally {
      setCreatingScen(false);
    }
  };

  let initialConditions: Record<string, string> = {
    weather: "Monsoon squall line — 110mm/h",
    initialSurge: "+0.8m above danger mark",
    populationDensity: "High (3,200/km²)",
    wind: "SSW 14 km/h",
  };
  try {
    if (selectedScenario?.config) {
      initialConditions = { ...initialConditions, ...JSON.parse(selectedScenario.config) };
    }
  } catch {}

  const TABS: { id: TabId; icon: React.ReactNode; label: string }[] = [
    { id: "SIMULATION", icon: <Activity size={16} />, label: "Cascade Event Timeline" },
    { id: "FLEET_STATE", icon: <Layers size={16} />, label: "Fleet Degradation" },
    { id: "CASCADE_RISKS", icon: <AlertTriangle size={16} />, label: "Vulnerability Matrix" },
    { id: "COMPARISON", icon: <BarChart2 size={16} />, label: "Live vs Simulated" },
  ];

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
    borderRadius: "8px", color: "var(--text-primary)", fontSize: "14px",
    fontFamily: "inherit", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── PAGE HEADER ── */}
      <PageHeader
        title="Digital Twin Simulation & Stress Testing"
        description="Run multi-phase emergency scenarios, model cascade failures, evaluate resource readiness, and stress-test response workflows in an isolated sandbox."
        icon={Activity}
        iconColor="#a855f7"
      />

      {/* ── SANDBOX ISOLATION BANNER ── */}
      <div style={{
        background: "rgba(120,53,15,0.2)", border: "1px solid rgba(217,119,6,0.5)",
        borderLeft: "4px solid #f59e0b", borderRadius: "14px",
        padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "20px", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
            background: "rgba(120,53,15,0.4)", border: "1px solid rgba(217,119,6,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShieldCheck size={22} color="#fbbf24" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "5px" }}>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#fbbf24", letterSpacing: "0.3px" }}>
                Digital Twin Sandbox — Strict Isolation Active
              </span>
              <span style={{
                fontSize: "11px", fontWeight: "800", padding: "3px 10px",
                background: "rgba(120,53,15,0.6)", color: "#fde68a",
                border: "1px solid rgba(217,119,6,0.4)", borderRadius: "6px",
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px",
              }}>
                ZERO LIVE DB MUTATIONS
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(253,230,138,0.7)", margin: 0, lineHeight: 1.5 }}>
              All events, resource deployments, and casualties operate strictly in simulated memory. Production records remain untouched.
            </p>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(120,53,15,0.5)", border: "1px solid rgba(217,119,6,0.4)",
          padding: "10px 20px", borderRadius: "10px", flexShrink: 0,
        }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24", animation: "pulse 1.5s infinite", flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace" }}>
            SANDBOX TIMELINE: Hour +0{currentStep}:00
          </span>
        </div>
      </div>

      {/* ── SCENARIO CONTROL PANEL ── */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-primary)",
        borderRadius: "14px", padding: "24px 28px",
        display: "flex", flexDirection: "column", gap: "22px",
      }}>
        {/* Row 1: Scenario selector + controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          {/* Scenario dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>
              Active Scenario:
            </span>
            <select
              value={selectedScenario?.id || ""}
              onChange={(e) => {
                const scen = scenarios.find((s) => s.id === e.target.value);
                if (scen) { setSelectedScenario(scen); handleReset(); }
              }}
              style={{ ...inputStyle, maxWidth: "360px", cursor: "pointer" }}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.4)", borderRadius: "8px",
                color: "#c084fc", cursor: "pointer", fontSize: "14px", fontWeight: "700",
              }}
            >
              <Plus size={15} /> Create Scenario
            </button>
          </div>

          {/* Player Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Speed */}
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
              borderRadius: "8px", padding: "6px 8px",
            }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace", paddingRight: "4px" }}>Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  style={{
                    padding: "5px 12px", borderRadius: "6px", border: "none",
                    background: playSpeed === spd ? "#7c3aed" : "transparent",
                    color: playSpeed === spd ? "#fff" : "var(--text-muted)",
                    fontSize: "13px", fontWeight: "700", cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 0.15s",
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => { if (currentStep > 1) advanceStep(currentStep - 1); }}
              disabled={isPlaying || currentStep <= 1}
              style={{
                padding: "10px 14px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "8px",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px",
                opacity: (isPlaying || currentStep <= 1) ? 0.4 : 1,
              }}
              title="Step Backward"
            >
              <Rewind size={16} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 22px", borderRadius: "8px",
                background: isPlaying
                  ? "linear-gradient(135deg, #d97706, #f59e0b)"
                  : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "none", color: "#fff", fontWeight: "700", fontSize: "14px",
                cursor: "pointer", boxShadow: `0 4px 20px ${isPlaying ? "rgba(217,119,6,0.4)" : "rgba(124,58,237,0.4)"}`,
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "Pause" : "Run Simulation"}
            </button>

            <button
              onClick={() => { if (currentStep < 6) advanceStep(currentStep + 1); }}
              disabled={isPlaying || currentStep >= 6}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 16px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "8px",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px", fontWeight: "600",
                opacity: (isPlaying || currentStep >= 6) ? 0.4 : 1,
              }}
            >
              +1h <FastForward size={15} />
            </button>

            <button
              onClick={handleReset}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 16px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "8px",
                color: "var(--text-muted)", cursor: "pointer", fontSize: "14px", fontWeight: "600",
              }}
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        {/* Row 2: Initial Conditions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", paddingTop: "10px", borderTop: "1px solid var(--border-primary)" }}>
          {[
            { label: "WEATHER DYNAMICS", value: initialConditions.weather, color: "var(--text-primary)" },
            { label: "SURGE THRESHOLD", value: initialConditions.initialSurge || "+0.8m", color: "#fbbf24" },
            { label: "WIND CONE", value: initialConditions.wind || "14 km/h", color: "var(--text-primary)" },
            { label: "POPULATION DENSITY", value: initialConditions.populationDensity, color: "var(--text-primary)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: "14px 16px", background: "var(--bg-secondary)",
              borderRadius: "10px", border: "1px solid var(--border-primary)",
            }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                {label}
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color, fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Row 3: Timeline stepper */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>
            <span>Simulation Progression</span>
            <span style={{ color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: "800" }}>
              Hour +0{currentStep}:00 — Step {currentStep} of 6
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <button
                key={st}
                onClick={() => !isPlaying && advanceStep(st)}
                style={{
                  height: "10px", borderRadius: "6px",
                  background: st <= currentStep
                    ? "linear-gradient(90deg, #3b82f6, #7c3aed, #f59e0b)"
                    : "var(--bg-secondary)",
                  border: st === currentStep ? "none" : "1px solid var(--border-primary)",
                  cursor: isPlaying ? "default" : "pointer",
                  transition: "all 0.3s",
                  boxShadow: st <= currentStep ? "0 0 10px rgba(124,58,237,0.4)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── LIVE METRICS CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
        {[
          { label: "Simulated Affected", value: metrics.affectedCount, suffix: "", color: "var(--text-primary)", border: "var(--border-primary)", sub: `+${(currentStep - 1) * 120} vs t0` },
          { label: "Simulated Casualties", value: metrics.casualtyCount, suffix: "", color: "#f87171", border: "#ef4444", sub: "Acute Trauma" },
          { label: "Hospital Bed Strain", value: metrics.hospitalStrain, suffix: "%", color: "#fbbf24", border: "#f59e0b", sub: "Regional ICU" },
          { label: "Roads Submerged", value: metrics.roadsBlocked, suffix: " Arterials", color: "#c084fc", border: "#a855f7", sub: "Transit Severed" },
          { label: "Grid Blackouts", value: metrics.powerOutageZones, suffix: " Zones", color: "#60a5fa", border: "#3b82f6", sub: "Backup Power" },
        ].map(({ label, value, suffix, color, border, sub }) => (
          <div key={label} style={{
            padding: "20px", background: "var(--bg-card)",
            borderStyle: "solid", borderTopWidth: "1px", borderRightWidth: "1px",
            borderBottomWidth: "1px", borderLeftWidth: "4px",
            borderTopColor: "var(--border-primary)", borderRightColor: "var(--border-primary)",
            borderBottomColor: "var(--border-primary)", borderLeftColor: border,
            borderRadius: "12px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              {label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "900", color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
              {value}{suffix}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        borderBottom: "2px solid var(--border-primary)", paddingBottom: "0",
      }}>
        {TABS.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 20px", borderRadius: "10px 10px 0 0",
              border: activeTab === id ? "1px solid var(--border-primary)" : "1px solid transparent",
              borderBottom: activeTab === id ? "2px solid #7c3aed" : "2px solid transparent",
              background: activeTab === id ? "var(--bg-card)" : "transparent",
              color: activeTab === id ? "#c084fc" : "var(--text-muted)",
              fontWeight: "700", fontSize: "14px", cursor: "pointer",
              transition: "all 0.15s", marginBottom: "-2px",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── TAB: CASCADE TIMELINE ── */}
      {activeTab === "SIMULATION" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Event Log */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: "14px", padding: "24px",
            display: "flex", flexDirection: "column", gap: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} color="#a78bfa" /> Simulated Event Progression
              </h2>
              <span style={{
                fontSize: "12px", fontWeight: "800", color: "#a78bfa",
                background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
                padding: "4px 12px", borderRadius: "8px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {Math.min(4, currentStep)} Events Active
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {CASCADE_EVENTS.filter((ev) => ev.step <= currentStep).map((ev) => (
                <div key={ev.step} style={{
                  padding: "18px 20px", background: "var(--bg-secondary)",
                  borderRadius: "10px", border: `1px solid var(--border-primary)`,
                  borderLeft: `4px solid ${ev.color}`,
                  display: "flex", flexDirection: "column", gap: "8px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>{ev.title}</span>
                    <span style={{
                      fontSize: "12px", fontWeight: "800", color: "#60a5fa",
                      background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                      padding: "3px 10px", borderRadius: "6px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      Hour +0{ev.step}:00
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{ev.desc}</p>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: ev.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" }}>
                    {ev.tag}
                  </div>
                </div>
              ))}

              {CASCADE_EVENTS.filter((ev) => ev.step <= currentStep).length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                  Run the simulation to observe cascade events...
                </div>
              )}
            </div>
          </div>

          {/* Stress Analysis */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: "14px", padding: "24px",
            display: "flex", flexDirection: "column", gap: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#c084fc", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Compass size={18} /> Sandbox Stress Findings
              </h2>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                Monte Carlo Engine v2.4
              </span>
            </div>

            <div style={{
              padding: "18px", background: "var(--bg-secondary)",
              borderRadius: "10px", border: "1px solid var(--border-primary)",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Finding at Hour +0{currentStep}:00:
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0, lineHeight: 1.7 }}>
                {currentStep <= 2
                  ? "Initial response capacity is adequate. Inflatable boat fleet is sufficient for Sector 4 rescue operations, but water rise rate of 0.15m/hr will strain single-boat units by Hour +03."
                  : currentStep <= 4
                  ? "CRITICAL BOTTLENECK PROJECTED: ICU bed capacity in North Zone will reach exhaustion within 45 minutes if casualties continue at simulated rate. Recommend preemptively pre-alerting VS Hospital and pre-staging 50 field beds."
                  : "MAXIMUM SEVERITY BREACH: Multi-agency cross-district mutual aid required. Reserve boat fleets from Gandhinagar must be requested immediately."}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Prescribed Contingency Protocols:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)", text: "Re-route non-critical ambulance traffic away from Akhbarnagar underpass" },
                  { color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", text: "Pre-stage 3 high-capacity dewatering pump trucks at Narol Gate" },
                ].map(({ color, bg, border, text }, i) => (
                  <div key={i} style={{
                    padding: "14px 16px", background: bg, borderRadius: "10px",
                    border: `1px solid ${border}`,
                    display: "flex", alignItems: "flex-start", gap: "12px",
                  }}>
                    <CheckCircle size={18} color={color} style={{ flexShrink: 0, marginTop: "1px" }} />
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              paddingTop: "16px", borderTop: "1px solid var(--border-primary)",
              display: "flex", justifyContent: "space-between",
              fontSize: "12px", color: "var(--text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>Model State: Converged</span>
              <span>Sim ID: {selectedScenario?.id?.slice(0, 12) || "N/A"}...</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: FLEET STATE ── */}
      {activeTab === "FLEET_STATE" && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-primary)",
          borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px",
        }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Layers size={20} color="#a78bfa" /> Simulated Fleet Degradation — Step {currentStep}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
              Simulates equipment attrition, transit latency, and operational fatigue over disaster duration.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px" }}>
            {simulatedResources.map((res, idx) => (
              <div key={idx} style={{
                padding: "22px", background: "var(--bg-secondary)",
                borderRadius: "12px", border: "1px solid var(--border-primary)",
                display: "flex", flexDirection: "column", gap: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{res.type}</span>
                  <span style={{
                    fontSize: "13px", fontWeight: "800", color: "var(--text-muted)",
                    background: "var(--bg-card)", padding: "4px 12px",
                    borderRadius: "8px", border: "1px solid var(--border-primary)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {res.total} Total
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Available / Standby", value: res.available, color: "#4ade80" },
                    { label: "Deployed in Sandbox", value: res.deployed, color: "#60a5fa" },
                    { label: "Damaged / Stranded", value: res.exhaustedOrDamaged, color: "#f87171" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontSize: "18px", fontWeight: "900", color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Utilization bar */}
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>
                    Fleet Utilization
                  </div>
                  <div style={{ height: "10px", borderRadius: "6px", overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border-primary)", display: "flex" }}>
                    <div style={{ width: `${(res.deployed / res.total) * 100}%`, background: "#3b82f6" }} title="Deployed" />
                    <div style={{ width: `${(res.available / res.total) * 100}%`, background: "#22c55e" }} title="Available" />
                    <div style={{ width: `${(res.exhaustedOrDamaged / res.total) * 100}%`, background: "#ef4444" }} title="Damaged" />
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                    <span style={{ color: "#3b82f6" }}>■ Deployed</span>
                    <span style={{ color: "#22c55e" }}>■ Available</span>
                    <span style={{ color: "#ef4444" }}>■ Damaged</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: CASCADE RISKS ── */}
      {activeTab === "CASCADE_RISKS" && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-primary)",
          borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px",
        }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertTriangle size={20} color="#fbbf24" /> Subsystem Cascade Risk Breakdown
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
              Probabilistic modeling of secondary failures across critical urban lifelines.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
            {cascadeRisks.map((cr, idx) => {
              const isCritical = cr.riskScore > 50;
              return (
                <div key={idx} style={{
                  padding: "22px", background: "var(--bg-secondary)",
                  borderRadius: "12px",
                  borderStyle: "solid", borderTopWidth: "1px", borderRightWidth: "1px",
                  borderBottomWidth: "1px", borderLeftWidth: "4px",
                  borderTopColor: "var(--border-primary)", borderRightColor: "var(--border-primary)",
                  borderBottomColor: "var(--border-primary)",
                  borderLeftColor: isCritical ? "#ef4444" : "#f59e0b",
                  display: "flex", flexDirection: "column", gap: "16px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.3 }}>{cr.subsystem}</span>
                    <span style={{
                      fontSize: "14px", fontWeight: "900",
                      color: isCritical ? "#f87171" : "#fbbf24",
                      fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                    }}>
                      {cr.riskScore}%
                    </span>
                  </div>

                  {/* Risk gauge */}
                  <div style={{ height: "8px", borderRadius: "4px", background: "var(--bg-card)", overflow: "hidden" }}>
                    <div style={{
                      width: `${cr.riskScore}%`, height: "100%",
                      background: isCritical
                        ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                        : "linear-gradient(90deg, #4ade80, #f59e0b)",
                      transition: "width 0.3s ease",
                    }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Current Status</span>
                      <strong style={{ color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace" }}>{cr.status}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Time to Breach</span>
                      <strong style={{ color: "#f87171", fontFamily: "'JetBrains Mono', monospace" }}>{cr.timeToBreach}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: COMPARISON ── */}
      {activeTab === "COMPARISON" && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-primary)",
          borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px" }}>
                <BarChart2 size={20} color="#a78bfa" /> Digital Twin vs. Live Operational Baseline
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                Evaluates simulated catastrophe escalation against current live telemetry in real-time.
              </p>
            </div>
            <button
              onClick={fetchComparison}
              disabled={loadingComparison}
              style={{
                padding: "10px 18px", background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)", borderRadius: "8px",
                color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              {loadingComparison ? "Comparing..." : "Refresh Baseline"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Live Baseline */}
            <div style={{
              padding: "24px", background: "rgba(74,222,128,0.05)",
              borderRadius: "12px", border: "1px solid rgba(74,222,128,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(74,222,128,0.2)", paddingBottom: "14px", marginBottom: "18px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#4ade80", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={16} /> Live Operational Baseline
                </span>
                <span style={{
                  fontSize: "11px", fontWeight: "800", color: "#4ade80",
                  background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                  padding: "3px 10px", borderRadius: "6px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>REAL-TIME CAD</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "AFFECTED POPULATION", value: comparisonData?.liveBaseline?.affected || 145 },
                  { label: "CASUALTIES", value: comparisonData?.liveBaseline?.casualties || 17 },
                  { label: "HOSPITAL STRAIN", value: `${comparisonData?.liveBaseline?.hospitalStrain || 75}%` },
                  { label: "BLOCKED ROADS", value: comparisonData?.liveBaseline?.roadsBlocked || 1 },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "14px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{label}</div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Twin */}
            <div style={{
              padding: "24px", background: "rgba(168,85,247,0.05)",
              borderRadius: "12px", border: "1px solid rgba(168,85,247,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(168,85,247,0.2)", paddingBottom: "14px", marginBottom: "18px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", color: "#c084fc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={16} /> Simulated Twin — Hour +0{currentStep}
                </span>
                <span style={{
                  fontSize: "11px", fontWeight: "800", color: "#c084fc",
                  background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
                  padding: "3px 10px", borderRadius: "6px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>SANDBOX</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "SIMULATED AFFECTED", value: metrics.affectedCount, color: "#c084fc" },
                  { label: "SIMULATED CASUALTIES", value: metrics.casualtyCount, color: "#f87171" },
                  { label: "HOSPITAL STRAIN", value: `${metrics.hospitalStrain}%`, color: "#fbbf24" },
                  { label: "BLOCKED ROADS", value: metrics.roadsBlocked, color: "#c084fc" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: "14px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{label}</div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "4px" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Digital Twin Strategic Comparison Insights:
            </div>
            {(comparisonData?.comparisonNotes || [
              "Digital Twin indicates casualty load will increase by 240% if riverfront evacuation is delayed past Hour +03.",
            ]).map((note: string, i: number) => (
              <div key={i} style={{
                padding: "16px 18px", background: "var(--bg-secondary)",
                borderRadius: "10px", border: "1px solid var(--border-primary)",
                display: "flex", alignItems: "flex-start", gap: "12px",
                fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6,
              }}>
                <span style={{ color: "#a78bfa", fontWeight: "900", marginTop: "2px" }}>●</span>
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE SCENARIO MODAL ── */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}>
          <form
            onSubmit={handleCreateScenario}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border-secondary)",
              borderRadius: "16px", maxWidth: "560px", width: "100%",
              padding: "32px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column", gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Plus size={18} color="#c084fc" />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                  Configure Simulation Scenario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "1px solid var(--border-primary)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer", padding: "6px 10px" }}
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Scenario Name *
              </label>
              <input
                type="text" required value={newScenName}
                onChange={(e) => setNewScenName(e.target.value)}
                placeholder="e.g. Sabarmati Breach & East Industrial Firestorm"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Disaster Type
                </label>
                <select value={newScenType} onChange={(e) => setNewScenType(e.target.value)} style={inputStyle}>
                  <option value="FLOOD">FLOOD (Hydrological)</option>
                  <option value="HAZMAT">HAZMAT (Industrial Toxic)</option>
                  <option value="ROAD_ACCIDENT">ROAD ACCIDENT</option>
                  <option value="FIRE">FIRE (Multi-Sector)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Weather Conditions
                </label>
                <input type="text" value={newWeather} onChange={(e) => setNewWeather(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Description & Tactical Objectives
              </label>
              <textarea
                rows={3} value={newScenDesc}
                onChange={(e) => setNewScenDesc(e.target.value)}
                placeholder="Describe scenario parameters, primary failure points, and response goals..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{
              padding: "14px 16px", background: "rgba(120,53,15,0.2)",
              border: "1px solid rgba(217,119,6,0.35)", borderRadius: "10px",
              fontSize: "13px", color: "#fde68a",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <Lock size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
              <span>Scenario will be generated with 3 cascade events. Live production DB will not be altered.</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px", borderTop: "1px solid var(--border-primary)" }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--border-primary)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingScen || !newScenName.trim()}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  border: "none", borderRadius: "8px", color: "#fff",
                  fontWeight: "700", fontSize: "14px", cursor: "pointer",
                  opacity: (creatingScen || !newScenName.trim()) ? 0.6 : 1,
                  boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                }}
              >
                {creatingScen ? "Initializing..." : "Create Sandbox Scenario"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
