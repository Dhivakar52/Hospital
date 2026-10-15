/**
 * Centralized, type-safe query keys factory for TanStack Query.
 * Organizes cache keys hierarchically for precise invalidation and caching.
 */
export const queryKeys = {
  // Patients & HIP
  patients: {
    all: ["patients"] as const,
    hipList: () => [...queryKeys.patients.all, "hip"] as const,
    registeredList: (filters?: Record<string, unknown>) =>
      [...queryKeys.patients.all, "registered", filters] as const,
    byUhid: (uhid: string | number) =>
      [...queryKeys.patients.all, "detail", String(uhid)] as const,
  },

  // HIU (Health Information User)
  hiu: {
    all: ["hiu"] as const,
    consents: (payload?: unknown) =>
      [...queryKeys.hiu.all, "consents", payload] as const,
    consentsFromDB: () =>
      [...queryKeys.hiu.all, "consentsFromDB"] as const,
    approvals: (params?: unknown) =>
      [...queryKeys.hiu.all, "approvals", params] as const,
    healthRecords: (consentId: string) =>
      [...queryKeys.hiu.all, "health-records", consentId] as const,
    patientByUhid: (uhid: string | number) =>
      [...queryKeys.hiu.all, "patient", String(uhid)] as const,
  },

  // Care Context
  careContext: {
    all: ["careContext"] as const,
    list: (params?: unknown) =>
      [...queryKeys.careContext.all, "list", params] as const,
  },
} as const;
