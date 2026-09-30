import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type PatientApproval } from "@/types/patientApproval";
import { XCircle } from "lucide-react";

interface DenyConfirmationModalProps {
  isOpen: boolean;
  approval: PatientApproval | null;
  onClose: () => void;
  onConfirm: (approval: PatientApproval, denialReason: string) => void;
}

const COMMON_REASONS = [
  "Patient declined data sharing",
  "Privacy preference",
  "Incorrect doctor or clinic request",
  "Requested records window exceeds requirement",
];

export const DenyConfirmationModal: React.FC<DenyConfirmationModalProps> = ({
  isOpen,
  approval,
  onClose,
  onConfirm,
}) => {
  const [denialReason, setDenialReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDenialReason("");
    }
  }, [isOpen]);

  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md px-[10px] py-[20px] overflow-hidden border border-slate-200 rounded-xl shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 px-6 py-5 border-b border-rose-100 dark:border-rose-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Deny Record Access
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Decline permission for this medical record request.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Request:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{approval.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {approval.patientName} ({approval.patientId})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {approval.doctorName} ({approval.hospitalName})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="denial-reason"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Reason for denial <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="denial-reason"
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              placeholder="e.g. Patient does not wish to share diagnostic reports with third party."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 dark:text-slate-200 resize-none"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_REASONS.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDenialReason(reason)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  + {reason}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-slate-50 dark:bg-slate-900 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirm(approval, denialReason.trim());
              onClose();
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5 font-semibold cursor-pointer shadow-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Confirm Denial</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
