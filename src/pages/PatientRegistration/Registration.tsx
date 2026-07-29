import * as React from "react";
import { UsersRound, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/Stepper";
import  RegisteredPatientsTable  from "./RegisteredPatientsTable";
import { StepPatientDetails, StepAddressContact, StepInsuranceDetails, StepAdditionalInformation } from "./StepPanels";

type StepKey = 1 | 2 | 3 | 4;

const STEP_PANELS: Record<StepKey, React.ReactNode> = {
  1: <StepPatientDetails />,
  2: <StepAddressContact />,
  3: <StepInsuranceDetails />,
  4: <StepAdditionalInformation />,
};

export default function Registration() {
  const [step, setStep] = React.useState<StepKey>(1);

  const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as StepKey) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepKey) : s));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={
            {
                background:"var(--side-menu)",color:"var(--blue-text-color)"
            }
          }>
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-foreground">Patient Registration</h1>
            <p className="text-[12.5px] text-muted-foreground">Register new patient details and manage information</p>
          </div>
        </div>
        <Button className="gap-2  text-[13px] text-white hover:bg-indigo-700" style={{ background: "var(--blue-btn)" , padding: "18px 18px" }}>
          <BarChart3 className="h-3.5 w-3.5" /> 
          OP Statistics
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200"
      style={
        {
            background :"var(--background)"
        }
      }>
        <Stepper current={step} />
        <div className=" border-t border-slate-100 px-6 py-6">
          {STEP_PANELS[step]}

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            {step > 1 && (
              <Button variant="outline" onClick={goBack} className="gap-1.5 text-[13px] font-medium text-slate-600">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button variant="outline" className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            <Button onClick={goNext} className="gap-1.5 text-white text-[13px] " style={{ background: "var(--blue-btn)" , padding: "18px 18px",borderRadius: "8px" }}>
              Save & Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
   
      <div className="my-4">
            <RegisteredPatientsTable />
      </div>
      
    </div>
  );
}