import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Stethoscope, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/common/Datatable";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";

interface DiagnosisRow {
  id: string;
  code: string;
  name: string;
  count: number;
}

const DEPARTMENTS = ["General Surgery", "Obstetrics", "General Medicine", "Orthopaedics"] as const;

let rowId = 0;

export default function DiagnoModule() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [department, setDepartment] = React.useState<string>("General Surgery");
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [count, setCount] = React.useState("");
  const [rows, setRows] = React.useState<DiagnosisRow[]>([
    { id: "seed-1", code: "M00.1", name: "Pneumococcal arthritis and polyarthritis", count: 1 },
  ]);

  const total = React.useMemo(() => rows.reduce((sum, r) => sum + r.count, 0), [rows]);

  const handleAdd = () => {
    if (!code.trim() || !name.trim()) return;
    rowId += 1;
    setRows((current) => [
      ...current,
      { id: `row-${rowId}`, code: code.trim(), name: name.trim(), count: Number(count) || 1 },
    ]);
    setCode("");
    setName("");
    setCount("");
  };

  const handleDelete = (id: string) => {
    setRows((current) => current.filter((r) => r.id !== id));
  };

  const columns: ColumnDef<DiagnosisRow>[] = [
    { accessorKey: "code", header: "Diagnosis Code" },
    { accessorKey: "name", header: "Diagnosis Name" },
    { accessorKey: "count", header: "Count" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <span
          className="cursor-pointer text-[13px] font-medium hover:underline"
          style={{ color: "var(--blue-text-color)" }}
          onClick={() => handleDelete(row.original.id)}
        >
          Delete
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Diagnosis Entry</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Record diagnosis details for the visit
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 items-end gap-4">
            <Field label="Date" required>
              <DateField value={date} onChange={setDate} placeholder="Pick a date" />
            </Field>
            <Field label="Department" required>
              <SelectField options={DEPARTMENTS} value={department} onChange={setDepartment} />
            </Field>
            <Button
              variant="outline"
              className="h-9 text-[13px]"
              style={{ color: "var(--blue-text-color)" }}
            >
              Get Details
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-4 items-end gap-4">
            <Field label="Diagnosis Code">
              <TextField placeholder="Enter code" value={code} onChange={setCode} />
            </Field>
            <Field label="Diagnosis Name" span={2}>
              <TextField placeholder="Enter diagnosis name" value={name} onChange={setName} />
            </Field>
            <Field label="Count">
              <TextField placeholder="1" value={count} onChange={setCount} />
            </Field>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              onClick={handleAdd}
              className="gap-1.5 text-white text-[13px]"
              style={{ background: "var(--blue-btn)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          <div className="mt-5">
            <DataTable columns={columns} data={rows} />
            <div className="mt-2 flex justify-end pr-4 text-[13px] font-semibold">
              Total: {total}
            </div>
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
    </div>
  );
}