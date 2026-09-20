"use client";

import React from "react";
import { Activity, Zap, AlertTriangle, Building2, Search, Bot } from "lucide-react";

export type CommanderTab =
  | "SITREP"
  | "RECOMMENDATIONS"
  | "RISKS"
  | "BOTTLENECKS"
  | "DUPLICATES"
  | "COPILOT";

interface CommanderNavTabsProps {
  activeTab: CommanderTab;
  onSelectTab: (tab: CommanderTab) => void;
  recommendationsCount: number;
  duplicatesCount: number;
}

export function CommanderNavTabs({
  activeTab,
  onSelectTab,
  recommendationsCount,
  duplicatesCount,
}: CommanderNavTabsProps) {
  const tabs = [
    {
      id: "SITREP" as CommanderTab,
      label: "Executive SITREP",
      icon: <Activity size={18} />,
    },
    {
      id: "RECOMMENDATIONS" as CommanderTab,
      label: "Recommended Actions",
      icon: <Zap size={18} />,
      badge: recommendationsCount > 0 ? recommendationsCount : undefined,
      badgeColor: "bg-purple-950 text-purple-300 border-purple-700",
    },
    {
      id: "RISKS" as CommanderTab,
      label: "Priority Risks & Cascades",
      icon: <AlertTriangle size={18} />,
    },
    {
      id: "BOTTLENECKS" as CommanderTab,
      label: "Resource Bottlenecks",
      icon: <Building2 size={18} />,
    },
    {
      id: "DUPLICATES" as CommanderTab,
      label: "Deduplication",
      icon: <Search size={18} />,
      badge: duplicatesCount > 0 ? duplicatesCount : undefined,
      badgeColor: "bg-blue-950 text-blue-300 border-blue-700",
    },
    {
      id: "COPILOT" as CommanderTab,
      label: "Tactical Chat Copilot",
      icon: <Bot size={18} />,
    },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-5 py-3 rounded-xl transition-all font-semibold flex items-center gap-2.5 whitespace-nowrap text-sm ${
              isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isActive ? "bg-white/20 text-white border-white/30" : tab.badgeColor
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CommanderNavTabs;
