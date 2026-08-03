import RegisteredPatientsTable from "./RegisteredPatientsTable";
import { useNavigate } from "react-router-dom";
import { UsersRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisteredPatientsPage() {
  const navigate = useNavigate();

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
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Registered Patients</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage registered patient records
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/op/registration")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Plus className="h-4 w-4" />
          New Registration
        </Button>
      </div>

      <RegisteredPatientsTable />
    </div>
  );
}
