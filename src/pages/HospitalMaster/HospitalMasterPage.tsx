import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Building2, Plus, FileText, Pencil } from "lucide-react";
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

interface HospitalRow {
  hospital: string;
  areaName: string;
  cityName: string;
  contactNo: string;
  state: string;
}

const MOCK_HOSPITALS: HospitalRow[] = [
  { hospital: "SRM Global Hospitals", areaName: "Vadapalani", cityName: "Chennai", contactNo: "044-45923000", state: "Tamil Nadu" },
  { hospital: "Apollo Speciality", areaName: "Vanagaram", cityName: "Chennai", contactNo: "044-40200000", state: "Tamil Nadu" },
  { hospital: "Fortis Malar", areaName: "Adyar", cityName: "Chennai", contactNo: "044-42892222", state: "Tamil Nadu" },
];

export default function HospitalMasterPage() {
  const navigate = useNavigate();
  const [selectedHospital, setSelectedHospital] = useState<HospitalRow | null>(null);

  const columns: ColumnDef<HospitalRow>[] = [
    { accessorKey: "hospital", header: "Hospital" },
    { accessorKey: "areaName", header: "Area Name" },
    { accessorKey: "cityName", header: "City Name" },
    { accessorKey: "contactNo", header: "Contact No" },
    { accessorKey: "state", header: "State" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setSelectedHospital(item)}
          onEdit={(item) => navigate("/hospital-master", { state: { record: item } })}
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
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Hospital Master Records</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage registered referring hospitals
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/hospital-master")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Plus className="h-4 w-4" />
          New Hospital
        </Button>
      </div>

      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="Hospital Master Records"
        searchPlaceholder="Search hospital, area, city..."
        columns={columns}
        data={MOCK_HOSPITALS}
        searchField={(r) => `${r.hospital} ${r.areaName} ${r.cityName} ${r.state}`}
      />

      {/* View Details Dialog */}
      <Dialog open={Boolean(selectedHospital)} onOpenChange={() => setSelectedHospital(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-slate-200 shadow-xl">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-bold text-slate-900">
                Hospital Master Details
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Detailed information for referring hospital
            </DialogDescription>
          </DialogHeader>

          {selectedHospital && (
            <div className="p-6 space-y-4 text-xs text-slate-700 bg-white">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block">Hospital Name</span>
                  <span className="font-bold text-slate-900 text-base">{selectedHospital.hospital}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Area Name</span>
                  <span className="font-semibold text-slate-800">{selectedHospital.areaName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">City Name</span>
                  <span className="font-semibold text-slate-800">{selectedHospital.cityName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Contact No</span>
                  <span className="font-medium text-slate-700 font-mono">{selectedHospital.contactNo}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">State</span>
                  <span className="font-medium text-slate-700">{selectedHospital.state}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedHospital(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const rec = selectedHospital;
                    setSelectedHospital(null);
                    navigate("/hospital-master", { state: { record: rec } });
                  }}
                  className="text-white text-xs gap-1.5"
                  style={{ background: "var(--blue-btn)" }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Hospital
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
