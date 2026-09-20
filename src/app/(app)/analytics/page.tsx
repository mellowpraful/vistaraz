"use client";

import { useState } from "react";
import {
  TrendingUp,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  AlertTriangle,
  Flame,
  Ambulance,
  Car,
  LifeBuoy,
  Waves,
  Download,
  CheckCircle,
  Building2,
  FileCheck,
  Radio,
  Timer,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7D");
  const [downloadingReport, setDownloadingReport] = useState(false);

  const incidentTypes = [
    { type: "FLOOD", label: "Flood & Water Inundation", count: 42, color: "bg-blue-500", barColor: "from-blue-600 to-blue-400", pct: 30, icon: Waves, severity: "CRITICAL" },
    { type: "ROAD_ACCIDENT", label: "Road & Highway Collisions", count: 36, color: "bg-orange-500", barColor: "from-orange-600 to-orange-400", pct: 25, icon: Car, severity: "HIGH" },
    { type: "FIRE", label: "Structure & Industrial Fires", count: 28, color: "bg-red-500", barColor: "from-red-600 to-red-400", pct: 20, icon: Flame, severity: "HIGH" },
    { type: "MEDICAL", label: "Mass-Casualty & Acute Trauma", count: 18, color: "bg-emerald-500", barColor: "from-emerald-600 to-emerald-400", pct: 13, icon: Ambulance, severity: "MEDIUM" },
    { type: "HAZMAT", label: "Chemical & Toxic Vapor Leaks", count: 10, color: "bg-purple-500", barColor: "from-purple-600 to-purple-400", pct: 7, icon: AlertTriangle, severity: "CRITICAL" },
    { type: "SEARCH_RESCUE", label: "Structural Collapse & Rescue", count: 8, color: "bg-amber-500", barColor: "from-amber-600 to-amber-400", pct: 5, icon: LifeBuoy, severity: "MEDIUM" },
  ];

  const agencyPerformance = [
    {
      name: "108 Emergency Medical Services",
      sector: "Medical & Trauma Transport",
      dispatched: 54,
      avgEta: "5.8m",
      targetEta: "8.0m",
      score: 96,
      status: "OPTIMAL",
    },
    {
      name: "Ahmedabad Fire & Emergency",
      sector: "Fire Suppression & Heavy Rescue",
      dispatched: 41,
      avgEta: "7.2m",
      targetEta: "8.0m",
      score: 94,
      status: "COMPLIANT",
    },
    {
      name: "NDRF Battalion 6 (Disaster Reserve)",
      sector: "Flood Extraction & Specialized Boat Fleet",
      dispatched: 28,
      avgEta: "12.4m",
      targetEta: "15.0m",
      score: 98,
      status: "OPTIMAL",
    },
    {
      name: "Ahmedabad City Police",
      sector: "Perimeter Security & Evacuation Corridors",
      dispatched: 39,
      avgEta: "4.9m",
      targetEta: "6.0m",
      score: 92,
      status: "COMPLIANT",
    },
  ];

  const hourlyVolume = [
    { hour: 0, val: 2, label: "00:00" },
    { hour: 1, val: 1, label: "01:00" },
    { hour: 2, val: 0, label: "02:00" },
    { hour: 3, val: 1, label: "03:00" },
    { hour: 4, val: 2, label: "04:00" },
    { hour: 5, val: 4, label: "05:00" },
    { hour: 6, val: 7, label: "06:00" },
    { hour: 7, val: 12, label: "07:00" },
    { hour: 8, val: 18, label: "08:00" },
    { hour: 9, val: 24, label: "09:00" },
    { hour: 10, val: 28, label: "10:00" },
    { hour: 11, val: 32, label: "11:00" },
    { hour: 12, val: 29, label: "12:00" },
    { hour: 13, val: 35, label: "13:00" },
    { hour: 14, val: 42, label: "14:00" },
    { hour: 15, val: 38, label: "15:00" },
    { hour: 16, val: 30, label: "16:00" },
    { hour: 17, val: 26, label: "17:00" },
    { hour: 18, val: 22, label: "18:00" },
    { hour: 19, val: 17, label: "19:00" },
    { hour: 20, val: 12, label: "20:00" },
    { hour: 21, val: 9, label: "21:00" },
    { hour: 22, val: 5, label: "22:00" },
    { hour: 23, val: 3, label: "23:00" },
  ];

  const handleExportReport = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      setDownloadingReport(false);
      alert("Executive SLA Audit Report exported to PDF format.");
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-9 sm:space-y-10 animate-fade-in pb-24">
      {/* ── Section A: Page Header ───────────────────────────────────── */}
      <PageHeader
        title="Executive Analytics & Operations Audit"
        description="Cross-agency response SLAs, dispatch velocity benchmarks, and explainable AI acceptance telemetry."
        icon={TrendingUp}
        iconColor="#3b82f6"
        badge={
          <div className="flex items-center gap-2">
            <span className="badge badge-success flex items-center gap-1.5 px-3 py-1 text-xs">
              <Radio size={13} className="animate-pulse" /> Live Telemetry Stream
            </span>
            <span className="badge badge-neutral hidden sm:inline-flex px-3 py-1 text-xs">ISO 22320 SLA Certified</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-sm">
              <Calendar size={15} className="text-slate-400 ml-2.5 mr-1" />
              {["24H", "7D", "30D", "90D"].map((tr) => (
                <button
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    timeRange === tr
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {tr}
                </button>
              ))}
            </div>

            {/* Export Audit Report Action */}
            <button
              onClick={handleExportReport}
              disabled={downloadingReport}
              className="btn btn-secondary text-xs sm:text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-sm cursor-pointer"
            >
              <Download size={15} className={downloadingReport ? "animate-bounce text-blue-400" : "text-blue-400"} />
              <span>{downloadingReport ? "Exporting…" : "Export Report"}</span>
            </button>
          </div>
        }
      />

      {/* ── Section B: Consistent KPI Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Response Velocity */}
        <div className="card p-7 rounded-3xl bg-slate-900/90 border-slate-800 hover:border-emerald-700/60 transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-xl hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Average Response Velocity</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-inner">
              <Timer size={20} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-tight flex items-baseline gap-2">
              6.4 <span className="text-base font-mono text-slate-400 font-medium">mins</span>
            </div>
            <div className="text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5 mt-2 font-semibold">
              <ArrowDownRight size={16} className="text-emerald-400 shrink-0" />
              1.6m ahead of 8.0m SLA target
            </div>
          </div>
          <div className="text-xs text-slate-400 pt-3.5 border-t border-slate-800/80 font-sans leading-relaxed">
            From initial CAD dispatch to on-scene arrival across all active units.
          </div>
        </div>

        {/* KPI 2: Incident Resolution Rate */}
        <div className="card p-7 rounded-3xl bg-slate-900/90 border-slate-800 hover:border-blue-700/60 transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-xl hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Incident Resolution Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 shadow-inner">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-blue-400 font-mono tracking-tight">
              88.4%
            </div>
            <div className="text-xs sm:text-sm text-slate-300 mt-2 font-sans font-medium">
              125 of 142 logged emergencies resolved
            </div>
          </div>
          <div className="text-xs text-slate-400 pt-3.5 border-t border-slate-800/80 font-sans leading-relaxed">
            17 active incidents currently undergoing field mitigation or triage containment.
          </div>
        </div>

        {/* KPI 3: AI Dispatch Acceptance */}
        <div className="card p-7 rounded-3xl bg-slate-900/90 border-slate-800 hover:border-purple-700/60 transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-xl hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">AI Dispatch Acceptance</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 shadow-inner">
              <Zap size={20} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-purple-400 font-mono tracking-tight">
              92.5%
            </div>
            <div className="text-xs sm:text-sm text-purple-300 flex items-center gap-1.5 mt-2 font-sans font-semibold">
              <ArrowUpRight size={16} className="text-purple-400 shrink-0" />
              Commander approved without manual override
            </div>
          </div>
          <div className="text-xs text-slate-400 pt-3.5 border-t border-slate-800/80 font-sans leading-relaxed">
            Human-in-the-loop recommendation authorization meeting national standards.
          </div>
        </div>

        {/* KPI 4: Lives Evacuated */}
        <div className="card p-7 rounded-3xl bg-slate-900/90 border-slate-800 hover:border-amber-700/60 transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-xl hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Citizens Evacuated / Rescued</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 shadow-inner">
              <Users size={20} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
              418
            </div>
            <div className="text-xs sm:text-sm text-slate-300 mt-2 font-sans font-medium">
              Across 6 high-risk municipal districts
            </div>
          </div>
          <div className="text-xs text-slate-400 pt-3.5 border-t border-slate-800/80 font-sans leading-relaxed">
            Zero fatalities recorded across pre-designated flood evacuation corridors.
          </div>
        </div>
      </div>

      {/* ── Section C & D: Main Analytics Section ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section C: Professional Incident Distribution Visualization */}
        <div className="card p-7 sm:p-9 rounded-3xl bg-slate-900/90 border-slate-800 space-y-7 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shadow-inner">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                    Incident Distribution by Type
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Proportional breakdown of CAD intake</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-950 text-slate-300 px-3.5 py-1.5 rounded-xl border border-slate-800">
                142 Total
              </span>
            </div>

            {/* Segmented Distribution Track */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Sector Profile:</span>
                <span className="text-blue-400 font-bold">Monsoon Hydrological Driver</span>
              </div>
              <div className="h-5 bg-slate-950 rounded-2xl overflow-hidden flex border border-slate-800 shadow-inner">
                {incidentTypes.map((item) => (
                  <div
                    key={item.type}
                    style={{ width: `${item.pct}%` }}
                    className={`h-full ${item.color} transition-all duration-500 hover:brightness-125 cursor-pointer`}
                    title={`${item.label}: ${item.count} incidents (${item.pct}%)`}
                  />
                ))}
              </div>
            </div>

            {/* Detailed Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {incidentTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-slate-200 font-bold text-xs sm:text-sm font-sans">
                        <div className={`w-7 h-7 rounded-xl ${item.color}/20 flex items-center justify-center text-slate-200 shrink-0`}>
                          <Icon size={15} />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white shrink-0 ml-1">
                        {item.pct}%
                      </span>
                    </div>

                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.pct * 3.3}%` }}
                        className={`h-full bg-gradient-to-r ${item.barColor} rounded-full`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{item.count} incidents</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{item.severity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-800/80 gap-2">
            <span>Primary Factor: Monsoonal Surge (30%)</span>
            <span>Secondary: Highway Collisions (25%)</span>
          </div>
        </div>

        {/* Section D: Multi-Agency Performance & Comparison Table */}
        <div className="card p-7 sm:p-9 rounded-3xl bg-slate-900/90 border-slate-800 space-y-7 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                    Multi-Agency Response & SLA Velocity
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Benchmarking dispatch velocity against municipal mandates</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-800">
                4 Agencies
              </span>
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4 pt-1">
              {agencyPerformance.map((ag) => (
                <div
                  key={ag.name}
                  className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-100 text-sm sm:text-base font-sans tracking-tight">{ag.name}</span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                        ag.status === "OPTIMAL" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-blue-950 text-blue-300 border border-blue-800"
                      }`}>
                        {ag.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans flex items-center gap-2">
                      <span>{ag.sector}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-mono font-semibold">{ag.dispatched} Dispatches Completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-right shrink-0">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Avg Arrival (Target)</div>
                      <div className="font-bold text-blue-400 text-sm sm:text-base">
                        {ag.avgEta} <span className="text-xs text-slate-400 font-normal">(&lt;{ag.targetEta})</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">SLA Compliance</div>
                      <div className="font-bold text-emerald-400 text-sm sm:text-base flex items-center justify-end gap-1.5">
                        <CheckCircle size={15} className="text-emerald-400" />
                        {ag.score}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-800/80 gap-2">
            <span>Inter-Agency Mutual Aid Protocol: ACTIVE</span>
            <span>Target Standard: &lt;8.0 mins</span>
          </div>
        </div>
      </div>

      {/* ── Section E: Full-Width 24-Hour Incident Heatmap ───────────── */}
      <div className="card p-7 sm:p-10 rounded-3xl bg-slate-900/90 border-slate-800 space-y-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 shadow-inner">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                24-Hour Incident Inflow Timeline & Peak Demand Forecast
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
                Hourly dispatch call volume tracking emergency intake across municipal dispatch CAD systems
              </p>
            </div>
          </div>

          {/* Accessible Intensity Scale Legend */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
            <span className="font-bold uppercase text-slate-500 text-[11px] mr-1">Load Intensity:</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700" /> &lt;5 Low</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-500" /> 5-10 Mod</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-yellow-500" /> 11-20 Elev</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-orange-500" /> 21-30 High</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-red-500 shadow-sm shadow-red-500/50" /> 31+ Peak</span>
          </div>
        </div>

        {/* Structured Timeline Chart */}
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-2 items-end h-52 p-5 sm:p-6 bg-slate-950/90 rounded-3xl border border-slate-800 shadow-inner">
            {hourlyVolume.map((item) => {
              const val = item.val;
              const intensity =
                val > 30
                  ? "bg-red-500 shadow-md shadow-red-500/50"
                  : val > 20
                  ? "bg-orange-500 shadow-sm shadow-orange-500/50"
                  : val > 10
                  ? "bg-yellow-500"
                  : val > 4
                  ? "bg-blue-500"
                  : "bg-slate-800";
              const heightPct = Math.max(16, (val / 42) * 100);

              return (
                <div key={item.hour} className="flex flex-col items-center justify-end h-full group relative">
                  {/* Floating tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-20 pointer-events-none bg-slate-900 border border-slate-700 text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                    {item.label}: {val} calls
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-lg ${intensity} transition-all duration-300 hover:brightness-125 cursor-pointer`}
                  />
                  <span className="text-[10px] font-mono text-slate-500 mt-2.5 group-hover:text-white transition-colors">
                    {item.hour % 4 === 0 ? `${item.hour}h` : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Prominent Peak Load Banner */}
          <div className="p-4 sm:p-5 bg-amber-950/30 border border-amber-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm font-sans">
            <div className="flex items-center gap-3 text-amber-300 font-medium">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <span>
                <strong>Peak Inflow Window: 14:00 - 16:00</strong> — Coincides with monsoonal runoff surge & rush-hour traffic collisions.
              </span>
            </div>
            <div className="font-mono text-red-400 font-bold text-xs bg-red-950/80 px-3.5 py-1.5 rounded-xl border border-red-800 self-start sm:self-center">
              Max Intake: 42 Incidents/Hr (14:00)
            </div>
          </div>
        </div>
      </div>

      {/* ── Section F: Executive Strategic Insights & EOC Audit Takeaways */}
      <div className="card p-7 sm:p-10 rounded-3xl bg-slate-900/90 border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shadow-inner">
            <Info size={18} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
              Strategic Operations Review & Leadership Insights
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Key operational observations derived from cross-agency CAD logs and SLA benchmarks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Insight 1 */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold font-mono text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle size={15} /> Dispatch Velocity Benchmark
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              Medical response SLA compliance stands at 98.2%, with 108 EMS units arriving 1.6 minutes ahead of the national 8.0-minute target standard across high-density urban wards.
            </p>
          </div>

          {/* Insight 2 */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold font-mono text-blue-400 uppercase flex items-center gap-2">
              <Building2 size={15} /> Regional Health Network Routing
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              Civil Hospital ICU occupancy has reached 84%. The automated diversion protocol successfully routed 18 non-trauma admissions to SVP Hospital, preventing emergency room saturation.
            </p>
          </div>

          {/* Insight 3 */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold font-mono text-purple-400 uppercase flex items-center gap-2">
              <FileCheck size={15} /> AI Governance & Decision Support
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              The 92.5% AI recommendation approval rate confirms alignment with incident command protocols. Zero unverified algorithmic dispatches occurred, maintaining 100% human authorization compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
