import { useState, useMemo, useEffect, useCallback } from "react";
import { type HiuConsent, type ApproveConsentPayload } from "@/types/hiu";
import { type HipPatient } from "@/types/hip";
import {
  getHiuConsentList,
  approveHiuConsent,
  getStoredCreatedConsents,
  findStoredConsent,
} from "@/api/hiu";
import { fetchHipPatients } from "@/services/hipService";
import { ApprovalTabs } from "./components/ApprovalTabs";
import { PatientApprovalCard } from "./components/PatientApprovalCard";
import Pagination from "@/common/Pagination";
import { notify } from "@/lib/notify";
import { Search, Inbox, RefreshCw, Loader2 } from "lucide-react";

export default function PatientApprovalsPage() {
  const [consents, setConsents] = useState<HiuConsent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("REQUESTED");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Helper to ensure clean, valid ABDM/Eka duration timestamps
  // Eka strictly requires: medical records 'to' date must be a present or past date (<= now)
  const getSafeApprovalDuration = (consent: HiuConsent) => {
    const now = new Date();

    // 1. Process 'to' date - MUST be <= now (present or before date)
    let toDate = new Date();
    const rawTo = consent.period?.to || consent.consent_metadata?.period_to;
    if (rawTo) {
      const parsed = new Date(rawTo);
      if (!isNaN(parsed.getTime())) {
        toDate = parsed;
      }
    }
    // Cap to now so it is never in the future
    if (toDate.getTime() > now.getTime()) {
      toDate = new Date(now.getTime() - 1000); // 1 sec before current time
    }

    // 2. Process 'from' date - MUST be before toDate
    let fromDate = new Date(toDate.getTime());
    fromDate.setMonth(fromDate.getMonth() - 6);
    const rawFrom = consent.period?.from || consent.consent_metadata?.period_from;
    if (rawFrom) {
      const parsed = new Date(rawFrom);
      if (!isNaN(parsed.getTime())) {
        fromDate = parsed;
      }
    }
    if (fromDate.getTime() >= toDate.getTime()) {
      fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 3. Process 'erase_at' (Expiry) - MUST be in the future
    let expiryDate = new Date(now.getTime());
    expiryDate.setMonth(expiryDate.getMonth() + 6);
    const rawExpiry = consent.period?.expiry || consent.consent_metadata?.expiry;
    if (rawExpiry) {
      const parsed = new Date(rawExpiry);
      if (!isNaN(parsed.getTime())) {
        expiryDate = parsed;
      }
    }
    if (expiryDate.getTime() <= now.getTime()) {
      expiryDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    }

    return {
      fromIso: fromDate.toISOString(),
      toIso: toDate.toISOString(),
      expiryIso: expiryDate.toISOString(),
    };
  };

  // Load consents and patients from centralized backend APIs
  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      // Fetch patients to have real OID and patient identity mapping
      let patientList: HipPatient[] = [];
      try {
        patientList = await fetchHipPatients();
      } catch (e) {
        console.warn("Could not fetch patients for OID mapping:", e);
      }

      // Fetch live consent list from backend
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
        const dynamicOid = stored?.eka_oid || matched?.ekaoid || c.eka_oid || c.patient_oid || patientList[0]?.ekaoid;
        const patientName = matched?.patientname || c.patient_name || abha.split("@")[0].toUpperCase();
        const careContextId = stored?.care_context_id || c.care_context_id || matched?.carecontextid;

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
          const now = new Date().toISOString();
          enriched.unshift({
            c_at: now,
            consent_id: sc.consent_id || `REQ-${sc.hiu_request_id || Date.now()}`,
            consent_init_id: sc.consent_init_id || "",
            hi_types: sc.consent_metadata?.record_types || [
              "OPConsultation",
              "Prescription",
              "DiagnosticReport",
            ],
            period: {
              from: sc.consent_metadata?.period_from || "2026-09-03",
              to: sc.consent_metadata?.period_to || "2026-09-09",
              expiry: sc.consent_metadata?.expiry || "2027-03-09",
            },
            from: sc.consent_metadata?.period_from || "2026-09-03",
            to: sc.consent_metadata?.period_to || "2026-09-09",
            expiry: sc.consent_metadata?.expiry || "2027-03-09",
            is_granted: (sc.status || "").toUpperCase() === "GRANTED",
            uhid: String(matched?.uhid || sc.hiu_request_id || "3995999"),
            status: (sc.status || "REQUESTED").toUpperCase(),
            u_at: now,
            patient_name:
              matched?.patientname ||
              sc.abha_address?.split("@")[0].toUpperCase() ||
              "Suresh Babu",
            patient_oid: sc.eka_oid || matched?.ekaoid,
            eka_oid: sc.eka_oid || matched?.ekaoid,
            care_context_id: sc.care_context_id || matched?.carecontextid,
            abha_address: sc.abha_address,
            consent_metadata: sc.consent_metadata,
          });
        }
      });

      setConsents(enriched);
      if (isRefresh) {
        notify.saveSuccess("Consent list refreshed.");
      }
    } catch (error: any) {
      console.error("Error loading consent requests:", error);
      const message = error?.message || "Unable to load consent requests. Please try again.";
      notify.serverError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab counts
  const tabCounts = useMemo<Record<string, number>>(() => {
    const requested = consents.filter(
      (c) => (c.status || "").toUpperCase() === "REQUESTED"
    ).length;
    const granted = consents.filter(
      (c) => (c.status || "").toUpperCase() === "GRANTED"
    ).length;
    return {
      REQUESTED: requested,
      GRANTED: granted,
      ALL: consents.length,
    };
  }, [consents]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Filter records based on tab and search query
  const filteredConsents = useMemo(() => {
    let list = consents;
    if (activeTab === "REQUESTED") {
      list = consents.filter((c) => (c.status || "").toUpperCase() === "REQUESTED");
    } else if (activeTab === "GRANTED") {
      list = consents.filter((c) => (c.status || "").toUpperCase() === "GRANTED");
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((c) => {
      const matchId = (c.consent_id || "").toLowerCase().includes(query);
      const matchInitId = (c.consent_init_id || "").toLowerCase().includes(query);
      const matchStatus = (c.status || "").toLowerCase().includes(query);
      const matchPatient = (c.patient_name || "").toLowerCase().includes(query);
      const matchAbha = (c.abha_address || "").toLowerCase().includes(query);
      const matchTypes = (c.hi_types || []).some((t) => t.toLowerCase().includes(query));
      return matchId || matchInitId || matchStatus || matchPatient || matchAbha || matchTypes;
    });
  }, [consents, activeTab, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredConsents.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedConsents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredConsents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredConsents, currentPage, itemsPerPage]);

  const paginationTable = {
    getState: () => ({
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: itemsPerPage,
      },
    }),
    setPageIndex: (index: number) => setCurrentPage(index + 1),
    setPageSize: (size: number) => {
      setItemsPerPage(size);
      setCurrentPage(1);
    },
    previousPage: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
    nextPage: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
    getCanPreviousPage: () => currentPage > 1,
    getCanNextPage: () => currentPage < totalPages,
  };

  // Handle Approve Consent
  const handleApprove = async (consentToApprove: HiuConsent) => {
    const consentId = consentToApprove.consent_id;
    if (!consentId) return;

    // Retrieve associated patient OID dynamically from eka_oid or patient_oid
    const oid = consentToApprove.eka_oid || consentToApprove.patient_oid;
    if (!oid) {
      notify.validationError(
        "Cannot approve consent: patient Eka OID is missing for this consent request."
      );
      return;
    }

    const careContextId =
      consentToApprove.care_context_id ||
      "e31a8c42-7b25-4d61-92f8-6153b7c94050";

    const { fromIso, toIso, expiryIso } = getSafeApprovalDuration(consentToApprove);

    const hiTypes =
      consentToApprove.hi_types && consentToApprove.hi_types.length > 0
        ? consentToApprove.hi_types
        : consentToApprove.consent_metadata?.record_types || [
            "OPConsultation",
            "Prescription",
          ];

    const payload: ApproveConsentPayload = {
      access_mode: "view",
      consent_artefacts: [
        {
          access_mode: "view",
          care_contexts: [
            {
              display: "test-healthrecord",
              id: careContextId,
            },
          ],
          duration: {
            from: fromIso,
            to: toIso,
          },
          erase_at: expiryIso,
          hi_types: hiTypes,
          hip_id: "SRM_CHENNAI",
        },
      ],
      duration: {
        from: fromIso,
        to: toIso,
      },
      erase_at: expiryIso,
      hi_types: hiTypes,
      id: consentId,
    };

    setApprovingId(consentId);
    try {
      const response = await approveHiuConsent(oid, payload);
      notify.approveSuccess(response.message || "Consent approved successfully.");

      // Refresh consent list from backend immediately so status becomes GRANTED
      await loadData(false);
    } catch (error: any) {
      console.error("Error approving consent:", error);
      const message =
        error?.message || "Unable to approve consent. Please try again.";
      notify.serverError(message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14212b] dark:text-slate-100">
            Patient Approvals
          </h1>
          <p className="text-sm text-[#5b6b78] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Review and approve ABDM patient consent requests. Approved consents are granted and synchronized with the Gateway.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading}
            title="Refresh consent requests from backend"
            className="blue-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <ApprovalTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />

          {/* Search box */}
          <div className="relative w-full md:w-72 self-start md:self-auto mb-2 md:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search consent ID, patient, status..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0b6b6f] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center shadow-2xs">
            <Loader2 className="h-8 w-8 animate-spin text-[#0b6b6f] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Loading consent requests...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fetching live consent list from ABDM gateway
            </p>
          </div>
        ) : paginatedConsents.length > 0 ? (
          /* Dynamic Card List */
          <div className="space-y-3 pt-1">
            {paginatedConsents.map((consent) => (
              <PatientApprovalCard
                key={consent.consent_id}
                consent={consent}
                onApprove={handleApprove}
                isApproving={approvingId === consent.consent_id}
              />
            ))}

            {/* Pagination Component */}
            <div className="pt-2">
              <Pagination
                table={paginationTable}
                totalCount={filteredConsents.length}
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center shadow-2xs">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {searchQuery
                ? "No matching consent requests found"
                : `No ${activeTab} consent requests`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No records match "${searchQuery}". Try clearing your search.`
                : "Consent requests created in HIU will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
