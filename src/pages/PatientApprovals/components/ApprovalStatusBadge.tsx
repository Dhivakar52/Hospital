import React from "react";
import { type ApprovalStatus } from "@/types/patientApproval";
import { cn } from "@/lib/utils";

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ status, className }) => {
  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight transition-colors shadow-2xs",
          "bg-[#fdf0d2] text-[#7a4f00] border border-[#f0c46a]/60 dark:bg-[#3a2c0d] dark:text-[#f0c46a] dark:border-[#7a4f00]/60",
          className
        )}
      >
        Needs your decision
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight transition-colors shadow-2xs",
          "bg-[#dcf2e4] text-[#17603a] border border-[#7fd6a1]/60 dark:bg-[#12301f] dark:text-[#7fd6a1] dark:border-[#17603a]/60",
          className
        )}
      >
        Approved
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight transition-colors shadow-2xs",
        "bg-[#fbe3e0] text-[#a3271f] border border-[#f19a92]/60 dark:bg-[#3b1a17] dark:text-[#f19a92] dark:border-[#a3271f]/60",
        className
      )}
    >
      Denied
    </span>
  );
};
