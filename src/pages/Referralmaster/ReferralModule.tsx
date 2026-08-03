import * as React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField, SelectField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

const DESIGNATIONS = ["Consultant", "General Practitioner", "Surgeon", "Specialist"] as const;

export default function ReferralModule() {
  const navigate = useNavigate();
  const [designation, setDesignation] = React.useState<string>("");

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Referral Master</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Add new referring doctor details
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/referral-master-records")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <UserPlus className="h-4 w-4" />
          View Referral Master
        </Button>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Referral Name" required>
              <TextField placeholder="Enter referral name" />
            </Field>
            <Field label="Designation">
              <SelectField options={DESIGNATIONS} value={designation} onChange={setDesignation} />
            </Field>

            <Field label="Hospital Name" required>
              <TextField placeholder="Enter hospital name" />
            </Field>
            <Field label="Contact No" required>
              <TextField placeholder="Enter contact number" />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            <Button
              onClick={() => {
                notify.saveSuccess("Record saved successfully.");
                navigate("/referral-master-records");
              }}
              className="text-white text-[13px] cursor-pointer"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Save Referral
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}