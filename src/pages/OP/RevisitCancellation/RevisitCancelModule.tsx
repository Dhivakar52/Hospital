import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/FormPrimitives";

export default function RevisitCancelModule() {
  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Ban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">OP Re-Visit Cancellation</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Cancel an existing OP re-visit record
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 items-end gap-4">
            <Field label="UHID No" required>
              <TextField placeholder="Enter UHID number" />
            </Field>
            <Field label="OP">
              <TextField placeholder="Enter OP number" />
            </Field>
            <Button
              variant="outline"
              className="h-9 text-[13px] w-25 "
              style={{ background: "var(--blue-btn)",
                color: "white"
               }}
            >
              Get Details
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <Field label="Patient Name">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Gender">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Address">
              <textarea
                readOnly
                rows={2}
                className="w-full resize-none rounded-[4px] border border-input bg-slate-50 px-3 py-2 text-[13px] text-slate-500 outline-none"
              />
            </Field>

            <Field label="FH Name">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Contact No">
              <TextField disabled placeholder="—" />
            </Field>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <Field label="Reason for Cancel" required>
              <TextField placeholder="Enter reason for cancellation" />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" className="text-[13px] font-medium text-slate-600">
              Clear
            </Button>
            {/* <Button
              className="text-white text-[13px]"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Cancel Visit
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}