import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { Eyebrow, Panel, SectionHeading, SectionShell, StatusDot } from "./shared";

type Phrase = {
  lang: string;
  script: string;
  text: string;
  translation: string;
  entities: [string, string, string][];
};

const PHRASES: Phrase[] = [
  {
    lang: "Gujarati · code-mixed",
    script: "ગુજરાતી",
    text: "Naroda road par factory ma aag lagi che… 12 log andar fase che… jaldi bhejo…",
    translation: "There is a fire at a factory on Naroda road… 12 people are trapped… send help quickly…",
    entities: [
      ["Location", "Naroda, Ahmedabad", "accent"],
      ["Incident", "Industrial fire", "crit"],
      ["Severity", "Critical · P1", "crit"],
      ["People affected", "12+", "warn"],
    ],
  },
  {
    lang: "Hindi",
    script: "हिन्दी",
    text: "Sabzi mandi ke paas building gir gayi… log neeche dabe hue hain… rescue team bhejo…",
    translation: "A building has collapsed near the vegetable market… people are trapped underneath… send a rescue team…",
    entities: [
      ["Location", "Sabzi Mandi, Zone 2", "accent"],
      ["Incident", "Structure collapse", "crit"],
      ["Severity", "Critical · P1", "crit"],
      ["People affected", "8+", "warn"],
    ],
  },
  {
    lang: "English",
    script: "English",
    text: "Multi-vehicle collision on NH-8 near Vasna… two vehicles on fire… need ambulance now…",
    translation: "Multi-vehicle collision on NH-8 near Vasna… two vehicles on fire… need ambulance now…",
    entities: [
      ["Location", "NH-8 · Vasna", "accent"],
      ["Incident", "Road accident", "warn"],
      ["Severity", "High · P2", "warn"],
      ["People affected", "5+", "warn"],
    ],
  },
];

const PIPELINE = [
  ["Voice", "Inbound emergency call", 0],
  ["Transcription", "Speech → text, code-mixed", 0.12],
  ["Entity extraction", "Location · type · severity", 0.34],
  ["Incident card", "Structured & verified", 0.68],
  ["Dispatch", "Routed to commander", 0.94],
] as const;

export function Voice() {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);

  const phrase = PHRASES[idx];
  const progress = chars / phrase.text.length;

  useEffect(() => {
    if (chars < phrase.text.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 34);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % PHRASES.length);
      setChars(0);
    }, 3000);
    return () => clearTimeout(t);
  }, [chars, idx, phrase.text.length]);

  const litBars = Math.round(progress * 40);

  return (
    <SectionShell id="voice" className="overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 geo-grid opacity-60" />
        <div className="absolute left-1/4 top-1/3 h-[420px] w-[620px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,211,238,0.07),transparent_70%)] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-5 sm:px-8">
        <div className="flex justify-center">
          <Eyebrow>VoiceDispatch · multilingual</Eyebrow>
        </div>
        <SectionHeading
          className="mt-6"
          title="Emergency information shouldn't get lost in translation."
          sub="Callers speak in their own language, often mid-panic and code-mixed. Vistaraz listens, transcribes and extracts what matters — in real time."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* ---------- listening panel ---------- */}
          <Panel className="p-0" glow="accent">
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0B141C]/80 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <StatusDot tone="crit" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-200">
                  Listening
                </span>
              </div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
                Call · 112 · 00:0{Math.min(9, Math.round(progress * 9) + 1)}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {/* language chips */}
              <div className="flex flex-wrap items-center gap-2">
                {["Gujarati", "Hindi", "English", "Code-mixed"].map((l) => (
                  <span
                    key={l}
                    className={cn(
                      "rounded-md border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-all duration-300",
                      phrase.lang.includes(l.split(" ")[0])
                        ? "border-cyan-400/35 bg-cyan-400/[0.08] text-cyan-200"
                        : "border-white/[0.06] text-slate-500",
                    )}
                  >
                    {l}
                  </span>
                ))}
                <span className="ml-auto font-mono text-[10px] text-slate-500">
                  detected · {phrase.lang}
                </span>
              </div>

              {/* waveform */}
              <div className="mt-5 flex h-16 items-center gap-[3px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "vz-eq flex-1 rounded-full",
                      i < litBars ? "bg-cyan-300/85" : "bg-slate-700/60",
                    )}
                    style={{
                      height: `${22 + ((i * 41) % 68) * 0.7}%`,
                      animationDelay: `${(i % 14) * 80}ms`,
                      animationDuration: `${820 + (i % 6) * 130}ms`,
                      opacity: i < litBars ? 1 : 0.32,
                    }}
                  />
                ))}
              </div>

              {/* transcript */}
              <div className="mt-5 rounded-[12px] border border-white/[0.06] bg-[#081118]/85 p-4">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
                  Live transcript · {phrase.script}
                </div>
                <div className="mt-2 min-h-[52px] text-[15px] leading-relaxed text-slate-100">
                  {phrase.text.slice(0, chars)}
                  <span className="ml-0.5 inline-block h-[15px] w-[2px] translate-y-[2px] bg-cyan-300 vz-blink" />
                </div>
                <div className="mt-3 border-t border-white/[0.06] pt-3 text-[12.5px] leading-relaxed text-slate-500">
                  {phrase.translation}
                </div>
              </div>

              {/* extraction */}
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {phrase.entities.map(([k, v, tone], i) => {
                  const threshold = 0.3 + i * 0.16;
                  const shown = progress > threshold;
                  return (
                    <div
                      key={k}
                      className={cn(
                        "flex items-center justify-between rounded-[10px] border px-3.5 py-2.5 transition-all duration-500",
                        shown
                          ? "border-cyan-400/25 bg-cyan-400/[0.05]"
                          : "border-white/[0.05] bg-white/[0.012]",
                      )}
                      style={{ opacity: shown ? 1 : 0.3 }}
                    >
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">
                        {k}
                      </span>
                      <span
                        className={cn(
                          "text-[13px] transition-all duration-500",
                          shown
                            ? tone === "crit"
                              ? "text-red-300"
                              : tone === "warn"
                                ? "text-amber-300"
                                : "text-cyan-200"
                            : "text-slate-600",
                        )}
                      >
                        {shown ? v : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* ---------- pipeline ---------- */}
          <Panel className="p-6">
            <h3 className="text-[15px] font-medium tracking-[-0.01em] text-slate-100">
              From voice to dispatch
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              Each stage is auditable and editable by an operator before the next
              one runs.
            </p>

            <div className="mt-6 space-y-2">
              {PIPELINE.map(([name, desc, at], i) => {
                const active = progress >= at;
                return (
                  <div key={name} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-all duration-500",
                          active
                            ? "border-cyan-400/45 bg-cyan-400/[0.12] text-cyan-200"
                            : "border-white/[0.08] text-slate-600",
                        )}
                      >
                        {i + 1}
                      </span>
                      {i < PIPELINE.length - 1 && (
                        <span
                          className={cn(
                            "w-px flex-1 transition-colors duration-500",
                            active ? "bg-cyan-400/35" : "bg-white/[0.07]",
                          )}
                          style={{ minHeight: 22 }}
                        />
                      )}
                    </div>
                    <div className="pb-2">
                      <div
                        className={cn(
                          "text-[13.5px] transition-colors duration-500",
                          active ? "text-slate-100" : "text-slate-500",
                        )}
                      >
                        {name}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-slate-600">{desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-[12px] border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
                  Extraction latency
                </span>
                <span className="font-mono text-[12px] text-cyan-300">1.4 s</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
                  Languages
                </span>
                <span className="font-mono text-[12px] text-slate-300">11 + code-mixed</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </SectionShell>
  );
}
