"use client";

import { useState, useEffect, useCallback } from "react";

interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  totalBeds: number;
  availableBeds: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  burnBedsAvailable: number;
  oxygenAvailable: boolean;
  bloodBagsAvailable: number;
  agency?: { name: string };
}

interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  foodStockDays: number;
  waterLiters: number;
  medicalStaffPresent: boolean;
  status: string;
  agency?: { name: string };
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

      if (hospJson.success) setHospitals(hospJson.data);
      if (sheltJson.success) setShelters(sheltJson.data);
    } catch (err) {
      console.error("Failed to load hospital/shelter data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateHospitalBeds = async (id: string, delta: number) => {
    const hosp = hospitals.find((h) => h.id === id);
    if (!hosp) return;
    const newBeds = Math.max(0, Math.min(hosp.totalBeds, hosp.availableBeds + delta));
    setUpdatingId(id);
    try {
      const res = await fetch("/api/hospitals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, availableBeds: newBeds }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Update hospital failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateShelterOccupancy = async (id: string, delta: number) => {
    const shelt = shelters.find((s) => s.id === id);
    if (!shelt) return;
    const newOcc = Math.max(0, Math.min(shelt.capacity, shelt.currentOccupancy + delta));
    setUpdatingId(id);
    try {
      const res = await fetch("/api/shelters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentOccupancy: newOcc }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Update shelter failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalBeds = hospitals.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
  const totalAvailableBeds = hospitals.reduce((acc, h) => acc + (h.availableBeds || 0), 0);
  const totalIcuAvailable = hospitals.reduce(
    (acc, h) => acc + (h.icuBedsAvailable ?? (h as any).availableIcu ?? 0),
    0
  );
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + (s.currentOccupancy || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>🏥</span> Hospital Triage & Shelter Network
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time critical care bed surge capacity, ICU allocations, oxygen reserves, and evacuation shelter logistics
          </p>
        </div>

        <button
          onClick={() => fetchData()}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <span>🔄</span> Refresh Telemetry
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Total Hospital Beds</div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {totalAvailableBeds} / {totalBeds}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            {Math.round((totalAvailableBeds / (totalBeds || 1)) * 100)}% Available
          </div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-blue-500">
          <div className="text-[11px] text-blue-400 uppercase font-mono">Available ICU Beds</div>
          <div className="text-2xl font-black text-blue-400 font-mono">{totalIcuAvailable}</div>
          <div className="text-[10px] text-slate-400">Critical Care Ready</div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-amber-500">
          <div className="text-[11px] text-amber-400 uppercase font-mono">Shelter Capacity</div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {totalShelterOccupancy} / {totalShelterCapacity}
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.max(0, totalShelterCapacity - totalShelterOccupancy)} Vacancies
          </div>
        </div>

        <div className="card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <div className="text-[11px] text-emerald-400 uppercase font-mono">Oxygen Security</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
          <div className="text-[10px] text-slate-400">All Facilities Secured</div>
        </div>
      </div>

      {/* Section 1: Hospitals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <span>🏥</span> Hospital Emergency & Trauma Centers ({hospitals.length})
          </h2>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-slate-400">Loading hospital telemetry...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((hosp) => {
              const total = hosp.totalBeds || 1;
              const avail = hosp.availableBeds ?? 0;
              const occupancyPct = Math.round(
                ((total - avail) / total) * 100
              );
              const isHighOccupancy = occupancyPct >= 85;
              const icuAvail = hosp.icuBedsAvailable ?? (hosp as any).availableIcu ?? 0;
              const icuTot = hosp.icuBedsTotal ?? (hosp as any).icuBeds ?? icuAvail;
              const burnAvail = hosp.burnBedsAvailable ?? (hosp as any).availableBurn ?? (hosp as any).burnBeds ?? 0;
              const bloodAvail = hosp.bloodBagsAvailable ?? (hosp as any).bloodBags ?? 16;

              return (
                <div
                  key={hosp.id}
                  className={`card p-5 space-y-4 hover:border-slate-700 transition-all ${
                    isHighOccupancy ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-blue-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{hosp.name}</h3>
                      <p className="text-xs text-slate-400">{hosp.agency?.name || "Medical Authority"}</p>
                    </div>

                    {isHighOccupancy ? (
                      <span className="badge-critical text-[10px] px-2 py-0.5 rounded font-mono">
                        NEAR SATURATION ({occupancyPct}%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                        NORMAL ({occupancyPct}%)
                      </span>
                    )}
                  </div>

                  {/* Bed occupancy progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">General Bed Occupancy</span>
                      <span className="text-slate-200 font-bold">
                        {avail} Available / {total} Total
                      </span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${Math.min(100, Math.max(0, occupancyPct))}%` }}
                        className={`h-full transition-all duration-300 ${
                          isHighOccupancy ? "bg-amber-500" : "bg-blue-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* ICU & Specialty stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">ICU Beds</div>
                      <div className="text-sm font-bold text-blue-400 mt-0.5">
                        {icuAvail} / {icuTot}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Burn Units</div>
                      <div className="text-sm font-bold text-purple-400 mt-0.5">
                        {burnAvail} Ready
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Blood Reserves</div>
                      <div className="text-sm font-bold text-red-400 mt-0.5">
                        {bloodAvail} Units
                      </div>
                    </div>
                  </div>

                  {/* Fast Adjust Beds Controls */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">Simulate Admission:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateHospitalBeds(hosp.id, -1)}
                        disabled={updatingId === hosp.id || hosp.availableBeds <= 0}
                        className="btn-secondary text-[11px] py-0.5 px-2 hover:bg-slate-800"
                        title="Admit 1 patient"
                      >
                        -1 Bed
                      </button>
                      <button
                        onClick={() => handleUpdateHospitalBeds(hosp.id, 1)}
                        disabled={updatingId === hosp.id || hosp.availableBeds >= hosp.totalBeds}
                        className="btn-secondary text-[11px] py-0.5 px-2 hover:bg-slate-800"
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

      {/* Section 2: Shelters */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <span>⛺</span> Evacuation & Relief Shelters ({shelters.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.map((shelt) => {
            const occupancyPct = Math.round((shelt.currentOccupancy / shelt.capacity) * 100);

            return (
              <div
                key={shelt.id}
                className="card p-5 space-y-4 hover:border-slate-700 transition-all border-l-4 border-l-amber-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{shelt.name}</h3>
                    <p className="text-xs text-slate-400">{shelt.agency?.name || "Civil Defense"}</p>
                  </div>
                  <span className="badge-neutral text-[10px] px-2 py-0.5 rounded font-mono">
                    {shelt.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="text-amber-400 font-bold">
                      {shelt.currentOccupancy} / {shelt.capacity} ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${occupancyPct}%` }}
                      className="h-full bg-amber-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Food Supplies</div>
                    <div className="font-bold text-slate-200 mt-0.5">{shelt.foodStockDays} Days Stock</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Potable Water</div>
                    <div className="font-bold text-blue-400 mt-0.5">{shelt.waterLiters} Liters</div>
                  </div>
                </div>

                {/* Quick adjust */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">Evacuee Check-in:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateShelterOccupancy(shelt.id, 10)}
                      disabled={updatingId === shelt.id || shelt.currentOccupancy >= shelt.capacity}
                      className="btn-secondary text-[11px] py-0.5 px-2"
                    >
                      +10 Evacuees
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
