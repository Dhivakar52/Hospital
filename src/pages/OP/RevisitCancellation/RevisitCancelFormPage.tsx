import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Ban, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

export default function RevisitCancelFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingRecord = (location.state as { record?: any } | null)?.record;

  const [uhid, setUhid] = useState("");
  const [opNo, setOpNo] = useState("");
  const [reason, setReason] = useState("");
  const [patientName, setPatientName] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [contactNo, setContactNo] = useState("");

  useEffect(() => {
    if (!editingRecord) return;

    setUhid(editingRecord.uhidNo || "");
    setOpNo(editingRecord.opNo || "");
    setReason(editingRecord.reason || "");
    setPatientName(editingRecord.patientName ? `${editingRecord.title ? editingRecord.title + ". " : ""}${editingRecord.patientName}` : "");
    setGender(editingRecord.gender || "Male");
    setAddress(editingRecord.address || (editingRecord.area ? `${editingRecord.area}, ${editingRecord.city}` : "Chennai"));
    setContactNo(editingRecord.contactNo || "9840012345");
  }, [editingRecord]);

  const handleGetDetails = () => {
    if (!uhid.trim()) {
      notify.validationError("Please enter UHID number.");
      return;
    }
    setPatientName("NITESH KUMAR");
    setGender("Male");
    setAddress("12, Grand Trunk Road, Vadapalani, Chennai");
    setContactNo("9840012345");
    notify.saveSuccess("Patient details fetched successfully.");
  };

  const handleSubmit = () => {
    if (!uhid.trim() || !reason.trim()) {
      notify.validationError("Please fill all mandatory fields (UHID and Reason).");
      return;
    }

    const savedRecord = {
      uhidNo: uhid.trim(),
      opNo: opNo.trim() || "N/A",
      revisitNo: editingRecord?.revisitNo || `REV-${Date.now().toString().slice(-6)}`,
      patientName: patientName.trim() || "Cancelled Patient",
      gender: gender || "N/A",
      address: address || "N/A",
      contactNo: contactNo || "N/A",
      reason: reason.trim(),
      cancelledDate: new Date().toLocaleDateString("en-GB"),
      status: "cancelled",
    };

    notify.saveSuccess("Revisit cancelled successfully.");
    navigate("/revisit-records", {
      state: {
        cancelledRecord: savedRecord,
      },
    });
  };

  const handleClear = () => {
    setUhid("");
    setOpNo("");
    setReason("");
    setPatientName("");
    setGender("");
    setAddress("");
    setContactNo("");
  };

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
            <h1 className="text-[17px] font-semibold">Revisit Cancellation</h1>
            <p className="text-[12.5px] text-muted-foreground">
              Manage revisit cancellation records
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/revisit-records")}
          className="gap-2 text-[13px] border-slate-300 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Revisit List
        </Button>
      </div>

      {/* Form Card */}
      <div className="rounded-md border border-slate-200 bg-white" style={{ background: "var(--background)" }}>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 items-end gap-4">
            <Field label="UHID No" required>
              <TextField placeholder="Enter UHID number" value={uhid} onChange={setUhid} />
            </Field>
            <Field label="OP">
              <TextField placeholder="Enter OP number" value={opNo} onChange={setOpNo} />
            </Field>
            <Button
              variant="outline"
              onClick={handleGetDetails}
              className="h-9 text-[13px] w-28 cursor-pointer"
              style={{ background: "var(--blue-btn)", color: "white" }}
            >
              Get Details
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <Field label="Patient Name">
              <TextField disabled value={patientName} placeholder="—" />
            </Field>
            <Field label="Gender">
              <TextField disabled value={gender} placeholder="—" />
            </Field>
            <Field label="Address">
              <textarea
                readOnly
                rows={2}
                value={address}
                placeholder="—"
                className="w-full resize-none rounded-[4px] border border-input bg-slate-50 px-3 py-2 text-[13px] text-slate-500 outline-none"
              />
            </Field>

            <Field label="FH Name">
              <TextField disabled placeholder="—" />
            </Field>
            <Field label="Contact No">
              <TextField disabled value={contactNo} placeholder="—" />
            </Field>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <Field label="Reason for Cancel" required>
              <TextField
                placeholder="Enter reason for cancellation"
                value={reason}
                onChange={setReason}
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" onClick={handleClear} className="text-[13px] h-10 w-28 font-medium text-slate-600 cursor-pointer">
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              className="text-white text-[13px] cursor-pointer h-10 w-36"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
