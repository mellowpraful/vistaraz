import { Eyebrow, Reveal, SectionShell, StatusDot } from "./shared";
import { LiveMap } from "./LiveMap";

const PRINCIPLES = [
  {
    title: "Human approval",
    body: "AI recommendations remain reviewable, editable and rejectable. No action dispatches without an operator signing off.",
    icon: (
      <path d="M12 3.2 4.6 6v5.6c0 4.6 3.2 7.7 7.4 8.5 4.2-.8 7.4-3.9 7.4-8.5V6L12 3.2Z M9.2 12.2l2 2 3.6-3.8" />
    ),
  },
  {
    title: "Audit trail",
    body: "Every important action — recommendation, edit, approval, dispatch — is timestamped and traceable for after-action review.",
    icon: <path d="M6 3.5h8.5L19 8v12.5H6z M14 3.5V8h5 M9 12h6 M9 16h4" />,
  },
  {
    title: "Role-based access",
    body: "Information follows operational roles. Dispatchers, field crews and facility staff each see exactly what they need.",
    icon: <path d="M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z M4.8 20a7.2 7.2 0 0 1 14.4 0" />,
  },
  {
    title: "Simulation isolation",
    body: "What-if scenarios run in a separate model. Nothing in a sandbox can alter live incidents or real dispatches.",
    icon: <path d="M4.5 7.5h15v11h-15z M9 7.5V5.2h6v2.3 M4.5 12h15 M12 12v6.5" />,
  },
  {
    title: "Synthetic data",
    body: "Demo and simulation datasets are clearly identified so an operator is never unsure what is real.",
    icon: <path d="M12 3.8 5 7v5.4c0 4.2 2.9 7 7 7.8 4.1-.8 7-3.6 7-7.8V7l-7-3.2Z M9.6 12h4.8 M12 9.6v4.8" />,
  },
];

export function Trust() {
  return (
    <SectionShell id="trust" className="overflow-hidden bg-[#04080C] py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-40" />
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.05),transparent_70%)] blur-[70px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>Human control</Eyebrow>
        </div>

        <Reveal className="mt-6 text-center">
          <h2 className="mx-auto max-w-3xl text-balance text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-slate-50">
            Built for human-led emergency response.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            Emergency software has to be trustworthy before it is clever. So the
            system is designed to advise, explain and record — never to act on
            its own.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <div className="group h-full rounded-[16px] border border-white/[0.07] bg-[#0A1219]/70 p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-cyan-300/20 hover:bg-[#0C1620]/80">
                <span className="grid h-10 w-10 place-items-center rounded-[11px] border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.7)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {p.icon}
                  </svg>
                </span>
                <h3 className="mt-5 text-[15.5px] font-medium tracking-[-0.01em] text-slate-100">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function FinalCTA() {
  return (
    <SectionShell className="relative overflow-hidden py-28 sm:py-36">
      {/* live map background, slower */}
      <div className="absolute inset-0" aria-hidden>
        <LiveMap variant="slow" />
        <div className="absolute inset-0 bg-[#050A0F]/78" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,transparent_0%,#050A0F_92%)]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 text-center sm:px-8">
        <Eyebrow>Enter the command centre</Eyebrow>
        <h2 className="mx-auto mt-7 max-w-4xl text-balance text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-slate-50">
          When every second matters,
          <br className="hidden sm:block" /> every signal should become{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent">
            actionable
          </span>
          .
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400">
          See how CrisisOS, VoiceDispatch and RapidAid work together on a live
          incident — from the first call to the dispatched team.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/login"
            className="group inline-flex items-center gap-2.5 rounded-[10px] bg-cyan-400 px-6 py-3.5 text-[14px] font-semibold text-[#04222B] transition-all hover:-translate-y-[2px] hover:bg-cyan-300 hover:shadow-[0_20px_50px_-14px_rgba(34,211,238,0.7)]"
          >
            Enter Command Centre
            <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#platform"
            className="inline-flex items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.02] px-6 py-3.5 text-[14px] font-medium text-slate-200 transition-all hover:-translate-y-[2px] hover:border-white/25"
          >
            Explore the platform
          </a>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          <span className="flex items-center gap-2">
            <StatusDot tone="ok" /> Synthetic demo data
          </span>
          <span>Human approval required</span>
          <span>Audit logged</span>
        </div>
      </div>
    </SectionShell>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#04080C]">
      <div className="mx-auto max-w-[1240px] w-full px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="text-[15px] font-semibold tracking-[0.14em] text-slate-100">
              VISTARAZ
            </div>
            <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
              Emergency Intelligence Platform
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-slate-500">
              CrisisOS · VoiceDispatch · RapidAid — one operating picture for
              emergency response teams.
            </p>
          </div>

          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
              Platform
            </div>
            <ul className="mt-4 space-y-2.5">
              {["VoiceDispatch", "RapidAid", "CrisisOS", "Simulation"].map((l) => (
                <li key={l}>
                  <a href="#platform" className="text-[13.5px] text-slate-400 transition-colors hover:text-cyan-300">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">
              Resources
            </div>
            <ul className="mt-4 space-y-2.5">
              {["Architecture", "Documentation", "API", "Security"].map((l) => (
                <li key={l}>
                  <a href="#trust" className="text-[13.5px] text-slate-400 transition-colors hover:text-cyan-300">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-white/[0.07]" />

        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
            <StatusDot tone="ok" />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-400">
              System status · operational
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
            © 2026 Vistaraz · Built for emergency response
          </div>
        </div>
      </div>
    </footer>
  );
}
