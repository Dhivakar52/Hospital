import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { CalendarX, Plus, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { Badge } from "@/components/ui/badge";
import { ActionMenu } from "@/common/ActionMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CancelledVisitRow {
  uhidNo: string;
  opNo: string;
  patientName: string;
  revisitNo: string;
  cancelledDate: string;
  reason: string;
  status: string;
  createdBy: string;
}

const MOCK_CANCELLED: CancelledVisitRow[] = [
  {
    uhidNo: "3995988",
    opNo: "26602286",
    patientName: "NITESH KUMAR",
    revisitNo: "RV-1092",
    cancelledDate: "03 Aug 2026 17:30",
    reason: "Patient unavailable for consultation",
    status: "Cancelled",
    createdBy: "OP Receptionist",
  },
  {
    uhidNo: "3489205",
    opNo: "26602285",
    patientName: "SUVETHA",
    revisitNo: "RV-1088",
    cancelledDate: "02 Aug 2026 14:15",
    reason: "Duplicate registration entry",
    status: "Cancelled",
    createdBy: "Sister Mary",
  },
  {
    uhidNo: "4137281",
    opNo: "26602284",
    patientName: "ERGAMREDDY SHARMILA",
    revisitNo: "RV-1076",
    cancelledDate: "01 Aug 2026 11:20",
    reason: "Doctor emergency surgery delay",
    status: "Cancelled",
    createdBy: "Dr. Kavitha R",
  },
  {
    uhidNo: "3709448",
    opNo: "26602281",
    patientName: "PRIYANSHU PANDA",
    revisitNo: "RV-1065",
    cancelledDate: "31 Jul 2026 09:45",
    reason: "Transferred to Casualty Emergency",
    status: "Cancelled",
    createdBy: "Staff Nurse",
  },
];

export default function RevisitCancelModule() {
  const navigate = useNavigate();
  const [data] = useState<CancelledVisitRow[]>(MOCK_CANCELLED);
  const [viewingRecord, setViewingRecord] = useState<CancelledVisitRow | null>(null);

  const columns: ColumnDef<CancelledVisitRow>[] = [
    { accessorKey: "uhidNo", header: "UHID No" },
    { accessorKey: "opNo", header: "OP No" },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "revisitNo", header: "Revisit Number" },
    { accessorKey: "cancelledDate", header: "Cancellation Date" },
    { accessorKey: "reason", header: "Cancellation Reason" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="destructive" className="font-semibold text-[11px] px-2 py-0.5">
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "createdBy", header: "Created By" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setViewingRecord(item)}
          onEdit={() => navigate("/op/revisit-cancellation/new")}
          onPrint={() => window.print()}
          onBarcode={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header matching Registered Patients module */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <CalendarX className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Revisit Cancellation</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage Revisit Cancellation records.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/op/revisit-cancellation/new")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Plus className="h-4 w-4" />
          New Revisit Cancellation
        </Button>
      </div>

      {/* Standalone Revisit Cancellation List Screen (Table Only, No Form) */}
      <StandardModuleTable
        title="Revisit Cancellation Records"
        searchPlaceholder="Search Patient Name / UHID / OP Number"
        columns={columns}
        data={data}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.opNo} ${r.reason}`}
      />

      {/* View Record Details Dialog */}
      <Dialog open={Boolean(viewingRecord)} onOpenChange={() => setViewingRecord(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-slate-200 shadow-xl">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-bold text-slate-900">
                Revisit Cancellation Details
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Detailed view of selected cancellation record
            </DialogDescription>
          </DialogHeader>

          {viewingRecord && (
            <div className="p-6 space-y-4 text-xs text-slate-700 bg-white">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">UHID Number</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{viewingRecord.uhidNo}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">OP Number</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{viewingRecord.opNo}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block">Patient Name</span>
                  <span className="font-bold text-slate-900 text-base">{viewingRecord.patientName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Revisit Number</span>
                  <span className="font-semibold text-slate-800">{viewingRecord.revisitNo}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Status</span>
                  <Badge variant="destructive" className="mt-0.5 text-[10.5px]">
                    {viewingRecord.status}
                  </Badge>
                </div>
                <div className="col-span-2 border-t border-slate-200/80 pt-2">
                  <span className="text-[11px] text-slate-500 block">Cancellation Reason</span>
                  <span className="font-medium text-slate-800 text-[13px]">{viewingRecord.reason}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Cancelled Date</span>
                  <span className="font-medium text-slate-700">{viewingRecord.cancelledDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Created By</span>
                  <span className="font-medium text-slate-700">{viewingRecord.createdBy}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setViewingRecord(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setViewingRecord(null);
                    navigate("/op/revisit-cancellation/new");
                  }}
                  className="text-white text-xs gap-1.5"
                  style={{ background: "var(--blue-btn)" }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}