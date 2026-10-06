import { useNavigate, useLocation } from "react-router-dom";
import { FhirParsedViewer } from "./FhirParsedViewer";
import viewJsonData from "@/data/view.json";

export default function FhirViewerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { consentDetails?: any; returnUrl?: string; backLabel?: string } | null;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <FhirParsedViewer
        onBack={() => navigate(state?.returnUrl || "/consent")}
        initialData={state?.consentDetails ? viewJsonData : null}
        consentDetails={state?.consentDetails}
        backLabel={state?.backLabel || (state?.returnUrl ? "Back" : "Back to Consent")}
      />
    </div>
  );
}
