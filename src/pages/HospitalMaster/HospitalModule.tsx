import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";

export default function HospitalModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingRecord = (location.state as { record?: any } | null)?.record;

  const [hospital, setHospital] = useState("");
  const [areaName, setAreaName] = useState("");
  const [cityName, setCityName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [pincode, setPincode] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!editingRecord) return;

    setHospital(editingRecord.hospital || "");
    setAreaName(editingRecord.areaName || "");
    setCityName(editingRecord.cityName || "");
    setContactNo(editingRecord.contactNo || "");
    setPincode(editingRecord.pincode || "");
    setDistrict(editingRecord.district || "");
    setState(editingRecord.state || "");
    setCountry(editingRecord.country || "");
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
              <TextField placeholder="Enter hospital name" value={hospital} onChange={setHospital} />
            </Field>
            <Field label="Area Name">
              <TextField placeholder="Enter area name" value={areaName} onChange={setAreaName} />
            </Field>
            <Field label="City Name">
              <TextField placeholder="Enter city name" value={cityName} onChange={setCityName} />
            </Field>

            <Field label="Contact No">
              <TextField placeholder="Enter contact number" value={contactNo} onChange={setContactNo} />
            </Field>
            <Field label="Pincode">
              <TextField placeholder="Enter pincode" value={pincode} onChange={setPincode} />
            </Field>
            <Field label="District">
              <TextField placeholder="Enter district" value={district} onChange={setDistrict} />
            </Field>

            <Field label="State">
              <TextField placeholder="Enter state" value={state} onChange={setState} />
            </Field>
            <Field label="Country">
              <TextField placeholder="Enter country" value={country} onChange={setCountry} />
            </Field>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <Button variant="outline" className="text-[13px] h-10 w-28 font-medium text-slate-600">
              Clear
            </Button>
            <Button
              onClick={() => {
                const updatedRecord = {
                  hospital: hospital.trim() || "New Hospital",
                  areaName: areaName.trim() || "N/A",
                  cityName: cityName.trim() || "N/A",
                  contactNo: contactNo.trim() || "N/A",
                  state: state.trim() || "Tamil Nadu",
                  pincode,
                  district,
                  country,
                };

                notify.saveSuccess(editingRecord ? "Record updated successfully." : "Record saved successfully.");
                navigate("/hospital-master-records", {
                  state: {
                    ...(editingRecord ? { editedRecord: updatedRecord, originalHospital: editingRecord.hospital } : { newRecord: updatedRecord }),
                  },
                });
              }}
              className="text-white h-10 w-28 text-[13px] cursor-pointer"
              style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
            >
              {editingRecord ? "Update Hospital" : "Save Hospital"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}