"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { extractApiData, parseJsonSafe } from "@/lib/utils";
import { INCIDENT_TYPE_ICONS } from "@/lib/types";
import {
  DispatchRecommendationCard,
  DispatchRecommendationItem,
} from "@/components/dispatch/DispatchRecommendationCard";
import { DispatchApprovalModal } from "@/components/dispatch/DispatchApprovalModal";
import { DispatchRejectionModal } from "@/components/dispatch/DispatchRejectionModal";
import { CommanderOverrideDrawer } from "@/components/dispatch/CommanderOverrideDrawer";
import { EligibilityAuditDrawer, IneligibleUnit } from "@/components/dispatch/EligibilityAuditDrawer";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import {
  RotateCcw,
  Zap,
  Radio,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Flame,
  Info,
  SlidersHorizontal,
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-blue-950 border border-blue-800 rounded-lg text-xl">⚡</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              RapidAid Dispatch Studio
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Explainable capability matching, proximity scoring, and human-authorized resource allocation
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/70 border border-blue-800/80 rounded-lg text-xs font-mono text-blue-300">
            <Radio size={14} className="text-blue-400 animate-pulse" />
            <span>Human Authorization Mandatory</span>
          </div>

          <button
            onClick={() => setShowOverride(!showOverride)}
            className={`btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 ${
              showOverride ? "border-amber-500 text-amber-300 bg-amber-950/30" : ""
            }`}
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span>{showOverride ? "Close Override" : "Commander Override"}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-slide-in ${
            feedbackBanner.type === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
              : "bg-red-950/90 border-red-800 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackBanner.type === "success" ? (
              <CheckCircle size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-red-400" />
            )}
            <span className="font-medium">{feedbackBanner.text}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {errorBanner && (
        <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
            className="text-xs bg-red-900 hover:bg-red-800 text-white px-2.5 py-1 rounded font-mono"
          >
            Retry Match
          </button>
        </div>
      )}

      {/* Target Incident Selection & Assessment SITREP */}
      <div className="card p-5 space-y-4 bg-slate-900/80 border-slate-800 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 flex-shrink-0">
              Active Incident:
            </span>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="input text-xs bg-slate-950/90 font-semibold border-slate-800 rounded-lg h-10 w-full max-w-2xl text-slate-100"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.severity}] {inc.title} — ({inc.status})
                </option>
              ))}
            </select>
          </div>

          {selectedIncident && (
            <div className="flex items-center gap-2">
              <Link
                href={`/incidents/${selectedIncident.id}`}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 font-mono"
              >
                <span>View Full SITREP</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Incident Details Summary Bar */}
        {selectedIncident && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-slate-200">
                <span>{INCIDENT_TYPE_ICONS[selectedIncident.type as keyof typeof INCIDENT_TYPE_ICONS] || "🚨"}</span>
                <span>{selectedIncident.type.replace(/_/g, " ")}</span>
              </span>

              <span className="text-slate-500">•</span>

              <span className="flex items-center gap-1 text-slate-300">
                <MapPin size={13} className="text-blue-400" />
                <span>{selectedIncident.locationName || "Coordinates Registered"}</span>
              </span>

              <span className="text-slate-500">•</span>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  selectedIncident.severity === "CRITICAL"
                    ? "bg-red-950 text-red-300 border border-red-800"
                    : selectedIncident.severity === "HIGH"
                    ? "bg-orange-950 text-orange-300 border border-orange-800"
                    : "bg-blue-950 text-blue-300 border border-blue-800"
                }`}
              >
                {selectedIncident.severity}
              </span>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                {selectedIncident.status}
              </span>
            </div>

            {/* Required Capabilities Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                Required Capabilities:
              </span>
              {requiredCaps.length > 0 ? (
                requiredCaps.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-blue-950/70 border border-blue-800 text-blue-300 px-2 py-0.5 rounded font-mono font-medium"
                  >
                    {c.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500 italic">General Emergency Response</span>
              )}
            </div>
          </div>
        )}
      </div>

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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Ranked Candidate Recommendations ({recommendations.length})
            </h2>
          </div>

          <button
            onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
            disabled={recommending || isRefreshing}
            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
          >
            <RotateCcw size={13} className={recommending ? "animate-spin text-blue-400" : ""} />
            <span>{recommending ? "Recalculating Match Matrix..." : "Recalculate AI Match"}</span>
          </button>
        </div>

        {loading || recommending ? (
          <div className="card p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
            <LoadingState label="Evaluating capability matrix, route ETAs, and real-time fleet telemetry..." />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="card p-12 text-center border-slate-800 bg-slate-900/40">
            <EmptyState
              icon={Shield}
              title="No Eligible Candidate Units Available"
              description="All units with required capabilities are either currently deployed or out of service. Review the Eligibility Audit below or execute a Commander Manual Override."
              action={{
                label: "Open Commander Override",
                onClick: () => setShowOverride(true),
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
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
