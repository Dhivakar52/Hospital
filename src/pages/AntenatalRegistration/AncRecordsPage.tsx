import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import Status from "@/common/Status";
import CustomPanel from "@/common/CustomPanel";
import type { AncRecord } from "@/types/anc";
import { mockAncRecords } from "@/data/mockAncRecords";
import { notify } from "@/lib/notify";

export default function AncRecordsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<AncRecord[]>(mockAncRecords);
  const [selectedRecord, setSelectedRecord] = useState<AncRecord | null>(null);

  // Deactivation Modal State
  const [deactivateRecord, setDeactivateRecord] = useState<AncRecord | null>(null);

  useEffect(() => {
    const newRecord = (location.state as { newRecord?: AncRecord } | null)?.newRecord;

    if (!newRecord) return;

    setRecords((current) => {
      const exists = current.some(
        (item) => item.ancNo === newRecord.ancNo || item.uhidNo === newRecord.uhidNo,
      );

      return exists ? current : [newRecord, ...current];
    });

    navigate("/registered-anc-records", { replace: true, state: undefined });
  }, [location.state, navigate]);

  const handleConfirmDeactivate = () => {
    if (!deactivateRecord) return;

    setRecords((current) =>
      current.map((item) =>
        item.ancNo === deactivateRecord.ancNo ? { ...item, status: "inactive" } : item
      )
    );

    notify.saveSuccess("ANC Registration deactivated successfully.");
    setDeactivateRecord(null);
  };

  const columns: ColumnDef<AncRecord>[] = [
    {
      accessorKey: "ancNo",
      header: "ANC No",
      cell: ({ row }) => (
        <span
          className="cursor-pointer font-medium hover:underline"
          style={{ color: "var(--blue-text-color)" }}
          onClick={() => setSelectedRecord(row.original)}
        >
          {row.original.ancNo}
        </span>
      ),
    },
    { accessorKey: "ancDate", header: "ANC Date" },
    { accessorKey: "uhidNo", header: "UHID No" },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "department", header: "Department" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "active";
        return <Status status={status} size="sm" />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isInactive = row.original.status === "inactive" || row.original.status === "Inactive";
        return (
          <ActionMenu
            item={row.original}
            onView={(item) => setSelectedRecord(item)}
            onEdit={(item) => navigate("/antenatal-registration", { state: { record: item } })}
            onPrint={() => window.print()}
            onBarcode={() => {}}
            onDeactivate={
              isInactive
                ? undefined
                : (item) => setDeactivateRecord(item)
            }
          />
        );
      },
    },
  ];

  return (
    <div>
      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="Registered ANC Records"
        countUnit="ANC Records"
        searchPlaceholder="Search Patient Name / ANC Number / UHID"
        columns={columns}
        data={records}
        onAdd={() => navigate("/antenatal-registration")}
        filterFields={[
          { label: "Department", key: "department", type: "select", options: ["Obstetrics", "General Surgery", "General Medicine"] },
          { label: "Gender", key: "gender", type: "select", options: ["Female"] },
          { label: "Patient Name", key: "patientName", type: "text" }
        ]}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.ancNo} ${r.department}`}
      />

      {/* View Panel */}
      <CustomPanel
        isOpen={Boolean(selectedRecord)}
        title="ANC Registration Details"
        onClose={() => setSelectedRecord(null)}
        onSave={() => setSelectedRecord(null)}
        saveLabel="Close"
        width="620px"
      >
        {selectedRecord && (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div>
                <span className="text-[11px] text-slate-500 block">ANC Number</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{selectedRecord.ancNo}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">UHID Number</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{selectedRecord.uhidNo}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[11px] text-slate-500 block">Patient Name</span>
                <span className="font-bold text-slate-900 text-base">{selectedRecord.patientName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Gender / Age</span>
                <span className="font-medium text-slate-800">{selectedRecord.gender} / {selectedRecord.age} Yrs</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Department</span>
                <span className="font-semibold text-blue-900">{selectedRecord.department}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Status</span>
                <Status status={selectedRecord.status || "active"} size="sm" />
              </div>
              <div className="col-span-2 border-t border-slate-200/80 pt-2">
                <span className="text-[11px] text-slate-500 block">Registration Date & Time</span>
                <span className="font-medium text-slate-700">{selectedRecord.ancDate}</span>
              </div>
            </div>
          </div>
        )}
      </CustomPanel>

      {/* Requirement 4: Confirmation Dialog for Deactivation */}
      {deactivateRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <PowerOff className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Deactivate ANC Registration</h2>
                <p className="text-xs text-slate-500">Confirm record deactivation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Are you sure you want to deactivate ANC record <strong className="text-slate-900 font-semibold">{deactivateRecord.ancNo}</strong> ({deactivateRecord.patientName})? The status will be set to Inactive.
            </p>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeactivateRecord(null)}
                className="h-9 px-4 text-xs font-medium text-slate-600 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDeactivate}
                className="h-9 px-4 text-xs text-white bg-amber-600 hover:bg-amber-700 cursor-pointer"
              >
                Confirm Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}