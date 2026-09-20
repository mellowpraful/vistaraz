"use client";

import React from "react";
import Link from "next/link";
import { Bot, Send, RefreshCw, Sparkles, MessageSquare, ArrowRight, Cpu, Radio, ShieldCheck } from "lucide-react";

export interface CopilotMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  confidence?: number;
  uncertaintyNotes?: string;
  recommendations?: Array<{
    title: string;
    action: string;
    link?: string;
  }>;
  telemetryReferences?: string[];
}

interface CopilotChatViewProps {
  messages: CopilotMessage[];
  inputQuery: string;
  sendingQuery: boolean;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onQuickPrompt: (prompt: string) => void;
}

const QUICK_PROMPTS = [
  "How many ICU & trauma beds are free across Ahmedabad Civil Hospital?",
  "List all active flood boat rescue units in Western Zone",
  "Summarize hazard level for Vatva chemical industrial spill",
  "Recommend emergency fleet redeployment from Low to High risk sectors",
];

export function CopilotChatView({
  messages,
  inputQuery,
  sendingQuery,
  onInputChange,
  onSubmit,
  onQuickPrompt,
}: CopilotChatViewProps) {
  return (
    <div className="relative overflow-hidden p-7 md:p-9 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 border border-purple-500/30 space-y-6 h-[800px] flex flex-col justify-between rounded-3xl shadow-2xl backdrop-blur-2xl animate-fade-in">
      {/* Background Cyber Accents */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

      {/* Top Copilot HUD Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-purple-900/40 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/60 flex items-center justify-center text-purple-300 shadow-xl shadow-purple-950/60 animate-float">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">
                Tactical Situation Copilot
              </h2>
              <span className="text-xs font-mono font-bold bg-purple-950/90 text-purple-300 px-3 py-1 rounded-full border border-purple-600/50 flex items-center gap-1.5 shadow-sm">
                <Radio size={12} className="text-purple-400 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Natural language intelligence connected to CAD logs, telemetry hydro-sensors, and bed telemetry
            </p>
          </div>
        </div>

        {/* Live Audio / Processing Waveform */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-slate-400 bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
          <span>COGNITIVE ENGINE:</span>
          <div className="flex items-end gap-1 h-5">
            <span className="w-1 bg-purple-400 rounded-full wave-bar-1" />
            <span className="w-1 bg-indigo-400 rounded-full wave-bar-2" />
            <span className="w-1 bg-blue-400 rounded-full wave-bar-3" />
            <span className="w-1 bg-purple-400 rounded-full wave-bar-4" />
            <span className="w-1 bg-cyan-400 rounded-full wave-bar-5" />
          </div>
          <span className="text-emerald-400 font-bold">READY</span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="relative z-10 flex-1 overflow-y-auto space-y-6 pr-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "USER" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] p-6 rounded-3xl text-sm md:text-base leading-relaxed transition-all shadow-xl ${
                m.sender === "USER"
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-br-none shadow-purple-600/30 border border-purple-400/40"
                  : "bg-slate-950/95 border border-purple-900/50 text-slate-200 rounded-bl-none shadow-black/60 space-y-4"
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-xs opacity-75 font-mono border-b border-white/10 pb-2">
                <span className="font-bold flex items-center gap-1.5">
                  {m.sender === "USER" ? (
                    "🎖️ Officer Commander"
                  ) : (
                    <span className="text-purple-300 flex items-center gap-1.5">
                      <Bot size={14} className="text-purple-400" /> CrisisOS Neural Copilot
                    </span>
                  )}
                </span>
                <span>{m.timestamp}</span>
              </div>

              <p className="whitespace-pre-line leading-relaxed font-sans">{m.text}</p>

              {/* Uncertainty Alert */}
              {m.uncertaintyNotes && (
                <div className="text-xs md:text-sm text-amber-300 bg-amber-950/50 p-4 rounded-2xl border border-amber-800/60 leading-relaxed font-sans">
                  <strong>⚠️ Uncertainty Analysis:</strong> {m.uncertaintyNotes}
                </div>
              )}

              {/* Suggested Actions */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-purple-900/40">
                  {m.recommendations.map((rec, i) => (
                    <Link
                      key={i}
                      href={rec.link || "#"}
                      className="text-xs md:text-sm bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-600/60 px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 font-bold hover:scale-[1.02]"
                    >
                      <span>→ {rec.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Telemetry Reference Sources */}
              {m.telemetryReferences && (
                <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-900 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Verified Telemetry: {m.telemetryReferences.join(" • ")}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {sendingQuery && (
          <div className="text-xs md:text-sm font-mono text-purple-300 flex items-center gap-3 p-4 bg-purple-950/60 rounded-2xl border border-purple-800/60 w-fit animate-pulse">
            <RefreshCw size={16} className="animate-spin text-purple-400" />
            <span>Copilot is querying CAD telemetry, geospatial buffers, and hospital bed reserves...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts & Query Input Box */}
      <div className="relative z-10 space-y-4 pt-3 border-t border-purple-900/40">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto pb-1">
          <span className="flex-shrink-0 flex items-center gap-1.5 text-purple-400 font-bold">
            <Sparkles size={14} /> Quick Inquiries:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickPrompt(prompt)}
              className="flex-shrink-0 px-3.5 py-1.5 bg-slate-950 hover:bg-purple-950/80 text-slate-300 hover:text-purple-200 border border-slate-800 hover:border-purple-700/60 rounded-xl text-xs font-sans transition-all hover:scale-[1.02]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Ask Copilot (e.g. 'Status of flood rescue boats', 'ICU capacity in Sector 4')..."
            value={inputQuery}
            onChange={(e) => onInputChange(e.target.value)}
            className="flex-1 bg-slate-950/90 border border-slate-700/80 focus:border-purple-500 rounded-2xl px-5 py-4 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none transition shadow-inner font-sans"
          />
          <button
            type="submit"
            disabled={sendingQuery || !inputQuery.trim()}
            className="px-7 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-sm md:text-base font-bold flex items-center gap-2.5 shadow-xl shadow-purple-600/40 hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Transmit Query</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default CopilotChatView;
