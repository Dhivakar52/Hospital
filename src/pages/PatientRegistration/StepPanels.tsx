import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextField, SelectField, DateField } from "./FormPrimitives";
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
  cityTown: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Kanchipuram"],
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-5">
      <Field label="Dr. App. Ref No">
        <TextField placeholder="Enter reference number" />
      </Field>
      <Field label="Mobile No" required>
        <TextField placeholder="Enter mobile number" value={data.mobile} onChange={(value) => onChange("mobile", value)} />
      </Field>
      <Field label="UHID No">
        <TextField placeholder="Auto Generate" disabled />
      </Field>
      <Field label="OP No">
        <TextField placeholder="Auto Generate" disabled />
      </Field>

      <Field label="Patient Name" required>
        <TextField placeholder="Enter patient name" value={data.patientName} onChange={(value) => onChange("patientName", value)} />
      </Field>
      <Field label="Title">
        <SelectField options={OPTIONS.title} value={data.title} onChange={(value) => onChange("title", value)} />
      </Field>
      <Field label="Gender">
        <SelectField options={OPTIONS.gender} />
      </Field>
      <Field label="DOB">
        <DateField />
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
        <SelectField options={OPTIONS.maritalStatus} />
      </Field>
      <Field label="Blood Group">
        <SelectField options={OPTIONS.bloodGroup} />
      </Field>

      <Field label="Religion">
        <SelectField options={OPTIONS.religion} />
      </Field>
      <Field label="Nationality">
        <SelectField options={OPTIONS.nationality} />
      </Field>
      <Field label="Contact No 1">
        <TextField placeholder="Enter contact number" />
      </Field>
      <Field label="Contact No 2">
        <TextField placeholder="Enter alternative number" />
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
        <DateField defaultLabel="28-07-2026 04:40 PM" />
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
        <TextField placeholder="Enter door no" />
      </Field>
      <Field label="Building Name">
        <TextField placeholder="Enter building name" />
      </Field>
      <Field label="Street">
        <TextField placeholder="Enter street" />
      </Field>
      <Field label="Area">
        <TextField placeholder="Enter area" value={data.area} onChange={(value) => onChange("area", value)} />
      </Field>

      <Field label="City / Town">
        <SelectField options={OPTIONS.cityTown} value={data.city} onChange={(value) => onChange("city", value)} />
      </Field>
      <Field label="State">
        <SelectField options={OPTIONS.state} />
      </Field>
      <Field label="Country">
        <SelectField options={OPTIONS.country} />
      </Field>
      <Field label="PIN Code">
        <TextField placeholder="Enter pin code" />
      </Field>
    </div>
    </>
  );
}

export function StepInsuranceDetails() {
  return (
    <div className="grid grid-cols-4 gap-x-5 gap-y-5">
      <Field label="Patient Category">
        <SelectField options={OPTIONS.patientCategory} />
      </Field>
      <Field label="Sub Category">
        <SelectField options={OPTIONS.subCategory} />
      </Field>
      <Field label="Corporate Company">
        <SelectField options={OPTIONS.corporateCompany} />
      </Field>
      <Field label="Insurance Company">
        <SelectField options={OPTIONS.insuranceCompany} />
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
        <SelectField options={OPTIONS.billType} />
      </Field>
      <Field label="Pay Type">
        <SelectField options={OPTIONS.payType} />
      </Field>
      <Field label="Mode of Pay">
        <SelectField options={OPTIONS.modeOfPay} />
      </Field>
      <Field label="Bank Name">
        <SelectField options={OPTIONS.bankName} />
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
        <SelectField options={OPTIONS.doctor} />
      </Field>
      <Field label="Unit">
        <SelectField options={OPTIONS.unit} />
      </Field>
      <Field label="COVID Vaccination">
        <TextField />
      </Field>

      <Field label="VIP">
        <SelectField options={OPTIONS.vip} />
      </Field>
      <Field label="Mode of Visit">
        <SelectField options={OPTIONS.modeOfVisit} />
      </Field>
      <Field label="Referred By">
        <TextField />
      </Field>
      <Field label="Reason for Fee">
        <SelectField options={OPTIONS.reasonForFee} />
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
        <SelectField options={OPTIONS.nriRelationship} />
      </Field>
      <Field label="NRI Contact No">
        <TextField />
      </Field>
    </div>
  );
}
