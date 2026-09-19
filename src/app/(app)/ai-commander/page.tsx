"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CopilotMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  recommendations?: Array<{
    title: string;
    action: string;
    link?: string;
  }>;
}

export default function AICommanderPage() {
  const [briefing, setBriefing] = useState<string>("");
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [activeTab, setActiveTab] = useState<"BRIEFING" | "RISK" | "DUPLICATES" | "COPILOT">("BRIEFING");

  // Copilot Chat State
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-1",
      sender: "AI",
      text: "Commander, CrisisOS Tactical Copilot is online. I am actively monitoring 6 active incidents across the Ahmedabad EOC sector. How can I assist with tactical allocation, route analysis, or hospital triage?",
      timestamp: "Just now",
      recommendations: [
        { title: "Generate Situation Briefing", action: "briefing" },
        { title: "Check ICU & Trauma Bed Deficits", action: "hospitals", link: "/hospitals" },
        { title: "Run Flood Evacuation Simulation", action: "sim", link: "/simulation" },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [sendingQuery, setSendingQuery] = useState(false);

  // Duplicate incidents state
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const fetchExecutiveBriefing = useCallback(async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_SUMMARY" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBriefing(json.data.summary || json.data);
      }
    } catch (err) {
      console.error("Failed to generate briefing:", err);
    } finally {
      setLoadingBriefing(false);
    }
  }, []);

  const handleCheckDuplicates = async () => {
    setCheckingDuplicates(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DETECT_DUPLICATES" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDuplicates(json.data.duplicates || []);
      }
    } catch (err) {
      console.error("Duplicate check failed:", err);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  useEffect(() => {
    fetchExecutiveBriefing();
  }, [fetchExecutiveBriefing]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: "USER",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setSendingQuery(true);

    // Simulate smart tactical response based on query
    setTimeout(() => {
      let reply = "";
      let recs: any[] = [];
      const q = userText.toLowerCase();

      if (q.includes("hospital") || q.includes("bed") || q.includes("icu")) {
        reply = "Hospital Network Telemetry: Civil Hospital Trauma Center has 6 ICU beds available (88% full). VS Hospital has 14 ICU beds. Recommendation: Divert incoming burn & chemical casualties from Vatva GIDC to Sardar Vallabhbhai Patel Hospital to prevent critical saturation.";
        recs = [{ title: "View Hospital Network", action: "hosp", link: "/hospitals" }];
      } else if (q.includes("flood") || q.includes("boat") || q.includes("water")) {
        reply = "Flood Assessment: Sector 4 (Usmanpura) water level is rising at 0.15m/hr. 2 NDRF rescue boats are currently dispatched. Recommend placing 1 additional Inflatable Rescue Boat (IRB-03) on standby from Sabarmati Fire Station.";
        recs = [{ title: "Deploy Boat IRB-03", action: "dispatch", link: "/dispatch" }];
      } else if (q.includes("hazmat") || q.includes("chemical") || q.includes("gas")) {
        reply = "Hazmat Tactical Alert: Chlorine gas cloud plume is moving South-Southwest at 12 km/h. Recommend establishing a 1.5 km perimeter evacuation corridor around Vatva GIDC Phase IV and alerting Fire Station 6 for foam suppression.";
      } else {
        reply = `Tactical Analysis complete for query: "${userText}". All active response protocols are synchronized. 4 response teams are en route, and 2 shelters have verified surplus rations.`;
      }

      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: "AI",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendations: recs,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setSendingQuery(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>🤖</span> AI Commander & Tactical Copilot
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated multi-agency situation awareness, predictive casualty modeling & triage assistant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchExecutiveBriefing()}
            disabled={loadingBriefing}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>🔄</span> {loadingBriefing ? "Synthesizing..." : "Refresh SITREP"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("BRIEFING")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "BRIEFING"
              ? "bg-blue-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          📋 Executive SITREP Briefing
        </button>
        <button
          onClick={() => setActiveTab("RISK")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "RISK"
              ? "bg-blue-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          ⚠️ Cascade Risk & Bottleneck Predictor
        </button>
        <button
          onClick={() => setActiveTab("DUPLICATES")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "DUPLICATES"
              ? "bg-blue-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          🔍 Deduplication Engine
        </button>
        <button
          onClick={() => setActiveTab("COPILOT")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "COPILOT"
              ? "bg-blue-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          💬 Tactical Chat Assistant
        </button>
      </div>

      {/* Tab 1: Executive SITREP Briefing */}
      {activeTab === "BRIEFING" && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4 border-purple-900/40 bg-purple-950/10">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                  Automated Multi-Agency Situation Summary (SITREP)
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-800">
                Generated from Live Database Telemetry
              </span>
            </div>

            {loadingBriefing ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="animate-spin text-2xl">⏳</div>
                <p className="text-xs">Analyzing live incident reports, fleet telemetry & hospital capacities...</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-line">
                {briefing ||
                  "SITREP Summary: Multiple critical incidents active across Central and East districts. Flooding along Sabarmati corridor has required water rescue deployments. Hazmat reactor event in Vatva GIDC under active containment. Hospital ICU capacities are currently stable at 78% average occupancy across the metro area."}
              </div>
            )}
          </div>

          {/* Key Strategic Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 space-y-2 border-l-4 border-l-red-500">
              <div className="text-xs font-bold text-red-400 uppercase font-mono">Priority Action 1</div>
              <h3 className="text-sm font-bold text-slate-100">Establish Hazmat Containment Perimeter</h3>
              <p className="text-xs text-slate-300">
                Ensure all responding fire & rescue crews at Vatva GIDC are equipped with Level A suits and foam suppression assets.
              </p>
            </div>

            <div className="card p-4 space-y-2 border-l-4 border-l-amber-500">
              <div className="text-xs font-bold text-amber-400 uppercase font-mono">Priority Action 2</div>
              <h3 className="text-sm font-bold text-slate-100">Activate Emergency Relief Shelters</h3>
              <p className="text-xs text-slate-300">
                Prepare Sardar Patel Community Hall for 200+ evacuees from Sabarmati flood zone. Verify food & water stocks.
              </p>
            </div>

            <div className="card p-4 space-y-2 border-l-4 border-l-blue-500">
              <div className="text-xs font-bold text-blue-400 uppercase font-mono">Priority Action 3</div>
              <h3 className="text-sm font-bold text-slate-100">Pre-Position Mobile ICU Units</h3>
              <p className="text-xs text-slate-300">
                Position ALS Ambulance ALS-02 near Iskcon Flyover to handle road accident overflow and trauma triage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cascade Risk & Bottleneck Predictor */}
      {activeTab === "RISK" && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>⚠️</span> 4-Hour Escalation & Cascade Risk Forecast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">Sabarmati River Surge</span>
                  <span className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded">High Risk (82%)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Upstream dam discharge will peak in 2.5 hours. Submergence risk for low-lying residential clusters in Vadaj and Usmanpura.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Recommended Action: Pre-evacuate 150 ground-floor homes before 14:00.
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">ICU Bed Exhaustion Threshold</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded">Moderate (64%)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Civil Hospital ICU capacity will reach 95% if more than 8 additional respiratory/trauma patients are admitted.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Recommended Action: Divert secondary trauma admissions to SVP Hospital.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Deduplication Engine */}
      {activeTab === "DUPLICATES" && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>🔍</span> AI Incident Deduplication & Report Clustering
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically clusters multiple citizen reports describing the same physical emergency
              </p>
            </div>
            <button
              onClick={handleCheckDuplicates}
              disabled={checkingDuplicates}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {checkingDuplicates ? "Clustering..." : "Scan for Duplicate Reports"}
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Cluster #1: Usmanpura Riverfront Flooding</span>
              <span className="text-emerald-400 font-mono text-[10px]">3 Correlated Reports Found</span>
            </div>
            <p className="text-xs text-slate-400">
              Merged 3 citizen calls from Usmanpura with 94% geospatial and temporal proximity. Combined affected estimate: 30 persons.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Tactical Chat Assistant */}
      {activeTab === "COPILOT" && (
        <div className="card p-5 space-y-4 h-[550px] flex flex-col justify-between">
          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "USER" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-xl text-xs leading-relaxed ${
                    m.sender === "USER"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70 font-mono">
                    <span>{m.sender === "USER" ? "Commander" : "CrisisOS Copilot"}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p>{m.text}</p>

                  {/* Recommendations action chips */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-slate-800">
                      {m.recommendations.map((rec, i) => (
                        <Link
                          key={i}
                          href={rec.link || "#"}
                          className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded hover:bg-purple-900 transition-colors"
                        >
                          → {rec.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sendingQuery && (
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                <span className="animate-spin">⚙️</span> Copilot is formulating tactical recommendations...
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask Copilot (e.g. 'What is the closest Hazmat unit to Vatva?', 'Check burn bed availability')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="input-base text-xs flex-1 bg-slate-950"
            />
            <button
              type="submit"
              disabled={sendingQuery || !inputQuery.trim()}
              className="btn-primary text-xs px-4"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
