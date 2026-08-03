import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { CalendarClock, BarChart3, Search, ArrowRight, ArrowLeft , ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevisitStepper } from "./Revisitstepper";
import { DataTable } from "@/common/Datatable";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import { toast } from "sonner";

type StepKey = 1 | 2 | 3 | 4 | 5;

interface RevisitRow {
  uhidNo: string;
  opNo: string;
  title: string;
  patientName: string;
  fhwo: string;
  area: string;
  city: string;
  department: string;
}

const MOCK_DATA: RevisitRow[] = [
  { uhidNo: "3995988", opNo: "26602286", title: "Mr", patientName: "NITESH KUMAR", fhwo: "Self", area: "", city: "Chennai", department: "General Medicine" },
  { uhidNo: "3489205", opNo: "26602285", title: "Mrs", patientName: "SUVETHA", fhwo: "DHEENA DHAYALAN", area: "", city: "Chengalpattu", department: "Urology" },
  { uhidNo: "4137281", opNo: "26602284", title: "Miss", patientName: "ERGAMREDDY SHARMILA", fhwo: "D/O SIVASHANKARAREDDY", area: "Potheri", city: "Chengalpattu", department: "Psychiatry" },
  { uhidNo: "3709448", opNo: "26602281", title: "Mr", patientName: "PRIYANSHU PANDA", fhwo: "S/O PRASATH PANDA", area: "Potheri", city: "Chengalpattu", department: "Dermatology" },
  { uhidNo: "2879469", opNo: "26602280", title: "Mr", patientName: "MURUGESAN", fhwo: "S/O VEERASAMY", area: "Kancheepuram", city: "Kancheepuram", department: "Family Medicine" },
];

const columns: ColumnDef<RevisitRow>[] = [
  { accessorKey: "uhidNo", header: "UHID No" },
  { accessorKey: "opNo", header: "OP No" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "patientName", header: "Patient Name" },
  { accessorKey: "fhwo", header: "F/H/W/O" },
  { accessorKey: "area", header: "Area" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "department", header: "Department" },
  {
    id: "print",
    header: "",
    cell: () => (
      <span className="cursor-pointer text-[13px] font-medium hover:underline" style={{ color: "var(--blue-text-color)" }}>
        Print
      </span>
    ),
  },
  {
    id: "barcode",
    header: "",
    cell: () => (
      <span className="cursor-pointer text-[13px] font-medium hover:underline" style={{ color: "var(--blue-text-color)" }}>
        Barcode
      </span>
    ),
  },
];

const DEPARTMENTS = ["General Medicine", "General Surgery", "Urology", "Psychiatry", "Dermatology", "Family Medicine"] as const;
const DOCTORS = ["Dr. Kavitha R", "Dr. Sundar M", "Dr. Priya S"] as const;
const UNITS = ["Unit 1", "Unit 2", "Unit 3"] as const;
const SUB_DEPARTMENTS = ["OPD", "IPD"] as const;
const TITLES = ["Mr", "Mrs", "Miss", "Dr"] as const;
const PATIENT_CATEGORY = ["General", "Corporate", "Insurance", "Staff"] as const;
const SUB_CATEGORY = ["Standard", "Premium"] as const;
const CORPORATE_COMPANY = ["Not Applicable", "TCS", "Infosys", "SRM Technologies"] as const;
const INSURANCE_COMPANY = ["Not Applicable", "Star Health", "ICICI Lombard", "HDFC Ergo"] as const;
const COMPREHENSIVE_OPD = ["No", "Yes"] as const;
const BILL_TYPE = ["Cash", "Credit"] as const;
const MODE_OF_PAY = ["Cash", "Card", "UPI", "Net Banking"] as const;
const BANK_NAME = ["Select", "SBI", "HDFC", "ICICI"] as const;
const KIN_RELATIONSHIP = ["Spouse", "Parent", "Child", "Sibling", "Other"] as const;

export default function OPRevisit() {
  const [step, setStep] = React.useState<StepKey>(1);
  const [insurance, setInsurance] = React.useState<"No" | "Yes">("No");
  const [payType, setPayType] = React.useState<"Paid" | "Free">("Paid");
  const [modeOfVisit, setModeOfVisit] = React.useState<"Walk-In" | "Ambulance">("Walk-In");
  const [vip, setVip] = React.useState(false);
  const [uhidNo, setUhidNo] = React.useState("");
  const [patientName, setPatientName] = React.useState("");
  const [contactNo1, setContactNo1] = React.useState("");

  const goNext = () => {
    if (step < 5) {
      setStep((s) => (s + 1) as StepKey);
      return;
    }
    if (!uhidNo.trim() || !patientName.trim() || !contactNo1.trim()) {
      toast.error("UHID No, Patient Name and Contact No-I are required.");
      setStep(1);
      return;
    }
    toast.success("OP re-visit registered successfully.");
    setStep(1);
  };
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepKey) : s));
  const clearDraft = () => {
    setUhidNo("");
    setPatientName("");
    setContactNo1("");
    setInsurance("No");
    setPayType("Paid");
    setModeOfVisit("Walk-In");
    setVip(false);
    toast.info("Form cleared.");
  };

  const stepPatientDetails = (
    <div className="grid grid-cols-4 items-end gap-4">
      <Field label="UHID No" required>
        <TextField placeholder="Enter UHID number" value={uhidNo} onChange={setUhidNo} />
      </Field>
      <Button
        variant="outline"
        className="h-9 text-[13px]"
        style={{ color: "var(--blue-text-color)" }}
      >
        Get Details
      </Button>
      <Field label="Visit Count">
        <TextField disabled placeholder="—" />
      </Field>
      <div />

      <Field label="Reg. Date">
        <DateField placeholder="Pick date" />
      </Field>
      <Field label="Last Visit Date">
        <TextField disabled placeholder="—" />
      </Field>
      <Field label="Age">
        <TextField placeholder="Age" />
      </Field>
      <Field label="Title">
        <SelectField options={TITLES} />
      </Field>

      <Field label="Patient Name" span={2}>
        <TextField placeholder="Enter patient name" value={patientName} onChange={setPatientName} />
      </Field>
      <Field label="F/H/W/O" span={2}>
        <TextField placeholder="Enter F/H/W/O name" />
      </Field>

      <Field label="Area">
        <TextField placeholder="Enter area" />
      </Field>
      <Field label="PIN Code">
        <TextField placeholder="Enter PIN code" />
      </Field>
      <Field label="Gender">
        <SelectField options={["Male", "Female", "Other"]} />
      </Field>
      <Field label="City/Town">
        <TextField placeholder="Enter city / town" />
      </Field>

      <Field label="State">
        <TextField placeholder="Enter state" />
      </Field>
      <Field label="Contact No-I" required>
        <TextField placeholder="Primary contact number" value={contactNo1} onChange={setContactNo1} />
      </Field>
      <Field label="Contact No-II">
        <TextField placeholder="Alternate contact number" />
      </Field>
      <Field label="Religion">
        <TextField placeholder="Enter religion" />
      </Field>

      <Field label="Annual Income">
        <TextField placeholder="Enter annual income" />
      </Field>
      <Field label="Permanent Address" span={2}>
        <textarea
          rows={2}
          placeholder="Enter permanent address"
          className="w-full resize-none rounded-[4px] border border-input px-3 py-2 text-[13px] outline-none focus:border-slate-400 focus:bg-white"
        />
      </Field>
      <Field label="ID Card">
        <SelectField options={["Aadhaar", "PAN", "Passport", "Voter ID"]} />
      </Field>

      <Field label="ID Card No">
        <TextField placeholder="Enter ID card number" />
      </Field>
      <Field label="COVID Vaccination">
        <SelectField options={["Not Vaccinated", "Partially Vaccinated", "Fully Vaccinated"]} />
      </Field>
        <div className="relative flex items-center">
    <TextField 
      placeholder="Enter ABHA ID" 
    />
    <Button
      variant="link"
      className="absolute right-2  gap-1 bg-background whitespace-nowrap p-0 text-[8px] font-medium"
      style={{
        color:"var(--blue-text-color)",
       
      }}
    >
      Create ABHA ID
      <ExternalLink className="size-2.5" />
    </Button>
  </div>
      
    </div>
  );

  const stepVisitDetails = (
    <div className="grid grid-cols-3 gap-4">
      <Field label="Department">
        <SelectField options={DEPARTMENTS} />
      </Field>
      <Field label="Doctor">
        <SelectField options={DOCTORS} />
      </Field>
      <Field label="Unit">
        <SelectField options={UNITS} />
      </Field>
      <Field label="Sub Department">
        <SelectField options={SUB_DEPARTMENTS} />
      </Field>
    </div>
  );

  const stepCategoryInsurance = (
    <div className="grid grid-cols-4 gap-4">
      <Field label="Patient Category">
        <SelectField options={PATIENT_CATEGORY} />
      </Field>
      <Field label="Sub Category">
        <SelectField options={SUB_CATEGORY} />
      </Field>
      <Field label="Corporate Company">
        <SelectField options={CORPORATE_COMPANY} />
      </Field>
      <Field label="Card ID No">
        <TextField placeholder="Enter card ID number" />
      </Field>

      <Field label="Employee No">
        <TextField placeholder="Enter employee number" />
      </Field>
      <Field label="Subhiksha No">
        <TextField placeholder="Enter Subhiksha number" />
      </Field>
      <Field label="Insurance Company">
        <SelectField options={INSURANCE_COMPANY} />
      </Field>
      <Field label="Comprehensive OPD Type">
        <SelectField options={COMPREHENSIVE_OPD} />
      </Field>

      <div>
        <span className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">Insurance</span>
        <div className="flex h-9 items-center gap-4">
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="radio" checked={insurance === "No"} onChange={() => setInsurance("No")} />
            No
          </label>
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="radio" checked={insurance === "Yes"} onChange={() => setInsurance("Yes")} />
            Yes
          </label>
        </div>
      </div>
    </div>
  );

  const stepPaymentDetails = (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <span className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">Pay Type</span>
        <div className="flex h-9 items-center gap-4">
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="radio" checked={payType === "Paid"} onChange={() => setPayType("Paid")} />
            Paid
          </label>
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="radio" checked={payType === "Free"} onChange={() => setPayType("Free")} />
            Free
          </label>
        </div>
      </div>
      <Field label="Reason for Free">
        <TextField placeholder="Enter reason" disabled={payType === "Paid"} />
      </Field>
      <Field label="Bill Type">
        <SelectField options={BILL_TYPE} />
      </Field>
      <Field label="Mode of Pay">
        <SelectField options={MODE_OF_PAY} />
      </Field>

      <Field label="Payment No">
        <TextField placeholder="Enter payment reference no" />
      </Field>
      <Field label="Bank Name">
        <SelectField options={BANK_NAME} />
      </Field>
      <Field label="Reg. Fee">
        <TextField placeholder="0" />
      </Field>
      <Field label="Disc.%">
        <TextField placeholder="0" />
      </Field>

      <Field label="Net Reg. Fee">
        <TextField disabled placeholder="0" />
      </Field>
    </div>
  );

  const stepReferralVisitMode = (
    <div className="grid grid-cols-4 items-end gap-4">
      <Field label="Referred by">
        <TextField placeholder="Enter referral name" />
      </Field>
      <div>
        <span className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">Mode of Visit</span>
        <div className="flex h-9 items-center gap-4">
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="radio" checked={modeOfVisit === "Walk-In"} onChange={() => setModeOfVisit("Walk-In")} />
            Walk-In
          </label>
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="radio" checked={modeOfVisit === "Ambulance"} onChange={() => setModeOfVisit("Ambulance")} />
            Ambulance
          </label>
        </div>
      </div>
      <Field label="Survey Code">
        <TextField placeholder="Enter survey code" />
      </Field>
      <label className="mb-2 flex h-9 items-center gap-2 text-[13px] font-medium">
        <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} />
        VIP
      </label>

      <Field label="KIN Name">
        <TextField placeholder="Enter next of kin name" />
      </Field>
      <Field label="KIN Relationship">
        <SelectField options={KIN_RELATIONSHIP} />
      </Field>
      <Field label="KIN Contact No">
        <TextField placeholder="Enter next of kin contact" />
      </Field>
    </div>
  );

  const panels: Record<StepKey, React.ReactNode> = {
    1: stepPatientDetails,
    2: stepVisitDetails,
    3: stepCategoryInsurance,
    4: stepPaymentDetails,
    5: stepReferralVisitMode,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">OP Re-Visit</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Last UHID No: <span className="font-medium text-slate-700">4285630</span> &nbsp;•&nbsp;
              New Visit: <span className="font-medium text-slate-700">805</span> &nbsp;•&nbsp;
              ReVisit: <span className="font-medium text-slate-700">1912</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 text-[13px] border-blue-200"
            style={{ color: "var(--blue-text-color)" }}
          >
            <Search className="h-4 w-4" />
            OP Search
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-[13px] border-blue-200"
            style={{ color: "var(--blue-text-color)" }}
          >
            <BarChart3 className="h-4 w-4" />
            OP Statistics
          </Button>
        </div>
      </div>

      {/* Stepper form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <RevisitStepper current={step} />
        <div className="border-t border-slate-100 px-6 py-6">
          {panels[step]}

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            {step > 1 && (
              <Button variant="outline" onClick={goBack} className="gap-1.5 text-[13px] font-medium text-slate-600">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button variant="outline" onClick={clearDraft} className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            <Button
              onClick={goNext}
              className="gap-1.5 text-white text-[13px]"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              {step === 5 ? "Save" : "Save & Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* View and Edit */}
      <div className="mt-4 rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-5">
          <h2 className="mb-4 text-[13.5px] font-semibold">View and Edit</h2>
          <div className="grid grid-cols-4 items-end gap-4">
            <Field label="UHID No">
              <TextField placeholder="Enter UHID number" />
            </Field>
            <Field label="OP No">
              <TextField placeholder="Enter OP number" />
            </Field>
            <Field label="No. Of Records">
              <TextField defaultValue="5" />
            </Field>
            <Button
              variant="outline"
              className="h-9 text-[13px]"
              style={{ color: "var(--blue-text-color)" }}
            >
              Get Details
            </Button>
          </div>
        </div>
      </div>

      {/* View and Print */}
      <div className="my-4">
        <h2 className="mb-3 text-[14.5px] font-semibold">View and Print</h2>
        <DataTable columns={columns} data={MOCK_DATA} />
      </div>
    </div>
  );
}