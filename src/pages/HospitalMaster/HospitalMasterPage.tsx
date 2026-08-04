import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import { GENERATED_HOSPITAL_RECORDS, type HospitalRow } from "@/data/sampleData";

export default function HospitalMasterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<HospitalRow[]>(GENERATED_HOSPITAL_RECORDS);
  const [selectedHospital, setSelectedHospital] = useState<HospitalRow | null>(null);

  useEffect(() => {
    const newRecord = (location.state as { newRecord?: HospitalRow } | null)?.newRecord;
    const editedRecord = (location.state as { editedRecord?: HospitalRow; originalHospital?: string } | null)?.editedRecord;
    const originalHospital = (location.state as { originalHospital?: string } | null)?.originalHospital;

    if (newRecord) {
      setRecords((current) => {
        const exists = current.some(
          (item) => item.hospital === newRecord.hospital && item.contactNo === newRecord.contactNo,
        );

        return exists ? current : [newRecord, ...current];
      });
    }

    if (editedRecord && originalHospital) {
      setRecords((current) =>
        current.map((item) =>
          item.hospital === originalHospital ? { ...item, ...editedRecord } : item,
        ),
      );
    }

    if (newRecord || editedRecord) {
      navigate("/hospital-master-records", { replace: true, state: undefined });
    }
  }, [location.state, navigate]);

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
        data={records}
        searchField={(r) => `${r.hospital} ${r.areaName} ${r.cityName} ${r.state}`}
      />

      <CustomPanel
        isOpen={Boolean(selectedHospital)}
        title="Hospital Master Details"
        onClose={() => setSelectedHospital(null)}
        onSave={() => setSelectedHospital(null)}
        saveLabel="Close"
        width="620px"
      >
        {selectedHospital && (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
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


          </div>
        )}
      </CustomPanel>
    </div>
  );
}
