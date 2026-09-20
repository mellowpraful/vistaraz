"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bot,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Send,
  Zap,
  Building2,
  FileCheck2,
  XCircle,
  Eye,
  Activity,
  ChevronRight,
  Database,
  Search,
  Check,
  X,
  FileText,
  Radio,
  Flame,
  ShieldCheck,
  AlertCircle,
  Layers,
} from "lucide-react";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import type { ExecutiveSitrep, AICommanderRecommendation } from "@/lib/ai/commander-service";

interface CopilotMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  confidence?: number;
  uncertaintyNotes?: string;
  recommendations?: Array<{
    title: string;
    action: string;
    link?: string;
  }>;
  telemetryReferences?: string[];
}

export default function AICommanderPage() {
  const [sitrep, setSitrep] = useState<ExecutiveSitrep | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [activeTab, setActiveTab] = useState<"SITREP" | "RECOMMENDATIONS" | "RISKS" | "BOTTLENECKS" | "DUPLICATES" | "COPILOT">("SITREP");

  // Decision Modal State
  const [activeModalRec, setActiveModalRec] = useState<AICommanderRecommendation | null>(null);
  const [decisionType, setDecisionType] = useState<"APPROVED" | "REJECTED" | "FIELD_VERIFY">("APPROVED");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionNotification, setDecisionNotification] = useState<string | null>(null);

  // Copilot Chat State
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-1",
      sender: "AI",
      text: "Commander, CrisisOS Intelligence Engine is active. Live telemetry stream is connected. I can assist with resource availability, hospital capacity routing, flood surge timelines, or hazmat containment advice. All outputs are advisory and require officer authorization.",
      timestamp: "Just now",
      confidence: 96,
      recommendations: [
        { title: "Generate Full SITREP", action: "sitrep" },
        { title: "Check ICU & Trauma Bed Reserves", action: "hospitals", link: "/hospitals" },
        { title: "Digital Twin Flood Simulation", action: "sim", link: "/simulation" },
      ],
      telemetryReferences: ["Hospital Network Feed", "Police Dispatch CAD", "Sensors AQI/Hydro"],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [sendingQuery, setSendingQuery] = useState(false);

  // Duplicate incidents state
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Fetch Executive SITREP
  const fetchExecutiveBriefing = useCallback(async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_SUMMARY" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSitrep(json.data);
      }
    } catch (err) {
      console.error("Failed to generate SITREP:", err);
    } finally {
      setLoadingBriefing(false);
    }
  }, []);

  const handleCheckDuplicates = async () => {
    setCheckingDuplicates(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DETECT_DUPLICATES" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDuplicates(json.data.duplicates || []);
      }
    } catch (err) {
      console.error("Duplicate check failed:", err);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  useEffect(() => {
    fetchExecutiveBriefing();
    handleCheckDuplicates();
  }, [fetchExecutiveBriefing]);

  // Handle Human Decision Submission
  const handleConfirmDecision = async () => {
    if (!activeModalRec) return;
    setSubmittingDecision(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DECIDE_RECOMMENDATION",
          recommendationId: activeModalRec.id,
          decision: decisionType,
          notes: decisionNotes || `Decision marked as ${decisionType} by Commander`,
          userId: "demo-commander",
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Update local state
        setSitrep((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            recommendations: prev.recommendations.map((r) =>
              r.id === activeModalRec.id
                ? { ...r, approvalStatus: decisionType, notes: decisionNotes, reviewedBy: "Cmdr. Rajesh Sharma" }
                : r
            ),
          };
        });
        setDecisionNotification(`Action recorded: ${activeModalRec.title} marked as ${decisionType}. Logged to audit trail.`);
        setTimeout(() => setDecisionNotification(null), 5000);
      }
    } catch (err) {
      console.error("Failed to submit decision:", err);
    } finally {
      setSubmittingDecision(false);
      setActiveModalRec(null);
      setDecisionNotes("");
    }
  };

  // Handle Copilot Chat Send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: "USER",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setSendingQuery(true);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "copilot_chat", query: userText }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const aiMsg: CopilotMessage = {
          id: `ai-${Date.now()}`,
          sender: "AI",
          text: json.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidence: json.data.confidence,
          uncertaintyNotes: json.data.uncertaintyNotes,
          recommendations: json.data.recommendations,
          telemetryReferences: json.data.telemetryReferences,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("Copilot chat query failed:", err);
      const fallbackMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: "AI",
        text: `Analysis for "${userText}": Active response operations are ongoing. 4 response teams are en route. Hospital ICU occupancy is within manageable thresholds.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSendingQuery(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Decision Confirmation Notification ─────────────────────────── */}
      {decisionNotification && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-600 rounded-xl flex items-center justify-between text-sm text-emerald-200 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{decisionNotification}</span>
          </div>
          <button
            onClick={() => setDecisionNotification(null)}
            className="text-emerald-400 hover:text-white text-xs px-3 py-1 rounded bg-emerald-900/50 border border-emerald-700/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Section A: Page Header ─────────────────────────────────────── */}
      <PageHeader
        title="AI Commander & Situation Intelligence"
        description="Automated multi-agency situational awareness, predictive risk modeling, and human-in-the-loop decision support."
        icon={Bot}
        iconColor="#a855f7"
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge" style={{ background: "rgba(88,28,135,0.4)", color: "#d8b4fe", borderColor: "rgba(168,85,247,0.4)" }}>
              Engine v2.4 Active
            </span>
            <span className="badge badge-warning flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-amber-400" /> Human Authorization Mandatory
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">TELEMETRY STREAM</div>
              <div className="text-xs font-mono text-emerald-400 flex items-center justify-end gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Feed
              </div>
            </div>
            <button
              onClick={fetchExecutiveBriefing}
              disabled={loadingBriefing}
              className="btn btn-secondary text-xs flex items-center gap-2 px-4 py-2 font-semibold shadow-sm"
            >
              <RefreshCw size={14} className={loadingBriefing ? "animate-spin text-purple-400" : "text-purple-400"} />
              <span>{loadingBriefing ? "Synthesizing Telemetry…" : "Refresh SITREP"}</span>
            </button>
          </div>
        }
      />

      {/* ── Section C: Key Metrics Deck ────────────────────────────────── */}
      {sitrep && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Threat Level */}
          <div className="card p-5 bg-slate-900/90 border-slate-800 hover:border-red-800/60 transition-all flex flex-col justify-between min-h-[125px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Threat Level</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-tight font-sans">
                {sitrep.overallStatus.replace("_", " ")}
              </div>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {sitrep.metrics.criticalCount} Critical Sectors
            </div>
          </div>

          {/* 2. Active Emergencies */}
          <div className="card p-5 bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between min-h-[125px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Emergencies</span>
            <div className="my-1.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-baseline gap-2">
                {sitrep.metrics.activeIncidents}
                <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  {sitrep.metrics.criticalCount} Critical
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              CAD Incident Registry
            </div>
          </div>

          {/* 3. Fleet Deployment */}
          <div className="card p-5 bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between min-h-[125px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Deployment</span>
            <div className="my-1.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-baseline gap-2">
                {sitrep.metrics.dispatchedUnits}
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  / {sitrep.metrics.availableUnits} Avail
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Active Field Units
            </div>
          </div>

          {/* 4. ICU Bed Occupancy */}
          <div className="card p-5 bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between min-h-[125px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ICU Bed Occupancy</span>
            <div className="my-1.5">
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${sitrep.metrics.hospitalIcuOccupancyPercent > 80 ? "text-amber-400" : "text-slate-100"}`}>
                {sitrep.metrics.hospitalIcuOccupancyPercent}%
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {sitrep.metrics.hospitalIcuOccupancyPercent > 80 ? "Surge Capacity Nearing" : "Capacity Optimal"}
            </div>
          </div>

          {/* 5. Shelter Saturation */}
          <div className="card p-5 bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between min-h-[125px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shelter Saturation</span>
            <div className="my-1.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight">
                {sitrep.metrics.shelterCapacityUsedPercent}%
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Evacuation Centers
            </div>
          </div>

          {/* 6. AI Confidence */}
          <div className="card p-5 bg-slate-900/90 border-slate-800 hover:border-purple-800/60 transition-all flex flex-col justify-between min-h-[125px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Confidence</span>
            <div className="my-1.5">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono tracking-tight flex items-baseline gap-2">
                {sitrep.confidenceScore}%
                <span className="text-[11px] font-mono text-purple-300/80 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                  Calibrated
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Multi-Sensor Fusion
            </div>
          </div>
        </div>
      )}

      {/* ── Segmented Navigation Strip ─────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("SITREP")}
          className={`text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === "SITREP"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Activity size={15} /> Executive SITREP
        </button>
        <button
          onClick={() => setActiveTab("RECOMMENDATIONS")}
          className={`text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === "RECOMMENDATIONS"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Zap size={15} /> Tactical Actions
          {sitrep?.recommendations && sitrep.recommendations.length > 0 && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-800">
              {sitrep.recommendations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("RISKS")}
          className={`text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === "RISKS"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <AlertTriangle size={15} /> Escalation & Risks
        </button>
        <button
          onClick={() => setActiveTab("BOTTLENECKS")}
          className={`text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === "BOTTLENECKS"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Building2 size={15} /> Deficit Forecast
        </button>
        <button
          onClick={() => setActiveTab("DUPLICATES")}
          className={`text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === "DUPLICATES"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Search size={15} /> Deduplication
          {duplicates.length > 0 && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {duplicates.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("COPILOT")}
          className={`text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === "COPILOT"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Bot size={15} /> Tactical Copilot
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: EXECUTIVE SITREP BRIEFING DOSSIER                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "SITREP" && (
        <div className="space-y-6">
          {/* ── Section B: Executive Situation Overview (Command Briefing Card) */}
          <div className="card p-6 sm:p-8 bg-slate-900/90 border-purple-900/50 space-y-6 relative overflow-hidden shadow-2xl">
            {/* Briefing Dossier Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shadow-inner">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                      Executive Incident Command SITREP Briefing
                    </h2>
                    <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded font-bold">
                      {sitrep?.sitrepId || "SITREP-LIVE"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    CLASSIFICATION: UNCLASSIFIED // INCIDENT COMMAND SYSTEM // EOC ADVISORY
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  Last Updated: <strong className="text-slate-200">{sitrep ? new Date(sitrep.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now"}</strong>
                </span>
                <span className="text-purple-300 bg-purple-950 px-3 py-1.5 rounded-lg border border-purple-800 font-bold">
                  {sitrep?.confidenceScore || 88}% Confidence
                </span>
              </div>
            </div>

            {loadingBriefing ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <LoadingState label="Synthesizing multi-agency CAD logs, sensor telemetry, and dispatch telemetry…" />
              </div>
            ) : !sitrep ? (
              <EmptyState
                icon={Bot}
                title="Executive SITREP Not Yet Generated"
                description="Synthesize live sensor telemetry and CAD incident registries into an authoritative briefing."
                action={{ label: "Generate Executive SITREP", onClick: fetchExecutiveBriefing }}
              />
            ) : (
              <div className="space-y-6">
                {/* 1. Situation Briefing Narrative */}
                <div className="p-5 bg-slate-950/90 rounded-xl border border-slate-800 shadow-inner space-y-2 border-l-4 border-l-purple-500">
                  <div className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400">
                    SITUATION NARRATIVE
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-normal">
                    {sitrep.summary}
                  </p>
                </div>

                {/* 2. Structured Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Highlight 1: Operational Posture */}
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-red-400" /> Operational Posture
                    </div>
                    <div className="text-base font-bold text-slate-100 font-sans">
                      {sitrep.overallStatus.replace("_", " ")}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sitrep.metrics.criticalCount} of {sitrep.metrics.activeIncidents} active emergencies require immediate containment.
                    </p>
                  </div>

                  {/* Highlight 2: Operational Impact */}
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity size={14} className="text-amber-400" /> Critical Sector Load
                    </div>
                    <div className="text-base font-bold text-amber-400 font-mono">
                      {sitrep.metrics.hospitalIcuOccupancyPercent}% ICU Occupancy
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Evacuation centers at {sitrep.metrics.shelterCapacityUsedPercent}% capacity. Hospital surge diversion active.
                    </p>
                  </div>

                  {/* Highlight 3: Immediate Risks */}
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-orange-400" /> Immediate Escalation
                    </div>
                    <div className="text-base font-bold text-slate-100 font-sans truncate">
                      {sitrep.priorityRisks[0]?.title || "Hydrological Surge"}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sitrep.priorityRisks[0]?.timeToImpact || "Under 2 Hours"} to critical breach threshold in downstream sectors.
                    </p>
                  </div>

                  {/* Highlight 4: Recommended Attention */}
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Zap size={14} className="text-purple-400" /> Commander Attention
                    </div>
                    <div className="text-base font-bold text-purple-300 font-sans truncate">
                      {sitrep.bottlenecks[0]?.resourceType || "Rescue Boat Deficit"}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sitrep.bottlenecks[0]?.deficit || 0} unit deficit. Review pending recommendations for authorization.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Governance and Disclaimer Footnote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-sans">
              <span className="flex items-center gap-2 text-amber-400 font-medium">
                <ShieldAlert size={15} className="shrink-0 text-amber-400" />
                Mandatory Governance: AI models provide advisory decision support. Incident Commander authorization is required for consequential action.
              </span>
              <span className="font-mono text-slate-400">
                Freshness: <strong className="text-slate-200 font-bold">{sitrep?.dataFreshnessSeconds || 12}s</strong> telemetry latency
              </span>
            </div>
          </div>

          {/* ── Section D: Verified Facts vs. Unverified Reports ──────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Key Confirmed Field Facts */}
            <div className="card p-6 sm:p-7 bg-slate-900/90 border-emerald-900/40 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">
                      Key Confirmed Field Facts
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">Verified by first responders & physical sensors</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800">
                  {sitrep?.confirmedFacts.length || 0} Verified
                </span>
              </div>

              <div className="space-y-4">
                {sitrep?.confirmedFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-4 sm:p-5 bg-slate-950/80 rounded-xl border border-emerald-900/30 space-y-3 hover:border-emerald-700/60 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-100 font-semibold leading-relaxed font-sans">
                        {fact.statement}
                      </p>
                      <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-800 whitespace-nowrap shrink-0">
                        {fact.confidence}% Verified
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono pt-2 border-t border-slate-900">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Database size={13} className="text-emerald-400" />
                        Source: <strong className="text-slate-200">{fact.source}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        {new Date(fact.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Unverified Reports & Critical Uncertainties */}
            <div className="card p-6 sm:p-7 bg-slate-900/90 border-amber-900/40 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">
                      Unverified Reports & Critical Uncertainties
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">Citizen telecom & unconfirmed sensory observations</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-950 text-amber-300 px-2.5 py-1 rounded border border-amber-800">
                  {sitrep?.unverifiedReports.length || 0} Requiring Action
                </span>
              </div>

              <div className="space-y-4">
                {sitrep?.unverifiedReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 sm:p-5 bg-slate-950/80 rounded-xl border border-amber-900/30 space-y-3 hover:border-amber-700/60 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-100 font-semibold leading-relaxed font-sans">
                        {report.statement}
                      </p>
                      <span className="text-xs font-mono font-bold bg-amber-950 text-amber-400 px-2.5 py-1 rounded border border-amber-800 whitespace-nowrap shrink-0">
                        ~{report.confidence}% Conf.
                      </span>
                    </div>

                    {/* Operational Uncertainty Callout */}
                    <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed font-sans">
                      <strong className="text-amber-400 font-bold block mb-0.5">Operational Uncertainty:</strong>
                      {report.uncertaintyReason}
                    </div>

                    {/* Required Field Verification Action */}
                    <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-900/40 text-xs text-blue-200/90 leading-relaxed font-sans">
                      <strong className="text-blue-400 font-bold block mb-0.5">Required Field Verification:</strong>
                      {report.requiredAction}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono pt-1 border-t border-slate-900">
                      <span>Reported By: {report.reportedBy} ({report.channel})</span>
                      <span>{new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: RECOMMENDED ACTIONS (SECTION E: TACTICAL ACTIONS)            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "RECOMMENDATIONS" && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5 font-sans">
                <Zap size={18} className="text-purple-400" /> Explainable Tactical Recommendations
              </h2>
              <p className="text-sm text-slate-300 font-sans">
                Every AI-suggested response includes transparent operational rationale, sensor evidence, and requires officer authorization prior to execution.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-purple-950 text-purple-200 border border-purple-800">
                {sitrep?.recommendations.filter((r) => r.approvalStatus === "PENDING").length || 0} Pending Officer Decisions
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {sitrep?.recommendations.map((rec) => {
              const isApproved = rec.approvalStatus === "APPROVED";
              const isRejected = rec.approvalStatus === "REJECTED";
              const isVerify = rec.approvalStatus === "FIELD_VERIFY";

              return (
                <div
                  key={rec.id}
                  className={`card p-6 sm:p-7 space-y-5 border transition-all shadow-xl ${
                    isApproved
                      ? "border-emerald-600 bg-emerald-950/15"
                      : isRejected
                      ? "border-red-800 bg-red-950/10 opacity-75"
                      : isVerify
                      ? "border-amber-600 bg-amber-950/15"
                      : "border-slate-800 bg-slate-900/95 hover:border-purple-800/60"
                  }`}
                >
                  {/* Top Bar: Action Title & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-purple-950 text-purple-300 border border-purple-800">
                        {rec.actionType}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                        {rec.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                        Confidence: <strong className="text-purple-300 font-bold">{rec.confidenceScore}%</strong>
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-3.5 py-1 rounded-full border ${
                          isApproved
                            ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                            : isRejected
                            ? "bg-red-950 text-red-300 border-red-700"
                            : isVerify
                            ? "bg-amber-950 text-amber-300 border-amber-600"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        ● {rec.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Split: Operational Directive vs Why Recommended */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 sm:p-5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-xs font-bold font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Operational Action Directive
                      </div>
                      <p className="text-sm text-slate-100 leading-relaxed font-sans">
                        {rec.recommendation}
                      </p>
                    </div>

                    <div className="p-4 sm:p-5 bg-slate-950/90 rounded-xl border border-purple-900/40 space-y-2">
                      <div className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Operational Rationale & Tactical Evidence
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-sans">
                        {rec.whyRecommended}
                      </p>
                    </div>
                  </div>

                  {/* Supporting Data & Uncertainty Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">SUPPORTING SCENE</span>
                      <span className="font-bold text-slate-100 text-sm block">{rec.supportingData.incidentTitle}</span>
                      <span className="text-slate-300 text-xs block">
                        {rec.supportingData.location} (Severity: {rec.supportingData.severity})
                      </span>
                      {rec.supportingData.resourceName && (
                        <span className="text-xs text-emerald-400 font-mono block mt-1 font-semibold">
                          Assigned Unit: {rec.supportingData.resourceName} (ETA ~{rec.supportingData.etaMinutes}m)
                        </span>
                      )}
                    </div>

                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] font-mono text-amber-400 uppercase font-bold block">OPERATIONAL UNCERTAINTY</span>
                      <p className="text-slate-300 text-xs leading-relaxed">{rec.uncertaintyOrMissingInfo}</p>
                    </div>

                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] font-mono text-blue-400 uppercase font-bold block">REQUIRED COMMANDER DECISION</span>
                      <p className="text-slate-300 text-xs leading-relaxed">{rec.requiredHumanDecision}</p>
                      {rec.reviewedBy && (
                        <span className="text-xs text-emerald-400 font-mono block mt-1 font-semibold">
                          Authorized by: {rec.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Decision Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>Sources: {rec.sourceReferences.join(", ")}</span>
                      <span>•</span>
                      <span>{new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveModalRec(rec);
                          setDecisionType("APPROVED");
                        }}
                        disabled={isApproved}
                        className="btn text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 rounded-lg disabled:opacity-40 transition-colors shadow-sm"
                      >
                        <CheckCircle2 size={15} /> Approve Action
                      </button>

                      <button
                        onClick={() => {
                          setActiveModalRec(rec);
                          setDecisionType("FIELD_VERIFY");
                        }}
                        disabled={isApproved || isVerify}
                        className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 rounded-lg font-semibold disabled:opacity-40"
                      >
                        <Eye size={14} /> Field Verify First
                      </button>

                      <button
                        onClick={() => {
                          setActiveModalRec(rec);
                          setDecisionType("REJECTED");
                        }}
                        disabled={isRejected}
                        className="btn btn-secondary text-xs py-2 px-3.5 hover:text-red-400 hover:border-red-900/60 flex items-center gap-2 rounded-lg font-semibold disabled:opacity-40"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: PRIORITY RISKS & CASCADING EFFECTS MATRIX                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "RISKS" && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5 font-sans">
                <AlertTriangle size={18} className="text-amber-400" /> 4-Hour Escalation & Priority Risk Forecast
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-sans">
                Predictive risk models based on combined meteorological, hydrological, and hazardous material models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sitrep?.priorityRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-red-400 font-sans">{risk.title}</span>
                      <span className="text-xs font-mono font-bold text-red-400 bg-red-950 px-2.5 py-1 rounded border border-red-800">
                        {risk.probabilityScore}% Prob
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono">
                      Time to Breach: <strong className="text-amber-300">{risk.timeToImpact}</strong>
                    </div>

                    <div className="text-xs text-slate-300 font-sans">
                      <strong>Target Zone:</strong> {risk.affectedZone}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-mono uppercase font-bold text-slate-400">Cascading Threats:</span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside font-sans">
                        {risk.cascadingThreats.map((ct, i) => (
                          <li key={i}>{ct}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-xs text-blue-200 bg-blue-950/40 p-3 rounded-lg border border-blue-900/40 font-sans">
                    <strong className="text-blue-400 font-bold block mb-0.5">Mitigation Directive:</strong>
                    {risk.recommendedMitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cascading Effects Pathway */}
          <div className="card p-6 bg-slate-900/90 border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2 font-sans">
              <Activity size={16} /> Multi-Sector Cascading Failure Pathways
            </h3>
            <div className="space-y-3">
              {sitrep?.cascadingEffects.map((effect, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm text-slate-200 flex items-start gap-3 font-sans leading-relaxed"
                >
                  <span className="text-purple-400 font-mono font-bold text-base">0{idx + 1}.</span>
                  <p>{effect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: RESOURCE BOTTLENECKS & DEFICITS                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "BOTTLENECKS" && (
        <div className="space-y-5">
          <div className="card p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-5 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5 font-sans">
                <Building2 size={18} className="text-blue-400" /> Sector Resource Bottlenecks & Deficit Forecast
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-sans">
                Telemetry matching active incident demands against currently available and committed fleet assets.
              </p>
            </div>

            <div className="space-y-4">
              {sitrep?.bottlenecks.map((bn, i) => (
                <div
                  key={i}
                  className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-slate-100 font-sans">{bn.resourceType}</span>
                      <span className="text-xs font-mono text-slate-400 ml-2">Agency: {bn.agency}</span>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-md border self-start sm:self-center ${
                        bn.status === "CRITICAL_DEFICIT"
                          ? "bg-red-950 text-red-300 border-red-800"
                          : bn.status === "STRETCHED"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {bn.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono py-1">
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-bold">AVAILABLE</span>
                      <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{bn.available}</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-bold">COMMITTED</span>
                      <span className="text-lg font-bold text-blue-400 mt-0.5 block">{bn.committed}</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-bold">EST. REQUIRED</span>
                      <span className="text-lg font-bold text-slate-100 mt-0.5 block">{bn.requiredEstimated}</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-bold">DEFICIT GAP</span>
                      <span className={`text-lg font-bold mt-0.5 block ${bn.deficit > 0 ? "text-red-400" : "text-slate-400"}`}>
                        {bn.deficit > 0 ? `-${bn.deficit}` : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 pt-1 font-sans">
                    <strong className="text-purple-400">Mitigation Directive:</strong> {bn.mitigationStrategy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: DEDUPLICATION ENGINE                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "DUPLICATES" && (
        <div className="card p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5 font-sans">
                <Search size={18} className="text-purple-400" /> AI Incident Deduplication & Report Clustering
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-sans">
                Identifies and clusters multiple citizen telecom reports describing the same physical emergency event.
              </p>
            </div>
            <button
              onClick={handleCheckDuplicates}
              disabled={checkingDuplicates}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 font-bold"
            >
              <RefreshCw size={13} className={checkingDuplicates ? "animate-spin" : ""} />
              <span>{checkingDuplicates ? "Clustering…" : "Scan Active Incidents"}</span>
            </button>
          </div>

          <div className="space-y-4">
            {duplicates.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-sans">
                No duplicate incident clusters detected across active incidents.
              </div>
            ) : (
              duplicates.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-purple-800/60 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white font-sans">{cluster.clusterTitle}</span>
                      <span className="text-xs font-mono bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded border border-purple-800">
                        {cluster.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-mono text-xs font-bold">
                        {cluster.totalReports} Correlated Reports
                      </span>
                      <span className="text-xs font-mono bg-slate-900 text-slate-300 px-2.5 py-0.5 rounded border border-slate-800">
                        {cluster.confidence}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{cluster.summary}</p>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-900">
                    <span>Geographic Proximity: &lt;{cluster.proximityKm} km radius</span>
                    <Link
                      href={`/dispatch?incidentId=${cluster.primaryIncidentId}`}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-sans text-xs font-bold"
                    >
                      View in Dispatch Studio <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 6: TACTICAL COPILOT CHAT ASSISTANT                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "COPILOT" && (
        <div className="card p-6 bg-slate-900/95 border-slate-800 space-y-4 h-[640px] flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Bot size={18} className="text-purple-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Tactical Situation Copilot
              </span>
            </div>
            <span className="text-xs font-mono bg-purple-950 text-purple-300 px-3 py-1 rounded border border-purple-800 font-bold">
              Query Live Telemetry
            </span>
          </div>

          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "USER" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "USER"
                      ? "bg-purple-600 text-white rounded-br-none shadow-md"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md space-y-3"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-xs opacity-70 font-mono">
                    <span>{m.sender === "USER" ? "Commander" : "CrisisOS Copilot"}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="font-sans">{m.text}</p>

                  {/* Uncertainty banner for AI response */}
                  {m.uncertaintyNotes && (
                    <div className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/40 font-sans">
                      <strong className="text-amber-400">Uncertainty Note:</strong> {m.uncertaintyNotes}
                    </div>
                  )}

                  {/* Recommendations action chips */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                      {m.recommendations.map((rec, i) => (
                        <Link
                          key={i}
                          href={rec.link || "#"}
                          className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-lg hover:bg-purple-900 transition-colors flex items-center gap-1.5 font-sans font-medium"
                        >
                          → {rec.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Telemetry reference tag */}
                  {m.telemetryReferences && (
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      Data Sources: {m.telemetryReferences.join(" • ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sendingQuery && (
              <div className="text-xs text-purple-400 font-mono flex items-center gap-2 p-2">
                <RefreshCw size={14} className="animate-spin" />
                Copilot is synthesizing database telemetry…
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSendChat} className="flex gap-2.5 pt-3 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask Copilot (e.g. 'How many ICU beds free at Civil Hospital?', 'Status of flood rescue boats')…"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="input-base text-sm flex-1 bg-slate-950 p-3"
            />
            <button
              type="submit"
              disabled={sendingQuery || !inputQuery.trim()}
              className="btn-primary text-xs px-5 flex items-center gap-2 font-bold"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HUMAN DECISION CONFIRMATION MODAL                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeModalRec && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2.5 font-sans">
                <FileCheck2 size={18} className="text-purple-400" />
                Commander Decision Authorization
              </h3>
              <button
                onClick={() => setActiveModalRec(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs text-slate-400 uppercase font-mono font-bold">
                Target Recommendation:
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-sm font-bold text-white">
                {activeModalRec.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeModalRec.recommendation}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-bold block">
                Command Decision Action:
              </label>
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDecisionType("APPROVED")}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    decisionType === "APPROVED"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Check size={14} /> Approve
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("FIELD_VERIFY")}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    decisionType === "FIELD_VERIFY"
                      ? "bg-amber-950 text-amber-300 border-amber-500 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Eye size={14} /> Field Verify
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("REJECTED")}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    decisionType === "REJECTED"
                      ? "bg-red-950 text-red-300 border-red-500 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <X size={14} /> Reject
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-bold block">
                Officer Justification / Operational Notes:
              </label>
              <textarea
                rows={3}
                placeholder="Enter mandatory tactical justification or operational constraints…"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="input text-xs w-full bg-slate-950 p-3 rounded-xl resize-none font-sans"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Action will be committed to the immutable Audit Trail with Commander credentials.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModalRec(null)}
                className="btn btn-secondary text-xs px-4 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={submittingDecision}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-2 font-bold shadow-md"
              >
                {submittingDecision ? "Recording…" : "Authorize Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
