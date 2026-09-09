// 100 Sample Records Generator for Revisit, Hospital Master, and Referral Master modules

export interface RevisitRow {
  uhidNo: string;
  opNo: string;
  title: string;
  patientName: string;
  fhwo: string;
  area: string;
  city: string;
  department: string;
}

export interface HospitalRow {
  hospital: string;
  streetName?: string;
  areaName: string;
  cityName: string;
  contactNo: string;
  state: string;
}

export interface ReferralRow {
  referralName: string;
  designation: string;
  hospitalName: string;
  contactNo: string;
}

const FIRST_NAMES = [
  "NITESH", "SUVETHA", "ERGAMREDDY", "PRIYANSHU", "MURUGESAN", "KAVITHA", "DEEPAK", "SANGEETHA",
  "RAMESH", "BALAJI", "MEENA", "ARUN", "ANITHA", "SATHISH", "DIVYA", "VENKATESH",
  "LAKSHMI", "GOKUL", "POOJA", "KARTHIK", "SARAVANAN", "BHARATHI", "SUBASH", "ABIRAMI",
  "RAJESH", "HARINI", "VIJAY", "ARCHANA", "PRAVEEN", "MONICA", "DINESH", "GAYATHRI",
  "GANESH", "SHARMILA", "MANIKANDAN", "KEERTHANA", "SURESH", "PRIYA", "SANTHOSH", "YUVARAJ"
];

const LAST_NAMES = [
  "KUMAR", "PANDA", "VEERASAMY", "REDDY", "RAMAN", "SELVAM", "NATARAJAN", "GOVIND",
  "SHARMA", "NAIR", "MURUGAN", "BALAN", "SWAMY", "PERUMAL", "CHANDRAN", "SUNDARAM",
  "MANI", "KANNAN", "VISHWANATHAN", "KRISHNAN", "BASKARAN", "JAGADEESAN", "SENTHIL", "RANGANATHAN"
];

const DEPARTMENTS = [
  "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
  "Dermatology", "Urology", "Obstetrics & Gynaecology", "ENT", "Ophthalmology",
  "Psychiatry", "Nephrology", "Gastroenterology", "Oncology", "Family Medicine"
];

const AREAS = [
  "Vadapalani", "Tambaram", "Potheri", "Kancheepuram", "Chengalpattu", "Maraimalainagar",
  "Guduvancherry", "Vandalur", "Chromepet", "Porur", "Velachery", "Guindy", "Saidapet",
  "T.Nagar", "Nungambakkam", "Egmore", "Anna Nagar", "Adyar", "Perungudi", "OMR", "Sholinganallur"
];

const CITIES = ["Chennai", "Chengalpattu", "Kancheepuram", "Thiruvallur"];
const TITLES = ["Mr", "Mrs", "Miss", "Dr"];
const RELATION_PREFIXES = ["S/O", "D/O", "W/O", "Self"];

// Generate 100 Revisit Records
export const GENERATED_REVISIT_RECORDS: RevisitRow[] = Array.from({ length: 100 }, (_, i) => {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const title = TITLES[i % TITLES.length];
  const relation = RELATION_PREFIXES[i % RELATION_PREFIXES.length];
  const relName = LAST_NAMES[(i * 5) % LAST_NAMES.length];
  
  return {
    uhidNo: String(3995900 + i + 1),
    opNo: String(26602200 + i + 1),
    title,
    patientName: `${firstName} ${lastName}`,
    fhwo: relation === "Self" ? "Self" : `${relation} ${relName}`,
    area: AREAS[i % AREAS.length],
    city: CITIES[i % CITIES.length],
    department: DEPARTMENTS[i % DEPARTMENTS.length],
  };
});

const HOSPITAL_NAMES = [
  "SRM Global Hospitals", "Apollo Speciality", "Fortis Malar", "SIMS Hospital", "MIOT International",
  "Kauvery Hospital", "Gleneagles Global", "Prashanth Super Speciality", "MGM Healthcare", "Vijaya Hospital",
  "Chettinad Health City", "Saveetha Medical Center", "Rela Hospital", "Frontier Lifeline", "Mehta Hospitals",
  "Billroth Hospitals", "Sundaram Medical Foundation", "Hindu Mission Hospital", "Kumaran Hospitals", "Parvathy Hospital"
];

// Generate 100 Hospital Master Records
export const GENERATED_HOSPITAL_RECORDS: HospitalRow[] = Array.from({ length: 100 }, (_, i) => {
  const baseHospital = HOSPITAL_NAMES[i % HOSPITAL_NAMES.length];
  const area = AREAS[(i * 2) % AREAS.length];
  const city = CITIES[i % CITIES.length];
  const branchNum = Math.floor(i / HOSPITAL_NAMES.length) + 1;
  
  return {
    hospital: branchNum > 1 ? `${baseHospital} (${area} Branch)` : `${baseHospital} - ${area}`,
    streetName: ["Grand Trunk Road", "Anna Salai", "GST Road", "Mount Road", "Usman Road", "Arcot Road"][i % 6],
    areaName: area,
    cityName: city,
    contactNo: `044-${45000000 + i * 111}`,
    state: "Tamil Nadu",
  };
});

const DESIGNATIONS = [
  "Consultant Cardiologist", "General Practitioner", "Senior Surgeon", "Pediatrician",
  "Neurologist", "Orthopedic Surgeon", "Gynecologist", "Dermatologist", "ENT Specialist",
  "Oncologist", "Nephrologist", "Radiologist", "Pulmonologist", "Anesthesiologist", "Gastroenterologist"
];

// Generate 100 Referral Master Records
export const GENERATED_REFERRAL_RECORDS: ReferralRow[] = Array.from({ length: 100 }, (_, i) => {
  const firstName = FIRST_NAMES[(i * 2) % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(i * 4) % LAST_NAMES.length];
  const hospital = HOSPITAL_NAMES[i % HOSPITAL_NAMES.length];
  
  return {
    referralName: `Dr. ${firstName.charAt(0) + firstName.slice(1).toLowerCase()} ${lastName.charAt(0) + lastName.slice(1).toLowerCase()}`,
    designation: DESIGNATIONS[i % DESIGNATIONS.length],
    hospitalName: hospital,
    contactNo: `98400${String(10000 + i * 87).slice(-5)}`,
  };
});

export interface HiuConsentRow {
  consentId: string;
  requestedOnDate: string;
  requestedOnTime: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  sharedFor: string;
  expiresInDays: string;
  expiresOnDate: string;
  status: "Pending" | "Success" | "INIT_ERROR";
  patientName?: string;
  uhidNo?: string;
  hiTypes?: string;
  purpose?: string;
}

export const INITIAL_HIU_RECORDS: HiuConsentRow[] = [
  {
    consentId: "c28c16f3-b52f-4d7b-9cbf-c842aa02b981",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "04:54 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "04:54 pm",
    sharedFor: "184 Days",
    expiresInDays: "29 days",
    expiresOnDate: "08 Oct 26",
    status: "Pending",
    patientName: "NITESH KUMAR",
    uhidNo: "3995901",
    hiTypes: "Diagnostic Report, Prescription",
    purpose: "General Consultation"
  },
  {
    consentId: "fab5ca0f-6619-43ee-8914-c9aa2274aa3c",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "04:41 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "04:41 pm",
    sharedFor: "184 Days",
    expiresInDays: "180 days",
    expiresOnDate: "08 Mar 27",
    status: "Pending",
    patientName: "SUVETHA PANDA",
    uhidNo: "3995902",
    hiTypes: "OPD Record, Discharge Summary",
    purpose: "Referral Evaluation"
  },
  {
    consentId: "45ea4174-6659-4ae1-9bc4-f9ad69ff623c",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "04:26 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "04:34 pm",
    sharedFor: "25 Days",
    expiresInDays: "21 days",
    expiresOnDate: "30 Sept 26",
    status: "Success",
    patientName: "ERGAMREDDY VEERASAMY",
    uhidNo: "3995903",
    hiTypes: "Diagnostic Report, Prescriptions, Immunization Record",
    purpose: "Specialist Review"
  },
  {
    consentId: "7d312a41-d930-4815-912c-86797f6131ac",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "01:26 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "01:26 pm",
    sharedFor: "38 Days",
    expiresInDays: "29 days",
    expiresOnDate: "08 Oct 26",
    status: "Success",
    patientName: "PRIYANSHU REDDY",
    uhidNo: "3995904",
    hiTypes: "Lab Reports, Scan Images",
    purpose: "Follow-up Treatment"
  },
  {
    consentId: "a75c3398-0081-4d2f-b5c8-5bd9855c55fb",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "01:21 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "01:21 pm",
    sharedFor: "38 Days",
    expiresInDays: "29 days",
    expiresOnDate: "08 Oct 26",
    status: "Success",
    patientName: "MURUGESAN RAMAN",
    uhidNo: "3995905",
    hiTypes: "Discharge Summary",
    purpose: "Post-Operative Care"
  },
  {
    consentId: "86cf0ee9-1294-4c13-87d2-01403c3ea837",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "01:20 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "01:20 pm",
    sharedFor: "38 Days",
    expiresInDays: "29 days",
    expiresOnDate: "08 Oct 26",
    status: "INIT_ERROR",
    patientName: "KAVITHA SELVAM",
    uhidNo: "3995906",
    hiTypes: "Diagnostic Report",
    purpose: "Insurance Verification"
  },
  {
    consentId: "0d6e0883-97e4-44b9-ae31-8b38a469354c",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "12:16 pm",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "12:16 pm",
    sharedFor: "184 Days",
    expiresInDays: "180 days",
    expiresOnDate: "08 Mar 27",
    status: "Pending",
    patientName: "DEEPAK NATARAJAN",
    uhidNo: "3995907",
    hiTypes: "Prescriptions, OPD Record",
    purpose: "Routine Checkup"
  },
  {
    consentId: "2d9274a1-0aa6-4295-bdc6-2f52a2631f02",
    requestedOnDate: "08 Sept 26",
    requestedOnTime: "11:04 am",
    lastUpdatedDate: "08 Sept 26",
    lastUpdatedTime: "11:04 am",
    sharedFor: "184 Days",
    expiresInDays: "180 days",
    expiresOnDate: "08 Mar 27",
    status: "Pending",
    patientName: "SANGEETHA SHARMA",
    uhidNo: "3995908",
    hiTypes: "Diagnostic Report",
    purpose: "Second Opinion"
  }
];

// Additional 92 generated HIU Records for pagination, search, and filtering testing
export const GENERATED_HIU_RECORDS: HiuConsentRow[] = [
  ...INITIAL_HIU_RECORDS,
  ...Array.from({ length: 92 }, (_, i) => {
    const idx = i + 9;
    const hex = (idx * 0x1a2b3c4d).toString(16).padStart(32, '0');
    const consentId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-9${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    const status: "Pending" | "Success" | "INIT_ERROR" = i % 5 === 0 ? "INIT_ERROR" : i % 2 === 0 ? "Success" : "Pending";
    const days = (15 + (i * 3) % 150);
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const hour = String((i % 12) + 1).padStart(2, '0');
    const min = String((i * 7) % 60).padStart(2, '0');
    const ampm = i % 2 === 0 ? "am" : "pm";

    return {
      consentId,
      requestedOnDate: `07 Sept 26`,
      requestedOnTime: `${hour}:${min} ${ampm}`,
      lastUpdatedDate: `07 Sept 26`,
      lastUpdatedTime: `${hour}:${min} ${ampm}`,
      sharedFor: `${days} Days`,
      expiresInDays: `${days - 5} days`,
      expiresOnDate: `${(i % 28) + 1} Oct 26`,
      status,
      patientName: `${firstName} ${lastName}`,
      uhidNo: String(3995900 + idx),
      hiTypes: i % 3 === 0 ? "Diagnostic Report, OPD Record" : i % 2 === 0 ? "Prescription" : "Discharge Summary",
      purpose: i % 2 === 0 ? "General Consultation" : "Specialist Evaluation"
    };
  })
];

