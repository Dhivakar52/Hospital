import { useNavigate } from "react-router-dom";
import { FhirParsedViewer } from "./FhirParsedViewer";

export default function FhirViewerPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <FhirParsedViewer onBack={() => navigate("/consent")} initialData={null} />
    </div>
  );
}
