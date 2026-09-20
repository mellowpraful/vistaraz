import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { Eyebrow, Panel, SectionHeading, SectionShell, StatusDot } from "./shared";
import { LiveMap } from "./LiveMap";

const SEVERITY = [
  ["Critical", "03", "crit"],
  ["High", "07", "warn"],
  ["Medium", "12", "accent"],
  ["Low", "18", "idle"],
] as const;

const EVENTS = [
  { text: "Ambulance 12 dispatched", tone: "accent" as const, tag: "UNIT" },
  { text: "Fire team assigned · Unit 04", tone: "warn" as const, tag: "UNIT" },
  { text: "Hospital Central notified", tone: "ok" as const, tag: "FACILITY" },
  { text: "Incident INC-2479 merged", tone: "accent" as const, tag: "SYSTEM" },
  { text: "Route recalculated · NH-8 closed", tone: "warn" as const, tag: "ROUTE" },
  { text: "Drone 02 providing aerial feed", tone: "accent" as const, tag: "SENSOR" },
  { text: "Shelter N capacity confirmed", tone: "ok" as const, tag: "FACILITY" },
  { text: "Rescue 07 stood down", tone: "idle" as const, tag: "UNIT" },
];

const INCIDENTS_ROWS = [
  ["INC-2481", "Industrial fire", "Zone 4", "crit", "08:42"],
  ["INC-2480", "Structure collapse", "Zone 2", "crit", "07:15"],
  ["INC-2479", "Road accident", "NH-8", "warn", "05:58"],
  ["INC-2478", "Flood risk", "Sabarmati", "accent", "04:20"],
  ["INC-2477", "Gas leak", "Vasna", "warn", "02:47"],
  ["INC-2476", "Medical emergency", "Paldi", "accent", "01:12"],
] as const;

function hhmm(total: number) {
  const m = ((total % 720) + 720) % 720;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function CommandCentre() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3400);
    return () => clearInterval(id);
  }, []);

  const feed = EVENTS.map((_, k) => EVENTS[(tick + k) % EVENTS.length]).slice(0, 6);

  return (
    <SectionShell id="command-centre" className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-60" />
        <div className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.08),transparent_70%)] blur-[70px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>CrisisOS · command centre</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="One screen. The whole situation."
          sub="Incidents, units, facilities, routes and risks — synchronised into a single operating picture that every responder role can read."
        />

        <div className="mt-14">
          <Panel className="p-0" glow="accent">
            {/* ---------- app chrome ---------- */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0B141C]/85 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-[7px] border border-cyan-400/25 bg-cyan-400/[0.07]">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M12 2.6 3.4 6.2v6.1c0 5 3.7 8.3 8.6 9.1 4.9-.8 8.6-4.1 8.6-9.1V6.2L12 2.6Z" strokeLinejoin="round" />
                    <path d="M12 8.6v6.8M8.6 12h6.8" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="text-[13px] font-semibold tracking-[0.1em] text-slate-100">
                    CRISIS<span className="text-cyan-300">OS</span>
                  </div>
                  <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500">
                    Ahmedabad Command · Gujarat
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-1 rounded-[9px] border border-white/[0.06] bg-white/[0.02] p-1 lg:flex">
                {["Overview", "Incidents", "Resources", "Facilities", "Simulation"].map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      "rounded-[6px] px-3 py-1.5 text-[11.5px] transition-colors",
                      i === 0 ? "bg-cyan-400/[0.1] text-cyan-200" : "text-slate-500",
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <StatusDot tone="crit" /> live
                </span>
                <span className="text-slate-300">{hhmm(642 - tick)} IST</span>
              </div>
            </div>

            {/* ---------- dashboard body ---------- */}
            <div className="grid lg:grid-cols-[228px_minmax(0,1fr)_248px]">
              {/* left: active incidents */}
              <div className="border-b border-white/[0.06] p-4 lg:border-b-0 lg:border-r">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                  Active incidents
                </div>
                <div className="mt-3 space-y-1.5">
                  {SEVERITY.map(([l, n, tone]) => (
                    <div
                      key={l}
                      className="flex items-center justify-between rounded-[9px] border border-white/[0.05] bg-white/[0.012] px-2.5 py-2"
                    >
                      <span className="flex items-center gap-2 text-[12px] text-slate-300">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            tone === "crit"
                              ? "bg-red-500 shadow-[0_0_8px_1px_rgba(239,68,68,0.7)]"
                              : tone === "warn"
                                ? "bg-amber-400"
                                : tone === "accent"
                                  ? "bg-cyan-400"
                                  : "bg-slate-600",
                          )}
                        />
                        {l}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[13px]",
                          tone === "crit" ? "text-red-400" : tone === "warn" ? "text-amber-300" : "text-slate-300",
                        )}
                      >
                        {n}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-3">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                    Queue
                  </div>
                  <div className="mt-2.5 space-y-1">
                    {INCIDENTS_ROWS.map(([id, name, area, tone, t]) => (
                      <div key={id} className="flex items-center gap-2 px-1 py-1.5">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            tone === "crit" ? "bg-red-500" : tone === "warn" ? "bg-amber-400" : "bg-cyan-400",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] text-slate-200">{name}</div>
                          <div className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
                            {id} · {area}
                          </div>
                        </div>
                        <span className="font-mono text-[9.5px] text-slate-500">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* centre: map */}
              <div className="relative min-h-[340px] border-b border-white/[0.06] lg:border-b-0">
                <LiveMap variant="slow" />

                <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
                  {["Incidents", "Units", "Routes", "Facilities", "Risk"].map((l, i) => (
                    <span
                      key={l}
                      className={cn(
                        "rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] backdrop-blur-sm",
                        i < 4
                          ? "border-cyan-400/25 bg-[#050A0F]/70 text-cyan-200/90"
                          : "border-white/[0.08] bg-[#050A0F]/70 text-slate-400",
                      )}
                    >
                      {l}
                    </span>
                  ))}
                </div>

                <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.08] bg-[#050A0F]/85 px-3.5 py-2 backdrop-blur-sm">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-400">
                    Grid 4B · 23.0225°N 72.5714°E · zoom 14
                  </span>
                </div>
              </div>

              {/* right: activity feed */}
              <div className="border-t border-white/[0.06] p-4 lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                    Response activity
                  </span>
                  <StatusDot tone="accent" />
                </div>

                <div className="mt-3 space-y-2">
                  {feed.map((e, i) => (
                    <div
                      key={`${e.text}-${tick}-${i}`}
                      className={cn(
                        "rounded-[9px] border px-3 py-2 transition-all duration-500",
                        i === 0
                          ? "border-cyan-400/25 bg-cyan-400/[0.06] animate-[vz-rise_0.45s_ease-out]"
                          : "border-white/[0.05] bg-white/[0.012]",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9.5px] text-slate-500">
                          {hhmm(642 - tick - i * 3)}
                        </span>
                        <span
                          className={cn(
                            "ml-auto rounded-[4px] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em]",
                            e.tone === "accent"
                              ? "bg-cyan-400/10 text-cyan-300"
                              : e.tone === "warn"
                                ? "bg-amber-400/10 text-amber-300"
                                : e.tone === "ok"
                                  ? "bg-emerald-400/10 text-emerald-300"
                                  : "bg-white/[0.05] text-slate-400",
                          )}
                        >
                          {e.tag}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] leading-snug text-slate-200">{e.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ---------- metrics strip ---------- */}
            <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] border-t border-white/[0.07] bg-[#0A1219]/70 sm:grid-cols-4 sm:divide-y-0">
              {[
                ["Response time", "08:42", "avg · last 24h", "text-amber-300"],
                ["Active teams", "24", "on duty now", "text-cyan-300"],
                ["Available units", "41", "of 68 fleet", "text-cyan-300"],
                ["Hospital load", "72%", "4 facilities", "text-amber-300"],
              ].map(([l, v, s, c]) => (
                <div key={l} className="px-4 py-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    {l}
                  </div>
                  <div className={cn("mt-1.5 font-mono text-[22px] font-medium tracking-tight", c)}>
                    {v}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-slate-600">{s}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </SectionShell>
  );
}
