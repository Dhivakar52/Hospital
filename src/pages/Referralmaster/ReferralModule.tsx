import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/common/Datatable";
import { Field, TextField, SelectField } from "@/components/FormPrimitives";

interface ReferralRow {
  referralName: string;
  designation: string;
  hospitalName: string;
  contactNo: string;
}

const DESIGNATIONS = ["Consultant", "General Practitioner", "Surgeon", "Specialist"] as const;

const MOCK_REFERRALS: ReferralRow[] = [
  { referralName: "Dr. Meena Kumar", designation: "Consultant", hospitalName: "Apollo Speciality", contactNo: "9840012345" },
  { referralName: "Dr. Arjun Nair", designation: "General Practitioner", hospitalName: "SRM Global Hospitals", contactNo: "9884023456" },
  { referralName: "Dr. Sathish Babu", designation: "Surgeon", hospitalName: "Fortis Malar", contactNo: "9445034567" },
];

const columns: ColumnDef<ReferralRow>[] = [
  { accessorKey: "referralName", header: "Referral Name" },
  { accessorKey: "designation", header: "Designation" },
  { accessorKey: "hospitalName", header: "Hospital Name" },
  { accessorKey: "contactNo", header: "Contact No" },
];

export default function ReferralModule() {
  const [designation, setDesignation] = React.useState<string>("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return MOCK_REFERRALS;
    const q = searchTerm.toLowerCase();
    return MOCK_REFERRALS.filter((r) => r.referralName.toLowerCase().includes(q));
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
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Referral Master</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Manage referring doctor details
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Referral Name" required>
              <TextField placeholder="Enter referral name" />
            </Field>
            <Field label="Designation">
              <SelectField options={DESIGNATIONS} value={designation} onChange={setDesignation} />
            </Field>

            <Field label="Hospital Name" required>
              <TextField placeholder="Enter hospital name" />
            </Field>
            <Field label="Contact No" required>
              <TextField placeholder="Enter contact number" />
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
            <Field label="Referral Name">
              <TextField
                placeholder="Search referral"
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