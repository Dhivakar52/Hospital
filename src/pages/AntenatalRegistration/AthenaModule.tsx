import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

const DEPARTMENTS = ["Obstetrics", "General Surgery", "General Medicine"] as const;
const DOCTORS = ["Dr. Kavitha R", "Dr. Sundar M", "Dr. Priya S"] as const;
const UNITS = ["Unit 1", "Unit 2", "Unit 3"] as const;

export default function AntenatalRegistration() {
  const navigate = useNavigate();
  const [lmp, setLmp] = React.useState<Date | undefined>();
  const [edd, setEdd] = React.useState<Date | undefined>();
  const [department, setDepartment] = React.useState<string>("");
  const [doctor, setDoctor] = React.useState<string>("");
  const [unit, setUnit] = React.useState<string>("");

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
              Register new antenatal care details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/registered-anc-records")}
            className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
            style={{ background: "var(--blue-btn)" }}
          >
            <Baby className="h-4 w-4" />
            View Registered ANC Records
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
              <TextField placeholder="Enter patient name" />
            </Field>
            <Field label="Age">
              <TextField placeholder="Enter age" />
            </Field>
            <Field label="Gender">
              <TextField placeholder="Enter gender" />
            </Field>
            <Field label="Category">
              <TextField placeholder="Enter category" />
            </Field>

            <Field label="Address" span={2}>
              <TextField placeholder="Enter address" />
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
            <Button
              onClick={() => {
                notify.saveSuccess("Record saved successfully.");
                navigate("/registered-anc-records");
              }}
              className="gap-1.5 text-white text-[13px] cursor-pointer"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Save ANC Registration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}