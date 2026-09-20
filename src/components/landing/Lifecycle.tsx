import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Eyebrow, SectionHeading, SectionShell, useInView } from "./shared";

const STAGES = [
  ["Detect", "Signal ingested from any source"],
  ["Understand", "Entities, language and intent resolved"],
  ["Prioritise", "Severity scored against live risk"],
  ["Match", "Units scored by capability and distance"],
  ["Simulate", "What-if run on the digital twin"],
  ["Approve", "Operator reviews and signs off"],
  ["Respond", "Teams dispatched with live routing"],
  ["Learn", "Outcome folded back into the model"],
];

export function Lifecycle() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.25;
      const p = (start - r.top) / (start - end + r.height * 0.5);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const activeCount = Math.min(STAGES.length, Math.floor(progress * STAGES.length) + 1);

  return (
    <SectionShell className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-50" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>Incident lifecycle</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="Every incident follows the same disciplined path."
          sub="One pipeline from first signal to after-action learning — with a human decision gate where it matters most."
        />

        <div ref={ref} className="mt-16">
          {/* rail */}
          <div className="relative">
            <div className="absolute left-0 right-0 top-[13px] hidden h-[2px] rounded-full bg-white/[0.07] sm:block" />
            <div
              className="absolute left-0 top-[13px] hidden h-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 shadow-[0_0_18px_0_rgba(34,211,238,0.65)] transition-[width] duration-300 ease-out sm:block"
              style={{ width: `${progress * 100}%` }}
            />
            <div className="relative grid grid-cols-4 gap-y-8 sm:grid-cols-8">
              {STAGES.map(([name, desc], i) => {
                const lit = i < activeCount && inView;
                return (
                  <div key={name} className="flex flex-col items-center px-1 text-center">
                    <span
                      className={cn(
                        "relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 bg-[#050A0F] font-mono text-[10px] transition-all duration-500",
                        lit
                          ? "border-cyan-400 text-cyan-200 shadow-[0_0_20px_-2px_rgba(34,211,238,0.9)]"
                          : "border-white/[0.12] text-slate-600",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div
                      className={cn(
                        "mt-3 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors duration-500 sm:text-[12.5px]",
                        lit ? "text-slate-100" : "text-slate-600",
                      )}
                    >
                      {name}
                    </div>
                    <div
                      className={cn(
                        "mt-1.5 hidden max-w-[140px] text-[11px] leading-snug transition-opacity duration-500 lg:block",
                        lit ? "text-slate-500 opacity-100" : "opacity-40 text-slate-600",
                      )}
                    >
                      {desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* stage detail */}
          <div className="mt-12 rounded-[16px] border border-white/[0.07] bg-[#0B141C]/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-cyan-300/80">
                  Stage {Math.max(1, activeCount)} / {STAGES.length}
                </span>
                <span className="text-[15px] font-medium text-slate-100">
                  {STAGES[Math.max(0, activeCount - 1)][0]}
                </span>
              </div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
                Human gate · stage 06
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-slate-400">
              {STAGES[Math.max(0, activeCount - 1)][1]}. Each stage emits an
              immutable event, so the full history of a response can be replayed
              later for review and training.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
