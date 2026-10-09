import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHiuConsentList,
  getHiuConsentListFromDB,
  startHiuConsent,
  approveHiuConsent,
  getHealthRecords,
  getPatientByUhid,
  findStoredConsent,
  getStoredCreatedConsents,
} from "@/api/hiu";
import { fetchHipPatients } from "@/services/hipService";
import { queryKeys } from "@/api/queryKeys";
import type {
  StartConsentPayload,
  StartConsentResponse,
  HiuConsentListPayload,
  HiuConsentListResponse,
  ApproveConsentPayload,
  ApproveConsentResponse,
  HiuHealthRecordsResponse,
  HiuPatientDetailsResponse,
  HiuConsent,
} from "@/types/hiu";
import type { HipPatient } from "@/types/hip";

/**
 * Hook to retrieve HIU consent list directly from database (GET /api/hiu/ConsentListFromDB).
 */
export function useHiuConsentsFromDB(options?: {
  refetchInterval?: number | false;
}) {
  return useQuery<HiuConsentListResponse, Error>({
    queryKey: queryKeys.hiu.consentsFromDB(),
    queryFn: async () => {
      return await getHiuConsentListFromDB();
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to retrieve HIU consent list from backend (POST /api/hiu/consent/list).
 */
export function useHiuConsentList(
  payload?: HiuConsentListPayload,
  options?: { refetchInterval?: number | false }
) {
  return useQuery<HiuConsentListResponse, Error>({
    queryKey: queryKeys.hiu.consents(payload),
    queryFn: async () => {
      return await getHiuConsentList(payload);
    },
    staleTime: 1000 * 30,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch and enrich patient approvals data.
 * Merges backend consent list, patient identity data (for real OID mapping),
 * and session-stored created consents into a unified list.
 */
export function usePatientApprovals(options?: {
  refetchInterval?: number | false;
}) {
  return useQuery<HiuConsent[], Error>({
    queryKey: queryKeys.hiu.approvals(),
    queryFn: async () => {
      let patientList: HipPatient[] = [];
      try {
        patientList = await fetchHipPatients();
      } catch (e) {
        console.warn("Could not fetch patients for OID mapping:", e);
      }

      const response = await getHiuConsentList();
      const rawConsents = response.consents || [];

      // Enrich consents with patient information (stored eka_oid, care context, etc.)
      const enriched: HiuConsent[] = rawConsents.map((c) => {
        // 1. Look up any stored created consent for this consentId or initId
        const stored = findStoredConsent({
          consentId: c.consent_id || undefined,
          consentInitId: c.consent_init_id,
          abhaAddress: c.abha_address,
        });

        const abha = stored?.abha_address || c.abha_address || "testinguser12@sbx";

        // 2. Try to match patient from database
        const matched = patientList.find(
          (p) =>
            p.abhaaddress === abha ||
            (stored?.care_context_id && p.carecontextid === stored.care_context_id) ||
            (c.care_context_id && p.carecontextid === c.care_context_id)
        );

        // Dynamic eka_oid: priority given to start consent response's eka_oid, then matched patient ekaoid
        const dynamicOid =
          stored?.eka_oid ||
          matched?.ekaoid ||
          c.eka_oid ||
          c.patient_oid ||
          patientList[0]?.ekaoid;
        const patientName =
          matched?.patientname || c.patient_name || abha.split("@")[0].toUpperCase();
        const careContextId =
          stored?.care_context_id || c.care_context_id || matched?.carecontextid;

        return {
          ...c,
          expiry: c.period?.expiry || "",
          from: c.period?.from || "",
          to: c.period?.to || "",
          is_granted: (c.status || "").toUpperCase() === "GRANTED",
          uhid: String(matched?.uhid || "3995999"),
          patient_name: patientName,
          patient_oid: dynamicOid ? String(dynamicOid) : undefined,
          eka_oid: dynamicOid ? String(dynamicOid) : undefined,
          care_context_id: careContextId,
          abha_address: abha,
          consent_metadata: stored?.consent_metadata,
        };
      });

      // 3. Include any stored created consent that is pending and not yet present in rawConsents
      const storedConsents = getStoredCreatedConsents();
      storedConsents.forEach((sc) => {
        const alreadyExists = enriched.some(
          (e) =>
            (sc.consent_id && e.consent_id === sc.consent_id) ||
            (sc.consent_init_id && e.consent_init_id === sc.consent_init_id)
        );
        if (!alreadyExists) {
          const matched = patientList.find(
            (p) =>
              p.abhaaddress === sc.abha_address ||
              (sc.care_context_id && p.carecontextid === sc.care_context_id)
          );

          const dynamicOid = sc.eka_oid || matched?.ekaoid || "178789437141310";
          const patientName =
            matched?.patientname ||
            (sc.abha_address ? sc.abha_address.split("@")[0].toUpperCase() : "PATIENT");

          enriched.unshift({
            consent_id:
              sc.consent_id || sc.consent_init_id || `REQ-${sc.hiu_request_id || "NEW"}`,
            consent_init_id: sc.consent_init_id,
            status: sc.status || "REQUESTED",
            c_at: new Date().toISOString(),
            u_at: new Date().toISOString(),
            hi_types: sc.consent_metadata?.record_types || ["OPConsultation"],
            period: {
              from: sc.consent_metadata?.period_from || "2026-09-03",
              to: sc.consent_metadata?.period_to || "2026-09-09",
              expiry: sc.consent_metadata?.expiry || "2027-03-09",
            },
            expiry: sc.consent_metadata?.expiry || "2027-03-09",
            from: sc.consent_metadata?.period_from || "2026-09-03",
            to: sc.consent_metadata?.period_to || "2026-09-09",
            is_granted: false,
            uhid: String(matched?.uhid || "3995999"),
            patient_name: patientName,
            patient_oid: dynamicOid ? String(dynamicOid) : undefined,
            eka_oid: dynamicOid ? String(dynamicOid) : undefined,
            care_context_id: sc.care_context_id || matched?.carecontextid,
            abha_address: sc.abha_address || "testinguser12@sbx",
            consent_metadata: sc.consent_metadata,
          });
        }
      });

      return enriched;
    },
    staleTime: 1000 * 30, // 30s stale time
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch FHIR health records for a given consent ID.
 */
export function useHealthRecords(
  consentId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<HiuHealthRecordsResponse, Error>({
    queryKey: queryKeys.hiu.healthRecords(consentId || ""),
    queryFn: async () => {
      if (!consentId) throw new Error("Missing consent ID");
      return await getHealthRecords(consentId);
    },
    enabled: Boolean(consentId) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Hook to fetch patient details by UHID.
 */
export function usePatientByUhid(
  uhid: string | number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<HiuPatientDetailsResponse, Error>({
    queryKey: queryKeys.hiu.patientByUhid(uhid ? String(uhid) : ""),
    queryFn: async () => {
      if (!uhid) throw new Error("Missing UHID");
      return await getPatientByUhid(uhid);
    },
    enabled: Boolean(uhid) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Mutation hook for looking up patient details on-demand by UHID (e.g. from an action button).
 * Automatically primes the query cache with the result.
 */
export function useFetchPatientByUhidMutation() {
  const queryClient = useQueryClient();

  return useMutation<HiuPatientDetailsResponse, Error, string | number>({
    mutationFn: async (uhid: string | number) => {
      return await getPatientByUhid(uhid);
    },
    onSuccess: (data, uhid) => {
      queryClient.setQueryData(queryKeys.hiu.patientByUhid(uhid), data);
    },
  });
}

/**
 * Mutation hook to initiate an HIU consent request.
 * Automatically invalidates DB and backend consent lists so UI updates seamlessly.
 */
export function useStartHiuConsent() {
  const queryClient = useQueryClient();

  return useMutation<StartConsentResponse, Error, StartConsentPayload>({
    mutationFn: async (payload: StartConsentPayload) => {
      return await startHiuConsent(payload);
    },
    onSuccess: () => {
      // Refresh DB consents, backend consents, and approvals simultaneously
      queryClient.invalidateQueries({ queryKey: queryKeys.hiu.consentsFromDB() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hiu.consents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hiu.approvals() });
    },
  });
}

/**
 * Mutation hook to approve a consent request by OID.
 * Automatically invalidates approvals and consent lists so UI transitions immediately to "GRANTED".
 */
export function useApproveHiuConsent() {
  const queryClient = useQueryClient();

  return useMutation<
    ApproveConsentResponse,
    Error,
    { oid: string; payload: ApproveConsentPayload }
  >({
    mutationFn: async ({ oid, payload }) => {
      return await approveHiuConsent(oid, payload);
    },
    onSuccess: () => {
      // Invalidate all HIU queries so approvals list updates automatically
      queryClient.invalidateQueries({ queryKey: queryKeys.hiu.approvals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hiu.consents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hiu.consentsFromDB() });
    },
  });
}
