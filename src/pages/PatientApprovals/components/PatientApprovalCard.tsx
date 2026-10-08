import React, { useState } from "react";
import { type HiuConsent } from "@/types/hiu";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { format } from "date-fns";
import {
  FileKey,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Loader2,
  Copy,
  Check,
  User,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientApprovalCardProps {
  consent: HiuConsent;
  onApprove?: (consent: HiuConsent) => void;
  isApproving?: boolean;
  className?: string;
}

export const PatientApprovalCard: React.FC<PatientApprovalCardProps> = ({
  consent,
  onApprove,
  isApproving = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const formatDateSafe = (dateStr?: string, fmt = "dd MMM yyyy") => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return format(d, fmt);
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  const handleCopyId = () => {
    if (consent.consent_id) {
      navigator.clipboard.writeText(consent.consent_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPending = (consent.status || "").toUpperCase() === "REQUESTED";
  const isGranted = (consent.status || "").toUpperCase() === "GRANTED";
  const isError = (consent.status || "").toUpperCase() === "INIT_ERROR";

  return (
    <div
      data-consent-id={consent.consent_id}
      className={cn(
        "bg-white border border-[#dbe3e9] rounded-xl p-5 mb-3 transition-all duration-150 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800",
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FileKey className="h-4 w-4 text-[#0b6b6f] shrink-0" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Consent ID:
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded border border-slate-200 select-all">
              {consent.consent_id}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy Consent ID"
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Consent Init ID sub-line */}
          {consent.consent_init_id && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-slate-600">Consent Init ID:</span>
              <span className="font-mono text-slate-700 dark:text-slate-400">
                {consent.consent_init_id}
              </span>
            </div>
          )}

          {/* Patient Details & Dates */}
          <div className="flex items-center gap-3 pt-1 text-xs text-[#5b6b78] dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <User className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
              <span>Patient:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {consent.patient_name || consent.abha_address || "Registered Patient"}
              </span>
              {consent.abha_address && (
                <span className="text-slate-500 font-mono">({consent.abha_address})</span>
              )}
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Created:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDateSafe(consent.c_at, "dd MMM yyyy, HH:mm")}
              </span>
            </div>
            {consent.eka_oid && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">OID:</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] select-all font-bold text-slate-900 dark:text-slate-200">
                    {consent.eka_oid}
                  </span>
                </div>
              </>
            )}
            {consent.u_at && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Updated:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatDateSafe(consent.u_at, "dd MMM yyyy, HH:mm")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 self-start">
          <ApprovalStatusBadge status={consent.status} />
        </div>
      </div>

      {/* Health Information Types Chips */}
      {consent.hi_types && consent.hi_types.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 my-3 pt-1">
          <span className="text-xs font-medium text-[#5b6b78] dark:text-slate-400 mr-1 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Health Info Types:
          </span>
          {consent.hi_types.map((type, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-md bg-[#f2f5f7] border border-[#dbe3e9] text-slate-700 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {/* Date Range & Expiry Banner */}
      <div className="text-xs text-[#5b6b78] dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          Period: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatDateSafe(consent.period?.from)}</strong> -{" "}
          <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatDateSafe(consent.period?.to)}</strong>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Expiry:</span>
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
            {formatDateSafe(consent.period?.expiry)}
          </strong>
        </div>
      </div>

      {/* Granted Specific Notification */}
      {isGranted && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-[#dcf2e4]/40 border border-[#7fd6a1]/40 text-xs text-[#17603a] dark:bg-[#12301f]/40 dark:text-[#7fd6a1] flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#17603a] dark:text-[#7fd6a1]" />
          <span>
            Consent Granted by Patient. Records are accessible until{" "}
            <strong>{formatDateSafe(consent.period?.expiry)}</strong>.
          </span>
        </div>
      )}

      {/* Error Specific Notification */}
      {isError && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-[#fee2e2]/40 border border-[#fca5a5] text-xs text-[#ef4444] flex flex-wrap items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#ef4444]" />
          <span>Initialization error occurred with this consent request.</span>
        </div>
      )}

      {/* Action Buttons Row */}
      {isPending && (
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isApproving}
            onClick={() => onApprove?.(consent)}
            className="blue-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
