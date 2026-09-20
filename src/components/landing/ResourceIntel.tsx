import { cn } from "../utils/cn";
import { Eyebrow, Panel, Reveal, SectionHeading, SectionShell, StatusDot, useInView } from "./shared";

const WEIGHTS = [
  ["Capability", 35, "Does the unit solve this incident type?"],
  ["Distance", 25, "Live travel time, not straight-line radius"],
  ["Availability", 20, "Crew on shift, not already committed"],
  ["Priority", 10, "Severity and casualty exposure"],
  ["Equipment", 10, "Specialist gear and payload"],
] as const;

const UNITS = [
  { name: "Ambulance 12", code: "A12", dist: "2.4 km", status: "Available", eta: "06:10", tone: "accent" as const },
  { name: "Fire Unit 04", code: "F04", dist: "3.1 km", status: "Available", eta: "08:42", tone: "warn" as const },
];

export function ResourceIntel() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  return (
    <SectionShell className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-50" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.06),transparent_70%)] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>RapidAid · resource intelligence</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="The right resource. At the right place."
          sub="Every recommendation is scored against live conditions — capability, distance, availability, priority and equipment — then re-scored as the situation moves."
        />

        {/* ---------------- network diagram ---------------- */}
        <div ref={ref} className="relative mt-14 h-[440px] sm:h-[470px]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M50,11 C50,26 22,26 22,46"
              stroke="rgba(34,211,238,0.45)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M50,11 C50,26 78,26 78,46"
              stroke="rgba(245,158,11,0.45)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M50,11 C50,26 22,26 22,46"
              stroke="rgba(34,211,238,0.9)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="vz-dash"
            />
            <path
              d="M50,11 C50,26 78,26 78,46"
              stroke="rgba(245,158,11,0.9)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="vz-dash"
            />
            <path
              d="M22,54 C22,74 50,68 50,84"
              stroke="rgba(34,211,238,0.3)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M78,54 C78,74 50,68 50,84"
              stroke="rgba(245,158,11,0.3)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* incident node */}
          <div
            className="absolute left-1/2 top-[11%] -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{ opacity: inView ? 1 : 0, transform: `translate(-50%,-50%) scale(${inView ? 1 : 0.9})` }}
          >
            <div className="flex items-center gap-3 rounded-full border border-red-500/30 bg-[#0B141C]/95 px-4 py-2.5 shadow-[0_0_40px_-12px_rgba(239,68,68,0.8)] backdrop-blur-sm">
              <span className="relative grid h-6 w-6 place-items-center">
                <span className="absolute inset-0 rounded-full bg-red-500/30 vz-ping" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.8)]" />
              </span>
              <span className="text-[13.5px] font-medium text-slate-100">Incident · INC-2481</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:inline">
                P1 · industrial fire
              </span>
            </div>
          </div>

          {/* unit cards */}
          {UNITS.map((u, i) => (
            <div
              key={u.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${i === 0 ? 22 : 78}%`,
                top: "46%",
                opacity: inView ? 1 : 0,
                transform: `translate(-50%,-50%) translateY(${inView ? 0 : 16}px)`,
                transition: `opacity 700ms ease ${300 + i * 180}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 180}ms`,
              }}
            >
              <Panel className="w-[156px] p-3 sm:w-[248px] sm:p-4">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-[10px] border font-mono text-[11px] font-semibold",
                      u.tone === "accent"
                        ? "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-300"
                        : "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
                    )}
                  >
                    {u.code}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/[0.06] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-300">
                    <StatusDot tone="ok" /> {u.status}
                  </span>
                </div>
                <div className="mt-3 text-[14.5px] font-medium text-slate-100">{u.name}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-white/[0.06] bg-white/[0.015] px-2.5 py-1.5">
                    <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">Dist</div>
                    <div className="font-mono text-[12px] text-slate-200">{u.dist}</div>
                  </div>
                  <div className="rounded-md border border-white/[0.06] bg-white/[0.015] px-2.5 py-1.5">
                    <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">ETA</div>
                    <div className={cn("font-mono text-[12px]", u.tone === "accent" ? "text-cyan-300" : "text-amber-300")}>
                      {u.eta}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          ))}

          {/* response network */}
          <div
            className="absolute left-1/2 top-[84%] w-[min(560px,88%)] -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{ opacity: inView ? 1 : 0, transitionDelay: "700ms" }}
          >
            <div className="rounded-[14px] border border-cyan-400/20 bg-[#0B141C]/90 px-5 py-4 shadow-[0_0_50px_-18px_rgba(34,211,238,0.7)] backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StatusDot tone="accent" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200">
                    Response network
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">41 units · 24 crews</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Fire 04", "Amb 12", "Amb 19", "Rescue 07", "Tanker 03", "Drone 02", "Central Hosp", "Shelter N"].map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- matching logic ---------------- */}
        <Reveal delay={100}>
          <div className="mt-6 rounded-[16px] border border-white/[0.07] bg-[#0B141C]/70 p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <h3 className="text-[15px] font-medium tracking-[-0.01em] text-slate-100">
                Matching logic
              </h3>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
                Weighted score · recalculated every 5s
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {WEIGHTS.map(([label, pct, desc], i) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-slate-200">{label}</span>
                    <span className="font-mono text-[12px] text-cyan-300">{pct}%</span>
                  </div>
                  <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400/40 to-cyan-300"
                      style={{
                        width: inView ? `${pct * 2.6}%` : "0%",
                        transition: `width 900ms cubic-bezier(0.16,1,0.3,1) ${200 + i * 110}ms`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
