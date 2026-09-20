import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { Eyebrow, Panel, SectionShell, StatusDot, useInView } from "./shared";

const ACTIONS = [
  "Deploy Fire Unit 04",
  "Ambulance 12 → Zone 4",
  "Notify Hospital Central",
  "Avoid Road 18 · use alternate",
];

const STAGES = ["AI recommendation", "Human review", "Approve", "Dispatch"];

export function AICommander() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [stage, setStage] = useState(0);

  // advance from "AI recommendation" to "Human review" once the panel is seen
  useEffect(() => {
    if (inView && stage === 0) {
      const t = setTimeout(() => setStage(1), 1600);
      return () => clearTimeout(t);
    }
  }, [inView, stage]);

  useEffect(() => {
    if (stage === 3) {
      const t = setTimeout(() => setStage(0), 4200);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <SectionShell id="commander" className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-70" />
        <div className="absolute left-1/2 top-1/3 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.09),transparent_70%)] blur-[70px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* ---------- copy ---------- */}
          <div>
            <Eyebrow>AI incident commander</Eyebrow>
            <h2 className="mt-6 text-balance text-[clamp(1.9rem,3.7vw,3.05rem)] font-semibold leading-[1.06] tracking-[-0.038em] text-slate-50">
              AI that helps coordinate the response.
            </h2>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-slate-400">
              Turn fragmented emergency information into structured
              recommendations for human decision-makers. The system proposes.
              A commander approves. Every action stays accountable.
            </p>

            {/* human-in-the-loop pipeline */}
            <div ref={ref} className="mt-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Decision chain
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11.5px] transition-all duration-500",
                        stage === i
                          ? "border-cyan-400/45 bg-cyan-400/[0.1] text-cyan-200 shadow-[0_0_24px_-8px_rgba(34,211,238,0.9)]"
                          : stage > i
                            ? "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200/80"
                            : "border-white/[0.06] bg-white/[0.015] text-slate-500",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {stage > i ? (
                          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <path d="M2 6.5 4.6 9 10 3.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className={cn("h-1.5 w-1.5 rounded-full", stage === i ? "bg-cyan-300" : "bg-slate-700")} />
                        )}
                        {s}
                      </span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <svg viewBox="0 0 12 12" className={cn("h-3 w-3 transition-colors duration-500", stage > i ? "text-emerald-400/70" : "text-slate-700")} fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 6h7M6.5 3.5 9 6l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-5 max-w-lg text-[13.5px] leading-relaxed text-slate-500">
                <span className="text-slate-300">Nothing dispatches itself.</span>{" "}
                Recommendations arrive with reasoning, confidence and constraints
                attached — ready to be reviewed, edited or rejected.
              </p>
            </div>
          </div>

          {/* ---------- command panel ---------- */}
          <Panel className="p-0" glow="accent">
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0B141C]/80 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <StatusDot tone="accent" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-200">
                  AI Incident Commander
                </span>
              </div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
                Draft · v3
              </span>
            </div>

            <div className="px-5 py-5">
              {/* incident block */}
              <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] p-4">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                  Incident
                </div>
                <div className="mt-1.5 text-[16px] font-medium text-slate-100">
                  Industrial fire · Zone 4
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-md border border-red-500/25 bg-red-500/[0.08] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-red-300">
                    <StatusDot tone="crit" /> Severity: critical
                  </span>
                  <span className="rounded-md border border-white/[0.07] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-400">
                    Confidence 0.91
                  </span>
                  <span className="rounded-md border border-white/[0.07] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-400">
                    12+ people
                  </span>
                </div>
              </div>

              <div className="my-5 h-px bg-white/[0.06]" />

              {/* recommendations */}
              <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                Recommended response
              </div>
              <ul className="mt-3 space-y-2">
                {ACTIONS.map((a, i) => {
                  const done = inView;
                  return (
                    <li
                      key={a}
                      className="flex items-center gap-3 rounded-[10px] border border-white/[0.05] bg-white/[0.012] px-3.5 py-2.5 transition-all duration-500"
                      style={{
                        opacity: done ? 1 : 0.15,
                        transform: done ? "translateX(0)" : "translateX(-8px)",
                        transitionDelay: `${500 + i * 200}ms`,
                        borderColor: stage >= 3 ? "rgba(52,211,153,0.22)" : undefined,
                      }}
                    >
                      <span
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-all duration-500",
                          stage >= 3
                            ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                            : "border-cyan-400/35 bg-cyan-400/[0.1] text-cyan-300",
                        )}
                      >
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6.5 4.6 9 10 3.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-[13px] text-slate-200">{a}</span>
                      <span className="ml-auto font-mono text-[9.5px] text-slate-500">
                        {["P1", "P1", "P2", "P2"][i]}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* ETA + action */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] p-4">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                    Est. response time
                  </div>
                  <div className="mt-1 font-mono text-[26px] font-medium tracking-tight text-amber-300">
                    08:42
                  </div>
                </div>
                <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] p-4">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
                    Units assigned
                  </div>
                  <div className="mt-1 font-mono text-[26px] font-medium tracking-tight text-cyan-300">
                    03<span className="text-[15px] text-slate-600">/41</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setStage((s) => Math.min(3, s + 1))}
                  disabled={stage === 3}
                  className={cn(
                    "group inline-flex items-center gap-2.5 rounded-[10px] px-5 py-3 text-[13.5px] font-semibold transition-all",
                    stage === 3
                      ? "cursor-default border border-emerald-400/30 bg-emerald-400/[0.1] text-emerald-200"
                      : "bg-cyan-400 text-[#04222B] hover:-translate-y-[2px] hover:bg-cyan-300 hover:shadow-[0_16px_40px_-12px_rgba(34,211,238,0.65)]",
                  )}
                >
                  {stage === 3 ? (
                    <>
                      <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6.5 4.6 9 10 3.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Dispatched · logged
                    </>
                  ) : stage >= 2 ? (
                    "Approve & dispatch"
                  ) : (
                    "Review plan"
                  )}
                </button>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Requires operator approval
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </SectionShell>
  );
}
