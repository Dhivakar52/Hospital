import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useHealthRecords } from "@/hooks/useHiuQueries";
import type {
  HiuHealthRecordItem,
} from "@/types/hiu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Search,
  User,
  Building2,
  Stethoscope,
  Activity,
  Pill,
  ClipboardList,
  Layers,
  FileCode2,
  AlertCircle,
  Download,
  Loader2,
  X,
} from "lucide-react";

export default function ApprovedRecordsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const consentId = searchParams.get("consent_id");

  const {
    data,
    isLoading: isQueryLoading,
    isFetching,
    isError,
    error,
    refetch: loadHealthRecords,
  } = useHealthRecords(consentId);

  const isLoading = isQueryLoading || isFetching;
  const errorMessage = !consentId
    ? "No consent ID specified in URL."
    : isError
    ? error?.message || "Failed to fetch FHIR Bundles"
    : null;

  // Active record/bundle tab index
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number>(0);
  const [resourceFilter, setResourceFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Raw JSON Viewer Modal state
  const [isRawJsonModalOpen, setIsRawJsonModalOpen] = useState<boolean>(false);
  const [copiedConsentId, setCopiedConsentId] = useState<boolean>(false);
  const [copiedRawJson, setCopiedRawJson] = useState<boolean>(false);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsRawJsonModalOpen(false);
      }
    };
    if (isRawJsonModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRawJsonModalOpen]);

  const formatDateSafe = (dateStr?: string, fmt = "dd MMM yyyy, hh:mm a") => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return format(d, fmt);
    } catch { }
    return dateStr;
  };

  const handleCopyConsentId = () => {
    if (consentId) {
      navigator.clipboard.writeText(consentId);
      setCopiedConsentId(true);
      setTimeout(() => setCopiedConsentId(false), 2000);
    }
  };

  const handleCopyRawJson = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedRawJson(true);
      setTimeout(() => setCopiedRawJson(false), 2000);
    }
  };

  const handleDownloadRawJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fhir-health-records-${consentId || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Active record bundle
  const activeRecord: HiuHealthRecordItem | undefined = useMemo(() => {
    if (!data?.records || data.records.length === 0) return undefined;
    return data.records[selectedRecordIndex] || data.records[0];
  }, [data, selectedRecordIndex]);

  // Extract all entries in the selected active record bundle
  const currentEntries = useMemo(() => {
    if (!activeRecord?.bundle?.entry) return [];
    return activeRecord.bundle.entry;
  }, [activeRecord]);

  // Derived patient resource from the records
  const patientResource = useMemo(() => {
    if (!data?.records) return null;
    for (const rec of data.records) {
      const pEntry = rec.bundle?.entry?.find(
        (e) => e.resource?.resourceType === "Patient"
      );
      if (pEntry?.resource) return pEntry.resource;
    }
    return null;
  }, [data]);

  // Format Patient Name
  const patientDisplayName = useMemo(() => {
    if (!patientResource) return null;
    const nameObj = patientResource.name?.[0];
    if (nameObj?.text) return nameObj.text;
    const given = Array.isArray(nameObj?.given) ? nameObj.given.join(" ") : "";
    const family = nameObj?.family || "";
    const combined = `${given} ${family}`.trim();
    return combined || "Patient";
  }, [patientResource]);

  // Patient ABHA ID / Number
  const patientAbhaInfo = useMemo(() => {
    if (!patientResource?.identifier) return null;
    const idList = Array.isArray(patientResource.identifier)
      ? patientResource.identifier
      : [];
    const abhaAddress = idList.find(
      (i: any) =>
        i.type?.coding?.[0]?.code === "ABHA" ||
        i.system?.includes("ndhm") ||
        i.system?.includes("abha") ||
        i.value?.includes("@")
    )?.value;
    const abhaNumber = idList.find(
      (i: any) =>
        i.type?.coding?.[0]?.code === "ABHANUMBER" ||
        (/^\d{2}-\d{4}-\d{4}-\d{4}$/.test(i.value || ""))
    )?.value;
    return { abhaAddress, abhaNumber };
  }, [patientResource]);

  // Available resource types in the active bundle
  const availableResourceTypes = useMemo(() => {
    const typesSet = new Set<string>();
    currentEntries.forEach((e) => {
      if (e.resource?.resourceType) {
        typesSet.add(e.resource.resourceType);
      }
    });
    return Array.from(typesSet);
  }, [currentEntries]);

  // Filtered entries for the selected resource tab and search term
  const filteredEntries = useMemo(() => {
    return currentEntries.filter((entry) => {
      const resource = entry.resource || {};
      const type = resource.resourceType || "Unknown";

      // Type filter
      if (resourceFilter !== "ALL" && type !== resourceFilter) {
        return false;
      }

      // Search term filter across clinical values
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const jsonString = JSON.stringify(resource).toLowerCase();
        return jsonString.includes(query);
      }

      return true;
    });
  }, [currentEntries, resourceFilter, searchTerm]);

  // =========================================================================
  // RENDERER HELPERS FOR READABLE UI REPRESENTATIONS (NO RAW JSON)
  // =========================================================================

  const renderObservationCard = (res: any) => {
    const codeDisplay =
      res.code?.text ||
      res.code?.coding?.[0]?.display ||
      res.code?.coding?.[0]?.code ||
      "Observation";

    let valueDisplay = "-";
    if (res.valueQuantity) {
      valueDisplay = `${res.valueQuantity.value} ${res.valueQuantity.unit || ""}`.trim();
    } else if (res.valueString) {
      valueDisplay = res.valueString;
    } else if (res.valueCodeableConcept) {
      valueDisplay =
        res.valueCodeableConcept.text ||
        res.valueCodeableConcept.coding?.[0]?.display ||
        "-";
    }

    const category =
      res.category?.[0]?.coding?.[0]?.display ||
      res.category?.[0]?.coding?.[0]?.code ||
      "Clinical";
    const date = formatDateSafe(res.effectiveDateTime || res.issued);
    const status = res.status ? String(res.status).toUpperCase() : "FINAL";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Observation
          </span>
          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
            {codeDisplay}
          </span>
          {category && (
            <span className="inline-block text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 mt-1">
              {category}
            </span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Result / Value
          </span>
          <span className="text-base font-extrabold text-blue-700 mt-0.5 block">
            {valueDisplay}
          </span>
          {Array.isArray(res.referenceRange) && res.referenceRange[0]?.text && (
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Ref: {res.referenceRange[0].text}
            </span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              {status}
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Date
          </span>
          <span className="text-xs font-medium text-slate-700 mt-1 block">
            {date}
          </span>
        </div>
      </div>
    );
  };

  const renderMedicationRequestCard = (res: any) => {
    const medName =
      res.medicationCodeableConcept?.text ||
      res.medicationCodeableConcept?.coding?.[0]?.display ||
      res.medicationReference?.display ||
      "Prescription";
    const dosage = res.dosageInstruction?.[0]?.text || "-";
    const status = res.status ? String(res.status).toUpperCase() : "ACTIVE";
    const authoredOn = formatDateSafe(res.authoredOn, "dd MMM yyyy");
    const requester = res.requester?.display || res.recorder?.display;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Medication
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Pill className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900">{medName}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Dosage / Instructions
          </span>
          <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
            {dosage}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              {status}
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Date / Prescribed By
          </span>
          <span className="text-xs font-medium text-slate-700 mt-0.5 block">
            {authoredOn}
          </span>
          {requester && (
            <span className="text-[11px] text-slate-500 block">
              By: {requester}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderPatientCard = (res: any) => {
    const telecom = Array.isArray(res.telecom) ? res.telecom : [];
    const phone = telecom.find((t: any) => t.system === "phone")?.value;
    const email = telecom.find((t: any) => t.system === "email")?.value;
    const gender = res.gender ? String(res.gender).toUpperCase() : "-";
    const birthDate = res.birthDate || "-";

    const abhaId = patientAbhaInfo?.abhaAddress || "-";
    const abhaNum = patientAbhaInfo?.abhaNumber;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Patient Name
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900 capitalize">
              {patientDisplayName || "Patient"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Gender: {gender} &bull; DOB: {birthDate}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            ABHA ID
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block select-all">
            {abhaId}
          </span>
          {abhaNum && (
            <span className="text-[11px] font-mono text-slate-500 block select-all">
              {abhaNum}
            </span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Contact
          </span>
          <span className="text-xs font-medium text-slate-800 mt-0.5 block">
            {phone ? `Phone: ${phone}` : email ? `Email: ${email}` : "Not Provided"}
          </span>
          {phone && email && (
            <span className="text-[11px] text-slate-500 block truncate">
              {email}
            </span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Identifiers
          </span>
          <div className="space-y-0.5 mt-0.5 font-mono text-[11px] text-slate-700">
            {Array.isArray(res.identifier) && res.identifier.length > 0 ? (
              res.identifier.slice(0, 2).map((id: any, i: number) => (
                <div key={i} className="truncate select-all" title={id.value}>
                  <strong className="text-slate-500">{id.type?.coding?.[0]?.display || "ID"}:</strong> {id.value}
                </div>
              ))
            ) : (
              <span>-</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPractitionerCard = (res: any) => {
    const nameObj = res.name?.[0];
    const prefix = Array.isArray(nameObj?.prefix) ? nameObj.prefix.join(" ") : "";
    const given = Array.isArray(nameObj?.given) ? nameObj.given.join(" ") : "";
    const family = nameObj?.family || "";
    const docName = nameObj?.text || `${prefix} ${given} ${family}`.trim() || "Doctor";
    const qualification = Array.isArray(res.qualification) && res.qualification.length > 0
      ? res.qualification.map((q: any) => q.code?.text || q.code?.coding?.[0]?.display).filter(Boolean).join(", ")
      : "Medical Practitioner";
    const regNo = res.identifier?.[0]?.value || "-";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Practitioner
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Stethoscope className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900">{docName}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Qualification / Specialty
          </span>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mt-1 inline-block">
            {qualification}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Registration No
          </span>
          <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block select-all">
            {regNo}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Practitioner ID
          </span>
          <span className="text-xs font-mono text-slate-600 mt-0.5 block truncate select-all">
            {res.id || "-"}
          </span>
        </div>
      </div>
    );
  };

  const renderOrganizationCard = (res: any) => {
    const orgName = res.name || "Healthcare Facility";
    const orgId = res.identifier?.[0]?.value || res.id || "-";
    const telecom = Array.isArray(res.telecom) ? res.telecom.map((t: any) => t.value).join(", ") : "-";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Organization / Facility
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900">{orgName}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Facility ID
          </span>
          <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block select-all">
            {orgId}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Contact
          </span>
          <span className="text-xs text-slate-700 mt-0.5 block">
            {telecom}
          </span>
        </div>
      </div>
    );
  };

  const renderEncounterCard = (res: any) => {
    const encounterClass = res.class?.display || res.class?.code || "Consultation";
    const status = res.status ? String(res.status).toUpperCase() : "COMPLETED";
    const periodStart = formatDateSafe(res.period?.start);
    const periodEnd = formatDateSafe(res.period?.end);
    const reason = Array.isArray(res.reasonCode)
      ? res.reasonCode.map((r: any) => r.text || r.coding?.[0]?.display).filter(Boolean).join(", ")
      : "-";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Encounter Class
          </span>
          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
            {encounterClass}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200"
            >
              {status}
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Period
          </span>
          <span className="text-xs text-slate-700 mt-0.5 block">
            {periodStart} {periodEnd !== "-" ? `- ${periodEnd}` : ""}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Reason / Diagnosis
          </span>
          <span className="text-xs font-medium text-slate-800 mt-0.5 block">
            {reason}
          </span>
        </div>
      </div>
    );
  };

  const renderCarePlanCard = (res: any) => {
    const title = res.title || "Care Plan";
    const status = res.status ? String(res.status).toUpperCase() : "ACTIVE";
    const desc = res.description || res.text?.div?.replace(/<[^>]+>/g, "") || "Instructions provided";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Care Plan
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ClipboardList className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900">{title}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-purple-50 text-purple-700 border-purple-200"
            >
              {status}
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Description / Instructions
          </span>
          <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    );
  };

  const renderProcedureCard = (res: any) => {
    const procName = res.code?.text || res.code?.coding?.[0]?.display || "Procedure";
    const status = res.status ? String(res.status).toUpperCase() : "COMPLETED";
    const date = formatDateSafe(res.performedDateTime);
    const note = res.note?.[0]?.text;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Procedure
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Activity className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm font-bold text-slate-900">{procName}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200"
            >
              {status}
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Performed Date
          </span>
          <span className="text-xs text-slate-700 mt-0.5 block">{date}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Notes
          </span>
          <span className="text-xs text-slate-700 mt-0.5 block">
            {note || "-"}
          </span>
        </div>
      </div>
    );
  };

  const renderCompositionCard = (res: any) => {
    const title = res.title || res.type?.text || "Clinical Document Composition";
    const status = res.status ? String(res.status).toUpperCase() : "FINAL";
    const date = formatDateSafe(res.date);

    return (
      <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Document Composition
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FileText className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-sm font-bold text-slate-900">{title}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Status
            </span>
            <div className="mt-1">
              <Badge
                variant="outline"
                className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200"
              >
                {status}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Document Date
            </span>
            <span className="text-xs text-slate-700 mt-0.5 block">{date}</span>
          </div>
        </div>

        {Array.isArray(res.section) && res.section.length > 0 && (
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Document Sections
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {res.section.map((sec: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-lg border border-slate-200"
                >
                  <strong className="text-slate-800 block text-xs">
                    {sec.title || "Section"}
                  </strong>
                  <p className="text-slate-600 mt-0.5 text-[11px]">
                    {sec.text?.div?.replace(/<[^>]+>/g, "") || "Clinical content recorded"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGenericResourceCard = (res: any) => {
    // Non-JSON, human-readable key-value representation for any generic/future FHIR resource
    const keys = Object.keys(res).filter(
      (k) => !["resourceType", "id", "meta", "text"].includes(k)
    );

    return (
      <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900">
            {res.resourceType || "Generic FHIR Resource"}
          </span>
          {res.status && (
            <Badge variant="outline" className="text-xs capitalize">
              {String(res.status)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {keys.slice(0, 6).map((k) => {
            const val = res[k];
            let displayVal = "-";
            if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
              displayVal = String(val);
            } else if (Array.isArray(val)) {
              displayVal = `${val.length} item(s)`;
            } else if (val && typeof val === "object") {
              displayVal = val.display || val.text || val.code || val.value || "Configured";
            }
            return (
              <div
                key={k}
                className="bg-white p-2 rounded-lg border border-slate-100"
              >
                <span className="text-[10.5px] font-semibold text-slate-400 capitalize block">
                  {k.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                  {displayVal}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Main resource dispatcher (NO RAW JSON)
  const renderReadableResource = (resource: any) => {
    const type = resource.resourceType;
    switch (type) {
      case "Observation":
        return renderObservationCard(resource);
      case "MedicationRequest":
      case "MedicationStatement":
        return renderMedicationRequestCard(resource);
      case "Patient":
        return renderPatientCard(resource);
      case "Practitioner":
        return renderPractitionerCard(resource);
      case "Organization":
        return renderOrganizationCard(resource);
      case "Encounter":
        return renderEncounterCard(resource);
      case "CarePlan":
        return renderCarePlanCard(resource);
      case "Procedure":
        return renderProcedureCard(resource);
      case "Composition":
        return renderCompositionCard(resource);
      default:
        return renderGenericResourceCard(resource);
    }
  };

  // =========================================================================
  // VIEW STATES: MISSING ID / LOADING / ERROR / EMPTY / SUCCESS
  // =========================================================================

  // 1. Missing Consent ID State
  if (!consentId) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-950">
              Missing Consent ID
            </h2>
            <p className="text-sm text-amber-800 mt-1 max-w-md mx-auto">
              No consent_id parameter was provided in the URL. Please return to Consent Management and select an approved consent to view records.
            </p>
          </div>
          <Button
            onClick={() => navigate("/consent")}
            className="bg-amber-700 hover:bg-amber-800 text-white cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Consent Management
          </Button>
        </div>
      </div>
    );
  }

  // 2. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-7 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Loading banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">
              Fetching FHIR Health Records...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Connecting to ABDM / HIU health-records service for Consent:
              <br />
              <code className="text-blue-600 font-mono mt-1 inline-block">
                {consentId}
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State (HTTP 404 / 500)
  if (errorMessage && !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-950">
              Unable to Load Health Records
            </h2>
            <p className="text-sm text-red-800 mt-1 max-w-md mx-auto">
              {errorMessage}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/consent")}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Consents
            </Button>
            <Button
              onClick={() => {
                loadHealthRecords();
              }}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty Response State
  if (!data?.records || data.records.length === 0 || data.record_count === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              No health records available for this consent.
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The consent was found, but no clinical bundles or health documents have been returned by the HIP yet.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/consent")}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Consent Management
            </Button>
            <Button
              onClick={() => {
                loadHealthRecords();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. MAIN HEALTH RECORDS VIEW:
  //    STRUCTURE:
  //    - Top Bar: Raw JSON Viewer button (opens Modal, raw JSON hidden by default)
  //    - Middle: Records (Dynamic bundle_name selection)
  //    - Resource Tabs: All (Count) | Resource Types (Count)
  //    - Bottom: Readable Resource Cards (NO RAW JSON)
  // =========================================================================

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => navigate("/consent")}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Consent
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">FHIR Health Records</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            FHIR Health Records
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Consent ID Badge with Copy */}
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Consent ID:</span>
            <span className="font-mono font-bold text-slate-900 select-all">
              {consentId}
            </span>
            <button
              type="button"
              onClick={handleCopyConsentId}
              title="Copy Consent ID"
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
            >
              {copiedConsentId ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Raw JSON Viewer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRawJsonModalOpen(true)}
            className="cursor-pointer text-xs font-semibold text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:text-purple-800"
          >
            <FileCode2 className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
            Raw JSON Viewer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/consent")}
            className="cursor-pointer text-xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Consents
          </Button>

          <Button
            size="sm"
            onClick={() => {
              loadHealthRecords();
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs shadow-2xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. RECORDS (BUNDLE SELECTION)                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-blue-600" />
            Records
          </h2>
          <span className="text-xs text-slate-500">
            {data.records.length} {data.records.length === 1 ? "record bundle" : "record bundles"} available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {data.records.map((rec, idx) => {
            const bundleName =
              rec.bundle_name ||
              rec.doc_type ||
              rec.facility_name ||
              `Record ${idx + 1}`;
            const isSelected = selectedRecordIndex === idx;
            const entryCount = rec.bundle?.entry?.length || 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedRecordIndex(idx);
                  setResourceFilter("ALL");
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2.5 ${isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/30"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                  }`}
              >
                <span className="font-bold">{bundleName}</span>
                <span
                  className={`text-[10.5px] px-1.5 py-0.5 rounded-full font-medium ${isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {entryCount} {entryCount === 1 ? "entry" : "entries"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bundle Metadata Card */}
      {activeRecord && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                Facility
              </span>
              <span className="font-bold text-slate-800">
                {activeRecord.facility_name || "SRM_CHENNAI"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                Care Context ID
              </span>
              <span
                className="font-mono font-medium text-slate-800 truncate block select-all"
                title={activeRecord.care_context_id}
              >
                {activeRecord.care_context_id || "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                Created At
              </span>
              <span className="font-medium text-slate-800">
                {formatDateSafe(activeRecord.created_at || activeRecord.bundle?.timestamp)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                Document Type
              </span>
              <span className="font-medium text-slate-800">
                {activeRecord.doc_type || activeRecord.bundle?.type || "Clinical Summary"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. RESOURCE TABS (All + Dynamic Counts)                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Resource Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setResourceFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${resourceFilter === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            All ({currentEntries.length})
          </button>
          {availableResourceTypes.map((type) => {
            const count = currentEntries.filter(
              (e) => e.resource?.resourceType === type
            ).length;
            const isSelected = resourceFilter === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setResourceFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${isSelected
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clinical data..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. READABLE FHIR RESOURCE CARDS (NO RAW JSON)                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
          No resources found matching filter &quot;{resourceFilter}&quot;
          {searchTerm ? ` and search &quot;${searchTerm}&quot;` : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, idx) => {
            const resource = entry.resource || {};
            const resType = resource.resourceType || "Resource";
            const resId = resource.id || `res-${idx}`;

            return (
              <div
                key={`${resType}-${resId}-${idx}`}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors space-y-3"
              >
                {/* Resource Card Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {resType}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 select-all truncate max-w-[200px] sm:max-w-md">
                      {resId}
                    </span>
                  </div>
                </div>

                {/* Readable UI Details (NO RAW JSON) */}
                <div>{renderReadableResource(resource)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. RAW JSON VIEWER MODAL (ONLY PLACE RAW JSON APPEARS)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isRawJsonModalOpen && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-150"
          onClick={() => setIsRawJsonModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Raw JSON Viewer
                  </h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10.5px] py-0 px-2 font-mono">
                    {data.record_count || data.records?.length || 0} Records
                  </Badge>
                </div>
                <div className="font-mono text-xs text-slate-600 font-semibold select-all">
                  GET /api/hiu/health-records/{consentId}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRawJson}
                  className="h-8 text-xs cursor-pointer"
                >
                  {copiedRawJson ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy JSON
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadRawJson}
                  className="h-8 text-xs cursor-pointer"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download
                </Button>
                <button
                  type="button"
                  onClick={() => setIsRawJsonModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            {/* Modal JSON Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)] bg-slate-950">
              <pre className="text-slate-100 font-mono text-[11.5px] leading-relaxed selection:bg-blue-600 selection:text-white">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
