export type Patient = {
  id: string
  opNo: string
  title: string
  patientName: string
  fhwo: string
  area: string
  city: string
  department: string
  registrationDate: string
  email?: string
  phone?: string
  // Step 1: Patient Details
  drAppRefNo?: string
  gender?: string
  dob?: string
  age?: number | string
  ageMonths?: number | string
  ageDays?: number | string
  bloodGroup?: string
  maritalStatus?: string
  religion?: string
  nationality?: string
  contactNo1?: string
  contactNo2?: string
  abhaId?: string

  // Step 2: Address & Contact
  doorNo?: string
  buildingName?: string
  street?: string
  address?: string
  state?: string
  pincode?: string
  country?: string

  // Step 3: Insurance Details
  patientCategory?: string
  subCategory?: string
  corporateCompany?: string
  insuranceCompany?: string
  insuranceName?: string
  employeeNo?: string
  cardIdNo?: string
  comprehensiveOpdType?: string
  billType?: string
  payType?: string
  modeOfPay?: string
  bankName?: string
  netRegFee?: string
  regFee?: string

  // Step 4: Additional Information
  doctor?: string
  unit?: string
  covidVaccination?: string
  vip?: string
  modeOfVisit?: string
  referredBy?: string
  reasonForFee?: string
  discountPercent?: string
  kinName?: string
  kinRelationship?: string
  kinContactNo?: string
  nriRelationship?: string
  nriContactNo?: string

  // System & hospital status
  registrationType?: string
  facility?: string
  status?: string
  emergencyContact?: string
}

export type PatientFormData = Omit<Patient, 'id'>

// Helper to resolve complete patient display values with smart fallbacks
export function resolvePatientDetails(patient: Patient) {
  const gender = patient.gender || (
    patient.title === "Mr" ? "Male" :
    patient.title === "Mrs" || patient.title === "Ms" ? "Female" : "Other"
  );

  // Generate stable mock DOB and age based on ID if missing
  const idNum = parseInt(patient.id.replace(/\D/g, "") || "1990", 10);
  const birthYear = 1950 + (idNum % 50);
  const birthMonth = String((idNum % 12) + 1).padStart(2, "0");
  const birthDay = String((idNum % 28) + 1).padStart(2, "0");
  const dob = patient.dob || `${birthYear}-${birthMonth}-${birthDay}`;
  const currentYear = new Date().getFullYear();
  const age = patient.age || (currentYear - birthYear);

  // Address
  const doorNo = patient.doorNo || `No. ${(idNum % 120) + 1}`;
  const buildingName = patient.buildingName || "Sai Residency";
  const street = patient.street || `${patient.area} Main Road`;
  const address = patient.address || `${doorNo}, ${buildingName}, ${street}, ${patient.area}, ${patient.city}`;
  const state = patient.state || "Tamil Nadu";
  const pincode = patient.pincode || `603${String((idNum % 899) + 100)}`;
  const country = patient.country || "India";

  // Patient Details
  const drAppRefNo = patient.drAppRefNo || `REF-${idNum + 1000}`;
  const religion = patient.religion || "Hindu";
  const nationality = patient.nationality || "Indian";
  const contactNo1 = patient.contactNo1 || patient.phone || "+91 98765-43210";
  const contactNo2 = patient.contactNo2 || "+91 94440-12345";
  const abhaId = patient.abhaId || `91-${(idNum % 900) + 100}4-2984-${(idNum % 8999) + 1000}`;
  const ageMonths = patient.ageMonths || ((idNum % 11) + 1);
  const ageDays = patient.ageDays || ((idNum % 27) + 1);

  // Insurance Details
  const patientCategory = patient.patientCategory || "General";
  const subCategory = patient.subCategory || "Employee";
  const corporateCompany = patient.corporateCompany || "TCS";
  const insuranceCompany = patient.insuranceCompany || "Star Health";
  const insuranceName = patient.insuranceName || "Family Health Optima Insurance";
  const employeeNo = patient.employeeNo || `EMP-${idNum + 500}`;
  const cardIdNo = patient.cardIdNo || `CRD-${idNum + 8000}`;
  const comprehensiveOpdType = patient.comprehensiveOpdType || "No";
  const billType = patient.billType || "Cash";
  const payType = patient.payType || "Full Payment";
  const modeOfPay = patient.modeOfPay || "Cash";
  const bankName = patient.bankName || "State Bank of India";
  const netRegFee = patient.netRegFee || "₹ 200";
  const regFee = patient.regFee || "₹ 200";

  // Additional Information
  const doctor = patient.doctor || (
    patient.department === "Cardiology" ? "Dr. Ramesh Kumar" :
    patient.department === "Neurology" ? "Dr. Priya Sharma" :
    patient.department === "Orthopedics" ? "Dr. Suresh Babu" : "Dr. Anitha Raj"
  );
  const unit = patient.unit || "Unit 1";
  const covidVaccination = patient.covidVaccination || "Completed (2 Doses)";
  const vip = patient.vip || "No";
  const modeOfVisit = patient.modeOfVisit || "Walk-in";
  const referredBy = patient.referredBy || "Self";
  const reasonForFee = patient.reasonForFee || "Consultation";
  const discountPercent = patient.discountPercent || "0%";
  const kinName = patient.kinName || patient.fhwo || "Guardian";
  const kinRelationship = patient.kinRelationship || "Father";
  const emergencyContact = patient.emergencyContact || (patient.phone ? patient.phone.replace(/\d{2}$/, "99") : "+91 98765-00000");
  const kinContactNo = patient.kinContactNo || emergencyContact;
  const nriRelationship = patient.nriRelationship || "Self";
  const nriContactNo = patient.nriContactNo || "N/A";

  const registrationType = patient.registrationType || "Outpatient (OP)";
  const facility = patient.facility || "City General Hospital & Medical Institute";
  const status = patient.status || "Active";
  const bloodGroup = patient.bloodGroup || ["O+", "A+", "B+", "AB+", "O-", "A-"][(idNum % 6)];
  const maritalStatus = patient.maritalStatus || (patient.title === "Mr" || patient.title === "Mrs" ? "Married" : "Single");

  return {
    ...patient,
    drAppRefNo,
    gender,
    dob,
    age,
    ageMonths,
    ageDays,
    religion,
    nationality,
    contactNo1,
    contactNo2,
    abhaId,
    doorNo,
    buildingName,
    street,
    address,
    state,
    pincode,
    country,
    patientCategory,
    subCategory,
    corporateCompany,
    insuranceCompany,
    insuranceName,
    employeeNo,
    cardIdNo,
    comprehensiveOpdType,
    billType,
    payType,
    modeOfPay,
    bankName,
    netRegFee,
    regFee,
    doctor,
    unit,
    covidVaccination,
    vip,
    modeOfVisit,
    referredBy,
    reasonForFee,
    discountPercent,
    kinName,
    kinRelationship,
    kinContactNo,
    nriRelationship,
    nriContactNo,
    registrationType,
    facility,
    status,
    bloodGroup,
    maritalStatus,
    emergencyContact,
  };
}