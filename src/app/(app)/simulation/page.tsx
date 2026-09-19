"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  scenarioType: string;
  status: string;
  parameters: string | null;
  events: Array<{
    id: string;
    step: number;
    title: string;
    description: string;
    eventType: string;
    impactLevel: string;
  }>;
}

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1x, 2x, 5x
  const [loading, setLoading] = useState(true);

  // Dynamic simulation telemetry
  const [metrics, setMetrics] = useState({
    affectedCount: 150,
    casualtyCount: 12,
    hospitalStrain: 35,
    roadsBlocked: 2,
    powerOutageZones: 1,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
          // Scale metrics dynamically with step
          setMetrics({
            affectedCount: 150 + targetStep * 120,
            casualtyCount: 12 + targetStep * 8,
            hospitalStrain: Math.min(100, 35 + targetStep * 15),
            roadsBlocked: 2 + targetStep,
            powerOutageZones: 1 + Math.floor(targetStep / 2),
          });
        }
      } catch (err) {
        console.error("Simulation step error:", err);
      }
    },
    [selectedScenario]
  );

  // Play / loop timer
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
      }, 3000 / playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed, advanceStep]);

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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              <span>🌐</span> Digital Twin & Disaster Simulation Sandbox
            </h1>
            <span className="badge-critical text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              🔒 ISOLATED SANDBOX MODE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Stress-test emergency protocols, cascade infrastructure failures, and hospital saturation models without affecting live ops
          </p>
        </div>
      </div>

      {/* Scenario Selector & Controls Bar */}
      <div className="card p-5 space-y-4 border-slate-800 bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
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
              className="input-base text-xs bg-slate-950 font-semibold max-w-md py-2"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.scenarioType})
                </option>
              ))}
            </select>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 px-1.5 font-mono">Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                    playSpeed === spd
                      ? "bg-blue-600 text-white font-bold"
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
              className={`btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 ${
                isPlaying ? "bg-amber-600 hover:bg-amber-500" : ""
              }`}
            >
              <span>{isPlaying ? "⏸️ Pause" : "▶️ Play Simulation"}</span>
            </button>

            {/* Step Forward */}
            <button
              onClick={() => {
                if (currentStep < 6) advanceStep(currentStep + 1);
              }}
              disabled={isPlaying || currentStep >= 6}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
            >
              +1 Step ⏩
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="btn-secondary text-xs py-1.5 px-3 hover:text-red-400"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Step Progress Stepper */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Simulation Timeline Progress</span>
            <span className="text-blue-400 font-bold">Hour +0{currentStep}:00 (Step {currentStep}/6)</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div
                key={st}
                className={`h-2 rounded-full transition-all duration-300 ${
                  st <= currentStep
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm shadow-purple-500/50"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Simulated Affected</div>
          <div className="text-2xl font-black text-slate-100 font-mono">{metrics.affectedCount}</div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-red-500">
          <div className="text-[11px] text-red-400 uppercase font-mono">Simulated Casualties</div>
          <div className="text-2xl font-black text-red-400 font-mono">{metrics.casualtyCount}</div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-amber-500">
          <div className="text-[11px] text-amber-400 uppercase font-mono">Hospital Bed Strain</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.hospitalStrain}%</div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-purple-500">
          <div className="text-[11px] text-purple-400 uppercase font-mono">Roads Submerged</div>
          <div className="text-2xl font-black text-purple-400 font-mono">{metrics.roadsBlocked} Arterials</div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-blue-500">
          <div className="text-[11px] text-blue-400 uppercase font-mono">Grid Blackouts</div>
          <div className="text-2xl font-black text-blue-400 font-mono">{metrics.powerOutageZones} Sectors</div>
        </div>
      </div>

      {/* Cascade Failure Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cascade Events Timeline */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> Simulated Cascade Events Log (Step {currentStep})
          </h2>

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
                  className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-100">{ev.title}</span>
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
                      Step {ev.step} (Hour +0{ev.step})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{ev.desc}</p>
                  <div className="text-[10px] text-slate-500 font-mono">{ev.tag}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Digital Twin AI Recommendations */}
        <div className="card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <span>🤖</span> Digital Twin Stress Analysis & Readiness Report
            </h2>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-slate-100">
                Stress Test Finding at Hour +0{currentStep}:
              </div>
              <p>
                {currentStep <= 2
                  ? "Initial response capacity is adequate. Inflatable boat fleet is sufficient for Sector 4 rescue operations."
                  : currentStep <= 4
                  ? "CRITICAL BOTTLENECK DETECTED: ICU bed capacity in North Zone will exhaust in 45 minutes if casualties continue at this rate. Pre-alert VS Hospital and activate 50-bed field hospital at Sardar Patel Stadium."
                  : "MAXIMUM SEVERITY THRESHOLD: Multi-agency cross-district mutual aid required. Recommend mobilizing NDRF 6th Battalion reserve teams."}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                Prescribed Contingency Actions:
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-emerald-950/40 border border-emerald-900/60 rounded text-emerald-300">
                  ✓ Re-route non-critical ambulances to District General Hospital
                </div>
                <div className="p-2 bg-blue-950/40 border border-blue-900/60 rounded text-blue-300">
                  ✓ Pre-stage 3 high-capacity dewatering pumps at Narol Industrial Gate
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Simulation model: CrisisOS Monte Carlo Cascade Engine v2.4
          </div>
        </div>
      </div>
    </div>
  );
}
