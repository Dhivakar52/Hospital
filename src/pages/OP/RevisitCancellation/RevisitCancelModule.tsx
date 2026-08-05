import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import Status from "@/common/Status";
import type { CancelledVisitRow } from "@/types/revisitCancellation";
import { mockRevisitCancellations } from "@/data/mockRevisitCancellations";
import CustomPanel from "@/common/CustomPanel";

export default function RevisitCancelModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<CancelledVisitRow[]>(mockRevisitCancellations);
  const [viewingRecord, setViewingRecord] = useState<CancelledVisitRow | null>(null);

  useEffect(() => {
    const newRecord = (location.state as { newRecord?: CancelledVisitRow } | null)?.newRecord;
    const editedRecord = (location.state as { editedRecord?: CancelledVisitRow; originalRevisitNo?: string } | null)?.editedRecord;
    const originalRevisitNo = (location.state as { originalRevisitNo?: string } | null)?.originalRevisitNo;

    if (newRecord) {
      setData((current) => {
        const exists = current.some((item) => item.revisitNo === newRecord.revisitNo);
        return exists ? current : [newRecord, ...current];
      });
    }

    if (editedRecord && originalRevisitNo) {
      setData((current) =>
        current.map((item) =>
          item.revisitNo === originalRevisitNo ? { ...item, ...editedRecord } : item,
        ),
      );
    }

    if (newRecord || editedRecord) {
      navigate("/op/revisit-cancellation", { replace: true, state: undefined });
    }
  }, [location.state, navigate]);

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
      cell: ({ row }) => {
        const status = row.original.status || 'cancelled';
        return <Status status={status} size="sm" />;
      },
    },
    { accessorKey: "createdBy", header: "Created By" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setViewingRecord(item)}
          onEdit={(item) => navigate("/op/revisit-cancellation/new", { state: { record: item } })}
          onPrint={() => window.print()}
          onBarcode={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Standalone Revisit Cancellation List Screen */}
      <StandardModuleTable
        title="Revisit Cancellation"
        countUnit="Records"
        searchPlaceholder="Search Patient Name / UHID / OP Number / Reason"
        columns={columns}
        data={data}
        onAdd={() => navigate("/op/revisit-cancellation/new")}
        filterFields={[
          { label: "Cancellation Reason", key: "reason", type: "text" },
          { label: "Created By", key: "createdBy", type: "text" },
          { label: "Status", key: "status", type: "select", options: ["Cancelled"] }
        ]}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.opNo} ${r.reason} ${r.createdBy}`}
      />

      <CustomPanel
        isOpen={Boolean(viewingRecord)}
        title="Revisit Cancellation Details"
        onClose={() => setViewingRecord(null)}
        onSave={() => setViewingRecord(null)}
        saveLabel="Close"
        width="620px"
      >
        {viewingRecord && (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
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
                <Status status={viewingRecord.status || "cancelled"} size="sm" />
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

           
          </div>
        )}
      </CustomPanel>
    </div>
  );
}