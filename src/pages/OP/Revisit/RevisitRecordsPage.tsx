import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Plus, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RevisitRow {
  uhidNo: string;
  opNo: string;
  title: string;
  patientName: string;
  fhwo: string;
  area: string;
  city: string;
  department: string;
}

const MOCK_DATA: RevisitRow[] = [
  { uhidNo: "3995988", opNo: "26602286", title: "Mr", patientName: "NITESH KUMAR", fhwo: "Self", area: "Vadapalani", city: "Chennai", department: "General Medicine" },
  { uhidNo: "3489205", opNo: "26602285", title: "Mrs", patientName: "SUVETHA", fhwo: "DHEENA DHAYALAN", area: "Tambaram", city: "Chengalpattu", department: "Urology" },
  { uhidNo: "4137281", opNo: "26602284", title: "Miss", patientName: "ERGAMREDDY SHARMILA", fhwo: "D/O SIVASHANKARAREDDY", area: "Potheri", city: "Chengalpattu", department: "Psychiatry" },
  { uhidNo: "3709448", opNo: "26602281", title: "Mr", patientName: "PRIYANSHU PANDA", fhwo: "S/O PRASATH PANDA", area: "Potheri", city: "Chengalpattu", department: "Dermatology" },
  { uhidNo: "2879469", opNo: "26602280", title: "Mr", patientName: "MURUGESAN", fhwo: "S/O VEERASAMY", area: "Kancheepuram", city: "Kancheepuram", department: "Family Medicine" },
];

export default function RevisitRecordsPage() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<RevisitRow | null>(null);

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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setSelectedRecord(item)}
          onEdit={(item) => navigate("/op/revisit", { state: { record: item } })}
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
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Revisit Records</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage patient revisit history
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/op/revisit")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Plus className="h-4 w-4" />
          New Revisit
        </Button>
      </div>

      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="Revisit Records"
        searchPlaceholder="Search Patient / UHID / OP No"
        columns={columns}
        data={MOCK_DATA}
        searchField={(r) => `${r.patientName} ${r.uhidNo} ${r.opNo} ${r.department}`}
      />

      {/* View Details Dialog */}
      <Dialog open={Boolean(selectedRecord)} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-slate-200 shadow-xl">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-bold text-slate-900">
                Revisit Record Details
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Complete details for selected revisit record
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="p-6 space-y-4 text-xs text-slate-700 bg-white">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
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
                    navigate("/op/revisit", { state: { record: rec } });
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
