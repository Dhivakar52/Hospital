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
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface ApproveConfirmationModalProps {
  isOpen: boolean;
  approval: PatientApproval | null;
  onClose: () => void;
  onConfirm: (approval: PatientApproval) => void;
}

export const ApproveConfirmationModal: React.FC<ApproveConfirmationModalProps> = ({
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
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 px-6 py-5 border-b border-teal-100 dark:border-teal-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Approve Record Access
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Confirm granting medical records access to the requesting doctor.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Request ID:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{approval.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {approval.patientName} ({approval.patientId})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Doctor & Clinic:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                {approval.doctorName} • {approval.hospitalName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Purpose:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{approval.reason}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Access Expiry:</span>
              <span className="font-semibold text-teal-700 dark:text-teal-400">{approval.accessEnds}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            By approving, the patient authorizes <strong>{approval.doctorName}</strong> ({approval.hospitalName})
            to decrypt and review requested records until <strong>{approval.accessEnds}</strong>. Access can be revoked at any time.
          </p>
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
            className="blue-btn text-white text-xs gap-1.5 font-semibold cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirm Approval</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
