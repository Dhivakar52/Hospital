import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { HipPatient } from "@/types/hip";
import type { CareContextVisitItem } from "@/services/hipService";
import { API_ENDPOINTS } from "@/api/endpoints";
import {
  Copy,
  Check,
  Code2,
  FileText,
  Send,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export interface CareContextPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  visits: CareContextVisitItem[];
  selectedPatients: HipPatient[];
  onConfirm: (dryRun: boolean) => Promise<void>;
  isSubmitting: boolean;
}

export function CareContextPayloadModal({
  isOpen,
  onClose,
  visits,
  selectedPatients,
  onConfirm,
  isSubmitting,
}: CareContextPayloadModalProps) {
  const [dryRun, setDryRun] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"json" | "table">("json");

  // Construct the exact request payload matching POST /api/care-context/link-selected
  const payload = useMemo(() => {
    return {
      dry_run: dryRun,
      visits: visits.map((v) => ({
        care_context_id: v.care_context_id,
        uhid: v.uhid,
      })),
    };
  }, [dryRun, visits]);

  const jsonString = useMemo(() => {
    return JSON.stringify(payload, null, 2);
  }, [payload]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("Payload JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy payload to clipboard");
    }
  };

  const handleConfirm = async () => {
    await onConfirm(dryRun);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <DialogHeader className="bg-slate-50 dark:bg-slate-900/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Care Context Linking Payload Preview
                  </DialogTitle>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Testing Mode
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inspect the payload that will be submitted to the Eka Care linking API
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Endpoint URL Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 font-mono font-bold text-[11px] rounded bg-emerald-600 text-white">
                POST
              </span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {API_ENDPOINTS.CARE_CONTEXT.LINK_SELECTED}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Total Visits: <strong className="text-slate-700 dark:text-slate-200">{visits.length}</strong>
            </div>
          </div>

          {/* Dry Run Toggle Options */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-lg border border-blue-200/60 dark:border-blue-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Execution Mode (dry_run)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {dryRun
                      ? "dry_run: true — Validates & previews without sending request to Eka Care"
                      : "dry_run: false — Submits linking requests directly to Eka Care"}
                  </div>
                </div>
              </div>
              <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDryRun(false)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    !dryRun
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Live (false)
                </button>
                <button
                  type="button"
                  onClick={() => setDryRun(true)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    dryRun
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Dry Run (true)
                </button>
              </div>
            </div>
          </div>

          {/* View Mode Tabs & Copy Button */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "json"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Raw JSON
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "table"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Visits Table ({visits.length})
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </Button>
          </div>

          {/* Tab 1: Formatted JSON Block */}
          {activeTab === "json" && (
            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-[300px] border border-slate-800 leading-relaxed">
                <code>{jsonString}</code>
              </pre>
            </div>
          )}

          {/* Tab 2: Selected Visits Table */}
          {activeTab === "table" && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">UHID</th>
                    <th className="px-3 py-2 font-semibold">Care Context ID</th>
                    <th className="px-3 py-2 font-semibold">Patient Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visits.map((v, idx) => {
                    const matched = selectedPatients.find(
                      (p) => String(p.uhid).trim() === String(v.uhid).trim()
                    );
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {v.uhid}
                        </td>
                        <td className="px-3 py-2 font-mono text-blue-600 dark:text-blue-400 font-medium">
                          {v.care_context_id}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {matched?.patientname || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="bg-slate-50 dark:bg-slate-900/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isSubmitting || visits.length === 0}
            className="blue-btn text-white text-xs font-medium cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {dryRun ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Test Dry Run
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Confirm & Submit ({visits.length})
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
