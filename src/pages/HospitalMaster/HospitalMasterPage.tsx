import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import { GENERATED_HOSPITAL_RECORDS, type HospitalRow } from "@/data/sampleData";
// import { notify } from "@/lib/notify";

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

  // Handle Delete - ActionMenu will handle the confirmation dialog
  const handleDelete = (item: HospitalRow) => {
    setRecords((current) =>
      current.filter((record) => record.hospital !== item.hospital)
    );
    // Notification is already handled by ActionMenu
  };

  const columns: ColumnDef<HospitalRow>[] = [
    { accessorKey: "hospital", header: "Hospital" },
    { accessorKey: "streetName", header: "Street Name", cell: ({ row }) => row.original.streetName || "N/A" },
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
          onDelete={handleDelete}
          // onPrint={() => window.print()}
          // onBarcode={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="Hospital Master Records"
        countUnit="Hospitals"
        searchPlaceholder="Search hospital name, street, area, city..."
        columns={columns}
        data={records}
        hideDateFilters={true}
        onAdd={() => navigate("/hospital-master")}
        filterFields={[
          { label: "City Name", key: "cityName", type: "select", options: ["Chennai", "Chengalpattu", "Kancheepuram", "Thiruvallur"] },
          { label: "State", key: "state", type: "select", options: ["Tamil Nadu"] },
          { label: "Street Name", key: "streetName", type: "text" },
          { label: "Area Name", key: "areaName", type: "text" },
          { label: "Hospital Name", key: "hospital", type: "text" }
        ]}
        searchField={(r) => `${r.hospital} ${r.streetName || ""} ${r.areaName} ${r.cityName} ${r.state}`}
      />

      {/* View Panel */}
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
                <span className="text-[11px] text-slate-500 block">Street Name</span>
                <span className="font-semibold text-slate-800">{selectedHospital.streetName || "N/A"}</span>
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
              <div className="col-span-2">
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