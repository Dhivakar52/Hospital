export interface StartConsentPayload {
  abha_address: string;
  dry_run: boolean;
  expiry: string;
  period_from: string;
  period_to: string;
  purpose: string;
  record_types: string[];
}

export interface ConsentMetadata {
  expiry: string;
  period_from: string;
  period_to: string;
  purpose: string;
  record_types: string[];
}

export interface StartConsentResponse {
  abha_address: string;
  care_context_id: string;
  consent_id: string;
  consent_init_id: string;
  consent_metadata: ConsentMetadata;
  eka_oid?: string;
  hiu_request_id: number;
  message: string;
  status: string;
}

export interface HiuConsentPeriod {
  expiry: string;
  from: string;
  to: string;
}

export interface HiuConsent {
  c_at: string;
  consent_id: string;
  consent_init_id: string;
  hi_types: string[];
  period: HiuConsentPeriod;
  status: string; // "REQUESTED" | "GRANTED" | "INIT_ERROR"
  u_at: string;
  // Supplementary mapped fields for enriched display & approval
  patient_name?: string;
  patient_id?: string;
  patient_oid?: string;
  eka_oid?: string;
  abha_address?: string;
  care_context_id?: string;
  consent_metadata?: ConsentMetadata;
}

export interface HiuConsentListResponse {
  consents: HiuConsent[];
}

export interface HiuConsentListPayload {
  hiu?: {
    clinic_id: string;
  };
  patient?: {
    health_id: string;
    oid: string;
  };
}

export interface ApproveConsentCareContext {
  display: string;
  id: string;
}

export interface ApproveConsentArtefact {
  access_mode: string;
  care_contexts: ApproveConsentCareContext[];
  duration: {
    from: string;
    to: string;
  };
  erase_at: string;
  hi_types: string[];
  hip_id: string;
}

export interface ApproveConsentPayload {
  access_mode: string;
  consent_artefacts: ApproveConsentArtefact[];
  duration: {
    from: string;
    to: string;
  };
  erase_at: string;
  hi_types: string[];
  id: string;
}

export interface ApproveConsentResponse {
  eka_http_status?: number;
  message?: string;
  status?: string;
  error?: string;
  response?: string;
}

export interface HealthRecordEntry {
  fullUrl?: string;
  resource: Record<string, any>;
}

export interface HealthRecordBundle {
  resourceType: string;
  id?: string;
  identifier?: {
    system?: string;
    value?: string;
  };
  timestamp?: string;
  type?: string;
  entry: HealthRecordEntry[];
}

export interface HiuHealthRecordItem {
  bundle: HealthRecordBundle;
  bundle_name?: string;
  care_context_id?: string;
  checksum?: string;
  created_at?: string;
  doc_type?: string;
  entry_index?: number;
  facility_name?: string;
  hi_type_id?: number;
  hiu_record_id?: number;
  hiu_request_id?: number;
  transaction_id?: string;
}

export interface HiuHealthRecordsResponse {
  consent_id: string;
  hiu_request_id: number;
  message: string;
  record_count: number;
  records: HiuHealthRecordItem[];
  success: boolean;
}

export interface HiuPatientDetails {
  abha_address?: string;
  care_context_id?: string;
  eka_oid?: string;
  linked?: string;
  linked_at?: string | null;
  patient_name?: string;
  uhid?: number | string;
  visited_at?: string;
}

export interface HiuPatientDetailsResponse {
  data?: HiuPatientDetails;
  message?: string;
  success: boolean;
}

