import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type PatientApproval } from "@/types/patientApproval";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface RevokeAccessModalProps {
  isOpen: boolean;
  approval: PatientApproval | null;
  onClose: () => void;
  onConfirm: (approval: PatientApproval) => void;
}

export const RevokeAccessModal: React.FC<RevokeAccessModalProps> = ({
  isOpen,
  approval,
  onClose,
  onConfirm,
}) => {
  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md px-[10px] py-[20px] overflow-hidden border border-slate-200 rounded-xl shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 px-6 py-5 border-b border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Revoke Record Access
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immediately terminate health record access for this provider.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {approval.patientName} ({approval.patientId})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Doctor / Hospital:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {approval.doctorName} • {approval.hospitalName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Scheduled Expiry:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{approval.accessEnds}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              Are you sure you want to revoke access? <strong>{approval.doctorName}</strong> will immediately lose
              permission to view the patient&apos;s medical records, and the consent artifact will be moved to denied/revoked.
            </p>
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
              onConfirm(approval);
              onClose();
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 font-semibold cursor-pointer shadow-xs"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Revoke Access</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
