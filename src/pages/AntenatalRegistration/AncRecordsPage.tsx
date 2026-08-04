import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Baby, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import Status from "@/common/Status";
import CustomPanel from "@/common/CustomPanel";
import type { AncRecord } from "@/types/anc";
import { mockAncRecords } from "@/data/mockAncRecords";

export default function AncRecordsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<AncRecord[]>(mockAncRecords);
  const [selectedRecord, setSelectedRecord] = useState<AncRecord | null>(null);

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
        const status = row.original.status || 'active';
        return <Status status={status} size="sm" />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setSelectedRecord(item)}
          onEdit={(item) => navigate("/antenatal-registration", { state: { record: item } })}
          onPrint={() => window.print()}
          onBarcode={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{
              background: "var(--side-menu)",
              color: "var(--blue-text-color)",
            }}
          >
            <Baby className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Registered ANC Records</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage registered antenatal care records
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/antenatal-registration")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Plus className="h-4 w-4" />
          New ANC Registration
        </Button>
      </div>

      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="Registered ANC Records"
        searchPlaceholder="Search Patient / UHID / ANC No / Mobile"
        columns={columns}
        data={records}
        filterFields={[
          { label: "Department", key: "department", type: "select", options: ["Obstetrics", "General Surgery", "General Medicine"] },
          { label: "Gender", key: "gender", type: "select", options: ["Female"] },
          { label: "Patient Name", key: "patientName", type: "text" }
        ]}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.ancNo} ${r.department}`}
      />

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
                <Status status={selectedRecord.status || 'active'} size="sm" />
              </div>
              <div className="col-span-2 border-t border-slate-200/80 pt-2">
                <span className="text-[11px] text-slate-500 block">Registration Date & Time</span>
                <span className="font-medium text-slate-700">{selectedRecord.ancDate}</span>
              </div>
            </div>

          
          </div>
        )}
      </CustomPanel>
    </div>
  );
}