import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SquareChartGantt, Pencil, Trash2, Menu, Printer, Barcode, XCircle, PowerOff, FileKey, FileCode2, Link2, Loader2 } from "lucide-react"
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"
import { notify } from "@/lib/notify"

type ActionMenuProps<T> = {
  item: T;
  onView?: (item: T) => void;
  isViewLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPrint?: (item: T) => void;
  onBarcode?: (item: T) => void;
  onRequestConsent?: (item: T) => void;
  requestConsentLabel?: string;
  onFhirViewer?: (item: T) => void;
  onCareContext?: (item: T) => void;
  onAuditLog?: (item: T) => void;
  onCollect?: (item: T) => void;
  onAck?: (item: T) => void;
  onValidate?: (item: T) => void;
  onReject?: (item: T) => void;
  onRevisitCancellation?: (item: T) => void;
  onDeactivate?: (item: T) => void;
};

export function ActionMenu<T>({
  item,
  onView,
  isViewLoading = false,
  onEdit,
  onPrint,
  onBarcode,
  onRequestConsent,
  requestConsentLabel,
  onFhirViewer,
  onCareContext,
  onDelete,
  onAuditLog,
  onCollect,
  onAck,
  onValidate,
  onReject,
  onRevisitCancellation,
  onDeactivate,
}: ActionMenuProps<T>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    if (onDelete) {
      onDelete(item);
      notify.deleteSuccess("Record deleted successfully.");
    }
  };

  const hasAnyAction = Boolean(
    onEdit ||
    onView ||
    onPrint ||
    onBarcode ||
    onRevisitCancellation ||
    onDeactivate ||
    onAuditLog ||
    onCollect ||
    onAck ||
    onValidate ||
    onReject ||
    onRequestConsent ||
    onFhirViewer ||
    onCareContext ||
    onDelete
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger >
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!hasAnyAction && (
            <div className="px-3 py-2 text-xs text-slate-400 select-none">No actions available</div>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4 text-slate-600" />
              Edit
            </DropdownMenuItem>
          )}
          {onView && (
            <DropdownMenuItem
              onClick={() => {
                if (!isViewLoading) onView(item);
              }}
              disabled={isViewLoading}
              className="cursor-pointer"
            >
              {isViewLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <SquareChartGantt className="mr-2 h-4 w-4 text-blue-600" />
              )}
              {isViewLoading ? "Loading..." : "View"}
            </DropdownMenuItem>
          )}

          {onPrint && (
            <DropdownMenuItem onClick={() => onPrint(item)} className="cursor-pointer">
              <Printer className="mr-2 h-4 w-4 text-blue-600" />
              Print
            </DropdownMenuItem>
          )}
          {onBarcode && (
            <DropdownMenuItem onClick={() => onBarcode(item)} className="cursor-pointer">
              <Barcode className="mr-2 h-4 w-4 text-purple-600" />
              Generate Barcode
            </DropdownMenuItem>
          )}
          {onRevisitCancellation && (
            <DropdownMenuItem onClick={() => onRevisitCancellation(item)} className="text-amber-700 focus:text-amber-800 cursor-pointer">
              <XCircle className="mr-2 h-4 w-4 text-amber-600" />
              Cancellation
            </DropdownMenuItem>
          )}
          {onDeactivate && (
            <DropdownMenuItem onClick={() => onDeactivate(item)} className="text-amber-700 focus:text-amber-800 cursor-pointer">
              <PowerOff className="mr-2 h-4 w-4 text-amber-600" />
              Deactivate
            </DropdownMenuItem>
          )}
          {onAuditLog && (
            <DropdownMenuItem onClick={() => onAuditLog(item)} className="cursor-pointer">
              <span className="mr-2">📋</span>
              Audit Log
            </DropdownMenuItem>
          )}
          {onCollect && (
            <DropdownMenuItem onClick={() => onCollect(item)} className="cursor-pointer">
              <span className="mr-2">📥</span>
              Collect
            </DropdownMenuItem>
          )}
          {onAck && (
            <DropdownMenuItem onClick={() => onAck(item)} className="cursor-pointer">
              <span className="mr-2">✅</span>
              Acknowledge
            </DropdownMenuItem>
          )}
          {onValidate && (
            <DropdownMenuItem onClick={() => onValidate(item)} className="cursor-pointer">
              <span className="mr-2">✓</span>
              Validate
            </DropdownMenuItem>
          )}
          {onReject && (
            <DropdownMenuItem onClick={() => onReject(item)} className="cursor-pointer">
              <span className="mr-2">✕</span>
              Reject
            </DropdownMenuItem>
          )}
          {onRequestConsent && (
            <DropdownMenuItem onClick={() => onRequestConsent(item)} className="cursor-pointer">
              <FileKey className="mr-2 h-4 w-4 text-blue-600" />
              {requestConsentLabel || "Request Consent"}
            </DropdownMenuItem>
          )}
          {onFhirViewer && (
            <DropdownMenuItem onClick={() => onFhirViewer(item)} className="cursor-pointer">
              <FileCode2 className="mr-2 h-4 w-4 text-blue-600" />
              FHIR Viewer
            </DropdownMenuItem>
          )}
          {onCareContext && (
            <DropdownMenuItem onClick={() => onCareContext(item)} className="cursor-pointer">
              <Link2 className="mr-2 h-4 w-4 text-emerald-600" />
              Care Context
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Delete Confirmation"
          description="Are you sure you want to delete this record?"
        />
      )}
    </>
  );
}