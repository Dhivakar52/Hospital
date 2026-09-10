import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import type { RegistrationDraft } from "./Registration";

type DraftPanelProps = {
  data: RegistrationDraft;
  onChange: (field: keyof RegistrationDraft, value: string) => void;
};

const OPTIONS = {
  title: ["Mr", "Mrs", "Ms", "Master", "Baby", "Dr"],
  gender: ["Male", "Female", "Other"],
  maritalStatus: ["Single", "Married", "Widowed", "Divorced"],
  bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  religion: ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"],
  nationality: ["Indian", "Other"],
  cityTown: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Kanchipuram", "Maraimalainagar", "Chengalpattu", "Tambaram"],
  state: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"],
  country: ["India", "Sri Lanka", "United Arab Emirates", "Other"],
  patientCategory: ["General", "Corporate", "Insurance", "Staff", "Senior Citizen"],
  subCategory: ["Employee", "Dependent", "Retiree"],
  corporateCompany: ["TCS", "Infosys", "Wipro", "HCL Technologies", "Cognizant"],
  insuranceCompany: ["Star Health", "ICICI Lombard", "HDFC Ergo", "United India Insurance", "New India Assurance"],
  billType: ["Cash", "Credit", "Insurance"],
  payType: ["Full Payment", "Partial Payment"],
  modeOfPay: ["Cash", "Card", "UPI", "Net Banking"],
  bankName: ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Indian Bank"],
  department: ["Neurology", "Cardiology", "Orthopedics", "General Medicine", "Pediatrics", "ENT"],
  doctor: ["Dr. Ramesh Kumar", "Dr. Priya Sharma", "Dr. Anitha Raj", "Dr. Suresh Babu"],
  unit: ["Unit 1", "Unit 2", "Unit 3"],
  vip: ["Yes", "No"],
  modeOfVisit: ["Walk-in", "Referral", "Online", "Emergency"],
  reasonForFee: ["Consultation", "Follow-up", "Emergency", "Procedure"],
  nriRelationship: ["Self", "Spouse", "Child", "Parent", "Sibling"],
} as const;

export function StepPatientDetails({ data, onChange }: DraftPanelProps) {
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-3">
      <Field label="Dr. App. Ref No">
        <TextField placeholder="Enter reference number" />
      </Field>
      <Field label="Mobile No" required>
        <TextField placeholder="Enter mobile number" value={data.mobile} onChange={(value) => onChange("mobile", value)} />
      </Field>
      <Field label="UHID No">
        <TextField placeholder="Auto Generate" value={data.uhidNo} disabled />
      </Field>
      <Field label="OP No">
        <TextField placeholder="Auto Generate" value={data.opNo} disabled />
      </Field>

      <Field label="Patient Name" required>
        <TextField placeholder="Enter patient name" value={data.patientName} onChange={(value) => onChange("patientName", value)} />
      </Field>
      <Field label="Title">
        <SelectField options={OPTIONS.title} value={data.title} onChange={(value) => onChange("title", value)} />
      </Field>
      <Field label="Gender">
        <SelectField options={OPTIONS.gender} value={data.gender} onChange={(value) => onChange("gender", value)} />
      </Field>
      <Field label="DOB">
        <DateField
          value={data.dob ? new Date(`${data.dob}T00:00:00`) : undefined}
          onChange={(date) => onChange("dob", date ? format(date, "yyyy-MM-dd") : "")}
        />
      </Field>

      <Field label="Age / Month / Day">
        <div className="grid grid-cols-3 gap-2">
          <TextField />
          <TextField />
          <TextField />
        </div>
      </Field>
      <Field label="Father / Husband / Wife Name">
        <TextField placeholder="Enter Father / Wife name" value={data.fhwo} onChange={(value) => onChange("fhwo", value)} />
      </Field>
      <Field label="Marital Status">
        <SelectField options={OPTIONS.maritalStatus} value={data.maritalStatus} onChange={(value) => onChange("maritalStatus", value)} />
      </Field>
      <Field label="Blood Group">
        <SelectField options={OPTIONS.bloodGroup} value={data.bloodGroup} onChange={(value) => onChange("bloodGroup", value)} />
      </Field>

      <Field label="Religion">
        <SelectField options={OPTIONS.religion} value={data.religion} onChange={(value) => onChange("religion", value)} />
      </Field>
      <Field label="Nationality">
        <SelectField options={OPTIONS.nationality} value={data.nationality} onChange={(value) => onChange("nationality", value)} />
      </Field>
      <Field label="Contact No 1">
        <TextField placeholder="Enter contact number" value={data.contactNo1} onChange={(value) => onChange("contactNo1", value)} />
      </Field>
      <Field label="Contact No 2">
        <TextField placeholder="Enter alternative number" value={data.contactNo2} onChange={(value) => onChange("contactNo2", value)} />
      </Field>

      
      <div />
      <div />

     
    </div>
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-5">
      <Field label="Email">
        <TextField placeholder="Enter email" value={data.email} onChange={(value) => onChange("email", value)} />
      </Field>

      <Field label="ABHA ID">
  <div className="relative flex items-center">
    <TextField 
      placeholder="Enter ABHA ID" 
    />
    <Button
      variant="link"
      className="absolute right-2  gap-1 bg-background whitespace-nowrap p-0 text-[8px] font-medium"
      style={{
        color:"var(--blue-text-color)",
       
      }}
    >
      Create ABHA ID
      <ExternalLink className="size-2.5" />
    </Button>
  </div>
</Field>
      <Field label="Reg Date">
        <DateField
          defaultLabel="28-07-2026 04:40 PM"
          value={data.registrationDate ? new Date(`${data.registrationDate}T00:00:00`) : undefined}
          onChange={(date) => onChange("registrationDate", date ? format(date, "yyyy-MM-dd") : "")}
        />
      </Field>

       
      <div />
      <div />

     
    </div>
    </>
  );
}

export function StepAddressContact({ data, onChange }: DraftPanelProps) {
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-5">
      <Field label="Door No">
        <TextField placeholder="Enter door no" value={data.doorNo} onChange={(value) => onChange("doorNo", value)} />
      </Field>
      <Field label="Building Name">
        <TextField placeholder="Enter building name" value={data.buildingName} onChange={(value) => onChange("buildingName", value)} />
      </Field>
      <Field label="Street">
        <TextField placeholder="Enter street" value={data.street} onChange={(value) => onChange("street", value)} />
      </Field>
      <Field label="Area">
        <TextField placeholder="Enter area" value={data.area} onChange={(value) => onChange("area", value)} />
      </Field>

      <Field label="City / Town">
        <SelectField options={OPTIONS.cityTown} value={data.city} onChange={(value) => onChange("city", value)} />
      </Field>
      <Field label="State">
        <SelectField options={OPTIONS.state} value={data.state} onChange={(value) => onChange("state", value)} />
      </Field>
      <Field label="Country">
        <SelectField options={OPTIONS.country} value={data.country} onChange={(value) => onChange("country", value)} />
      </Field>
      <Field label="PIN Code">
        <TextField placeholder="Enter pin code" value={data.pincode} onChange={(value) => onChange("pincode", value)} />
      </Field>
    </div>
    </>
  );
}

export function StepInsuranceDetails({ data, onChange }: DraftPanelProps) {
  return (
    <div className="grid grid-cols-4 gap-x-5 gap-y-5">
      <Field label="Patient Category">
        <SelectField options={OPTIONS.patientCategory} value={data.patientCategory} onChange={(value) => onChange("patientCategory", value)} />
      </Field>
      <Field label="Sub Category">
        <SelectField options={OPTIONS.subCategory} value={data.subCategory} onChange={(value) => onChange("subCategory", value)} />
      </Field>
      <Field label="Corporate Company">
        <SelectField options={OPTIONS.corporateCompany} value={data.corporateCompany} onChange={(value) => onChange("corporateCompany", value)} />
      </Field>
      <Field label="Insurance Company">
        <SelectField options={OPTIONS.insuranceCompany} value={data.insuranceCompany} onChange={(value) => onChange("insuranceCompany", value)} />
      </Field>

      <Field label="Insurance">
        <TextField placeholder="Enter insurance" />
      </Field>
      <Field label="Employee No">
        <TextField placeholder="Enter employee no" />
      </Field>
      <Field label="Card ID No">
        <TextField placeholder="Enter card id number" />
      </Field>
      <Field label="Comprehensive OPD Type">
        <TextField placeholder="No" disabled />
      </Field>

      <Field label="Bill Type">
        <SelectField options={OPTIONS.billType} value={data.billType} onChange={(value) => onChange("billType", value)} />
      </Field>
      <Field label="Pay Type">
        <SelectField options={OPTIONS.payType} value={data.payType} onChange={(value) => onChange("payType", value)} />
      </Field>
      <Field label="Mode of Pay">
        <SelectField options={OPTIONS.modeOfPay} value={data.modeOfPay} onChange={(value) => onChange("modeOfPay", value)} />
      </Field>
      <Field label="Bank Name">
        <SelectField options={OPTIONS.bankName} value={data.bankName} onChange={(value) => onChange("bankName", value)} />
      </Field>

      <Field label="Net Reg Fee">
        <TextField defaultValue="0" />
      </Field>
      <Field label="Reg Fee">
        <TextField defaultValue="0" />
      </Field>
    </div>
  );
}

export function StepAdditionalInformation({ data, onChange }: DraftPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-5">
      <Field label="Department">
        <SelectField options={OPTIONS.department} value={data.department} onChange={(value) => onChange("department", value)} />
      </Field>
      <Field label="Doctor">
        <SelectField options={OPTIONS.doctor} value={data.doctor} onChange={(value) => onChange("doctor", value)} />
      </Field>
      <Field label="Unit">
        <SelectField options={OPTIONS.unit} value={data.unit} onChange={(value) => onChange("unit", value)} />
      </Field>
      <Field label="COVID Vaccination">
        <TextField />
      </Field>

      <Field label="VIP">
        <SelectField options={OPTIONS.vip} value={data.vip} onChange={(value) => onChange("vip", value)} />
      </Field>
      <Field label="Mode of Visit">
        <SelectField options={OPTIONS.modeOfVisit} value={data.modeOfVisit} onChange={(value) => onChange("modeOfVisit", value)} />
      </Field>
      <Field label="Referred By">
        <TextField />
      </Field>
      <Field label="Reason for Fee">
        <SelectField options={OPTIONS.reasonForFee} value={data.reasonForFee} onChange={(value) => onChange("reasonForFee", value)} />
      </Field>

      <Field label="Disc %">
        <TextField />
      </Field>
      <Field label="KIN Name">
        <TextField />
      </Field>
      <Field label="KIN Relationship">
        <TextField />
      </Field>
      <Field label="KIN Contact No">
        <TextField />
      </Field>

      <Field label="NRI Relationship">
        <SelectField options={OPTIONS.nriRelationship} value={data.nriRelationship} onChange={(value) => onChange("nriRelationship", value)} />
      </Field>
      <Field label="NRI Contact No">
        <TextField />
      </Field>
    </div>
  );
}
