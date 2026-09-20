import { useState } from "react";
import { cn } from "../utils/cn";
import { Eyebrow, Panel, SectionHeading, SectionShell, StatusDot } from "./shared";
import { LiveMap } from "./LiveMap";

const BASE_ETA = 522; // 08:42

function mmss(total: number) {
  const s = Math.max(0, Math.round(total));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Metric({
  label,
  value,
  tone = "accent",
  sub,
}: {
  label: string;
  value: string;
  tone?: "accent" | "warn" | "crit" | "ok";
  sub?: string;
}) {
  const tones = {
    accent: "text-cyan-300",
    warn: "text-amber-300",
    crit: "text-red-400",
    ok: "text-emerald-300",
  } as const;
  return (
    <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] px-3.5 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className={cn("mt-1.5 font-mono text-[20px] font-medium tracking-tight", tones[tone])}>
        <span key={value} className="inline-block animate-[vz-rise_0.35s_ease-out]">
          {value}
        </span>
      </div>
      {sub && <div className="mt-0.5 text-[10.5px] text-slate-600">{sub}</div>}
    </div>
  );
}

export function Simulation() {
  const [closure, setClosure] = useState(60);
  const [hospital, setHospital] = useState(true);
  const [shortage, setShortage] = useState(true);

  const delaySec = (closure / 100) * 452 + (shortage ? 74 : 0);
  const eta = BASE_ETA + delaySec;
  const conflicts = Math.round(closure / 34) + (shortage ? 1 : 0);
  const load = Math.min(99, Math.round(58 + (hospital ? 19 : 0) + closure * 0.13));
  const coverage = Math.max(41, Math.round(97 - closure * 0.24 - (shortage ? 7 : 0)));
  const ambulances = Math.max(1, 10 - Math.ceil(closure / 26) - (shortage ? 2 : 0));

  const toggles = [
    { label: "Road closure · NH-8", on: closure > 18, onClick: () => setClosure((c) => (c > 18 ? 0 : 60)) },
    { label: "Hospital capacity", on: hospital, onClick: () => setHospital((v) => !v) },
    { label: "Resource shortage", on: shortage, onClick: () => setShortage((v) => !v) },
  ];

  return (
    <SectionShell id="simulation" className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-60" />
        <div className="absolute right-0 top-1/4 h-[460px] w-[620px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(245,158,11,0.06),transparent_70%)] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>Digital twin</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="Before you act, simulate the response."
          sub="Run what-if scenarios on a live model of the city. See how a closure, a shortage or a full hospital changes the plan — before anyone is dispatched."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          {/* ---------- controls ---------- */}
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <StatusDot tone="warn" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
                Simulation scenario
              </span>
            </div>
            <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">
              Isolated sandbox · synthetic data
            </p>

            <div className="mt-5 space-y-2">
              {toggles.map((t) => (
                <button
                  key={t.label}
                  onClick={t.onClick}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition-all duration-300",
                    t.on
                      ? "border-cyan-400/25 bg-cyan-400/[0.06] text-slate-100"
                      : "border-white/[0.06] bg-white/[0.012] text-slate-500 hover:border-white/15",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-all",
                      t.on ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200" : "border-white/15 text-transparent",
                    )}
                  >
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M2 6.5 4.6 9 10 3.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[13px]">{t.label}</span>
                  <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500">
                    {t.on ? "on" : "off"}
                  </span>
                </button>
              ))}
            </div>

            {/* slider */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
                  Road closure severity
                </span>
                <span className="font-mono text-[11px] text-amber-300">{closure}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={closure}
                onChange={(e) => setClosure(Number(e.target.value))}
                className="vz-range mt-3 w-full"
                aria-label="Road closure severity"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                <span>clear</span>
                <span>partial</span>
                <span>sealed</span>
              </div>
            </div>

            <div className="my-5 h-px bg-white/[0.06]" />

            <div className="space-y-3">
              {[
                ["Traffic delay", `+ ${(delaySec / 60).toFixed(1)} min`, "warn"],
                ["Hospital capacity", `${load}%`, load > 85 ? "crit" : "accent"],
                ["Available ambulances", `${ambulances} / 10`, ambulances < 5 ? "warn" : "ok"],
              ].map(([l, v, tone]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-[12.5px] text-slate-400">{l}</span>
                  <span
                    className={cn(
                      "font-mono text-[12px]",
                      tone === "warn" ? "text-amber-300" : tone === "crit" ? "text-red-400" : tone === "ok" ? "text-emerald-300" : "text-cyan-300",
                    )}
                  >
                    <span key={v} className="inline-block animate-[vz-rise_0.35s_ease-out]">
                      {v}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <Metric label="Response time" value={`+${mmss(delaySec)}`} tone={delaySec > 240 ? "crit" : "warn"} sub={`ETA ${mmss(eta)}`} />
              <Metric label="Resource conflict" value={String(conflicts)} tone={conflicts > 2 ? "crit" : "warn"} sub="overlapping claims" />
              <Metric label="Hospital load" value={`${load}%`} tone={load > 85 ? "crit" : "accent"} sub="across 4 facilities" />
              <Metric label="Coverage" value={`${coverage}%`} tone={coverage < 70 ? "warn" : "ok"} sub="population in range" />
            </div>
          </Panel>

          {/* ---------- map ---------- */}
          <Panel className="p-0" glow="accent">
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0B141C]/80 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <StatusDot tone="warn" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-200">
                  What-if model · Zone 4
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.14em]">
                <span className="text-slate-500">
                  Route <span className={closure > 18 ? "text-amber-300" : "text-cyan-300"}>
                    {closure > 18 ? "alternate" : "primary"}
                  </span>
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <span className="text-slate-500">
                  ETA <span className="text-amber-300">{mmss(eta)}</span>
                </span>
              </div>
            </div>

            <div className="relative h-[380px] sm:h-[440px] lg:h-[520px]">
              <LiveMap variant="sim" closure={closure} />

              {/* legend */}
              <div className="pointer-events-none absolute left-4 top-4 space-y-1.5 rounded-[10px] border border-white/[0.06] bg-[#050A0F]/75 px-3 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-0.5 w-4 rounded bg-cyan-400" /> primary route
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-0.5 w-4 rounded bg-amber-400" /> fire corridor
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-0.5 w-4 rounded bg-red-500" />{" "}
                  {closure > 18 ? "blocked" : "monitored"}
                </div>
              </div>

              <div className="pointer-events-none absolute right-4 top-4 rounded-[10px] border border-white/[0.06] bg-[#050A0F]/75 px-3 py-2.5 text-right backdrop-blur-sm">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                  Projected ETA
                </div>
                <div className="font-mono text-[18px] font-medium text-amber-300">
                  <span key={mmss(eta)} className="inline-block animate-[vz-rise_0.35s_ease-out]">
                    {mmss(eta)}
                  </span>
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-red-400/80">
                  +{mmss(delaySec)} vs baseline
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 rounded-[10px] border border-amber-400/20 bg-[#0B141C]/85 px-3.5 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <StatusDot tone="warn" />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-amber-300">
                    {closure > 18 ? "Reroute recommended" : "Corridor clear"}
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-slate-400">
                  {closure > 18
                    ? `Via Ring Road · +${(delaySec / 60).toFixed(1)} min, avoids NH-8`
                    : "Primary corridor available for all units"}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Simulations run in an isolated model · live operations are never modified
        </p>
      </div>
    </SectionShell>
  );
}
