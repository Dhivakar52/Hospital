import * as React from "react";
import { UsersRound, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/Stepper";
import  RegisteredPatientsTable  from "./RegisteredPatientsTable";
import { StepPatientDetails, StepAddressContact, StepInsuranceDetails, StepAdditionalInformation } from "./StepPanels";
import { toast } from "sonner";

type StepKey = 1 | 2 | 3 | 4;

export type RegistrationDraft = {
  mobile: string;
  patientName: string;
  title: string;
  fhwo: string;
  email: string;
  area: string;
  city: string;
  department: string;
};

const emptyDraft: RegistrationDraft = {
  mobile: "",
  patientName: "",
  title: "",
  fhwo: "",
  email: "",
  area: "",
  city: "",
  department: "",
};

export default function Registration() {
  const [step, setStep] = React.useState<StepKey>(1);
  const [draft, setDraft] = React.useState<RegistrationDraft>(emptyDraft);
  const [savedPatient, setSavedPatient] = React.useState<RegistrationDraft | null>(null);

  const updateDraft = (field: keyof RegistrationDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const goNext = () => {
    if (step < 4) {
      setStep((current) => (current + 1) as StepKey);
      return;
    }

    if (!draft.patientName.trim() || !draft.mobile.trim()) {
      toast.error("Patient name and mobile number are required.");
      setStep(1);
      return;
    }

    setSavedPatient(draft);
    setDraft(emptyDraft);
    setStep(1);
    toast.success("Patient registered successfully.");
  };
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepKey) : s));
  const clearDraft = () => {
    setDraft(emptyDraft);
    toast.info("Registration form cleared.");
  };

  const panels: Record<StepKey, React.ReactNode> = {
    1: <StepPatientDetails data={draft} onChange={updateDraft} />,
    2: <StepAddressContact data={draft} onChange={updateDraft} />,
    3: <StepInsuranceDetails />,
    4: <StepAdditionalInformation data={draft} onChange={updateDraft} />,
  };

  return (
    <div>
     <div className="mb-5 flex items-center justify-between">
  {/* Left Side */}
  <div className="flex items-center gap-3">
    <div
      className="flex h-12 w-12 items-center justify-center rounded-lg"
      style={{
        background: "var(--side-menu)",
        color: "var(--blue-text-color)",
      }}
    >
      <UsersRound className="h-5 w-5" />
    </div>

    <div>
      <h1 className="text-[17px] font-semibold">
        Patient Registration
      </h1>
      <p className="text-[12.5px] text-muted-foreground">
        Register new patient details and manage information
      </p>
    </div>
  </div>

  {/* Right Side Buttons */}
  <div className="flex items-center gap-3">
    <Button
      variant="outline"
      className="gap-2 text-[13px] border-blue-200 "
      style={
        {
          color:"var(--blue-text-color)"
        }
      }
    >
      <BarChart3 className="h-4 w-4" />
      OP Statistics
    </Button>

    <Button
      className="gap-2 text-[13px] text-white hover:opacity-90"
      style={{ background: "var(--blue-btn)" }}
    >
      <UsersRound className="h-4 w-4" />
      View Registered Patients
    </Button>
  </div>
</div>

      <div className="rounded-md border border-slate-200"
      style={
        {
            background :"var(--background)"
        }
      }>
        <Stepper current={step} />
        <div className=" border-t border-slate-100 px-6 py-6">
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
            <Button onClick={goNext} className="gap-1.5 text-white text-[13px] " style={{ background: "var(--blue-btn)" , padding: "18px 18px",borderRadius: "8px" }}>
              {step === 4 ? "Register Patient" : "Save & Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
   
      <div className="my-4">
            <RegisteredPatientsTable newPatient={savedPatient} />
      </div>
      
    </div>
  );
}
