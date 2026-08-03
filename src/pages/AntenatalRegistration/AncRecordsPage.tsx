import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Baby, Plus, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AncRecord {
  ancNo: string;
  ancDate: string;
  uhidNo: string;
  patientName: string;
  age: number;
  gender: string;
  department: string;
}

const MOCK_DATA: AncRecord[] = [
  { ancNo: "263208", ancDate: "31 Jul 2026 14:04", uhidNo: "4282176", patientName: "AMUTHA", age: 26, gender: "Female", department: "Obstetrics" },
  { ancNo: "263207", ancDate: "31 Jul 2026 13:52", uhidNo: "4285500", patientName: "MANJUPRIYA", age: 32, gender: "Female", department: "Obstetrics" },
  { ancNo: "263206", ancDate: "31 Jul 2026 13:51", uhidNo: "4285330", patientName: "AFRIJA KHATUN", age: 23, gender: "Female", department: "Obstetrics" },
  { ancNo: "263205", ancDate: "31 Jul 2026 13:33", uhidNo: "4285299", patientName: "BHAVANI M", age: 31, gender: "Female", department: "General Surgery" },
  { ancNo: "263204", ancDate: "31 Jul 2026 13:18", uhidNo: "4285342", patientName: "RUPA GUPTA", age: 27, gender: "Female", department: "Obstetrics" },
];

export default function AncRecordsPage() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<AncRecord | null>(null);

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
      cell: () => (
        <Badge variant="destructive" className="rounded-full font-medium">
          Active
        </Badge>
      ),
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
        searchPlaceholder="Search Patient / UHID / ANC No"
        columns={columns}
        data={MOCK_DATA}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.ancNo} ${r.department}`}
      />

      {/* View Details Dialog */}
      <Dialog open={Boolean(selectedRecord)} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-slate-200 shadow-xl">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-bold text-slate-900">
                ANC Registration Details
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Detailed view of antenatal care registration
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="p-6 space-y-4 text-xs text-slate-700 bg-white">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
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
                <div className="col-span-2 border-t border-slate-200/80 pt-2">
                  <span className="text-[11px] text-slate-500 block">Registration Date & Time</span>
                  <span className="font-medium text-slate-700">{selectedRecord.ancDate}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const rec = selectedRecord;
                    setSelectedRecord(null);
                    navigate("/antenatal-registration", { state: { record: rec } });
                  }}
                  className="text-white text-xs gap-1.5"
                  style={{ background: "var(--blue-btn)" }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit ANC Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
