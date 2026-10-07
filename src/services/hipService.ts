import type { HipApiResponse, HipPatient } from "@/types/hip";
import { api } from "@/api/axios";
import { API_ENDPOINTS } from "@/api/endpoints";

/**
 * Safely parse FHIRBundleJSON which can be null, empty, already parsed, or a JSON string.
 */
export function parseFhirBundleData(fhirBundleJson: unknown): any {
  if (!fhirBundleJson) return null;
  if (typeof fhirBundleJson === "object") return fhirBundleJson;
  if (typeof fhirBundleJson !== "string") return null;

  const trimmed = fhirBundleJson.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === '""') {
    return null;
  }

  try {
    let parsed = JSON.parse(trimmed);
    // In case of double stringified JSON
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        // Keep first parse result
      }
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to parse FHIRBundleJSON:", err);
    return null;
  }
}

/**
 * Check whether a row contains valid FHIR data.
 */
export function hasValidFhirData(fhirBundleJson: unknown): boolean {
  if (
    fhirBundleJson === null ||
    fhirBundleJson === undefined ||
    fhirBundleJson === ""
  ) {
    return false;
  }
  const parsed = parseFhirBundleData(fhirBundleJson);
  if (!parsed) return false;

  // If array of HI Type bundles (e.g. [{ hi_type: "OPConsultation", bundle: ... }])
  if (Array.isArray(parsed)) {
    return (
      parsed.length > 0 &&
      parsed.some((item) =>
        Boolean(
          item &&
            (item.bundle ||
              item.resourceType ||
              (typeof item === "object" && Object.keys(item).length > 0))
        )
      )
    );
  }

  // If single bundle object
  if (typeof parsed === "object") {
    return (
      Boolean(parsed.resourceType || parsed.entry || parsed.bundle) ||
      Object.keys(parsed).length > 0
    );
  }

  return false;
}

export async function fetchHipPatients(): Promise<HipPatient[]> {
  const response = await api.get<HipApiResponse | HipPatient[]>(API_ENDPOINTS.PATIENTS);
  const data = response.data;

  let list: HipPatient[] = [];
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as HipApiResponse).data)) {
    list = (data as HipApiResponse).data;
  } else if (Array.isArray(data)) {
    list = data as HipPatient[];
  }

  return list.map((patient, index) => ({
    ...patient,
    id:
      patient.id ||
      (patient.carecontextid
        ? `hip_${patient.carecontextid}_${index}`
        : `hip_row_${patient.uhid ?? "pt"}_${index + 1}`),
  }));
}

export interface LinkCareContextBatchPayload {
  uhids: string[];
  dry_run: boolean;
}

export async function linkCareContextBatch(uhids: string[]): Promise<any> {
  const payload: LinkCareContextBatchPayload = {
    uhids: Array.from(new Set(uhids.map(String))),
    dry_run: false,
  };
  const response = await api.post(API_ENDPOINTS.CARE_CONTEXT.LINK_BATCH, payload);
  return response.data;
}
