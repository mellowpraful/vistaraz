import { cn } from "../utils/cn";
import { Eyebrow, Panel, Reveal, SectionHeading, SectionShell, StatusDot, useInView } from "./shared";

const TREND = [11.4, 10.9, 11.2, 9.6, 9.3, 8.8, 8.1, 8.6, 7.9, 7.4, 7.1, 6.8];
const TYPES = [
  ["Fire & industrial", 34, "crit"],
  ["Medical emergency", 27, "accent"],
  ["Road accidents", 18, "warn"],
  ["Flood & weather", 12, "accent"],
  ["Structural", 9, "warn"],
] as const;
const UTIL = [42, 48, 45, 56, 61, 58, 67, 72, 69, 78, 83, 88];

const SIGNALS = [
  ["Affected areas", "Recurring hotspot mapping"],
  ["Response delays", "Corridor-level bottleneck analysis"],
  ["Resource shortages", "Predicted gaps before peak hours"],
  ["Incident patterns", "Seasonal and time-of-day clustering"],
  ["Coverage gaps", "Where no unit can arrive under 8 min"],
];

function linePath(data: number[], w = 100, h = 100, pad = 8) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function areaPath(data: number[], w = 100, h = 100, pad = 8) {
  const line = linePath(data, w, h, pad);
  return `${line} L${w},${h} L0,${h} Z`;
}

export function Analytics() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <SectionShell className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-50" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>Operational analytics</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="Every response becomes intelligence for the next one."
          sub="Post-incident data is not a report nobody reads. It reshapes the matching model, the coverage map and the next simulation."
        />

        <div ref={ref} className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* response time trend */}
          <Reveal delay={0}>
            <Panel className="h-full p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[14.5px] font-medium text-slate-100">Response time</h3>
                  <p className="mt-1 text-[11.5px] text-slate-500">Avg minutes · 12 months</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/[0.06] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-300">
                  <StatusDot tone="ok" /> −40%
                </span>
              </div>

              <div className="mt-6 h-[150px] w-full">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="vzTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(148,197,219,0.08)" strokeWidth="0.4" />
                  ))}
                  <path d={areaPath(TREND)} fill="url(#vzTrend)" opacity={inView ? 1 : 0} style={{ transition: "opacity 900ms ease 500ms" }} />
                  <path
                    d={linePath(TREND)}
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    style={{
                      strokeDashoffset: inView ? 0 : 1,
                      transition: "stroke-dashoffset 1600ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                  <circle
                    cx="98.4"
                    cy={92}
                    r="1.6"
                    fill="#22D3EE"
                    opacity={inView ? 1 : 0}
                    style={{ transition: "opacity 500ms ease 1600ms" }}
                  />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[24px] font-medium tracking-tight text-cyan-300">06:48</div>
                  <div className="text-[11px] text-slate-500">current average</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px] text-slate-400">11:24</div>
                  <div className="text-[11px] text-slate-600">12 months ago</div>
                </div>
              </div>
            </Panel>
          </Reveal>

          {/* incident types */}
          <Reveal delay={120}>
            <Panel className="h-full p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[14.5px] font-medium text-slate-100">Incident types</h3>
                  <p className="mt-1 text-[11.5px] text-slate-500">Share of volume · this quarter</p>
                </div>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500">n=4,812</span>
              </div>

              <div className="mt-6 space-y-3.5">
                {TYPES.map(([label, pct, tone], i) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-slate-300">{label}</span>
                      <span
                        className={cn(
                          "font-mono",
                          tone === "crit" ? "text-red-300" : tone === "warn" ? "text-amber-300" : "text-cyan-300",
                        )}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-[7px] w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          tone === "crit"
                            ? "bg-gradient-to-r from-red-500/50 to-red-400"
                            : tone === "warn"
                              ? "bg-gradient-to-r from-amber-400/45 to-amber-300"
                              : "bg-gradient-to-r from-cyan-400/45 to-cyan-300",
                        )}
                        style={{
                          width: inView ? `${(pct / 34) * 100}%` : "0%",
                          transition: `width 1000ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 120}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>

          {/* resource utilisation */}
          <Reveal delay={240}>
            <Panel className="h-full p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[14.5px] font-medium text-slate-100">Resource utilisation</h3>
                  <p className="mt-1 text-[11.5px] text-slate-500">Fleet engaged · hourly</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-md border border-amber-400/25 bg-amber-400/[0.06] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-amber-300">
                  <StatusDot tone="warn" /> peak 88%
                </span>
              </div>

              <div className="mt-6 h-[150px] w-full">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="vzUtil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(148,197,219,0.08)" strokeWidth="0.4" />
                  ))}
                  <path d={areaPath(UTIL)} fill="url(#vzUtil)" opacity={inView ? 1 : 0} style={{ transition: "opacity 900ms ease 600ms" }} />
                  <path
                    d={linePath(UTIL)}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    style={{
                      strokeDashoffset: inView ? 0 : 1,
                      transition: "stroke-dashoffset 1600ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </svg>
              </div>

              <div className="mt-5 space-y-2">
                {SIGNALS.slice(0, 3).map(([a, b]) => (
                  <div key={a} className="flex items-center gap-2.5">
                    <span className="h-1 w-1 rounded-full bg-amber-400" />
                    <span className="text-[12px] text-slate-300">{a}</span>
                    <span className="truncate text-[11px] text-slate-600">{b}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>
        </div>

        {/* signal list */}
        <Reveal delay={120}>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {SIGNALS.map(([a, b]) => (
              <div
                key={a}
                className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] px-4 py-3.5 transition-all duration-300 hover:-translate-y-[3px] hover:border-cyan-300/20"
              >
                <div className="text-[12.5px] font-medium text-slate-200">{a}</div>
                <div className="mt-1 text-[11px] leading-snug text-slate-500">{b}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
