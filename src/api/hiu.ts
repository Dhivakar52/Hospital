import axios from "axios";
import { api, getApiErrorMessage } from "./axios";
import { API_ENDPOINTS } from "./endpoints";
import type {
  StartConsentPayload,
  StartConsentResponse,
  HiuConsentListPayload,
  HiuConsentListResponse,
  ApproveConsentPayload,
  ApproveConsentResponse,
  HiuHealthRecordsResponse,
} from "@/types/hiu";

const CREATED_CONSENTS_STORAGE_KEY = "hiu_created_consents_store";
let inMemoryCreatedConsents: StartConsentResponse[] = [];

/**
 * Persists created consent details (including eka_oid, care_context_id, consent_id)
 * so that it is preserved across screens and used for approval by OID.
 */
export function saveCreatedConsent(consent: StartConsentResponse): void {
  if (!consent) return;

  // Ensure in-memory cache is loaded from storage first if empty
  if (inMemoryCreatedConsents.length === 0) {
    try {
      const stored = sessionStorage.getItem(CREATED_CONSENTS_STORAGE_KEY);
      if (stored) {
        inMemoryCreatedConsents = JSON.parse(stored);
      }
    } catch {}
  }

  // Upsert into list
  const existingIdx = inMemoryCreatedConsents.findIndex(
    (c) =>
      (consent.consent_id && c.consent_id === consent.consent_id) ||
      (consent.consent_init_id && c.consent_init_id === consent.consent_init_id)
  );

  if (existingIdx >= 0) {
    inMemoryCreatedConsents[existingIdx] = {
      ...inMemoryCreatedConsents[existingIdx],
      ...consent,
    };
  } else {
    inMemoryCreatedConsents.unshift(consent);
  }

  try {
    sessionStorage.setItem(
      CREATED_CONSENTS_STORAGE_KEY,
      JSON.stringify(inMemoryCreatedConsents)
    );
  } catch (err) {
    console.warn("Could not save created consent to sessionStorage:", err);
  }
}

/**
 * Returns all stored created consents.
 */
export function getStoredCreatedConsents(): StartConsentResponse[] {
  if (inMemoryCreatedConsents.length === 0) {
    try {
      const stored = sessionStorage.getItem(CREATED_CONSENTS_STORAGE_KEY);
      if (stored) {
        inMemoryCreatedConsents = JSON.parse(stored);
      }
    } catch (err) {
      console.warn("Could not read created consents from sessionStorage:", err);
    }
  }
  return inMemoryCreatedConsents;
}

/**
 * Searches for stored consent details by consentId, consentInitId, or abhaAddress.
 */
export function findStoredConsent(query: {
  consentId?: string;
  consentInitId?: string;
  abhaAddress?: string;
}): StartConsentResponse | undefined {
  const list = getStoredCreatedConsents();
  if (query.consentId) {
    const found = list.find((c) => c.consent_id === query.consentId);
    if (found) return found;
  }
  if (query.consentInitId) {
    const found = list.find((c) => c.consent_init_id === query.consentInitId);
    if (found) return found;
  }
  if (query.abhaAddress) {
    const found = list.find((c) => c.abha_address === query.abhaAddress);
    if (found) return found;
  }
  return undefined;
}

/**
 * Initiates an HIU consent request.
 * POST /api/hiu/consent/start
 * Automatically preserves the returned response (including eka_oid).
 */
export const startHiuConsent = async (
  payload: StartConsentPayload
): Promise<StartConsentResponse> => {
  try {
    const response = await api.post<StartConsentResponse>(
      API_ENDPOINTS.HIU.START_CONSENT,
      payload
    );
    const data = response.data;
    if (data) {
      saveCreatedConsent(data);
    }
    return data;
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Unable to create consent request. Please try again."
    );
    throw new Error(message);
  }
};

/**
 * Retrieves the list of HIU consents from backend.
 * POST /api/hiu/consent/list
 */
export const getHiuConsentList = async (
  payload?: HiuConsentListPayload
): Promise<HiuConsentListResponse> => {
  try {
    // If not explicitly provided, use active stored consent's patient or SRM defaults
    const storedLatest = getStoredCreatedConsents()[0];

    const finalPayload: HiuConsentListPayload = {
      hiu: {
        clinic_id: payload?.hiu?.clinic_id || "SRM_CHENNAI",
      },
      patient: {
        health_id:
          payload?.patient?.health_id ||
          storedLatest?.abha_address ||
          "testinguser12@sbx",
        oid:
          payload?.patient?.oid ||
          storedLatest?.eka_oid ||
          "178789437141310",
      },
    };

    const response = await api.post<HiuConsentListResponse>(
      API_ENDPOINTS.HIU.LIST_CONSENT,
      finalPayload
    );

    return {
      consents: Array.isArray(response.data?.consents) ? response.data.consents : [],
    };
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Unable to load consent requests. Please try again."
    );
    throw new Error(message);
  }
};

/**
 * Approves a patient consent request by OID.
 * POST /api/hiu/consent/approve?oid={eka_oid}
 */
export const approveHiuConsent = async (
  oid: string,
  payload: ApproveConsentPayload
): Promise<ApproveConsentResponse> => {
  try {
    const response = await api.post<ApproveConsentResponse>(
      `${API_ENDPOINTS.HIU.APPROVE_CONSENT}?oid=${encodeURIComponent(oid)}`,
      payload
    );

    // Check if server returned 200 with failure status
    if (response.data && response.data.status === "failed") {
      let errMsg =
        response.data.error ||
        response.data.message ||
        "Consent approval failed.";

      if (typeof response.data.response === "string") {
        try {
          const parsed = JSON.parse(response.data.response);
          if (parsed.error === "SessionExpiredTryAgain") {
            errMsg =
              "Session expired on Eka server (SessionExpiredTryAgain). Please try again.";
          } else if (parsed.error || parsed.message) {
            errMsg = String(parsed.error || parsed.message);
          }
        } catch {
          if (response.data.response.includes("SessionExpiredTryAgain")) {
            errMsg =
              "Session expired on Eka server (SessionExpiredTryAgain). Please try again.";
          }
        }
      }
      throw new Error(errMsg);
    }

    return response.data;
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Unable to approve consent. Please try again."
    );
    throw new Error(message);
  }
};

/**
 * Fetches FHIR health records for an approved consent.
 * GET /api/hiu/health-records/{consent_id}
 */
export const getHealthRecords = async (
  consentId: string
): Promise<HiuHealthRecordsResponse> => {
  try {
    const response = await api.get<HiuHealthRecordsResponse>(
      API_ENDPOINTS.HIU.HEALTH_RECORDS(consentId)
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Consent ID not found or no health records available");
    }
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      throw new Error("Failed to fetch FHIR Bundles");
    }
    const message = getApiErrorMessage(
      error,
      "Failed to fetch FHIR Bundles"
    );
    throw new Error(message);
  }
};

