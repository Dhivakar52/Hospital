import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { notify } from "@/lib/notify";

export interface ParsedFhirData {
  rawJson: any;
  rawString: string;
  bundleId: string;
  bundleType: string;
  timestamp: string;
  patient: any | null;
  practitioner: any | null;
  organization: any | null;
  encounter: any | null;
  composition: any | null;
  diagnosticReports: any[];
  documentReferences: any[];
  observations: any[];
  conditions: any[];
  medications: any[];
  allergies: any[];
  procedures: any[];
  immunizations: any[];
  carePlans: any[];
  allResources: { type: string; fullUrl: string; resource: any }[];
  resourceCounts: Record<string, number>;
}

export interface HiTypeItem {
  hiType: string;
  displayTitle: string;
  bundle: any;
  parsed: ParsedFhirData;
}

export function formatHiTypeTitle(hiType: string): string {
  if (!hiType) return "General Record";
  return hiType
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
}

function parseSingleBundle(jsonObj: any): ParsedFhirData {
  if (!jsonObj || typeof jsonObj !== "object") {
    throw new Error("Invalid FHIR Bundle: Expected an object.");
  }

  // If jsonObj is wrapped in a .bundle property
  const bundle = jsonObj.bundle || jsonObj;
  const entries: any[] = Array.isArray(bundle.entry) ? bundle.entry : [];

  const composition =
    entries.find((e) => e.resource?.resourceType === "Composition")?.resource || null;
  const patient =
    entries.find((e) => e.resource?.resourceType === "Patient")?.resource || null;
  const practitioner =
    entries.find((e) => e.resource?.resourceType === "Practitioner")?.resource || null;
  const organization =
    entries.find((e) => e.resource?.resourceType === "Organization")?.resource || null;
  const encounter =
    entries.find((e) => e.resource?.resourceType === "Encounter")?.resource || null;

  const diagnosticReports = entries
    .filter((e) => e.resource?.resourceType === "DiagnosticReport")
    .map((e) => e.resource);

  const documentReferences = entries
    .filter((e) => e.resource?.resourceType === "DocumentReference")
    .map((e) => e.resource);

  const observations = entries
    .filter((e) => e.resource?.resourceType === "Observation")
    .map((e) => e.resource);

  const conditions = entries
    .filter((e) => e.resource?.resourceType === "Condition")
    .map((e) => e.resource);

  const medications = entries
    .filter(
      (e) =>
        e.resource?.resourceType === "MedicationRequest" ||
        e.resource?.resourceType === "MedicationStatement" ||
        e.resource?.resourceType === "Medication"
    )
    .map((e) => e.resource);

  const allergies = entries
    .filter((e) => e.resource?.resourceType === "AllergyIntolerance")
    .map((e) => e.resource);

  const procedures = entries
    .filter((e) => e.resource?.resourceType === "Procedure")
    .map((e) => e.resource);

  const immunizations = entries
    .filter((e) => e.resource?.resourceType === "Immunization")
    .map((e) => e.resource);

  const carePlans = entries
    .filter((e) => e.resource?.resourceType === "CarePlan")
    .map((e) => e.resource);

  const allResources = entries.map((e) => ({
    type: e.resource?.resourceType || "Unknown",
    fullUrl: e.fullUrl || "",
    resource: e.resource || {},
  }));

  const resourceCounts: Record<string, number> = {};
  allResources.forEach((item) => {
    resourceCounts[item.type] = (resourceCounts[item.type] || 0) + 1;
  });

  const bundleIdentifier =
    bundle.identifier?.value || bundle.identifier?.id || bundle.id || "Bundle-ABDM-01";

  return {
    rawJson: bundle,
    rawString: JSON.stringify(bundle, null, 2),
    bundleId: bundleIdentifier,
    bundleType: bundle.type || "document",
    timestamp: bundle.timestamp || new Date().toISOString(),
    patient,
    practitioner,
    organization,
    encounter,
    composition,
    diagnosticReports,
    documentReferences,
    observations,
    conditions,
    medications,
    allergies,
    procedures,
    immunizations,
    carePlans,
    allResources,
    resourceCounts,
  };
}

export function parseFhirInput(input: any): {
  hiTypes: HiTypeItem[];
  defaultParsed: ParsedFhirData | null;
  rawInput: any;
} {
  if (!input) {
    return { hiTypes: [], defaultParsed: null, rawInput: null };
  }

  let data = input;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
    } catch {
      throw new Error("Invalid JSON string");
    }
  }

  // Case 1: Array of HI Types or Bundles
  if (Array.isArray(data)) {
    const list: HiTypeItem[] = [];
    data.forEach((item, idx) => {
      if (!item) return;
      const hiType =
        item.hi_type ||
        item.bundle?.type ||
        item.resourceType ||
        `Record ${idx + 1}`;
      const bundle = item.bundle || item;
      try {
        const parsed = parseSingleBundle(bundle);
        list.push({
          hiType,
          displayTitle: formatHiTypeTitle(hiType),
          bundle,
          parsed,
        });
      } catch (e) {
        console.warn(`Failed to parse entry ${idx}:`, e);
      }
    });

    return {
      hiTypes: list,
      defaultParsed: list[0]?.parsed || null,
      rawInput: data,
    };
  }

  // Case 2: Single object with .bundle or .hi_type or .resourceType === 'Bundle'
  if (typeof data === "object") {
    const hiType = data.hi_type || data.type || "OP Consultation";
    const parsed = parseSingleBundle(data);
    const item: HiTypeItem = {
      hiType,
      displayTitle: formatHiTypeTitle(hiType),
      bundle: data.bundle || data,
      parsed,
    };

    return {
      hiTypes: [item],
      defaultParsed: parsed,
      rawInput: data,
    };
  }

  throw new Error("Unsupported FHIR data format.");
}

export function useFhirParser(initialJsonData?: any) {
  const [parseState, setParseState] = useState(() => {
    try {
      if (initialJsonData) {
        return parseFhirInput(initialJsonData);
      }
    } catch (e) {
      console.warn("Initial FHIR parse error:", e);
    }
    return { hiTypes: [] as HiTypeItem[], defaultParsed: null as ParsedFhirData | null, rawInput: null };
  });

  const [activeHiTypeIndex, setActiveHiTypeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Active parsed data corresponding to the selected HI Type
  const data = useMemo<ParsedFhirData | null>(() => {
    if (parseState.hiTypes.length > 0) {
      const idx = Math.min(activeHiTypeIndex, parseState.hiTypes.length - 1);
      return parseState.hiTypes[idx]?.parsed || parseState.defaultParsed;
    }
    return parseState.defaultParsed;
  }, [parseState, activeHiTypeIndex]);

  const activeHiTypeItem = useMemo<HiTypeItem | null>(() => {
    if (parseState.hiTypes.length > 0) {
      const idx = Math.min(activeHiTypeIndex, parseState.hiTypes.length - 1);
      return parseState.hiTypes[idx] || null;
    }
    return null;
  }, [parseState, activeHiTypeIndex]);

  const parseJson = useCallback((jsonInput: string | object) => {
    setIsLoading(true);
    try {
      const result = parseFhirInput(jsonInput);
      setParseState(result);
      setActiveHiTypeIndex(0);
      toast.success("FHIR Bundle parsed successfully!");
      return true;
    } catch (err: any) {
      console.error("FHIR Parsing error:", err);
      const msg = err.message || "Failed to parse FHIR Bundle";
      toast.error(msg);
      notify.apiError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setParseState({ hiTypes: [], defaultParsed: null, rawInput: null });
    setActiveHiTypeIndex(0);
    toast.info("FHIR Viewer cleared.");
  }, []);

  const exportJson = useCallback(() => {
    const rawToExport = parseState.rawInput || data?.rawJson;
    if (!rawToExport) return;
    const blob = new Blob([JSON.stringify(rawToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.bundleId || "fhir-bundle"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("FHIR Bundle JSON downloaded.");
  }, [parseState.rawInput, data]);

  const copyJson = useCallback(() => {
    const rawToExport = parseState.rawInput || data?.rawJson;
    if (!rawToExport) return;
    navigator.clipboard.writeText(JSON.stringify(rawToExport, null, 2));
    toast.success("FHIR Bundle JSON copied to clipboard!");
  }, [parseState.rawInput, data]);

  return {
    data,
    hiTypes: parseState.hiTypes,
    activeHiTypeIndex,
    setActiveHiTypeIndex,
    activeHiTypeItem,
    rawInput: parseState.rawInput,
    isLoading,
    parseJson,
    clear,
    exportJson,
    copyJson,
  };
}
