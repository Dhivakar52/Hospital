export const API_ENDPOINTS = {
  HIU: {
    START_CONSENT: "/api/hiu/consent/start",
    LIST_CONSENT: "/api/hiu/consent/list",
    CONSENT_LIST_FROM_DB: "/api/hiu/ConsentListFromDB",
    APPROVE_CONSENT: "/api/hiu/consent/approve",
    HEALTH_RECORDS: (consentId: string) =>
      `/api/hiu/health-records/${encodeURIComponent(consentId)}`,
    PATIENT_BY_UHID: (uhid: string | number) =>
      `/api/hiu/consent/patient/${encodeURIComponent(uhid)}`,
  },
  CARE_CONTEXT: {
    LINK_SELECTED: "/api/care-context/link-selected",
    LINK_BATCH: "/api/care-context/link-selected",
  },
  PATIENTS: "/api/patients",
};
