import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

export default function HospitalModule() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Hospital Master</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Register referring hospital details
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/hospital-master-records")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Building2 className="h-4 w-4" />
          View Hospital Master Records
        </Button>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Hospital Name" required>
              <TextField placeholder="Enter hospital name" />
            </Field>
            <Field label="Area Name">
              <TextField placeholder="Enter area name" />
            </Field>
            <Field label="City Name">
              <TextField placeholder="Enter city name" />
            </Field>

            <Field label="Contact No">
              <TextField placeholder="Enter contact number" />
            </Field>
            <Field label="Pincode">
              <TextField placeholder="Enter pincode" />
            </Field>
            <Field label="District">
              <TextField placeholder="Enter district" />
            </Field>

            <Field label="State">
              <TextField placeholder="Enter state" />
            </Field>
            <Field label="Country">
              <TextField placeholder="Enter country" />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            <Button
              onClick={() => {
                notify.saveSuccess("Record saved successfully.");
                navigate("/hospital-master-records");
              }}
              className="text-white text-[13px] cursor-pointer"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Save Hospital
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}