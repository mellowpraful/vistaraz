import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { Eyebrow, Panel, StatusDot } from "./shared";
import { IncidentCard, LiveMap } from "./LiveMap";

const LOOP = [
  { k: "Incident detected", t: "Signal received" },
  { k: "AI analyzes", t: "Severity · entities" },
  { k: "Resources matched", t: "Capability · distance" },
  { k: "Route calculated", t: "Live constraints" },
  { k: "Response coordinated", t: "Teams dispatched" },
];

const INCIDENTS = [
  { title: "Industrial Fire", area: "Ahmedabad · Zone 4", distance: "2.4 km", resources: 3, severity: "CRITICAL" as const },
  { title: "Structure Collapse", area: "Gandhinagar · Zone 2", distance: "5.1 km", resources: 4, severity: "CRITICAL" as const },
  { title: "Multi-vehicle Crash", area: "Vadodara · NH-8", distance: "3.7 km", resources: 2, severity: "HIGH" as const },
];

export function Hero() {
  const [step, setStep] = useState(0);
  const [inc, setInc] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % LOOP.length), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setInc((i) => (i + 1) % INCIDENTS.length), 6400);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative w-full flex flex-col items-center justify-center overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid" />
        <div className="absolute inset-0 geo-grid-lg opacity-70" />
        <div className="absolute -left-40 top-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.10),transparent_70%)] blur-[60px]" />
        <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(239,68,68,0.07),transparent_70%)] blur-[60px]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#050A0F] to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] w-full items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:pb-28">
        {/* ---------------- copy ---------------- */}
        <div className="max-w-xl">
          <div className="vz-rise in" style={{ animationDelay: "350ms" }}>
            <Eyebrow>
              <StatusDot tone="crit" />
              Live emergency intelligence
            </Eyebrow>
          </div>

          <h1
            className="vz-rise in mt-7 text-balance text-[clamp(2.4rem,5.4vw,4.15rem)] font-semibold leading-[1.02] tracking-[-0.042em] text-slate-50"
            style={{ animationDelay: "500ms" }}
          >
            From emergency signals
            <br className="hidden sm:block" />{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                to coordinated action.
              </span>
              <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-cyan-400/70 via-cyan-400/20 to-transparent" />
            </span>
          </h1>

          <p
            className="vz-rise in mt-7 max-w-[34rem] text-[15.5px] leading-[1.65] text-slate-400 sm:text-[17px]"
            style={{ animationDelay: "650ms" }}
          >
            AI-powered emergency response that understands incidents, coordinates
            resources, and helps teams act faster — inside one live operating
            picture.
          </p>

          <div
            className="vz-rise in mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "800ms" }}
          >
            <a
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-[10px] bg-cyan-400 px-5 py-3 text-[14px] font-semibold text-[#04222B] transition-all hover:-translate-y-[2px] hover:bg-cyan-300 hover:shadow-[0_16px_40px_-12px_rgba(34,211,238,0.65)]"
            >
              Enter Command Centre
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#how"
              className="group inline-flex items-center gap-2.5 rounded-[10px] border border-white/[0.09] bg-white/[0.02] px-5 py-3 text-[14px] font-medium text-slate-300 transition-all hover:-translate-y-[2px] hover:border-white/20 hover:text-slate-100"
            >
              Explore How It Works
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* response loop */}
          <div className="vz-rise in mt-12" style={{ animationDelay: "1000ms" }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Response loop
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3">
              {LOOP.map((s, i) => {
                const active = i === step;
                return (
                  <div key={s.k} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-all duration-500",
                        active
                          ? "border-cyan-400/40 bg-cyan-400/[0.1] text-cyan-200 shadow-[0_0_22px_-6px_rgba(34,211,238,0.7)]"
                          : "border-white/[0.06] bg-white/[0.015] text-slate-500",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                            active ? "bg-cyan-300" : "bg-slate-700",
                          )}
                        />
                        {s.k}
                      </span>
                    </div>
                    {i < LOOP.length - 1 && (
                      <svg viewBox="0 0 12 12" className={cn("h-3 w-3 transition-colors duration-500", active ? "text-cyan-400" : "text-slate-700")} fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 6h7M6.5 3.5 9 6l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 h-9 font-mono text-[11.5px] text-slate-500">
              <span key={step} className="inline-block animate-[vz-rise_0.5s_ease-out] text-cyan-300/80">
                ▸ {LOOP[step].t}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- live command visual ---------------- */}
        <div className="vz-rise in" style={{ animationDelay: "900ms" }}>
          <Panel className="p-0" glow="accent">
            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0B141C]/80 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <StatusDot tone="crit" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
                  Live Response Map
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500">
                <span className="hidden sm:inline">Ahmedabad · Zone 4</span>
                <span className="flex items-center gap-1.5 text-cyan-300/80">
                  <span className="vz-blink">●</span> Streaming
                </span>
              </div>
            </div>

            <div className="relative h-[360px] sm:h-[420px]">
              <LiveMap variant="hero" />
              <IncidentCard {...INCIDENTS[inc]} />

              {/* corner HUD */}
              <div className="pointer-events-none absolute left-4 top-4 space-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <div className="rounded-md border border-white/[0.06] bg-[#050A0F]/70 px-2.5 py-1.5 backdrop-blur-sm">
                  Grid <span className="text-slate-300">23.0225°N 72.5714°E</span>
                </div>
                <div className="rounded-md border border-white/[0.06] bg-[#050A0F]/70 px-2.5 py-1.5 backdrop-blur-sm">
                  Units <span className="text-cyan-300">41 available</span>
                </div>
              </div>
              <div className="pointer-events-none absolute right-4 top-4 rounded-md border border-white/[0.06] bg-[#050A0F]/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm">
                <span className="text-slate-500">ETA</span>{" "}
                <span className="text-amber-300">08:42</span>
              </div>
            </div>

            {/* bottom metrics strip */}
            <div className="grid grid-cols-4 divide-x divide-white/[0.06] border-t border-white/[0.07] bg-[#0B141C]/60">
              {[
                ["Active", "03", "crit"],
                ["Teams", "24", "accent"],
                ["Units", "41", "accent"],
                ["Hosp. load", "72%", "warn"],
              ].map(([l, v, tone]) => (
                <div key={l} className="px-3 py-3 text-center">
                  <div
                    className={cn(
                      "font-mono text-[15px] font-medium",
                      tone === "crit" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-cyan-300",
                    )}
                  >
                    {v}
                  </div>
                  <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
