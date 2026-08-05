import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Baby, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

const DEPARTMENTS = ["Obstetrics", "General Surgery", "General Medicine"] as const;
const DOCTORS = ["Dr. Kavitha R", "Dr. Sundar M", "Dr. Priya S"] as const;
const UNITS = ["Unit 1", "Unit 2", "Unit 3"] as const;

export default function AntenatalRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const editRecord = location.state?.record;

  const [ancNo, setAncNo] = React.useState("");
  const [uhidNo, setUhidNo] = React.useState("");
  const [patientName, setPatientName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [lmp, setLmp] = React.useState<Date | undefined>();
  const [edd, setEdd] = React.useState<Date | undefined>();
  const [department, setDepartment] = React.useState<string>("");
  const [doctor, setDoctor] = React.useState<string>("");
  const [unit, setUnit] = React.useState<string>("");

  React.useEffect(() => {
    if (editRecord) {
      setAncNo(editRecord.ancNo || "");
      setUhidNo(editRecord.uhidNo || "");
      setPatientName(editRecord.patientName || "");
      setAge(String(editRecord.age || ""));
      setGender(editRecord.gender || "Female");
      setDepartment(editRecord.department || "Obstetrics");
      setDoctor(editRecord.doctor || "Dr. Kavitha R");
      setUnit(editRecord.unit || "Unit 1");
      setCategory("General");
      setAddress("12, Main Road, Chengalpattu");
    }
  }, [editRecord]);

  const handleClear = () => {
    setAncNo("");
    setUhidNo("");
    setPatientName("");
    setAge("");
    setGender("");
    setCategory("");
    setAddress("");
    setLmp(undefined);
    setEdd(undefined);
    setDepartment("");
    setDoctor("");
    setUnit("");
  };

  const handleSaveOrUpdate = () => {
    if (editRecord) {
      notify.updateSuccess("Record updated successfully.");
    } else {
      notify.saveSuccess("Record saved successfully.");
    }
    navigate("/registered-anc-records");
  };

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
            <h1 className="text-[17px] font-semibold">
              {editRecord ? `Edit Antenatal Registration (${editRecord.ancNo})` : "Antenatal Registration"}
            </h1>
            <p className="text-[12.5px] text-muted-foreground">
              {editRecord ? "Modify existing antenatal care details" : "Manage antenatal registration records"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/registered-anc-records")}
            className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
            style={{ background: "var(--blue-btn)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ANC Records
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
              <TextField placeholder="Enter ANC number" value={ancNo} onChange={setAncNo} />
            </Field>
            <Field label="UHID No">
              <TextField placeholder="Enter UHID number" value={uhidNo} onChange={setUhidNo} />
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
              <TextField placeholder="Enter patient name" value={patientName} onChange={setPatientName} />
            </Field>
            <Field label="Age">
              <TextField placeholder="Enter age" value={age} onChange={setAge} />
            </Field>
            <Field label="Gender">
              <TextField placeholder="Enter gender" value={gender} onChange={setGender} />
            </Field>
            <Field label="Category">
              <TextField placeholder="Enter category" value={category} onChange={setCategory} />
            </Field>

            <Field label="Address" span={2}>
              <TextField placeholder="Enter address" value={address} onChange={setAddress} />
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
            <Button variant="outline" onClick={handleClear} className="text-[13px] h-10 w-28 font-medium text-slate-600">
              Clear
            </Button>
            <Button
              onClick={handleSaveOrUpdate}
              className="gap-1.5 h-10 text-white text-[13px] cursor-pointer"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              {editRecord ? "Update ANC Registration" : "Save ANC Registration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}