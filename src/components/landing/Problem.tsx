import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { MonoLabel, SectionHeading, SectionShell, StatusDot, useInView } from "./shared";

const BEFORE = [
  { label: "Emergency calls", meta: "112 · 108", pos: "left-[2%] top-[6%]", o: [-26, -10, -4] },
  { label: "Citizen reports", meta: "app · web · SMS", pos: "right-[6%] top-[2%]", o: [24, -6, 3] },
  { label: "Sensor alerts", meta: "smoke · seismic", pos: "left-[10%] top-[38%]", o: [-34, 14, 5] },
  { label: "Field updates", meta: "radio · mobile", pos: "right-[2%] top-[40%]", o: [30, 10, -3] },
  { label: "Hospital capacity", meta: "beds · ICU", pos: "left-[0%] bottom-[8%]", o: [-18, 24, 4] },
  { label: "Resource availability", meta: "fleet · crews", pos: "right-[10%] bottom-[4%]", o: [22, 20, -5] },
];

const AFTER = [
  ["Incident", "Industrial fire · Zone 4", "crit"],
  ["Severity", "Critical · P1", "crit"],
  ["Location", "23.0225°N 72.5714°E", "accent"],
  ["Resources", "3 matched · 41 available", "accent"],
  ["Hospitals", "Central · 62% load", "ok"],
  ["Routes", "Primary + 1 alternate", "warn"],
  ["Teams", "Fire 04 · Amb 12 · Rescue", "accent"],
  ["Recommendation", "Deploy & notify", "accent"],
];

function useMediaQuery(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    setM(mq.matches);
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [q]);
  return m;
}

export function Problem() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const wide = useMediaQuery("(min-width: 1024px)");

  return (
    <SectionShell id="how" className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-60" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.07),transparent_70%)] blur-[40px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <SectionHeading
          title="Emergency response shouldn't depend on fragmented information."
          sub="Signals arrive from a dozen places at once. Vistaraz turns them into one verified situation that a human can act on."
        />

        <div ref={ref} className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_minmax(160px,200px)_1fr] lg:gap-6">
          {/* ---------- BEFORE ---------- */}
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <MonoLabel className="text-slate-600">Before</MonoLabel>
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="relative h-[360px] rounded-[16px] border border-white/[0.05] bg-[#0A1219]/50 p-4 sm:h-[400px]">
              {BEFORE.map((c, i) => {
                const scattered = `translate(${c.o[0]}px, ${c.o[1]}px) rotate(${c.o[2]}deg)`;
                const converged = wide
                  ? `translate(190px, ${-c.o[1] * 0.85}px) scale(0.55)`
                  : `translate(0px,0px) scale(1)`;
                return (
                  <div
                    key={c.label}
                    className={cn(
                      "absolute w-[168px] rounded-[12px] border border-white/[0.08] bg-[#101C25]/90 px-3.5 py-3 shadow-[0_16px_36px_-22px_rgba(0,0,0,0.95)] backdrop-blur-sm sm:w-[180px]",
                      c.pos,
                    )}
                    style={{
                      transform: inView ? converged : scattered,
                      opacity: inView ? 0 : 1,
                      transition: `transform 1100ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms, opacity 700ms ease ${400 + i * 70}ms`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                      <span className="text-[12.5px] font-medium text-slate-300">{c.label}</span>
                    </div>
                    <div className="mt-1 pl-3.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">
                      {c.meta}
                    </div>
                  </div>
                );
              })}

              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600 transition-opacity duration-500"
                style={{ opacity: inView ? 0.35 : 1 }}
              >
                fragmented data
              </div>
            </div>
          </div>

          {/* ---------- CORE ---------- */}
          <div className="flex flex-col items-center gap-3 lg:py-10">
            <div className="relative grid h-[132px] w-[132px] place-items-center">
              <span
                className={cn(
                  "absolute inset-0 rounded-full border transition-all duration-700",
                  inView ? "border-cyan-400/40" : "border-white/10",
                )}
              />
              <span
                className={cn(
                  "absolute inset-3 rounded-full border border-dashed transition-all duration-700",
                  inView ? "border-cyan-400/25" : "border-white/[0.07]",
                )}
              />
              <span
                className={cn(
                  "absolute inset-0 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.28),transparent_70%)] transition-opacity duration-1000",
                  inView ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="relative text-center">
                <div className="text-[13px] font-semibold tracking-[0.14em] text-slate-100">VISTARAZ</div>
                <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-cyan-300/80">
                  AI Response Core
                </div>
              </div>
            </div>
            <div className="hidden h-16 w-px bg-gradient-to-b from-cyan-400/40 to-transparent lg:block" />
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-600">
              normalise · verify · prioritise
            </div>
          </div>

          {/* ---------- AFTER ---------- */}
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
              <MonoLabel className="text-cyan-300/70">After</MonoLabel>
            </div>

            <div className="relative overflow-hidden rounded-[16px] border border-cyan-400/15 bg-[#0B141C]/85 p-4 shadow-[0_24px_60px_-30px_rgba(34,211,238,0.35)]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div className="flex items-center gap-2">
                  <StatusDot tone="accent" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    One live situation
                  </span>
                </div>
                <span className="font-mono text-[9.5px] text-slate-500">INC-2481</span>
              </div>

              <div className="mt-3 space-y-1.5">
                {AFTER.map(([k, v, tone], i) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-[9px] border border-white/[0.05] bg-white/[0.015] px-3 py-2 transition-all duration-700"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? "translateX(0)" : "translateX(14px)",
                      transitionDelay: `${900 + i * 85}ms`,
                    }}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      {k}
                    </span>
                    <span
                      className={cn(
                        "text-[12px]",
                        tone === "crit"
                          ? "text-red-300"
                          : tone === "warn"
                            ? "text-amber-300"
                            : tone === "ok"
                              ? "text-emerald-300"
                              : "text-slate-200",
                      )}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
