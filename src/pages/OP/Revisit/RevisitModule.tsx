import * as React from "react";
import { RotateCcw, CalendarClock, Search, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevisitStepper } from "./Revisitstepper";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import { toast } from "@/components/ui/toast";
import { notify } from "@/lib/notify";
import { useLocation, useNavigate } from "react-router-dom";

type StepKey = 1 | 2 | 3 | 4 | 5;

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
  const navigate = useNavigate();
  const location = useLocation();
  const editingRecord = (location.state as { record?: any } | null)?.record;

  const [step, setStep] = React.useState<StepKey>(1);
  const [insurance, setInsurance] = React.useState<"No" | "Yes">("No");
  const [payType, setPayType] = React.useState<"Paid" | "Free">("Paid");
  const [modeOfVisit, setModeOfVisit] = React.useState<"Walk-In" | "Ambulance">("Walk-In");
  const [vip, setVip] = React.useState(false);
  const [uhidNo, setUhidNo] = React.useState("");
  const [patientName, setPatientName] = React.useState("");
  const [contactNo1, setContactNo1] = React.useState("");

  React.useEffect(() => {
    if (!editingRecord) return;

    setUhidNo(editingRecord.uhidNo || "");
    setPatientName(editingRecord.patientName || "");
    setContactNo1(editingRecord.contactNo1 || "");
  }, [editingRecord]);

  const goNext = () => {
    if (step < 5) {
      setStep((s) => (s + 1) as StepKey);
      return;
    }

    const updatedRecord = {
      uhidNo: uhidNo.trim() || `UH-${Date.now().toString().slice(-6)}`,
      opNo: `OP-${Date.now().toString().slice(-6)}`,
      title: TITLES[0],
      patientName: patientName.trim() || "New Revisit Patient",
      fhwo: "Self",
      area: "N/A",
      city: "N/A",
      department: DEPARTMENTS[0],
    };

    notify.saveSuccess(editingRecord ? "Record updated successfully." : "Record saved successfully.");
    setStep(1);
    navigate("/revisit-records", {
      state: editingRecord
        ? { editedRecord: updatedRecord, originalUhidNo: editingRecord.uhidNo, originalOpNo: editingRecord.opNo }
        : { newRecord: updatedRecord },
    });
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepKey) : s));

  const clearDraft = () => {
    setStep(1);
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
      <Field label="UHID No">
        <TextField placeholder="Enter UHID number" value={uhidNo} onChange={setUhidNo} />
      </Field>
       <Field label="Visit Count">
        <TextField disabled placeholder="—" />
      </Field>
      <Button
        variant="outline"
        className="h-9 text-[13px]  w-[30%]"
        style={{
                  background: "var(--blue-btn)",
                  color: "white",
                  borderColor: "var(--blue-btn)",
                }}
      >
        Get Details
      </Button>
     
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
      <Field label="Contact No-I">
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
          className="w-full resize-none rounded-lg border border-input px-3 py-2 text-[13px] outline-none focus:border-slate-400 focus:bg-white"
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
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Revisit</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage patient revisit records
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
            onClick={() => navigate("/revisit-records")}
            className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
            style={{ background: "var(--blue-btn)" }}
          >
            <CalendarClock className="h-4 w-4" />
            View Revisit Records
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
              <Button
                variant="outline"
                onClick={goBack}
                className="h-9 min-w-30 gap-1.5 text-[13px] font-medium text-slate-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={clearDraft}
              className="h-9 min-w-30 text-[13px] font-medium text-slate-600"
            >
              Clear
            </Button>
            <Button
              onClick={goNext}
              className="h-9 min-w-30 gap-1.5 text-white text-[13px]"
              style={{ background: "var(--blue-btn)", borderRadius: "8px" }}
            >
              {step === 5 ? (editingRecord ? "Update" : "Save") : "Save & Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}