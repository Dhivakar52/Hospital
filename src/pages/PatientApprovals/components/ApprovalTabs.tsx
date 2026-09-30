import React from "react";
import { type ApprovalStatus } from "@/types/patientApproval";
import { cn } from "@/lib/utils";

export interface TabConfig {
  key: ApprovalStatus;
  label: string;
}

interface ApprovalTabsProps {
  activeTab: ApprovalStatus;
  onTabChange: (tab: ApprovalStatus) => void;
  counts: Record<ApprovalStatus, number>;
  className?: string;
}

const TABS: TabConfig[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "denied", label: "Denied" },
];

export const ApprovalTabs: React.FC<ApprovalTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  className,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Filter patient approvals by status"
      className={cn("flex flex-wrap items-center gap-2 mb-4", className)}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[13.5px] font-medium transition-all duration-150 cursor-pointer shadow-2xs select-none",
              isActive
                ? "blue-btn text-white font-semibold shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "ml-1.5 font-semibold text-xs",
                isActive ? "text-teal-100" : "text-slate-500 dark:text-slate-400"
              )}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
};
