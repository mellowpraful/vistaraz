"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  Compass,
  Layers,
  BarChart2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
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

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 5x
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SIMULATION" | "FLEET_STATE" | "CASCADE_RISKS" | "COMPARISON">("SIMULATION");

  // Dynamic simulation telemetry
  const [metrics, setMetrics] = useState({
    affectedCount: 150,
    casualtyCount: 12,
    hospitalStrain: 35,
    roadsBlocked: 2,
    powerOutageZones: 1,
  });

  // Dynamic simulated resource states
  const [simulatedResources, setSimulatedResources] = useState<SimulatedResourceState[]>([
    { type: "Inflatable Rescue Boats", total: 6, available: 5, deployed: 1, exhaustedOrDamaged: 0 },
    { type: "ALS Ambulances", total: 10, available: 8, deployed: 2, exhaustedOrDamaged: 0 },
    { type: "Fire Suppression Engines", total: 8, available: 7, deployed: 1, exhaustedOrDamaged: 0 },
    { type: "Hazmat Containment Units", total: 3, available: 2, deployed: 1, exhaustedOrDamaged: 0 },
  ]);

  // Dynamic cascade risks
  const [cascadeRisks, setCascadeRisks] = useState<Array<{
    subsystem: string;
    status: string;
    riskScore: number;
    timeToBreach: string;
  }>>([
    { subsystem: "Urban Drainage & Sluice Gates", status: "SURGING", riskScore: 55, timeToBreach: "45 mins" },
    { subsystem: "Regional Grid Substations", status: "ELEVATED_RISK", riskScore: 42, timeToBreach: "70 mins" },
    { subsystem: "Hospital Emergency Trauma Surge", status: "STRETCHED", riskScore: 52, timeToBreach: "45 mins" },
  ]);

  // Comparison State
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // New Scenario Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenName, setNewScenName] = useState("");
  const [newScenType, setNewScenType] = useState("FLOOD");
  const [newScenDesc, setNewScenDesc] = useState("");
  const [newWeather, setNewWeather] = useState("Severe Torrential Rain — 90mm/hr");
  const [newWind, setNewWind] = useState("SSW 22 km/h");
  const [creatingScen, setCreatingScen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load scenarios from API
  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/simulation");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setScenarios(json.data);
        setSelectedScenario(json.data[0]);
      }
    } catch (err) {
      console.error("Failed to load simulations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // Advance simulation step
  const advanceStep = useCallback(
    async (targetStep: number) => {
      if (!selectedScenario) return;
      try {
        const res = await fetch("/api/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "STEP",
            scenarioId: selectedScenario.id,
            step: targetStep,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setCurrentStep(targetStep);
          setMetrics(json.data.metrics);
          if (json.data.simulatedResources) {
            setSimulatedResources(json.data.simulatedResources);
          }
          if (json.data.cascadeRisks) {
            setCascadeRisks(json.data.cascadeRisks);
          }
        }
      } catch (err) {
        console.error("Simulation step error:", err);
      }
    },
    [selectedScenario]
  );

  // Fetch Comparison Data
  const fetchComparison = useCallback(async () => {
    setLoadingComparison(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPARE" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setComparisonData(json.data);
      }
    } catch (err) {
      console.error("Failed to load comparison data:", err);
    } finally {
      setLoadingComparison(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "COMPARISON") {
      fetchComparison();
    }
  }, [activeTab, fetchComparison]);

  // Simulation playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 6) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          advanceStep(next);
          return next;
        });
      }, 3500 / playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed, advanceStep]);

  // Reset to initial conditions
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
    setMetrics({
      affectedCount: 150,
      casualtyCount: 12,
      hospitalStrain: 35,
      roadsBlocked: 2,
      powerOutageZones: 1,
    });
    setSimulatedResources([
      { type: "Inflatable Rescue Boats", total: 6, available: 5, deployed: 1, exhaustedOrDamaged: 0 },
      { type: "ALS Ambulances", total: 10, available: 8, deployed: 2, exhaustedOrDamaged: 0 },
      { type: "Fire Suppression Engines", total: 8, available: 7, deployed: 1, exhaustedOrDamaged: 0 },
      { type: "Hazmat Containment Units", total: 3, available: 2, deployed: 1, exhaustedOrDamaged: 0 },
    ]);
  };

  // Create new scenario
  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenName.trim()) return;
    setCreatingScen(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          name: newScenName,
          scenarioType: newScenType,
          description: newScenDesc || "User-configured disaster simulation sandbox",
          initialConditions: {
            weather: newWeather,
            wind: newWind,
            populationDensity: "High Urban Sector",
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setScenarios((prev) => [json.data, ...prev]);
        setSelectedScenario(json.data);
        handleReset();
        setShowCreateModal(false);
        setNewScenName("");
        setNewScenDesc("");
      }
    } catch (err) {
      console.error("Failed to create scenario:", err);
    } finally {
      setCreatingScen(false);
    }
  };

  // Parse scenario initial conditions config
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

  return (
    <div className="space-y-6">
      {/* ── Strict Isolation Banner ────────────────────────────────────── */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider">
                Digital Twin Sandbox Environment — Strict Isolation Active
              </span>
              <span className="text-[10px] font-mono bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded border border-amber-700">
                ZERO LIVE DB MUTATIONS
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              All events, resource deployments, and casualties generated within this module operate strictly in simulated memory. Production records remain untouched.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-[11px] text-amber-400 bg-amber-950/90 px-3 py-1.5 rounded-lg border border-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          SANDBOX TIMELINE: Hour +0{currentStep}:00
        </div>
      </div>

      {/* ── Scenario Selection & Control Bar ─────────────────────────────── */}
      <div className="card p-5 space-y-4 border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Scenario Selector & New Button */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Scenario:
            </span>
            <select
              value={selectedScenario?.id || ""}
              onChange={(e) => {
                const scen = scenarios.find((s) => s.id === e.target.value);
                if (scen) {
                  setSelectedScenario(scen);
                  handleReset();
                }
              }}
              className="input-base text-xs bg-slate-950 font-semibold max-w-md py-2 border-slate-800"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 hover:border-purple-600 hover:text-purple-300"
            >
              <Plus size={13} />
              <span>Create Custom Scenario</span>
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 px-1.5 font-mono text-[11px]">Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                    playSpeed === spd
                      ? "bg-purple-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`btn-primary text-xs py-2 px-4 flex items-center gap-1.5 transition-all ${
                isPlaying ? "bg-amber-600 hover:bg-amber-500" : "bg-purple-600 hover:bg-purple-500"
              }`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause Simulation" : "Run Simulation"}</span>
            </button>

            {/* Step Backward */}
            <button
              onClick={() => {
                if (currentStep > 1) advanceStep(currentStep - 1);
              }}
              disabled={isPlaying || currentStep <= 1}
              className="btn-secondary text-xs py-2 px-2.5 disabled:opacity-40"
              title="Step Backward"
            >
              <Rewind size={13} />
            </button>

            {/* Step Forward */}
            <button
              onClick={() => {
                if (currentStep < 6) advanceStep(currentStep + 1);
              }}
              disabled={isPlaying || currentStep >= 6}
              className="btn-secondary text-xs py-2 px-3 disabled:opacity-40 flex items-center gap-1"
            >
              <span>+1 Hour</span>
              <FastForward size={13} />
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="btn-secondary text-xs py-2 px-3 hover:text-red-400 flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Initial Conditions HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 block text-[10px]">WEATHER DYNAMICS</span>
            <span className="text-slate-200">{initialConditions.weather}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 block text-[10px]">SURGE THRESHOLD</span>
            <span className="text-amber-400">{initialConditions.initialSurge || "+0.8m"}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 block text-[10px]">WIND CONE</span>
            <span className="text-slate-200">{initialConditions.wind || "14 km/h"}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/60">
            <span className="text-slate-500 block text-[10px]">POPULATION DENSITY</span>
            <span className="text-slate-200">{initialConditions.populationDensity}</span>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Simulation Progression Hours</span>
            <span className="text-purple-400 font-bold">Hour +0{currentStep}:00 (Step {currentStep} of 6)</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div
                key={st}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  st <= currentStep
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 shadow-md shadow-purple-500/30"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Dynamic Telemetry Metrics Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-3.5 bg-slate-900/80 border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Simulated Affected</div>
          <div className="text-2xl font-black text-slate-100 font-mono">{metrics.affectedCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">+{(currentStep - 1) * 120} vs t0</span>
        </div>

        <div className="card p-3.5 bg-slate-900/80 border-l-4 border-l-red-500 space-y-1">
          <div className="text-[10px] text-red-400 uppercase font-mono">Simulated Casualties</div>
          <div className="text-2xl font-black text-red-400 font-mono">{metrics.casualtyCount}</div>
          <span className="text-[10px] text-red-400/80 font-mono">Acute Trauma</span>
        </div>

        <div className="card p-3.5 bg-slate-900/80 border-l-4 border-l-amber-500 space-y-1">
          <div className="text-[10px] text-amber-400 uppercase font-mono">Hospital Bed Strain</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.hospitalStrain}%</div>
          <span className="text-[10px] text-amber-400/80 font-mono">Regional ICU</span>
        </div>

        <div className="card p-3.5 bg-slate-900/80 border-l-4 border-l-purple-500 space-y-1">
          <div className="text-[10px] text-purple-400 uppercase font-mono">Roads Submerged</div>
          <div className="text-2xl font-black text-purple-400 font-mono">{metrics.roadsBlocked} Arterials</div>
          <span className="text-[10px] text-purple-400/80 font-mono">Transit Severed</span>
        </div>

        <div className="card p-3.5 bg-slate-900/80 border-l-4 border-l-blue-500 space-y-1">
          <div className="text-[10px] text-blue-400 uppercase font-mono">Grid Blackouts</div>
          <div className="text-2xl font-black text-blue-400 font-mono">{metrics.powerOutageZones} Zones</div>
          <span className="text-[10px] text-blue-400/80 font-mono">Backup Power</span>
        </div>
      </div>

      {/* ── Sub-Tabs: Stream / Fleet / Cascade / Comparison ───────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("SIMULATION")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
            activeTab === "SIMULATION" ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Activity size={13} /> Cascade Event Timeline
        </button>
        <button
          onClick={() => setActiveTab("FLEET_STATE")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
            activeTab === "FLEET_STATE" ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Layers size={13} /> Simulated Fleet Degradation
        </button>
        <button
          onClick={() => setActiveTab("CASCADE_RISKS")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
            activeTab === "CASCADE_RISKS" ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <AlertTriangle size={13} /> Subsystem Vulnerability Matrix
        </button>
        <button
          onClick={() => setActiveTab("COMPARISON")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
            activeTab === "COMPARISON" ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <BarChart2 size={13} /> Live vs. Simulated Comparison
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: CASCADE TIMELINE & AI STRESS REPORT                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "SIMULATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulated Cascade Events */}
          <div className="card p-5 bg-slate-900/80 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-purple-400" /> Simulated Event Progression (Hour +0{currentStep})
              </h2>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                Active Events: {Math.min(4, currentStep)}
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: "Monsoon Surge Cloudburst Initiation",
                  desc: "Rainfall exceeds 110mm in 90 minutes. Sabarmati water gauge exceeds Danger Mark by 0.8m.",
                  tag: "METEOROLOGICAL",
                },
                {
                  step: 2,
                  title: "Underpass Inundation & Traffic Arterial Severed",
                  desc: "Akhbarnagar underpass submerged in 2.2m of water. 4 public transport buses stranded.",
                  tag: "INFRASTRUCTURE",
                },
                {
                  step: 3,
                  title: "Civil Hospital Substation Power Trip",
                  desc: "Emergency diesel generators activated. ICU life-support operating on secondary backup power.",
                  tag: "CRITICAL_FACILITY",
                },
                {
                  step: 4,
                  title: "Secondary Industrial Chemical Tank Seepage",
                  desc: "Floodwaters breach chemical retention basin at Narol GIDC. Low-grade organic solvent leak detected.",
                  tag: "HAZMAT_ESCALATION",
                },
              ]
                .filter((ev) => ev.step <= currentStep)
                .map((ev) => (
                  <div
                    key={ev.step}
                    className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1 hover:border-purple-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">{ev.title}</span>
                      <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                        Hour +0{ev.step}:00
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{ev.desc}</p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">{ev.tag}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Digital Twin Stress Analysis */}
          <div className="card p-5 bg-slate-900/80 border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Compass size={14} /> Sandbox Stress Findings
                </h2>
                <span className="text-[10px] font-mono text-slate-400">Monte Carlo Engine v2.4</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Finding at Hour +0{currentStep}:00:</span>
                </div>
                <p>
                  {currentStep <= 2
                    ? "Initial response capacity is adequate. Inflatable boat fleet is sufficient for Sector 4 rescue operations, but water rise rate of 0.15m/hr will strain single-boat units by Hour +03."
                    : currentStep <= 4
                    ? "CRITICAL BOTTLENECK PROJECTED: ICU bed capacity in North Zone will reach exhaustion within 45 minutes if casualties continue at simulated rate. Recommend preemptively pre-alerting VS Hospital and pre-staging 50 field beds."
                    : "MAXIMUM SEVERITY BREACH: Multi-agency cross-district mutual aid required. Reserve boat fleets from Gandhinagar must be requested."}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Prescribed Contingency Protocols:
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/60 rounded text-emerald-300 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>Re-route non-critical ambulance traffic away from Akhbarnagar underpass</span>
                  </div>
                  <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded text-blue-300 flex items-center gap-2">
                    <CheckCircle size={14} className="text-blue-400 shrink-0" />
                    <span>Pre-stage 3 high-capacity dewatering pump trucks at Narol Gate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Model State: Converged</span>
              <span>Simulation ID: {selectedScenario?.id || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: SIMULATED FLEET STATE                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "FLEET_STATE" && (
        <div className="card p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-purple-400" /> Simulated Resource Fleet Dynamics (Step {currentStep})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates real-world equipment attrition, transit latency, and operational fatigue over duration of disaster
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {simulatedResources.map((res, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{res.type}</span>
                  <span className="text-[10px] font-mono text-slate-400">{res.total} Total</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Available / Standby:</span>
                    <span className="font-bold">{res.available}</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-400">
                    <span>Deployed in Sandbox:</span>
                    <span className="font-bold">{res.deployed}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-400">
                    <span>Damaged / Stranded:</span>
                    <span className="font-bold">{res.exhaustedOrDamaged}</span>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 flex overflow-hidden">
                  <div
                    style={{ width: `${(res.deployed / res.total) * 100}%` }}
                    className="bg-blue-500 h-full"
                    title="Deployed"
                  />
                  <div
                    style={{ width: `${(res.available / res.total) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title="Available"
                  />
                  <div
                    style={{ width: `${(res.exhaustedOrDamaged / res.total) * 100}%` }}
                    className="bg-red-500 h-full"
                    title="Damaged"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 3: CASCADE RISKS MATRIX                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "CASCADE_RISKS" && (
        <div className="card p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> Subsystem Cascade Risk Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Probabilistic modeling of secondary failures across critical urban lifelines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cascadeRisks.map((cr, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{cr.subsystem}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      cr.riskScore > 75
                        ? "bg-red-950 text-red-300 border-red-800"
                        : "bg-amber-950 text-amber-300 border-amber-800"
                    }`}
                  >
                    {cr.riskScore}% Risk
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                    <span>Current Status:</span>
                    <strong className="text-amber-400">{cr.status}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                    <span>Time to Breach:</span>
                    <strong className="text-red-400">{cr.timeToBreach}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 4: LIVE VS. SIMULATED SCENARIO COMPARISON                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "COMPARISON" && (
        <div className="card p-6 bg-slate-900/80 border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-purple-400" /> Digital Twin vs. Live Operational Baseline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates simulated catastrophe escalation against current live telemetry in real-time
              </p>
            </div>
            <button
              onClick={fetchComparison}
              disabled={loadingComparison}
              className="btn-secondary text-xs py-1 px-3"
            >
              {loadingComparison ? "Comparing..." : "Refresh Baseline"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Live Operational Baseline */}
            <div className="p-5 bg-slate-950 rounded-xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={14} /> Live Operational Baseline
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  REAL-TIME CAD FEED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">AFFECTED POPULATION</span>
                  <span className="text-base font-bold text-slate-100">
                    {comparisonData?.liveBaseline?.affected || 145}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">CASUALTIES</span>
                  <span className="text-base font-bold text-slate-100">
                    {comparisonData?.liveBaseline?.casualties || 17}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">HOSPITAL STRAIN</span>
                  <span className="text-base font-bold text-slate-100">
                    {comparisonData?.liveBaseline?.hospitalStrain || 75}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">BLOCKED ROADS</span>
                  <span className="text-base font-bold text-slate-100">
                    {comparisonData?.liveBaseline?.roadsBlocked || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Digital Twin Simulated Twin */}
            <div className="p-5 bg-slate-950 rounded-xl border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} /> Simulated Twin at Hour +0{currentStep}
                </span>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                  ISOLATED SANDBOX
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">SIMULATED AFFECTED</span>
                  <span className="text-base font-bold text-purple-300">{metrics.affectedCount}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">SIMULATED CASUALTIES</span>
                  <span className="text-base font-bold text-red-400">{metrics.casualtyCount}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">HOSPITAL STRAIN</span>
                  <span className="text-base font-bold text-amber-400">{metrics.hospitalStrain}%</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded">
                  <span className="text-[10px] text-slate-500 block">BLOCKED ROADS</span>
                  <span className="text-base font-bold text-purple-400">{metrics.roadsBlocked}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Insights */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Digital Twin Strategic Comparison Insights:
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              {comparisonData?.comparisonNotes?.map((note: string, i: number) => (
                <div key={i} className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-start gap-2">
                  <span className="text-purple-400 font-mono">•</span>
                  <span>{note}</span>
                </div>
              )) || (
                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  Digital Twin indicates casualty load will increase by 240% if riverfront evacuation is delayed past Hour +03.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENARIO CREATION MODAL                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateScenario}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus size={16} className="text-purple-400" />
                Configure Disaster Simulation Scenario
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Scenario Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Sabarmati Breach & East Industrial Firestorm"
                value={newScenName}
                onChange={(e) => setNewScenName(e.target.value)}
                className="input-base text-xs bg-slate-950 w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Disaster Type:</label>
                <select
                  value={newScenType}
                  onChange={(e) => setNewScenType(e.target.value)}
                  className="input-base text-xs bg-slate-950 w-full"
                >
                  <option value="FLOOD">FLOOD (Hydrological)</option>
                  <option value="HAZMAT">HAZMAT (Industrial Toxic)</option>
                  <option value="ROAD_ACCIDENT">ROAD ACCIDENT (Transit Gridlock)</option>
                  <option value="FIRE">FIRE (Multi-Sector Conflagration)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Atmospheric Weather:</label>
                <input
                  type="text"
                  value={newWeather}
                  onChange={(e) => setNewWeather(e.target.value)}
                  className="input-base text-xs bg-slate-950 w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Description & Tactical Objectives:</label>
              <textarea
                rows={3}
                placeholder="Describe scenario parameters, primary failure points, and response goals..."
                value={newScenDesc}
                onChange={(e) => setNewScenDesc(e.target.value)}
                className="input-base text-xs bg-slate-950 w-full resize-none"
              />
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg text-[10px] text-amber-300 font-mono">
              🔒 Scenario will be generated with 3 initial cascade timeline events. Live production database will not be altered.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingScen || !newScenName.trim()}
                className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
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
