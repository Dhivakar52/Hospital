import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UsersRound, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/Stepper";
import { StepPatientDetails, StepAddressContact, StepInsuranceDetails, StepAdditionalInformation } from "./StepPanels";
import { toast } from "sonner";
import { notify } from "@/lib/notify";
import { OpStatisticsModal } from "@/components/OpStatisticsModal";
import type { Patient } from "@/types/op_register";

type StepKey = 1 | 2 | 3 | 4;

export type RegistrationDraft = {
  uhidNo: string;
  opNo: string;
  registrationDate: string;
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
  uhidNo: "",
  opNo: "",
  registrationDate: "",
  mobile: "",
  patientName: "",
  title: "",
  fhwo: "",
  email: "",
  area: "",
  city: "",
  department: "",
};

type RegistrationLocationState = {
  patient?: Patient;
};

const patientToDraft = (patient: Patient): RegistrationDraft => ({
  uhidNo: patient.id,
  opNo: patient.opNo,
  registrationDate: patient.registrationDate,
  mobile: patient.phone ?? "",
  patientName: patient.patientName,
  title: patient.title,
  fhwo: patient.fhwo,
  email: patient.email ?? "",
  area: patient.area,
  city: patient.city,
  department: patient.department,
});

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingPatient = (location.state as RegistrationLocationState | null)?.patient;
  const [step, setStep] = React.useState<StepKey>(1);
  const [draft, setDraft] = React.useState<RegistrationDraft>(() =>
    editingPatient ? patientToDraft(editingPatient) : emptyDraft
  );
  const [_savedPatient, setSavedPatient] = React.useState<RegistrationDraft | null>(null);
  const [isStatsOpen, setIsStatsOpen] = React.useState(false);

  const updateDraft = (field: keyof RegistrationDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleStepClick = (targetStep: StepKey) => {
    setStep(targetStep);
  };

  const goNext = () => {
    if (step < 4) {
      setStep((current) => (current + 1) as StepKey);
      return;
    }

    if (!draft.patientName.trim() || !draft.mobile.trim()) {
      notify.validationError("Please fill all mandatory fields.");
      setStep(1);
      return;
    }

    setSavedPatient(draft);
    setDraft(emptyDraft);
    setStep(1);
    notify.saveSuccess("Data saved successfully.");
    navigate("/registered-patients");
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
      {/* Header Bar */}
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
              {editingPatient ? "Edit Registered Patient" : "Patient Registration"}
            </h1>
            <p className="text-[12.5px] text-muted-foreground">
              {editingPatient ? "Edit and update registered patient details" : "Register new patient details and manage information"}
            </p>
          </div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsStatsOpen(true)}
            className="gap-2 text-[13px] border-blue-200 cursor-pointer"
            style={{
              color: "var(--blue-text-color)",
            }}
          >
            <BarChart3 className="h-4 w-4" />
            OP Statistics
          </Button>

          <Button
            onClick={() => navigate("/registered-patients")}
            className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
            style={{ background: "var(--blue-btn)" }}
          >
            <UsersRound className="h-4 w-4" />
            View Registered Patients
          </Button>
        </div>
      </div>

      {/* Main Registration / Edit Form Container */}
      <div
        className="rounded-md border border-slate-200 bg-white"
        style={{
          background: "var(--background)",
        }}
      >
        {/* Clickable Stepper Tabs */}
        <Stepper current={step} onStepClick={handleStepClick} />

        {/* Step Panels Content */}
        <div className="border-t border-slate-100 px-6 py-6">
          {panels[step]}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            {step > 1 && (
              <Button variant="outline" onClick={goBack} className="gap-1.5 text-[13px] font-medium text-slate-600 cursor-pointer">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button variant="outline" onClick={clearDraft} className="text-[13px] font-medium text-slate-600 cursor-pointer">
              Clear
            </Button>
            <Button onClick={goNext} className="gap-1.5 text-white text-[13px] cursor-pointer" style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}>
              {step === 4 ? (editingPatient ? "Update Patient" : "Register Patient") : "Save & Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <OpStatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
}
