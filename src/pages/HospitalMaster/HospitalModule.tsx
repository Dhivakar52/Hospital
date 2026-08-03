import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/common/Datatable";
import { Field, TextField } from "@/components/FormPrimitives";

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

const columns: ColumnDef<HospitalRow>[] = [
  { accessorKey: "hospital", header: "Hospital" },
  { accessorKey: "areaName", header: "Area Name" },
  { accessorKey: "cityName", header: "City Name" },
  { accessorKey: "contactNo", header: "Contact No" },
  { accessorKey: "state", header: "State" },
];

export default function HospitalModule() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return MOCK_HOSPITALS;
    const q = searchTerm.toLowerCase();
    return MOCK_HOSPITALS.filter((r) => r.hospital.toLowerCase().includes(q));
  }, [searchTerm]);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Hospital Master</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Manage referring hospital details
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Hospital" required>
              <TextField placeholder="Enter hospital name" />
            </Field>
            <Field label="Street">
              <TextField placeholder="Enter street" />
            </Field>
            <Field label="Location">
              <TextField placeholder="Enter location" />
            </Field>

            <Field label="Area Name">
              <TextField placeholder="Enter area name" />
            </Field>
            <Field label="PIN Code">
              <TextField placeholder="Enter PIN code" />
            </Field>
            <Field label="Contact No" required>
              <TextField placeholder="Enter contact number" />
            </Field>

            <Field label="City Name" required>
              <TextField placeholder="Enter city name" />
            </Field>
            <Field label="State">
              <TextField placeholder="Enter state" />
            </Field>
            <Field label="Country">
              <TextField placeholder="Enter country" />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            <Button
              className="text-white text-[13px]"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Search + results */}
      <div className="my-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="max-w-sm flex-1">
            <Field label="Hospital Name">
              <TextField
                placeholder="Search hospital"
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </Field>
          </div>
          <Button
            className="gap-1.5 text-white text-[13px]"
            style={{ background: "var(--blue-btn)", marginTop: "22px" }}
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </Button>
        </div>
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}