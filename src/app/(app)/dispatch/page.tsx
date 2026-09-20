"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { extractApiData, parseJsonSafe } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import { DispatchIncidentBanner } from "@/components/dispatch/DispatchIncidentBanner";
import {
  DispatchRecommendationCard,
  DispatchRecommendationItem,
} from "@/components/dispatch/DispatchRecommendationCard";
import { DispatchApprovalModal } from "@/components/dispatch/DispatchApprovalModal";
import { DispatchRejectionModal } from "@/components/dispatch/DispatchRejectionModal";
import { CommanderOverrideDrawer } from "@/components/dispatch/CommanderOverrideDrawer";
import { EligibilityAuditDrawer, IneligibleUnit } from "@/components/dispatch/EligibilityAuditDrawer";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  RotateCcw,
  Zap,
  Radio,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Check,
  Clock,
  MapPin,
  Flame,
  Info,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  Layers,
  Activity,
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  requiredCapabilities: string | null;
  affectedCount?: number | null;
  injuryCount?: number | null;
  description?: string;
  createdAt?: string | Date;
}

interface ResourceOption {
  id: string;
  name: string;
  type: string;
  status: string;
  agency?: { name: string } | null;
  capabilities?: Array<{ capability: string }>;
}

function DispatchContent() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get("incidentId") || "";

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidentId);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [recommendations, setRecommendations] = useState<DispatchRecommendationItem[]>([]);
  const [ineligibleUnits, setIneligibleUnits] = useState<IneligibleUnit[]>([]);
  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Manual Override Form
  const [showOverride, setShowOverride] = useState(false);

  // Modals state
  const [approvalRec, setApprovalRec] = useState<DispatchRecommendationItem | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [rejectRec, setRejectRec] = useState<DispatchRecommendationItem | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Fetch all active incidents
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch("/api/incidents");
      const json = await res.json();
      const data = extractApiData<Incident>(json);
      setIncidents(data);

      if (!selectedIncidentId && data.length > 0) {
        setSelectedIncidentId(data[0].id);
        setSelectedIncident(data[0]);
      } else if (selectedIncidentId) {
        const found = data.find((i) => i.id === selectedIncidentId);
        if (found) setSelectedIncident(found);
      }
    } catch (err: any) {
      console.error("Failed to load incidents:", err);
      setErrorBanner("Failed to sync active emergency incidents feed");
    } finally {
      setLoading(false);
    }
  }, [selectedIncidentId]);

  // Fetch all resources for manual override drawer
  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/resources");
      const json = await res.json();
      const data = extractApiData<ResourceOption>(json);
      setResources(data);
    } catch (err) {
      console.error("Failed to load resources:", err);
    }
  }, []);

  // Fetch recommendations for the selected incident
  const fetchRecommendations = useCallback(async (incId: string, isManual = false) => {
    if (!incId) return;
    if (isManual) setIsRefreshing(true);
    setRecommending(true);
    setErrorBanner(null);

    try {
      const res = await fetch("/api/dispatch/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: incId, strict: true }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate capability recommendations");
      }

      const recs = json.data || json.recommendations || [];
      setRecommendations(recs);
      setIneligibleUnits(json.ineligible || []);
    } catch (err: any) {
      console.error("Failed to generate recommendations:", err);
      setErrorBanner(err.message || "Failed to generate AI capability recommendations");
      setRecommendations([]);
    } finally {
      setRecommending(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchResources();
  }, [fetchIncidents, fetchResources]);

  useEffect(() => {
    if (selectedIncidentId) {
      const found = incidents.find((i) => i.id === selectedIncidentId);
      if (found) setSelectedIncident(found);
      fetchRecommendations(selectedIncidentId);
    }
  }, [selectedIncidentId, incidents, fetchRecommendations]);

  // Handle open approval modal
  const handleOpenApprove = (rec: DispatchRecommendationItem) => {
    setApprovalRec(rec);
    setIsApprovalOpen(true);
  };

  // Handle open reject modal
  const handleOpenReject = (rec: DispatchRecommendationItem) => {
    setRejectRec(rec);
    setIsRejectOpen(true);
  };

  const handleApprovalSuccess = (recId: string) => {
    setFeedbackBanner({
      type: "success",
      text: `Dispatch order successfully authorized and transmitted to field unit terminal.`,
    });
    fetchRecommendations(selectedIncidentId);
    fetchIncidents();
    fetchResources();
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  const handleRejectionSuccess = (recId: string) => {
    setFeedbackBanner({
      type: "success",
      text: `Recommendation rejection and operational rationale successfully logged to compliance audit trail.`,
    });
    fetchRecommendations(selectedIncidentId);
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  const handleOverrideSuccess = () => {
    setFeedbackBanner({
      type: "success",
      text: `Commander Manual Tactical Override successfully executed and committed to audit trail.`,
    });
    fetchRecommendations(selectedIncidentId);
    fetchIncidents();
    fetchResources();
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  // Parsed incident required capabilities
  const requiredCaps = useMemo(() => {
    if (!selectedIncident?.requiredCapabilities) return [];
    return parseJsonSafe<string[]>(selectedIncident.requiredCapabilities, []);
  }, [selectedIncident]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-9 animate-fade-in pb-24">
      {/* Top Studio Header */}
      <PageHeader
        title="RapidAid Dispatch Studio"
        description="Explainable multi-agency capability matching, route proximity scoring, and human-authorized resource allocation"
        icon={Zap}
        iconColor="#eab308"
        badge={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/70 border border-amber-800/80 rounded-xl text-xs font-mono text-amber-300 shadow-sm">
            <Radio size={14} className="text-amber-400 animate-pulse" />
            <span>Human Authorization Mandatory</span>
          </div>
        }
        actions={
          <button
            onClick={() => setShowOverride(!showOverride)}
            className={`btn btn-secondary text-xs sm:text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-sm cursor-pointer transition-all ${
              showOverride ? "border-amber-500 text-amber-300 bg-amber-950/40" : ""
            }`}
          >
            <ShieldAlert size={16} className="text-amber-400" />
            <span>{showOverride ? "Close Override" : "Commander Tactical Override"}</span>
          </button>
        }
      />

      {/* Dispatch Workflow Stages Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 sm:p-5 bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl">
        {[
          { step: "1", title: "Incident Selected", done: !!selectedIncident },
          { step: "2", title: "Capabilities Identified", done: requiredCaps.length > 0 },
          { step: "3", title: "Eligibility Screened", done: !loading && !recommending },
          { step: "4", title: "Candidates Ranked", done: recommendations.length > 0 },
          { step: "5", title: "Officer Authorized", done: false },
        ].map((s, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
              s.done
                ? "bg-emerald-950/40 border-emerald-800/60 shadow-sm"
                : "bg-slate-950/40 border-slate-800/60"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                s.done
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {s.done ? <Check size={14} strokeWidth={3} /> : s.step}
            </div>
            <span
              className={`text-xs font-semibold truncate ${
                s.done ? "text-emerald-300" : "text-slate-400"
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Global Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-slide-in shadow-lg ${
            feedbackBanner.type === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
              : "bg-red-950/90 border-red-800 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackBanner.type === "success" ? (
              <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-400 shrink-0" />
            )}
            <span className="font-medium">{feedbackBanner.text}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800/60"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {errorBanner && (
        <div className="p-4 bg-red-950/90 border border-red-800 rounded-2xl text-xs sm:text-sm text-red-200 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
            className="text-xs font-mono bg-red-900 hover:bg-red-800 text-white px-3 py-1.5 rounded-xl font-semibold"
          >
            Retry Match
          </button>
        </div>
      )}

      {/* Target Incident Selection & Assessment SITREP Banner */}
      <DispatchIncidentBanner
        incidents={incidents}
        selectedIncidentId={selectedIncidentId}
        selectedIncident={selectedIncident}
        requiredCaps={requiredCaps}
        recommending={recommending}
        onSelectIncident={(id) => setSelectedIncidentId(id)}
        onRecalculate={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
      />

      {/* Commander Manual Override Drawer */}
      {showOverride && selectedIncident && (
        <CommanderOverrideDrawer
          incidentId={selectedIncident.id}
          incidentTitle={selectedIncident.title}
          resources={resources}
          isOpen={showOverride}
          onClose={() => setShowOverride(false)}
          onSuccess={handleOverrideSuccess}
        />
      )}

      {/* Recommendations Feed Section */}
      <div className="space-y-6">
        <SectionHeader
          title="Ranked Candidate Recommendations"
          count={recommendations.length}
          icon={Zap}
          iconColor="#eab308"
          actions={
            <button
              onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
              disabled={recommending || isRefreshing}
              className="btn btn-secondary text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 font-semibold cursor-pointer shadow-sm"
            >
              <RotateCcw size={14} className={recommending ? "animate-spin text-blue-400" : ""} />
              <span>{recommending ? "Recalculating Match Matrix…" : "Recalculate AI Match"}</span>
            </button>
          }
        />

        {loading || recommending ? (
          <div className="card p-16 text-center rounded-3xl shadow-xl">
            <LoadingState label="Evaluating capability matrix, proximity routes, and fleet telemetry…" />
          </div>
        ) : recommendations.length === 0 ? (
          /* Structured Operational Diagnostic Panel when zero units are eligible */
          <div className="card p-8 sm:p-10 rounded-3xl space-y-7 border-l-4 border-amber-500 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <ShieldAlert size={24} className="text-amber-400 shrink-0" />
                <h3 className="text-lg sm:text-xl font-black text-slate-100">
                  No Units Currently Meet Hard Eligibility Criteria
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                All registered fleet units with the required capabilities ({requiredCaps.join(", ") || "specialized"})
                are currently committed to active field incidents or undergoing maintenance.
              </p>
            </div>

            {/* Diagnostic screening summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-mono">Total Fleet Screened</div>
                <div className="text-2xl font-black font-mono text-slate-100">
                  {resources.length} units
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-1">
                <div className="text-xs text-amber-400 font-mono">Active Field Deployments</div>
                <div className="text-2xl font-black font-mono text-amber-300">
                  {ineligibleUnits.filter(u => u.reasons.some(r => r.includes("DISPATCH") || r.includes("BUSY") || r.includes("EN_ROUTE") || r.includes("ON_SCENE"))).length} busy
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 space-y-1">
                <div className="text-xs text-blue-400 font-mono">Capability Incompatible</div>
                <div className="text-2xl font-black font-mono text-blue-300">
                  {ineligibleUnits.filter(u => u.reasons.some(r => r.includes("capability") || r.includes("Capability") || r.includes("Missing"))).length} units
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-1">
                <div className="text-xs text-red-400 font-mono">Out of Service / Refit</div>
                <div className="text-2xl font-black font-mono text-red-300">
                  {ineligibleUnits.filter(u => u.reasons.some(r => r.includes("SERVICE") || r.includes("MAINTENANCE") || r.includes("OOS"))).length} units
                </div>
              </div>
            </div>

            {/* Recommended Dispatcher Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-mono">
                Recommended Operational Actions:
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
                  className="btn btn-secondary text-xs sm:text-sm px-4 py-2 rounded-xl"
                >
                  <RotateCcw size={14} />
                  <span>Recalculate Match</span>
                </button>
                <button
                  onClick={() => setShowOverride(true)}
                  className="btn btn-primary text-xs sm:text-sm px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 border-amber-600 font-bold shadow-lg shadow-amber-600/20"
                >
                  <ShieldAlert size={15} />
                  <span>Open Tactical Override</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec, rank) => (
              <DispatchRecommendationCard
                key={rec.id}
                recommendation={rec}
                rank={rank}
                onApprove={handleOpenApprove}
                onReject={handleOpenReject}
                isProcessing={false}
              />
            ))}
          </div>
        )}

        {/* Fleet Eligibility Hard Filter Audit */}
        {selectedIncident && (
          <EligibilityAuditDrawer
            ineligibleUnits={ineligibleUnits}
            requiredCapabilities={requiredCaps}
          />
        )}
      </div>

      {/* Human Approval Confirmation Modal */}
      {selectedIncident && (
        <DispatchApprovalModal
          recommendation={approvalRec}
          incidentTitle={selectedIncident.title}
          incidentSeverity={selectedIncident.severity}
          isOpen={isApprovalOpen}
          onClose={() => {
            setIsApprovalOpen(false);
            setApprovalRec(null);
          }}
          onSuccess={handleApprovalSuccess}
        />
      )}

      {/* Human Rejection Modal */}
      <DispatchRejectionModal
        recommendation={rejectRec}
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectRec(null);
        }}
        onSuccess={handleRejectionSuccess}
      />
    </div>
  );
}

export default function DispatchPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <LoadingState label="Loading RapidAid Dispatch Studio..." />
        </div>
      }
    >
      <DispatchContent />
    </Suspense>
  );
}
