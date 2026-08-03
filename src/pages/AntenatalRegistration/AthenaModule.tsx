import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Baby, ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/common/Datatable";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";

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

const DEPARTMENTS = ["Obstetrics", "General Surgery", "General Medicine"] as const;
const DOCTORS = ["Dr. Kavitha R", "Dr. Sundar M", "Dr. Priya S"] as const;
const UNITS = ["Unit 1", "Unit 2", "Unit 3"] as const;

const columns: ColumnDef<AncRecord>[] = [
  {
    accessorKey: "ancNo",
    header: "ANC No",
    cell: ({ row }) => (
      <span
        className="cursor-pointer font-medium hover:underline"
        style={{ color: "var(--blue-text-color)" }}
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
        De-Activate
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <Badge className="rounded-full bg-indigo-100 font-medium text-indigo-700 hover:bg-indigo-100">
        Barcode
      </Badge>
    ),
  },
];

export default function AntenatalRegistration() {
  const [lmp, setLmp] = React.useState<Date | undefined>();
  const [edd, setEdd] = React.useState<Date | undefined>();
  const [department, setDepartment] = React.useState<string>("");
  const [doctor, setDoctor] = React.useState<string>("");
  const [unit, setUnit] = React.useState<string>("");
  const [search, setSearch] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!search) return MOCK_DATA;
    const q = search.toLowerCase();
    return MOCK_DATA.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.uhidNo.includes(q) ||
        r.ancNo.includes(q)
    );
  }, [search]);

  return (
    <div>
      {/* Header */}
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
            <h1 className="text-[17px] font-semibold">Antenatal Registration</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Register and manage antenatal care records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 text-[13px] border-blue-200"
            style={{ color: "var(--blue-text-color)" }}
          >
            <ClipboardList className="h-4 w-4" />
            ANC Statistics
          </Button>
        </div>
      </div>

      {/* Form card */}
      <div
        className="rounded-md border border-slate-200"
        style={{ background: "var(--background)" }}
      >
        <div className="px-6 py-6">
          <h2 className="mb-4 text-[13.5px] font-semibold">Patient lookup</h2>
          <div className="grid grid-cols-4 items-end gap-4">
            <Field label="ANC No">
              <TextField placeholder="Enter ANC number" />
            </Field>
            <Field label="UHID No">
              <TextField placeholder="Enter UHID number" />
            </Field>
            <Field label="IP No">
              <TextField placeholder="Enter IP number" />
            </Field>
            <Button
              variant="outline"
              className="h-9 text-[13px]"
              style={{ color: "var(--blue-text-color)" }}
            >
              Get Details
            </Button>
          </div>

          <h2 className="mb-4 mt-6 text-[13.5px] font-semibold">Patient details</h2>
          <div className="grid grid-cols-4 gap-4">
            <Field label="Patient Name">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Age">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Gender">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Category">
              <TextField disabled placeholder="—" />
            </Field>

            <Field label="Address" span={2}>
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Department">
              <SelectField options={DEPARTMENTS} value={department} onChange={setDepartment} />
            </Field>
            <Field label="Doctor">
              <SelectField options={DOCTORS} value={doctor} onChange={setDoctor} />
            </Field>

            <Field label="Unit">
              <SelectField options={UNITS} value={unit} onChange={setUnit} />
            </Field>
            <Field label="Gravida">
              <TextField placeholder="Enter gravida" />
            </Field>
            <Field label="LMP">
              <DateField value={lmp} onChange={setLmp} placeholder="Pick LMP date" />
            </Field>
            <Field label="EDD">
              <DateField value={edd} onChange={setEdd} placeholder="Pick EDD date" />
            </Field>

            <Field label="Months of Pregnancy (weeks)">
              <TextField placeholder="Enter weeks" />
            </Field>
            <Field label="Remarks" span={3}>
              <TextField placeholder="Enter remarks" />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            {/* <Button
              className="gap-1.5 text-white text-[13px]"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Save & Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Registered records */}
      <div className="my-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14.5px] font-semibold">Registered ANC records</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient / UHID"
            className="h-9 w-60 rounded-[4px] border border-input bg-slate-50 px-3 text-[13px] outline-none focus:border-slate-400"
          />
        </div>
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}