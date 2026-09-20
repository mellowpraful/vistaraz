"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Tent, RotateCcw, BedDouble, HeartPulse, Users, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";

interface Hospital {
  id: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  icuBeds?: number;
  icuBedsTotal?: number;
  icuBedsAvailable?: number;
  availableIcu?: number;
  burnBeds?: number;
  burnBedsAvailable?: number;
  availableBurn?: number;
  hasHelipad?: boolean;
  hasDecon?: boolean;
  oxygenSecured?: boolean;
  status?: string;
  agency?: { name: string };
}

interface Shelter {
  id: string;
  name: string;
  capacity: number;
  /** Live API returns "occupied"; fallback data also uses "occupied" */
  occupied?: number;
  /** Some API shapes return currentOccupancy */
  currentOccupancy?: number;
  foodStockDays?: number;
  waterLiters?: number;
  status: string;
  agency?: { name: string };
}

// ── Safe numeric helpers ────────────────────────────────────────────
function safeNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function safeOccupancy(shelter: Shelter): number {
  return safeNum(shelter.occupied ?? shelter.currentOccupancy);
}

function safePct(numerator: number, denominator: number): number {
  if (!denominator || denominator === 0) return 0;
  const p = Math.round((numerator / denominator) * 100);
  return isNaN(p) ? 0 : Math.min(100, Math.max(0, p));
}

// ── Status badge helper ─────────────────────────────────────────────
function shelterStatusClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "OPEN":   return "badge badge-success";
    case "FULL":   return "badge badge-warning";
    case "CLOSED": return "badge badge-critical";
    default:       return "badge badge-neutral";
  }
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hospRes, sheltRes] = await Promise.all([
        fetch("/api/hospitals"),
        fetch("/api/shelters"),
      ]);
      const [hospJson, sheltJson] = await Promise.all([
        hospRes.json(),
        sheltRes.json(),
      ]);

      if (hospJson.success) setHospitals(hospJson.data ?? []);
      if (sheltJson.success) setShelters(sheltJson.data ?? []);
    } catch (err) {
      console.error("Failed to load hospital/shelter data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateHospitalBeds = async (id: string, delta: number) => {
    const hosp = hospitals.find((h) => h.id === id);
    if (!hosp) return;
    const newBeds = Math.max(0, Math.min(safeNum(hosp.totalBeds), safeNum(hosp.availableBeds) + delta));
    setUpdatingId(id);
    try {
      const res = await fetch("/api/hospitals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, availableBeds: newBeds }),
      });
      const json = await res.json();
      if (json.success) fetchData();
    } catch (err) {
      console.error("Update hospital failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateShelterOccupancy = async (id: string, delta: number) => {
    const shelt = shelters.find((s) => s.id === id);
    if (!shelt) return;
    const current = safeOccupancy(shelt);
    const newOcc = Math.max(0, Math.min(safeNum(shelt.capacity), current + delta));
    setUpdatingId(id);
    try {
      const res = await fetch("/api/shelters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, occupied: newOcc }),
      });
      const json = await res.json();
      if (json.success) fetchData();
    } catch (err) {
      console.error("Update shelter failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Aggregate metrics ─────────────────────────────────────────────
  const totalBeds = hospitals.reduce((a, h) => a + safeNum(h.totalBeds), 0);
  const totalAvailableBeds = hospitals.reduce((a, h) => a + safeNum(h.availableBeds), 0);
  const totalIcuAvailable = hospitals.reduce(
    (a, h) => a + safeNum(h.availableIcu ?? h.icuBedsAvailable),
    0
  );
  const totalShelterCapacity = shelters.reduce((a, s) => a + safeNum(s.capacity), 0);
  const totalShelterOccupancy = shelters.reduce((a, s) => a + safeOccupancy(s), 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Hospital Triage & Shelter Network"
        description="Real-time critical care bed capacity, ICU allocations, oxygen reserves, and evacuation shelter logistics across the Gujarat Metro EOC."
        icon={Building2}
        iconColor="#3b82f6"
        actions={
          <button onClick={() => fetchData()} className="btn btn-secondary" style={{ fontSize: "13px" }}>
            <RotateCcw size={14} />
            Refresh Telemetry
          </button>
        }
      />

      {/* ── Aggregate Stats ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {/* General Beds */}
        <div className="card" style={{ padding: "20px", borderLeft: "3px solid #3b82f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <BedDouble size={16} color="#3b82f6" />
            <span className="metric-label">General Beds</span>
          </div>
          <div className="data-value" style={{ fontSize: "28px", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.5px" }}>
            {totalAvailableBeds.toLocaleString()}
            <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "500" }}>
              {" "}/ {totalBeds.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#4ade80", fontWeight: "500", marginTop: "4px" }}>
            {safePct(totalAvailableBeds, totalBeds)}% available
          </div>
        </div>

        {/* ICU Beds */}
        <div className="card" style={{ padding: "20px", borderLeft: "3px solid #60a5fa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <HeartPulse size={16} color="#60a5fa" />
            <span className="metric-label">ICU Beds Available</span>
          </div>
          <div className="data-value" style={{ fontSize: "28px", fontWeight: "700", color: "#60a5fa", letterSpacing: "-0.5px" }}>
            {totalIcuAvailable}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Critical care ready
          </div>
        </div>

        {/* Shelter Capacity */}
        <div className="card" style={{ padding: "20px", borderLeft: "3px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Users size={16} color="#f59e0b" />
            <span className="metric-label">Shelter Occupancy</span>
          </div>
          <div className="data-value" style={{ fontSize: "28px", fontWeight: "700", color: "#f59e0b", letterSpacing: "-0.5px" }}>
            {totalShelterOccupancy.toLocaleString()}
            <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "500" }}>
              {" "}/ {totalShelterCapacity.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {Math.max(0, totalShelterCapacity - totalShelterOccupancy).toLocaleString()} vacancies
          </div>
        </div>

        {/* Oxygen */}
        <div className="card" style={{ padding: "20px", borderLeft: "3px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <ShieldCheck size={16} color="#10b981" />
            <span className="metric-label">Oxygen Security</span>
          </div>
          <div className="data-value" style={{ fontSize: "28px", fontWeight: "700", color: "#10b981", letterSpacing: "-0.5px" }}>
            {hospitals.filter((h) => h.oxygenSecured).length}
            <span style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "500" }}>
              {" "}/ {hospitals.length}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Facilities oxygen-secured
          </div>
        </div>
      </div>

      {/* ── Hospitals Section ─────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          title="Hospital Emergency & Trauma Centers"
          count={hospitals.length}
          icon={Building2}
          iconColor="#60a5fa"
          withDivider
        />

        {loading ? (
          <div className="card" style={{ padding: "48px" }}>
            <LoadingState label="Loading hospital telemetry…" />
          </div>
        ) : hospitals.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Hospital Data Available"
            description="Hospital telemetry could not be retrieved. Check data source connectivity."
            action={{ label: "Retry", onClick: fetchData }}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
            {hospitals.map((hosp) => {
              const total   = safeNum(hosp.totalBeds) || 1;
              const avail   = safeNum(hosp.availableBeds);
              const occupancyPct = safePct(total - avail, total);
              const isHighOccupancy = occupancyPct >= 85;

              const icuAvail = safeNum(hosp.availableIcu ?? hosp.icuBedsAvailable);
              const icuTotal = safeNum(hosp.icuBeds ?? hosp.icuBedsTotal ?? hosp.icuBedsAvailable ?? hosp.availableIcu);
              const burnAvail = safeNum(hosp.availableBurn ?? hosp.burnBedsAvailable ?? hosp.burnBeds);

              return (
                <div
                  key={hosp.id}
                  className="card"
                  style={{
                    padding: "24px",
                    borderLeft: `3px solid ${isHighOccupancy ? "#f59e0b" : "#3b82f6"}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Hospital name & status */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.3" }}>
                        {hosp.name}
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                        {hosp.agency?.name || "Medical Authority"}
                      </p>
                    </div>
                    <span className={`badge ${isHighOccupancy ? "badge-warning" : "badge-success"}`}>
                      {isHighOccupancy ? "Near Capacity" : "Normal"} · {occupancyPct}%
                    </span>
                  </div>

                  {/* Bed occupancy bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span className="metric-label">General Bed Occupancy</span>
                      <span className="technical" style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "600" }}>
                        {avail.toLocaleString()} available / {total.toLocaleString()} total
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${occupancyPct}%`,
                          height: "100%",
                          background: isHighOccupancy ? "#f59e0b" : "#3b82f6",
                          borderRadius: "4px",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>

                  {/* ICU, Burn & Facility indicators */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                      <div className="metric-label" style={{ fontSize: "11px", marginBottom: "4px" }}>ICU Beds</div>
                      <div className="data-value" style={{ fontSize: "15px", fontWeight: "700", color: "#60a5fa" }}>
                        {icuAvail} / {icuTotal || "—"}
                      </div>
                    </div>
                    <div style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                      <div className="metric-label" style={{ fontSize: "11px", marginBottom: "4px" }}>Burn Units</div>
                      <div className="data-value" style={{ fontSize: "15px", fontWeight: "700", color: "#c084fc" }}>
                        {burnAvail > 0 ? `${burnAvail} ready` : "Not available"}
                      </div>
                    </div>
                    <div style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                      <div className="metric-label" style={{ fontSize: "11px", marginBottom: "4px" }}>Oxygen</div>
                      <div className="data-value" style={{ fontSize: "15px", fontWeight: "700", color: hosp.oxygenSecured ? "#4ade80" : "#f87171" }}>
                        {hosp.oxygenSecured ? "Secured" : "Not secured"}
                      </div>
                    </div>
                  </div>

                  {/* Facility tags */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {hosp.hasHelipad && (
                      <span className="badge badge-neutral">Helipad</span>
                    )}
                    {hosp.hasDecon && (
                      <span className="badge badge-neutral">Decontamination</span>
                    )}
                  </div>

                  {/* Simulate admission controls */}
                  <div style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Simulate Admission</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleUpdateHospitalBeds(hosp.id, -1)}
                        disabled={updatingId === hosp.id || avail <= 0}
                        className="btn btn-secondary"
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                        title="Admit 1 patient"
                      >
                        −1 Bed
                      </button>
                      <button
                        onClick={() => handleUpdateHospitalBeds(hosp.id, 1)}
                        disabled={updatingId === hosp.id || avail >= total}
                        className="btn btn-secondary"
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                        title="Discharge 1 patient"
                      >
                        +1 Bed
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Shelters Section ──────────────────────────────────────── */}
      <div className="space-y-4" style={{ paddingTop: "8px" }}>
        <SectionHeader
          title="Evacuation & Relief Shelters"
          count={shelters.length}
          icon={Tent}
          iconColor="#f59e0b"
          withDivider
        />

        {loading ? (
          <div className="card" style={{ padding: "48px" }}>
            <LoadingState label="Loading shelter logistics…" />
          </div>
        ) : shelters.length === 0 ? (
          <EmptyState
            icon={Tent}
            title="No Shelter Data Available"
            description="Shelter occupancy data could not be retrieved. Check data source connectivity."
            action={{ label: "Retry", onClick: fetchData }}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {shelters.map((shelt) => {
              const occupancy = safeOccupancy(shelt);
              const capacity  = safeNum(shelt.capacity) || 1;
              const pct       = safePct(occupancy, capacity);
              const vacancies = Math.max(0, capacity - occupancy);

              return (
                <div
                  key={shelt.id}
                  className="card"
                  style={{ padding: "24px", borderLeft: "3px solid #f59e0b", display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  {/* Name & status */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.3" }}>
                        {shelt.name}
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                        {shelt.agency?.name || "Civil Defense Authority"}
                      </p>
                    </div>
                    <span className={shelterStatusClass(shelt.status)}>
                      {shelt.status || "Unknown"}
                    </span>
                  </div>

                  {/* Occupancy bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span className="metric-label">Occupancy</span>
                      <span className="technical" style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "600" }}>
                        {occupancy} / {capacity} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#4ade80",
                          borderRadius: "4px",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "5px" }}>
                      {vacancies} vacancies remaining
                    </div>
                  </div>

                  {/* Logistics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-primary)" }}>
                      <div className="metric-label" style={{ fontSize: "11px", marginBottom: "4px" }}>Food Supplies</div>
                      <div className="data-value" style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                        {shelt.foodStockDays != null && shelt.foodStockDays > 0
                          ? `${shelt.foodStockDays} day stock`
                          : "Not available"}
                      </div>
                    </div>
                    <div style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-primary)" }}>
                      <div className="metric-label" style={{ fontSize: "11px", marginBottom: "4px" }}>Potable Water</div>
                      <div className="data-value" style={{ fontSize: "14px", fontWeight: "600", color: "#60a5fa" }}>
                        {shelt.waterLiters != null && shelt.waterLiters > 0
                          ? `${shelt.waterLiters.toLocaleString()} L`
                          : "Not available"}
                      </div>
                    </div>
                  </div>

                  {/* Evacuee check-in control */}
                  <div style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Evacuee Check-in</span>
                    <button
                      onClick={() => handleUpdateShelterOccupancy(shelt.id, 10)}
                      disabled={updatingId === shelt.id || occupancy >= capacity}
                      className="btn btn-secondary"
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      +10 Evacuees
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
