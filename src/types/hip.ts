export interface HipPatient {
  id?: string;
  uhid: number | string;
  patientname: string;
  abhano: string;
  abhaaddress: string;
  carecontextid: string;
  ekaoid: string;
  ekauuid: string;
  visitedat: string;
  RequestedAt: string;
  Responsed: string; // "Yes" | "No"
  Linked?: string | null; // "Yes" | "No"
  Linkedat?: string | null;
  FHIRBundleJSON: string | null | any;
}

export interface HipApiResponse {
  data: HipPatient[];
  message?: string;
  status?: string;
}

export interface FhirBundleEntry {
  fullUrl?: string;
  resource?: {
    resourceType: string;
    id?: string;
    [key: string]: any;
  };
}

export interface FhirBundleDocument {
  resourceType: "Bundle" | string;
  id?: string;
  type?: string;
  timestamp?: string;
  identifier?: {
    system?: string;
    value?: string;
  };
  entry?: FhirBundleEntry[];
  [key: string]: any;
}

export interface FhirHiTypeWrapper {
  hi_type: string;
  bundle: FhirBundleDocument;
}
