import React from "react";
import { type PatientApproval } from "@/types/patientApproval";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { 
  Building2, 
  Stethoscope, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientApprovalCardProps {
  approval: PatientApproval;
  onApprove?: (approval: PatientApproval) => void;
  onDeny?: (approval: PatientApproval) => void;
  onRevoke?: (approval: PatientApproval) => void;
  className?: string;
}

export const PatientApprovalCard: React.FC<PatientApprovalCardProps> = ({
  approval,
  onApprove,
  onDeny,
  onRevoke,
  className,
}) => {
  const {
    id,
    patientName,
    patientId,
    hospitalName,
    doctorName,
    reason,
    requestedRecords,
    recordFrom,
    recordTo,
    accessEnds,
    requestedDate,
    status,
    denialReason,
    approvedDate,
    deniedDate,
  } = approval;

  return (
    <div
      data-approval-id={id}
      className={cn(
        "bg-white border border-[#dbe3e9] rounded-xl p-5 mb-3 transition-all duration-150 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800",
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[17px] font-bold text-[#14212b] dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-[#0b6b6f] shrink-0" />
              <span>{doctorName}</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              {id}
            </span>
          </div>

          <div className="text-sm text-[#5b6b78] dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {hospitalName}
            </span>
            <span>wants to view records for:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
              {reason}
            </span>
          </div>

          {/* Patient Details Sub-line */}
          <div className="flex items-center gap-3 pt-1 text-xs text-[#5b6b78] dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <User className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
              <span>Patient:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{patientName}</span>
              <span className="text-slate-500 font-mono">({patientId})</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Requested date:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{requestedDate}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 self-start">
          <ApprovalStatusBadge status={status} />
        </div>
      </div>

      {/* Requested Records Chips */}
      {requestedRecords && requestedRecords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 my-3 pt-1">
          <span className="text-xs font-medium text-[#5b6b78] dark:text-slate-400 mr-1 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Records:
          </span>
          {requestedRecords.map((recordType, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-md bg-[#f2f5f7] border border-[#dbe3e9] text-slate-700 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              {recordType}
            </span>
          ))}
        </div>
      )}

      {/* Date Range & Metadata Banner */}
      <div className="text-xs text-[#5b6b78] dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          Records from <strong className="text-slate-700 dark:text-slate-300 font-semibold">{recordFrom}</strong> to{" "}
          <strong className="text-slate-700 dark:text-slate-300 font-semibold">{recordTo}</strong>.
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Access ends</span>
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">{accessEnds}</strong>.
        </div>
      </div>

      {/* Approved / Denied Specific Information */}
      {status === "approved" && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-[#dcf2e4]/40 border border-[#7fd6a1]/40 text-xs text-[#17603a] dark:bg-[#12301f]/40 dark:text-[#7fd6a1] flex flex-wrap items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-[#17603a] dark:text-[#7fd6a1]" />
          <span>
            Access approved on{" "}
            <strong>{approvedDate || requestedDate}</strong>. Active until{" "}
            <strong>{accessEnds}</strong>.
          </span>
        </div>
      )}

      {status === "denied" && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-[#fbe3e0]/40 border border-[#f19a92]/40 text-xs text-[#a3271f] dark:bg-[#3b1a17]/40 dark:text-[#f19a92] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>Denied on {deniedDate || requestedDate}</span>
          </div>
          {denialReason ? (
            <div className="text-xs pl-5.5 text-slate-700 dark:text-slate-300">
              <span className="font-medium text-[#a3271f] dark:text-[#f19a92]">Reason:</span> {denialReason}
            </div>
          ) : (
            <div className="text-xs pl-5.5 text-slate-500 italic">No specific denial reason provided.</div>
          )}
        </div>
      )}

      {/* Action Buttons Row */}
      {status === "pending" && (
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onApprove?.(approval)}
            className="blue-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer shadow-2xs"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Approve</span>
          </button>
          <button
            type="button"
            onClick={() => onDeny?.(approval)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#a3271f] border border-[#dbe3e9] hover:bg-[#fbe3e0]/30 hover:border-[#f19a92] cursor-pointer transition-colors dark:bg-slate-900 dark:border-slate-800"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Deny</span>
          </button>
        </div>
      )}

      {status === "approved" && (
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onRevoke?.(approval)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#a3271f] border border-[#dbe3e9] hover:bg-[#fbe3e0]/30 hover:border-[#f19a92] cursor-pointer transition-colors dark:bg-slate-900 dark:border-slate-800"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Revoke Access</span>
          </button>
        </div>
      )}
    </div>
  );
};
