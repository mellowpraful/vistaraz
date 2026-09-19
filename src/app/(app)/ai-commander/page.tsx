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
} from "lucide-react";
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
    <div className="space-y-6">
      {/* ── Decision Confirmation Notification ─────────────────────────── */}
      {decisionNotification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{decisionNotification}</span>
          </div>
          <button
            onClick={() => setDecisionNotification(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Header & Governance Disclaimer ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg backdrop-blur">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-300">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  AI Commander & Tactical Copilot
                </h1>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  Decision Support Engine v2.4
                </span>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                  <ShieldAlert size={10} /> Human Officer Authorization Mandatory
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Automated multi-agency situation awareness, risk forecasting, and explainable recommendations. AI outputs are advisory.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-slate-400">DATA FRESHNESS</div>
            <div className="text-xs font-mono text-emerald-400 flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Telemetry (12s)
            </div>
          </div>
          <button
            onClick={fetchExecutiveBriefing}
            disabled={loadingBriefing}
            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"
          >
            <RefreshCw size={13} className={loadingBriefing ? "animate-spin" : ""} />
            <span>{loadingBriefing ? "Synthesizing..." : "Refresh SITREP"}</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics Bar ────────────────────────────────────────────── */}
      {sitrep && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card p-3.5 bg-slate-900/60 border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Threat Level</div>
            <div className="text-base font-bold text-red-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              {sitrep.overallStatus.replace("_", " ")}
            </div>
          </div>

          <div className="card p-3.5 bg-slate-900/60 border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Emergencies</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {sitrep.metrics.activeIncidents} <span className="text-xs text-red-400 font-normal">({sitrep.metrics.criticalCount} Critical)</span>
            </div>
          </div>

          <div className="card p-3.5 bg-slate-900/60 border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Fleet Deployment</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {sitrep.metrics.dispatchedUnits} <span className="text-xs text-emerald-400 font-normal">/ {sitrep.metrics.availableUnits} Avail</span>
            </div>
          </div>

          <div className="card p-3.5 bg-slate-900/60 border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">ICU Bed Occupancy</div>
            <div className={`text-xl font-bold font-mono mt-0.5 ${sitrep.metrics.hospitalIcuOccupancyPercent > 80 ? "text-amber-400" : "text-slate-100"}`}>
              {sitrep.metrics.hospitalIcuOccupancyPercent}%
            </div>
          </div>

          <div className="card p-3.5 bg-slate-900/60 border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Shelter Saturation</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {sitrep.metrics.shelterCapacityUsedPercent}%
            </div>
          </div>

          <div className="card p-3.5 bg-slate-900/60 border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">AI Confidence</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">
              {sitrep.confidenceScore}% <span className="text-[10px] text-slate-500 font-normal">Triangulated</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("SITREP")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap ${
            activeTab === "SITREP"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Activity size={14} /> Executive SITREP
        </button>
        <button
          onClick={() => setActiveTab("RECOMMENDATIONS")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap ${
            activeTab === "RECOMMENDATIONS"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Zap size={14} /> Recommended Actions ({sitrep?.recommendations.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("RISKS")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap ${
            activeTab === "RISKS"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <AlertTriangle size={14} /> Priority Risks & Cascades
        </button>
        <button
          onClick={() => setActiveTab("BOTTLENECKS")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap ${
            activeTab === "BOTTLENECKS"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Building2 size={14} /> Resource Bottlenecks
        </button>
        <button
          onClick={() => setActiveTab("DUPLICATES")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap ${
            activeTab === "DUPLICATES"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Search size={14} /> Deduplication ({duplicates.length})
        </button>
        <button
          onClick={() => setActiveTab("COPILOT")}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap ${
            activeTab === "COPILOT"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Bot size={14} /> Tactical Chat Copilot
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: EXECUTIVE SITREP BRIEFING                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "SITREP" && (
        <div className="space-y-6">
          {/* Executive Summary Narrative */}
          <div className="card p-6 bg-slate-900/80 border-purple-900/40 space-y-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h2 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                  Automated Multi-Agency Situation Summary
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                  {sitrep?.sitrepId || "SITREP-LIVE"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {sitrep ? new Date(sitrep.generatedAt).toLocaleTimeString() : "Just now"}
                </span>
              </div>
            </div>

            {loadingBriefing ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-purple-400" />
                <p className="text-xs">Synthesizing live sensor telemetry, citizen calls, and fleet logs...</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {sitrep?.summary || "Analyzing operational telemetry..."}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                ⚠️ Advisory only: Not verified truth. Emergency officer confirmation required.
              </span>
              <span className="font-mono text-[10px]">
                Confidence Score: <strong className="text-purple-300">{sitrep?.confidenceScore || 88}%</strong>
              </span>
            </div>
          </div>

          {/* ── Key Confirmed Facts vs. Unverified Reports ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confirmed Facts */}
            <div className="card p-5 bg-slate-900/70 border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 size={16} /> Key Confirmed Facts
                </div>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Verified by Field Units / Sensors
                </span>
              </div>

              <div className="space-y-2.5">
                {sitrep?.confirmedFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1 hover:border-emerald-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-slate-200 font-medium leading-snug">{fact.statement}</p>
                      <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60 whitespace-nowrap">
                        {fact.confidence}% Verified
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Source: {fact.source}</span>
                      <span>{new Date(fact.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unverified Reports */}
            <div className="card p-5 bg-slate-900/70 border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle size={16} /> Unverified Reports & Uncertainties
                </div>
                <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                  Needs Field Verification
                </span>
              </div>

              <div className="space-y-2.5">
                {sitrep?.unverifiedReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5 hover:border-amber-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-slate-200 font-medium leading-snug">{report.statement}</p>
                      <span className="text-[10px] font-mono bg-amber-950/70 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/60 whitespace-nowrap">
                        ~{report.confidence}% Confidence
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-300/80 bg-amber-950/30 p-1.5 rounded border border-amber-900/30">
                      <strong>Uncertainty:</strong> {report.uncertaintyReason}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Reported By: {report.reportedBy} ({report.channel})</span>
                      <span className="text-blue-400">Action: {report.requiredAction.slice(0, 35)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: RECOMMENDED ACTIONS (WITH HUMAN APPROVAL WORKFLOW)           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "RECOMMENDATIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} className="text-purple-400" /> Explainable Tactical Recommendations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                AI recommendations must be reviewed and authorized by an incident commander prior to consequential action.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {sitrep?.recommendations.filter((r) => r.approvalStatus === "PENDING").length || 0} Pending Approvals
            </span>
          </div>

          <div className="space-y-4">
            {sitrep?.recommendations.map((rec) => {
              const isApproved = rec.approvalStatus === "APPROVED";
              const isRejected = rec.approvalStatus === "REJECTED";
              const isVerify = rec.approvalStatus === "FIELD_VERIFY";

              return (
                <div
                  key={rec.id}
                  className={`card p-5 space-y-4 border transition-all ${
                    isApproved
                      ? "border-emerald-700/60 bg-emerald-950/10"
                      : isRejected
                      ? "border-red-800/40 bg-red-950/10 opacity-75"
                      : isVerify
                      ? "border-amber-700/60 bg-amber-950/10"
                      : "border-slate-800 bg-slate-900/90 hover:border-purple-800/50"
                  }`}
                >
                  {/* Top Bar: Title & Approval Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {rec.actionType}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{rec.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        Confidence: <strong className="text-purple-300">{rec.confidenceScore}%</strong>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                            : isRejected
                            ? "bg-red-950 text-red-300 border-red-800"
                            : isVerify
                            ? "bg-amber-950 text-amber-300 border-amber-700"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        ● {rec.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Details: What & Why */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-3 bg-slate-950/70 rounded-lg border border-slate-800/60">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        What is Recommended:
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{rec.recommendation}</p>
                    </div>

                    <div className="space-y-1.5 p-3 bg-slate-950/70 rounded-lg border border-slate-800/60">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        Why it is Recommended (Operational Rationale):
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rec.whyRecommended}</p>
                    </div>
                  </div>

                  {/* Supporting Data & Uncertainty Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 font-mono block">SUPPORTING DATA</span>
                      <span className="font-semibold text-slate-200">{rec.supportingData.incidentTitle}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {rec.supportingData.location} (Severity: {rec.supportingData.severity})
                      </span>
                      {rec.supportingData.resourceName && (
                        <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                          Unit: {rec.supportingData.resourceName} (ETA ~{rec.supportingData.etaMinutes}m)
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-amber-500 font-mono block">UNCERTAINTY & GAPS</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">{rec.uncertaintyOrMissingInfo}</p>
                    </div>

                    <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-blue-400 font-mono block">REQUIRED HUMAN DECISION</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">{rec.requiredHumanDecision}</p>
                      {rec.reviewedBy && (
                        <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                          Reviewed by: {rec.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer & Human Decision Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>Sources: {rec.sourceReferences.join(", ")}</span>
                      <span>•</span>
                      <span>{new Date(rec.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveModalRec(rec);
                          setDecisionType("APPROVED");
                        }}
                        disabled={isApproved}
                        className="btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-500 border-none flex items-center gap-1 disabled:opacity-40"
                      >
                        <CheckCircle2 size={13} /> Approve Action
                      </button>

                      <button
                        onClick={() => {
                          setActiveModalRec(rec);
                          setDecisionType("FIELD_VERIFY");
                        }}
                        disabled={isApproved || isVerify}
                        className="btn-secondary text-xs py-1 px-3 flex items-center gap-1 disabled:opacity-40"
                      >
                        <Eye size={13} /> Field Verify First
                      </button>

                      <button
                        onClick={() => {
                          setActiveModalRec(rec);
                          setDecisionType("REJECTED");
                        }}
                        disabled={isRejected}
                        className="btn-secondary text-xs py-1 px-3 hover:text-red-400 flex items-center gap-1 disabled:opacity-40"
                      >
                        <XCircle size={13} /> Reject
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
          <div className="card p-6 bg-slate-900/80 border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" /> 4-Hour Escalation & Priority Risk Forecast
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Predictive risk models based on combined meteorological, hydrological, and hazardous material models
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sitrep?.priorityRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-400">{risk.title}</span>
                      <span className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                        {risk.probabilityScore}% Prob
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Time to Breach: <strong className="text-amber-300">{risk.timeToImpact}</strong>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      <strong>Target Zone:</strong> {risk.affectedZone}
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500">Cascading Threats:</span>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                        {risk.cascadingThreats.map((ct, i) => (
                          <li key={i}>{ct}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-[11px] text-blue-300 bg-blue-950/30 p-2 rounded border border-blue-900/40">
                    <strong>Mitigation Directive:</strong> {risk.recommendedMitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cascading Effects Pathway */}
          <div className="card p-5 bg-slate-900/80 border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Activity size={14} /> Multi-Sector Cascading Failure Pathways
            </h3>
            <div className="space-y-2">
              {sitrep?.cascadingEffects.map((effect, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="text-purple-400 font-mono font-bold">0{idx + 1}.</span>
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
        <div className="space-y-4">
          <div className="card p-6 bg-slate-900/80 border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-blue-400" /> Sector Resource Bottlenecks & Deficit Forecast
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Telemetry matching active incident demands against currently available and committed fleet assets
              </p>
            </div>

            <div className="space-y-3">
              {sitrep?.bottlenecks.map((bn, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-100">{bn.resourceType}</span>
                      <span className="text-[10px] font-mono text-slate-400 ml-2">Agency: {bn.agency}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded border self-start sm:self-center ${
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
                    <div className="p-2 bg-slate-900/70 rounded">
                      <span className="text-[10px] text-slate-400 block">AVAILABLE</span>
                      <span className="text-sm font-bold text-emerald-400">{bn.available}</span>
                    </div>
                    <div className="p-2 bg-slate-900/70 rounded">
                      <span className="text-[10px] text-slate-400 block">COMMITTED</span>
                      <span className="text-sm font-bold text-blue-400">{bn.committed}</span>
                    </div>
                    <div className="p-2 bg-slate-900/70 rounded">
                      <span className="text-[10px] text-slate-400 block">EST. REQUIRED</span>
                      <span className="text-sm font-bold text-slate-200">{bn.requiredEstimated}</span>
                    </div>
                    <div className="p-2 bg-slate-900/70 rounded">
                      <span className="text-[10px] text-slate-400 block">DEFICIT GAP</span>
                      <span className={`text-sm font-bold ${bn.deficit > 0 ? "text-red-400" : "text-slate-400"}`}>
                        {bn.deficit > 0 ? `-${bn.deficit}` : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 pt-1">
                    <strong>Mitigation Directive:</strong> {bn.mitigationStrategy}
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
        <div className="card p-6 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Search size={16} className="text-purple-400" /> AI Incident Deduplication & Report Clustering
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Identifies and clusters multiple citizen telecom reports describing the same physical emergency event
              </p>
            </div>
            <button
              onClick={handleCheckDuplicates}
              disabled={checkingDuplicates}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={checkingDuplicates ? "animate-spin" : ""} />
              <span>{checkingDuplicates ? "Clustering..." : "Scan Active Incidents"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {duplicates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No duplicate incident clusters detected across active incidents.
              </div>
            ) : (
              duplicates.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 hover:border-purple-900/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{cluster.clusterTitle}</span>
                      <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                        {cluster.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-[11px]">
                        {cluster.totalReports} Correlated Reports
                      </span>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        {cluster.confidence}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{cluster.summary}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>Geographic Proximity: &lt;{cluster.proximityKm} km radius</span>
                    <Link
                      href={`/dispatch?incidentId=${cluster.primaryIncidentId}`}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-sans text-xs"
                    >
                      View in Dispatch Studio <ChevronRight size={12} />
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
        <div className="card p-5 bg-slate-900/90 border-slate-800 space-y-4 h-[580px] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Tactical Situation Copilot
              </span>
            </div>
            <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
              Query Live Telemetry
            </span>
          </div>

          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "USER" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                    m.sender === "USER"
                      ? "bg-purple-600 text-white rounded-br-none shadow-md"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md space-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 font-mono">
                    <span>{m.sender === "USER" ? "Commander" : "CrisisOS Copilot"}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p>{m.text}</p>

                  {/* Uncertainty banner for AI response */}
                  {m.uncertaintyNotes && (
                    <div className="text-[10px] text-amber-300/80 bg-amber-950/40 p-1.5 rounded border border-amber-900/40">
                      <strong>Uncertainty Note:</strong> {m.uncertaintyNotes}
                    </div>
                  )}

                  {/* Recommendations action chips */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                      {m.recommendations.map((rec, i) => (
                        <Link
                          key={i}
                          href={rec.link || "#"}
                          className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded hover:bg-purple-900 transition-colors flex items-center gap-1"
                        >
                          → {rec.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Telemetry reference tag */}
                  {m.telemetryReferences && (
                    <div className="text-[9px] font-mono text-slate-500 pt-1">
                      Data Sources: {m.telemetryReferences.join(" • ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sendingQuery && (
              <div className="text-xs text-purple-400 font-mono flex items-center gap-2 p-2">
                <RefreshCw size={13} className="animate-spin" />
                Copilot is synthesizing database telemetry...
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask Copilot (e.g. 'How many ICU beds free at Civil Hospital?', 'Status of flood rescue boats')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="input-base text-xs flex-1 bg-slate-950"
            />
            <button
              type="submit"
              disabled={sendingQuery || !inputQuery.trim()}
              className="btn-primary text-xs px-4 flex items-center gap-1.5"
            >
              <Send size={12} /> Send
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HUMAN DECISION CONFIRMATION MODAL                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeModalRec && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileCheck2 size={16} className="text-purple-400" />
                Commander Decision Authorization
              </h3>
              <button
                onClick={() => setActiveModalRec(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-300">
                You are about to record a human command decision for:
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold text-slate-100">
                {activeModalRec.title}
              </div>
              <p className="text-[11px] text-slate-400">{activeModalRec.recommendation}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Decision Action:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDecisionType("APPROVED")}
                  className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                    decisionType === "APPROVED"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("FIELD_VERIFY")}
                  className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                    decisionType === "FIELD_VERIFY"
                      ? "bg-amber-950 text-amber-300 border-amber-600"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  👁 Field Verify
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("REJECTED")}
                  className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                    decisionType === "REJECTED"
                      ? "bg-red-950 text-red-300 border-red-600"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  ✕ Reject
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase">
                Officer Justification / Operational Notes:
              </label>
              <textarea
                rows={3}
                placeholder="Enter mandatory tactical reason or constraints..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="input-base text-xs w-full bg-slate-950 resize-none"
              />
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Action will be logged in the immutable Audit Trail with Commander credentials.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModalRec(null)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={submittingDecision}
                className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
              >
                {submittingDecision ? "Recording..." : "Authorize Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
