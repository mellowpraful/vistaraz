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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Studio Header */}
      <PageHeader
        title="RapidAid Dispatch Studio"
        description="Explainable multi-agency capability matching, route proximity scoring, and human-authorized resource allocation"
        icon={Zap}
        iconColor="#eab308"
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-800/60 rounded-md text-xs font-mono text-amber-300">
            <Radio size={12} className="text-amber-400 animate-pulse" />
            <span>Human Authorization Mandatory</span>
          </div>
        }
        actions={
          <button
            onClick={() => setShowOverride(!showOverride)}
            className={`btn btn-secondary text-xs flex items-center gap-1.5 ${
              showOverride ? "border-amber-500 text-amber-300 bg-amber-950/30" : ""
            }`}
            style={{ padding: "8px 14px", fontSize: "12px" }}
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span>{showOverride ? "Close Override" : "Commander Tactical Override"}</span>
          </button>
        }
      />

      {/* Dispatch Workflow Stages Tracker */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "8px",
          padding: "10px 14px",
          background: "rgba(15, 23, 42, 0.55)",
          border: "1px solid var(--border-primary)",
          borderRadius: "10px",
        }}
      >
        {[
          { step: "1", title: "Incident Selected", done: !!selectedIncident },
          { step: "2", title: "Capabilities Identified", done: requiredCaps.length > 0 },
          { step: "3", title: "Eligibility Screened", done: !loading && !recommending },
          { step: "4", title: "Candidates Ranked", done: recommendations.length > 0 },
          { step: "5", title: "Officer Authorized", done: false },
        ].map((s, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 10px",
              borderRadius: "6px",
              background: s.done ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.02)",
              border: s.done ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid var(--border-primary)",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: s.done ? "#22c55e" : "rgba(255, 255, 255, 0.1)",
                color: s.done ? "#052e16" : "var(--text-muted)",
                fontSize: "10.5px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.done ? <Check size={11} strokeWidth={3} /> : s.step}
            </div>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: s.done ? "600" : "400",
                color: s.done ? "#4ade80" : "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.title}
            </span>
          </div>
        ))}
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
      <div
        style={{
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 30, 0.9) 100%)",
          border: "1px solid var(--border-primary)",
          borderRadius: "12px",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
              Active Incident:
            </span>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="input"
              style={{ flex: 1, minWidth: "260px", height: "40px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.severity}] {inc.title} — ({inc.status})
                </option>
              ))}
            </select>
          </div>

          {selectedIncident && (
            <Link
              href={`/incidents/${selectedIncident.id}`}
              className="btn btn-secondary"
              style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>View Full Incident SITREP</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {/* Incident Details Summary Bar */}
        {selectedIncident && (
          <div
            style={{
              paddingTop: "14px",
              borderTop: "1px solid var(--border-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "5px",
                  color: selectedIncident.severity === "CRITICAL" ? "#f87171" : selectedIncident.severity === "HIGH" ? "#fbbf24" : "#60a5fa",
                  background: selectedIncident.severity === "CRITICAL" ? "rgba(239, 68, 68, 0.15)" : selectedIncident.severity === "HIGH" ? "rgba(245, 158, 11, 0.15)" : "rgba(59, 130, 246, 0.15)",
                  border: `1px solid ${selectedIncident.severity === "CRITICAL" ? "rgba(239, 68, 68, 0.3)" : selectedIncident.severity === "HIGH" ? "rgba(245, 158, 11, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                }}
              >
                {selectedIncident.severity}
              </span>

              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
                {selectedIncident.type.replace(/_/g, " ")}
              </span>

              <span style={{ color: "var(--border-primary)" }}>•</span>

              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <MapPin size={13} color="#60a5fa" />
                <span>{selectedIncident.locationName || "Coordinates Provided"}</span>
              </div>

              <span style={{ color: "var(--border-primary)" }}>•</span>

              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-primary)",
                  padding: "1px 7px",
                  borderRadius: "4px",
                }}
              >
                {selectedIncident.status}
              </span>
            </div>

            {/* Required Capabilities */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Required:
              </span>
              {requiredCaps.length > 0 ? (
                requiredCaps.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "11px",
                      fontWeight: "500",
                      color: "#93c5fd",
                      background: "rgba(37, 99, 235, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      padding: "2px 8px",
                      borderRadius: "5px",
                    }}
                  >
                    {c.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  General Response
                </span>
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
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <SectionHeader
          title="Ranked Candidate Recommendations"
          count={recommendations.length}
          icon={Zap}
          iconColor="#eab308"
          actions={
            <button
              onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
              disabled={recommending || isRefreshing}
              className="btn btn-secondary"
              style={{ fontSize: "11.5px", padding: "5px 12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <RotateCcw size={12} className={recommending ? "animate-spin text-blue-400" : ""} />
              <span>{recommending ? "Recalculating Match Matrix…" : "Recalculate AI Match"}</span>
            </button>
          }
        />

        {loading || recommending ? (
          <div className="card" style={{ padding: "56px", textAlign: "center" }}>
            <LoadingState label="Evaluating capability matrix, proximity routes, and fleet telemetry…" />
          </div>
        ) : recommendations.length === 0 ? (
          /* Structured Operational Diagnostic Panel when zero units are eligible */
          <div
            style={{
              background: "linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)",
              border: "1px solid var(--border-primary)",
              borderLeft: "4px solid #f59e0b",
              borderRadius: "12px",
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <ShieldAlert size={20} color="#f59e0b" />
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  No Units Currently Meet Hard Eligibility Criteria
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5, maxWidth: "700px" }}>
                All registered fleet units with the required capabilities ({requiredCaps.join(", ") || "specialized"})
                are currently committed to active field incidents or undergoing maintenance.
              </p>
            </div>

            {/* Diagnostic screening summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-primary)" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Fleet Screened</div>
                <div className="data-value" style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>
                  {resources.length} units
                </div>
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(245, 158, 11, 0.05)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                <div style={{ fontSize: "11px", color: "#f59e0b", marginBottom: "4px" }}>Active Field Deployments</div>
                <div className="data-value" style={{ fontSize: "20px", fontWeight: "700", color: "#fbbf24" }}>
                  {ineligibleUnits.filter(u => u.reasons.some(r => r.includes("DISPATCH") || r.includes("BUSY") || r.includes("EN_ROUTE") || r.includes("ON_SCENE"))).length} busy
                </div>
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(59, 130, 246, 0.05)", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <div style={{ fontSize: "11px", color: "#60a5fa", marginBottom: "4px" }}>Capability Incompatible</div>
                <div className="data-value" style={{ fontSize: "20px", fontWeight: "700", color: "#93c5fd" }}>
                  {ineligibleUnits.filter(u => u.reasons.some(r => r.includes("capability") || r.includes("Capability") || r.includes("Missing"))).length} units
                </div>
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <div style={{ fontSize: "11px", color: "#f87171", marginBottom: "4px" }}>Out of Service / Refit</div>
                <div className="data-value" style={{ fontSize: "20px", fontWeight: "700", color: "#f87171" }}>
                  {ineligibleUnits.filter(u => u.reasons.some(r => r.includes("SERVICE") || r.includes("MAINTENANCE") || r.includes("OOS"))).length} units
                </div>
              </div>
            </div>

            {/* Recommended Dispatcher Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid var(--border-primary)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Recommended Operational Actions:
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => selectedIncidentId && fetchRecommendations(selectedIncidentId, true)}
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  <RotateCcw size={13} />
                  <span>Recalculate Match</span>
                </button>
                <button
                  onClick={() => setShowOverride(true)}
                  className="btn btn-primary"
                  style={{ fontSize: "12px", padding: "6px 16px", background: "linear-gradient(135deg, #d97706, #b45309)" }}
                >
                  <ShieldAlert size={14} />
                  <span>Open Tactical Override</span>
                </button>
              </div>
            </div>
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
