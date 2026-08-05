import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import CustomPanel from "@/common/CustomPanel";
import { DeleteConfirmationDialog } from "@/common/DeleteConfirmationDialog";
import { notify } from "@/lib/notify";

interface DiagnosisRow {
  id: string;
  code: string;
  name: string;
  count: number;
}

const DEPARTMENTS = ["General Surgery", "Obstetrics", "General Medicine", "Orthopaedics", "Cardiology", "Pediatrics"] as const;

const DIAGNOSIS_DICTIONARY: Record<string, string> = {
  "M00.1": "Pneumococcal arthritis and polyarthritis",
  "I10": "Essential (primary) hypertension",
  "E11.9": "Type 2 diabetes mellitus without complications",
  "J20.9": "Acute bronchitis, unspecified",
  "K21.9": "Gastro-esophageal reflux disease without esophagitis",
  "J45.909": "Unspecified asthma, uncomplicated",
  "M54.5": "Low back pain, unspecified",
  "R51": "Headache, unspecified",
  "N39.0": "Urinary tract infection, site not specified",
  "G43.909": "Migraine, unspecified, not intractable",
};

const SAMPLE_DIAGNOSES = [
  { code: "M00.1", name: "Pneumococcal arthritis and polyarthritis", count: 1 },
  { code: "I10", name: "Essential (primary) hypertension", count: 1 },
  { code: "E11.9", name: "Type 2 diabetes mellitus without complications", count: 2 },
  { code: "J20.9", name: "Acute bronchitis, unspecified", count: 1 },
  { code: "K21.9", name: "Gastro-esophageal reflux disease without esophagitis", count: 1 },
  { code: "J45.909", name: "Unspecified asthma, uncomplicated", count: 3 },
  { code: "M54.5", name: "Low back pain, unspecified", count: 1 },
  { code: "R51", name: "Headache, unspecified", count: 2 },
  { code: "N39.0", name: "Urinary tract infection, site not specified", count: 1 },
  { code: "G43.909", name: "Migraine, unspecified, not intractable", count: 1 },
];

let rowId = 100;

export default function DiagnoModule() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [department, setDepartment] = React.useState<string>("General Surgery");

  // Custom Side Panel State (Contains ONLY Diagnosis Code, Diagnosis Name, and Count)
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [count, setCount] = React.useState("1");

  // Delete Confirmation Dialog State
  const [itemToDeleteId, setItemToDeleteId] = React.useState<string | null>(null);

  const [rows, setRows] = React.useState<DiagnosisRow[]>(() =>
    Array.from({ length: 10 }, (_, i) => {
      const diag = SAMPLE_DIAGNOSES[i % SAMPLE_DIAGNOSES.length];
      return {
        id: `diag-${i + 1}`,
        code: diag.code,
        name: diag.name,
        count: diag.count,
      };
    })
  );

  const resetPanelForm = () => {
    setCode("");
    setName("");
    setCount("1");
  };

  const handleOpenPanel = () => {
    resetPanelForm();
    setIsPanelOpen(true);
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    const upperVal = val.trim().toUpperCase();
    if (DIAGNOSIS_DICTIONARY[upperVal]) {
      setName(DIAGNOSIS_DICTIONARY[upperVal]);
    }
  };

  const handleConfirmAddDiagnosis = () => {
    if (!code.trim() || !name.trim()) {
      notify.validationError("Please enter Diagnosis Code and Diagnosis Name.");
      return;
    }

    const numericCount = parseInt(count, 10);
    if (isNaN(numericCount) || numericCount <= 0) {
      notify.validationError("Count must be a valid positive number.");
      return;
    }

    rowId += 1;
    const newRow: DiagnosisRow = {
      id: `diag-${rowId}`,
      code: code.trim(),
      name: name.trim(),
      count: numericCount,
    };

    setRows((current) => [newRow, ...current]);
    notify.saveSuccess("Diagnosis added successfully.");
    setIsPanelOpen(false);
    resetPanelForm();
  };

  const handleConfirmDelete = () => {
    if (!itemToDeleteId) return;
    setRows((current) => current.filter((r) => r.id !== itemToDeleteId));
    setItemToDeleteId(null);
    notify.deleteSuccess("Record deleted successfully.");
  };

  const columns: ColumnDef<DiagnosisRow>[] = [
    { accessorKey: "code", header: "Diagnosis Code" },
    { accessorKey: "name", header: "Diagnosis Name" },
    { accessorKey: "count", header: "Count" },
    {
      id: "actions",
      header: "Delete",
      cell: ({ row }) => (
        <span
          className="cursor-pointer text-[13px] font-medium hover:underline text-red-600"
          onClick={() => setItemToDeleteId(row.original.id)}
        >
          Delete
        </span>
      ),
    },
  ];

  return (
    <div>


      {/* Top Form Card */}
      <div className="mb-6 rounded-md border border-slate-200 bg-white" style={{ background: "var(--background)" }}>
        <div className="px-6 py-5">
          <div className="grid grid-cols-12 items-end gap-4">
            <Field label="Date" required span={6}>
              <DateField value={date} onChange={setDate} placeholder="Pick a date" />
            </Field>

            <Field label="Department" required span={6}>
              <SelectField options={DEPARTMENTS} value={department} onChange={setDepartment} />
            </Field>
          </div>
        </div>
      </div>

      {/* Diagnosis Entry DataTable */}
      <StandardModuleTable
        title="Diagnosis Entry"
        countUnit="Records"
        searchPlaceholder="Search Diagnosis Code or Name..."
        columns={columns}
        data={rows}
        hideDateFilters={true}
        onAdd={handleOpenPanel}
        headerExtra={
          <Button
            variant="outline"
            size="sm"
            onClick={() => notify.saveSuccess("Details fetched successfully.")}
            className="h-9 gap-1.5 text-[13px] text-white cursor-pointer shrink-0"
            style={{
              background: "var(--blue-btn)",
              borderColor: "var(--blue-btn)",
            }}
          >
            <Search className="h-3.5 w-3.5" />
            Get Details
          </Button>
        }
        searchField={(r) => `${r.code} ${r.name} ${r.count}`}
      />

      {/* Right Side Custom Panel / Drawer for Adding Diagnosis */}
      <CustomPanel
        isOpen={isPanelOpen}
        title="Add Diagnosis"
        onClose={() => setIsPanelOpen(false)}
        onSave={handleConfirmAddDiagnosis}
        saveLabel="Save Diagnosis"
        width="480px"
      >
        <div className="space-y-4 text-xs">
          <Field label="Diagnosis Code" required>
            <TextField
              placeholder="e.g. M00.1, I10, E11.9..."
              value={code}
              onChange={handleCodeChange}
            />
          </Field>

          <Field label="Diagnosis Name" required>
            <TextField
              placeholder="Enter diagnosis name"
              value={name}
              onChange={setName}
            />
          </Field>

          <Field label="Count" required>
            <TextField
              placeholder="1"
              value={count}
              onChange={(val) => setCount(val.replace(/\D/g, "") || "1")}
            />
          </Field>
        </div>
      </CustomPanel>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={Boolean(itemToDeleteId)}
        onOpenChange={(open) => !open && setItemToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Confirmation"
        description="Are you sure you want to delete this diagnosis?"
      />
    </div>
  );
}