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
