import { StatusDot } from "./shared";

const SOURCES = [
  "Voice calls",
  "Citizen reports",
  "IoT sensors",
  "Field teams",
  "Hospitals",
  "Traffic feeds",
  "Weather",
  "CCTV / vision",
  "Social signals",
  "SMS & helplines",
];

function Node({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "src" | "core" | "out";
  children?: React.ReactNode;
}) {
  const styles = {
    src: "border-white/[0.08] bg-white/[0.02] text-slate-300",
    core: "border-cyan-400/35 bg-cyan-400/[0.08] text-cyan-200 shadow-[0_0_34px_-10px_rgba(34,211,238,0.75)]",
    out: "border-emerald-400/25 bg-emerald-400/[0.05] text-emerald-200",
  }[tone];

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-[10px] border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] ${styles}`}
    >
      {children}
      {label}
    </div>
  );
}

export function SignalStrip() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center overflow-hidden border-y border-white/[0.055] bg-[#070F16]/60 py-8">
      {/* marquee */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="vz-marquee flex w-max items-center gap-10 pr-10">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10">
              {SOURCES.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-3 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500"
                >
                  <span className="h-1 w-1 rounded-full bg-cyan-400/50" />
                  {s}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* flow */}
      <div className="mx-auto mt-9 max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-5">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {["Voice", "Citizens", "Sensors", "Field teams", "Hospitals"].map((s) => (
              <Node key={s} label={s} tone="src">
                <StatusDot tone="idle" pulse={false} />
              </Node>
            ))}
          </div>

          <svg viewBox="0 0 40 12" className="hidden h-3 w-10 text-cyan-400/60 lg:block" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M0 6h34M30 2.5 34 6l-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg viewBox="0 0 12 40" className="h-10 w-3 text-cyan-400/60 lg:hidden" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 0v34M2.5 30 6 34l3.5-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <Node label="AI Incident Engine" tone="core">
            <StatusDot tone="accent" />
          </Node>

          <svg viewBox="0 0 40 12" className="hidden h-3 w-10 text-emerald-400/60 lg:block" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M0 6h34M30 2.5 34 6l-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg viewBox="0 0 12 40" className="h-10 w-3 text-emerald-400/60 lg:hidden" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 0v34M2.5 30 6 34l3.5-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <Node label="Response Coordination" tone="out">
            <StatusDot tone="ok" />
          </Node>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-slate-600">
          Multi-source intelligence · normalised into one incident graph
        </p>
      </div>
    </section>
  );
}
