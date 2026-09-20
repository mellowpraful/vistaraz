import { cn } from "../utils/cn";
import { Eyebrow, Panel, Reveal, SectionHeading, SectionShell, StatusDot, useInView } from "./shared";

/* ------------------------------------------------------------------ */
/*  01 · VoiceDispatch                                                  */
/* ------------------------------------------------------------------ */
function VoiceCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const steps = [
    { k: "Incident detected", v: "Industrial fire", tone: "crit" as const },
    { k: "Location extracted", v: "Naroda, Ahmedabad", tone: "accent" as const },
    { k: "Severity", v: "HIGH · P1", tone: "warn" as const },
  ];

  return (
    <Panel className="flex flex-col p-6" glow="accent">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-cyan-300/80">01</div>
          <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-slate-50">
            VoiceDispatch
          </h3>
        </div>
        <span className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
          Signal → Understanding
        </span>
      </div>

      <p className="mt-4 text-[14.5px] leading-relaxed text-slate-400">
        Understand multilingual emergency reports, extract critical information
        and create a structured incident in real time.
      </p>

      {/* mini UI */}
      <div ref={ref} className="mt-6 rounded-[12px] border border-white/[0.06] bg-[#081118]/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {["Gujarati", "Hindi", "English"].map((l, i) => (
              <span
                key={l}
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em]",
                  i === 0
                    ? "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200"
                    : "border-white/[0.06] text-slate-500",
                )}
              >
                {l}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-red-300">
            <StatusDot tone="crit" /> rec
          </span>
        </div>

        {/* waveform */}
        <div className="mt-4 flex h-10 items-center gap-[3px]">
          {Array.from({ length: 34 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "vz-eq w-[3px] rounded-full",
                i < 20 ? "bg-cyan-300/80" : "bg-slate-700",
              )}
              style={{
                height: `${28 + ((i * 37) % 62) * 0.42}%`,
                animationDelay: `${(i % 12) * 90}ms`,
                animationDuration: `${900 + (i % 7) * 120}ms`,
                opacity: i >= 20 ? 0.35 : 1,
              }}
            />
          ))}
        </div>

        <div className="mt-3 rounded-md border border-white/[0.05] bg-white/[0.015] px-3 py-2 font-mono text-[11.5px] text-slate-400">
          <span className="text-cyan-300/70">“</span> aa jagya par aag lagi che…
          <span className="text-cyan-300/70">”</span>
        </div>

        <div className="mt-3 space-y-1.5">
          {steps.map((s, i) => (
            <div
              key={s.k}
              className="flex items-center gap-2.5 transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(8px)",
                transitionDelay: `${400 + i * 260}ms`,
              }}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-cyan-400/70" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 6.5 4.6 9 10 3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                {s.k}
              </span>
              <span
                className={cn(
                  "ml-auto text-[11.5px]",
                  s.tone === "crit" ? "text-red-300" : s.tone === "warn" ? "text-amber-300" : "text-slate-200",
                )}
              >
                {s.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  02 · RapidAid                                                       */
/* ------------------------------------------------------------------ */
function RapidAidCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const units = [
    ["Fire Team 04", 92, "3.1 km", "accent"],
    ["Ambulance 12", 87, "2.4 km", "accent"],
    ["Rescue Unit 07", 81, "4.0 km", "warn"],
    ["Water Tanker 03", 76, "5.2 km", "warn"],
  ] as const;

  return (
    <Panel className="flex flex-col p-6" glow="accent">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-cyan-300/80">02</div>
          <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-slate-50">
            RapidAid
          </h3>
        </div>
        <span className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
          Understanding → Coordination
        </span>
      </div>

      <p className="mt-4 text-[14.5px] leading-relaxed text-slate-400">
        Match the right teams, vehicles, equipment and facilities based on
        capability, distance and live availability.
      </p>

      <div ref={ref} className="mt-6 rounded-[12px] border border-white/[0.06] bg-[#081118]/80 p-4">
        <div className="flex items-center gap-2">
          <StatusDot tone="crit" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
            Incident · INC-2481
          </span>
        </div>
        <div className="mx-auto mt-2 h-6 w-px bg-gradient-to-b from-red-500/60 to-white/10" />

        <div className="space-y-2.5">
          {units.map(([name, pct, dist, tone], i) => (
            <div key={name}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-slate-200">
                  <span
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded-[4px] text-[8px] font-bold",
                      tone === "accent" ? "bg-cyan-400/15 text-cyan-300" : "bg-amber-400/15 text-amber-300",
                    )}
                  >
                    {i === 0 ? "F" : i === 1 ? "A" : i === 2 ? "R" : "W"}
                  </span>
                  {name}
                </span>
                <span className="flex items-center gap-3 font-mono text-[10.5px]">
                  <span className="text-slate-500">{dist}</span>
                  <span className={tone === "accent" ? "text-cyan-300" : "text-amber-300"}>{pct}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    tone === "accent"
                      ? "bg-gradient-to-r from-cyan-400/50 to-cyan-300"
                      : "bg-gradient-to-r from-amber-400/40 to-amber-300",
                  )}
                  style={{
                    width: inView ? `${pct}%` : "0%",
                    transition: `width 1100ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 130}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  03 · CrisisOS                                                       */
/* ------------------------------------------------------------------ */
function CrisisOSCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const plan = [
    ["Team A", "Fire Unit 04 · en route", "accent"],
    ["Ambulance B", "Amb 12 · 2.4 km out", "accent"],
    ["Hospital C", "Central · notified", "ok"],
  ] as const;

  return (
    <Panel className="flex flex-col p-6" glow="accent">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-cyan-300/80">03</div>
          <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-slate-50">
            CrisisOS
          </h3>
        </div>
        <span className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
          Coordination → Action
        </span>
      </div>

      <p className="mt-4 text-[14.5px] leading-relaxed text-slate-400">
        Give responders one live operating picture with incidents, teams,
        hospitals, routes and risks — on a single screen.
      </p>

      <div ref={ref} className="mt-6 rounded-[12px] border border-white/[0.06] bg-[#081118]/80 p-4">
        <div className="rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
          <div className="flex items-center gap-2">
            <StatusDot tone="crit" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-300">Incident</span>
          </div>
          <div className="mt-1 text-[13px] text-slate-200">Industrial fire · Zone 4</div>
        </div>

        <div className="mx-auto my-2 h-5 w-px bg-gradient-to-b from-red-500/50 to-cyan-400/50" />

        <div
          className="rounded-md border border-cyan-400/25 bg-cyan-400/[0.07] px-3 py-2 text-center transition-all duration-700"
          style={{
            opacity: inView ? 1 : 0.2,
            boxShadow: inView ? "0 0 30px -12px rgba(34,211,238,0.9)" : "none",
            transitionDelay: "400ms",
          }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">
            AI Commander
          </span>
        </div>

        <div className="mx-auto my-2 h-5 w-px bg-gradient-to-b from-cyan-400/50 to-white/10" />

        <div className="space-y-1.5">
          {plan.map(([n, d, tone], i) => (
            <div
              key={n}
              className="flex items-center gap-2.5 rounded-md border border-white/[0.05] bg-white/[0.015] px-3 py-2 transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(8px)",
                transitionDelay: `${900 + i * 160}ms`,
              }}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  tone === "ok" ? "bg-emerald-400" : "bg-cyan-400",
                )}
              />
              <span className="text-[12px] text-slate-200">{n}</span>
              <span className="ml-auto font-mono text-[10px] text-slate-500">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function Pillars() {
  return (
    <SectionShell id="platform" className="py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-50" />
      </div>
      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>Core platform</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="One operating picture. Every response layer connected."
          sub="Three systems, one shared incident graph — so a signal received in seconds becomes a coordinated response."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <Reveal delay={0}>
            <VoiceCard />
          </Reveal>
          <Reveal delay={120}>
            <RapidAidCard />
          </Reveal>
          <Reveal delay={240}>
            <CrisisOSCard />
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
