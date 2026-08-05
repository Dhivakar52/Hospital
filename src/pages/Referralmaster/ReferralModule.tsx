import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField, SelectField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

const DESIGNATIONS = ["Consultant", "General Practitioner", "Surgeon", "Specialist"] as const;

export default function ReferralModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingRecord = (location.state as { record?: any } | null)?.record;

  const [referralName, setReferralName] = React.useState("");
  const [designation, setDesignation] = React.useState<string>("");
  const [hospitalName, setHospitalName] = React.useState("");
  const [contactNo, setContactNo] = React.useState("");

  React.useEffect(() => {
    if (!editingRecord) return;

    setReferralName(editingRecord.referralName || "");
    setDesignation(editingRecord.designation || "");
    setHospitalName(editingRecord.hospitalName || "");
    setContactNo(editingRecord.contactNo || "");
  }, [editingRecord]);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Referral Master</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Manage referral information
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/referral-master-records")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Network className="h-4 w-4" />
          View Referral Master
        </Button>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-slate-200" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Referral Name" required>
              <TextField placeholder="Enter referral name" value={referralName} onChange={setReferralName} />
            </Field>
            <Field label="Designation">
              <SelectField options={DESIGNATIONS} value={designation} onChange={setDesignation} />
            </Field>

            <Field label="Hospital Name" required>
              <TextField placeholder="Enter hospital name" value={hospitalName} onChange={setHospitalName} />
            </Field>
            <Field label="Contact No" required>
              <TextField placeholder="Enter contact number" value={contactNo} onChange={setContactNo} />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button
              variant="outline"
              className="h-10 w-28 text-[13px] font-medium text-slate-600"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                const updatedRecord = {
                  referralName: referralName.trim() || "New Referral",
                  designation: designation || "Consultant",
                  hospitalName: hospitalName.trim() || "N/A",
                  contactNo: contactNo.trim() || "N/A",
                };

                notify.saveSuccess(editingRecord ? "Record updated successfully." : "Record saved successfully.");
                navigate("/referral-master-records", {
                  state: {
                    ...(editingRecord
                      ? { editedRecord: updatedRecord, originalReferralName: editingRecord.referralName }
                      : { newRecord: updatedRecord }),
                  },
                });
              }}
              className="h-10 w-28 cursor-pointer text-[13px] text-white"
              style={{ background: "var(--blue-btn)", borderRadius: "8px" }}
            >
              {editingRecord ? "Update Referral" : "Save Referral"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}