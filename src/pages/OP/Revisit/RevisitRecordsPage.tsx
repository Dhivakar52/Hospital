import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import Status from "@/common/Status";
import { OpStatisticsModal } from "@/components/OpStatisticsModal";
import { GENERATED_REVISIT_RECORDS, type RevisitRow } from "@/data/sampleData";

export default function RevisitRecordsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<RevisitRow[]>(GENERATED_REVISIT_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<RevisitRow | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    const newRecord = (location.state as { newRecord?: RevisitRow } | null)?.newRecord;
    const editedRecord = (location.state as { editedRecord?: RevisitRow; originalUhidNo?: string; originalOpNo?: string } | null)?.editedRecord;
    const cancelledRecord = (location.state as { cancelledRecord?: any } | null)?.cancelledRecord;
    const originalUhidNo = (location.state as { originalUhidNo?: string } | null)?.originalUhidNo;
    const originalOpNo = (location.state as { originalOpNo?: string } | null)?.originalOpNo;

    if (newRecord) {
      setRecords((current) => {
        const exists = current.some(
          (item) => item.uhidNo === newRecord.uhidNo && item.opNo === newRecord.opNo,
        );

        return exists ? current : [newRecord, ...current];
      });
    }

    if (editedRecord && originalUhidNo && originalOpNo) {
      setRecords((current) =>
        current.map((item) =>
          item.uhidNo === originalUhidNo && item.opNo === originalOpNo ? { ...item, ...editedRecord } : item,
        ),
      );
    }

    if (cancelledRecord) {
      setRecords((current) =>
        current.map((item) =>
          item.uhidNo === cancelledRecord.uhidNo || item.opNo === cancelledRecord.opNo
            ? { ...item, status: "cancelled" }
            : item
        )
      );
    }

    if (newRecord || editedRecord || cancelledRecord) {
      navigate("/revisit-records", { replace: true, state: undefined });
    }
  }, [location.state, navigate]);

  const columns: ColumnDef<RevisitRow>[] = [
    { accessorKey: "uhidNo", header: "UHID No" },
    { accessorKey: "opNo", header: "OP No" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "fhwo", header: "F/H/W/O" },
    { accessorKey: "area", header: "Area" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "department", header: "Department" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original as any).status || "active";
        return <Status status={status} size="sm" />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isCancelled = (row.original as any).status === "cancelled";
        return (
          <ActionMenu
            item={row.original}
            onView={(item) => setSelectedRecord(item)}
            onEdit={(item) => navigate("/op/revisit", { state: { record: item } })}
            onPrint={() => window.print()}
            onBarcode={() => {}}
            onRevisitCancellation={
              isCancelled
                ? undefined
                : (item) => navigate("/op/revisit-cancellation/new", { state: { record: item } })
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
        title="Revisit Records"
        countUnit="Records"
        searchPlaceholder="Search Patient Name / UHID / OP Number"
        columns={columns}
        data={records}
        onAdd={() => navigate("/op/revisit")}
        headerExtra={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatsOpen(true)}
            className="gap-2 text-[13px] border-blue-200 cursor-pointer h-9 shrink-0"
            style={{ color: "var(--blue-text-color)" }}
          >
            <BarChart3 className="h-4 w-4" />
            OP Statistics
          </Button>
        }
        filterFields={[
          {
            label: "Status",
            key: "status",
            type: "select",
            options: ["All", "Active", "Cancelled"],
          },
          {
            label: "Department",
            key: "department",
            type: "select",
            options: [
              "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
              "Dermatology", "Urology", "Obstetrics & Gynaecology", "ENT", "Ophthalmology",
              "Psychiatry", "Nephrology", "Gastroenterology", "Oncology", "Family Medicine"
            ]
          },
          { label: "City", key: "city", type: "select", options: ["Chennai", "Chengalpattu", "Kancheepuram", "Thiruvallur"] },
          { label: "Area", key: "area", type: "text" },
          { label: "Title", key: "title", type: "select", options: ["Mr", "Mrs", "Miss", "Dr"] }
        ]}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.opNo} ${r.department} ${r.area} ${r.city}`}
      />

      {/* View Details Custom Panel */}
      <CustomPanel
        isOpen={Boolean(selectedRecord)}
        title="Revisit Record Details"
        onClose={() => setSelectedRecord(null)}
        onSave={() => setSelectedRecord(null)}
        saveLabel="Close"
        width="620px"
      >
        {selectedRecord && (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div>
                <span className="text-[11px] text-slate-500 block">UHID Number</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{selectedRecord.uhidNo}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">OP Number</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{selectedRecord.opNo}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[11px] text-slate-500 block">Patient Name</span>
                <span className="font-bold text-slate-900 text-base">
                  {selectedRecord.title}. {selectedRecord.patientName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">F/H/W/O</span>
                <span className="font-medium text-slate-800">{selectedRecord.fhwo}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Department</span>
                <span className="font-semibold text-blue-900">{selectedRecord.department}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Area</span>
                <span className="font-medium text-slate-700">{selectedRecord.area}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">City</span>
                <span className="font-medium text-slate-700">{selectedRecord.city}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Status</span>
                <Status status={(selectedRecord as any).status || "active"} size="sm" />
              </div>
            </div>
          </div>
        )}
      </CustomPanel>

      {/* OP Statistics Modal */}
      <OpStatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
}
