import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/FormPrimitives";
import { type HiuConsentRow } from "@/data/sampleData";
import { notify } from "@/lib/notify";
import { FhirParsedViewer } from "./FhirParsedViewer";
import {
    startHiuConsent,
    getHiuConsentList,
    getStoredCreatedConsents,
    findStoredConsent,
    getPatientByUhid,
} from "@/api/hiu";
import { fetchHipPatients } from "@/services/hipService";
import type { HipPatient } from "@/types/hip";
import type { StartConsentPayload, StartConsentResponse } from "@/types/hiu";
import {
    FileKey,
    Calendar,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    CreditCard,
    X,
    Check,
    Search,
    Loader2,
    User,
} from "lucide-react";

const ALL_RECORD_TYPES = [
    "OPConsultation",
    "Prescription",
    "DischargeSummary",
    "DiagnosticReport",
    "ImmunizationRecord",
    "HealthDocumentRecord",
    "WellnessRecord",
];

export default function HiuModule() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as { openRequestModal?: boolean; patient?: any } | null;
    const [records, setRecords] = useState<HiuConsentRow[]>([]);
    const [isLoadingConsents, setIsLoadingConsents] = useState<boolean>(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdConsentResponse, setCreatedConsentResponse] = useState<StartConsentResponse | null>(null);
    const [viewingConsent, setViewingConsent] = useState<HiuConsentRow | null>(null);

    // Request Consent Form States matching screenshot
    const [uhidInput, setUhidInput] = useState("");
    const [isFetchingPatient, setIsFetchingPatient] = useState(false);
    const [requestTo, setRequestTo] = useState("");
    const [recordRangeQuick, setRecordRangeQuick] = useState("Last 6 months");
    const [startDate, setStartDate] = useState<Date | undefined>(new Date(2026, 2, 9));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date(2026, 8, 9));

    useEffect(() => {
        if (locationState?.openRequestModal) {
            setIsRequestModalOpen(true);
            if (locationState.patient) {
                const p = locationState.patient;
                if (p.uhid || p.id || p.opNo) {
                    setUhidInput(String(p.uhid || p.id || p.opNo));
                }
                if (p.email) {
                    setRequestTo(p.email);
                } else if (p.patientName) {
                    setRequestTo(`${p.patientName.toLowerCase().replace(/\s+/g, "")}@sbx`);
                }
            }
        }
    }, [location.state]);

    const [expireInQuick, setExpireInQuick] = useState("6 months");
    const [purpose, setPurpose] = useState("Care management");
    const [selectedRecordTypes, setSelectedRecordTypes] = useState<string[]>(ALL_RECORD_TYPES);

    const [isRecordRangeOpen, setIsRecordRangeOpen] = useState(true);
    const [isExpireInOpen, setIsExpireInOpen] = useState(true);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
    const [isRecordTypeDropdownOpen, setIsRecordTypeDropdownOpen] = useState(false);
    const [isPurposeDropdownOpen, setIsPurposeDropdownOpen] = useState(false);

    // Quick range helpers
    const handleQuickRangeSelect = (range: string) => {
        setRecordRangeQuick(range);
        const today = new Date();
        if (range === "Last 3 months") {
            const past = new Date();
            past.setMonth(past.getMonth() - 3);
            setStartDate(past);
            setEndDate(today);
        } else if (range === "Last 6 months") {
            const past = new Date();
            past.setMonth(past.getMonth() - 6);
            setStartDate(past);
            setEndDate(today);
        } else if (range === "Last 12 months") {
            const past = new Date();
            past.setFullYear(past.getFullYear() - 1);
            setStartDate(past);
            setEndDate(today);
        }
    };

    const formatDateSafe = (dateStr?: string, fmt = "dd MMM yy") => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return format(d, fmt);
        } catch { }
        return dateStr;
    };

    // Load live consents from centralized backend API
    const loadConsents = useCallback(async () => {
        setIsLoadingConsents(true);
        try {
            let patientList: HipPatient[] = [];
            try {
                patientList = await fetchHipPatients();
            } catch (err) {
                console.warn("Could not load patients list for mapping:", err);
            }

            const storedConsents = getStoredCreatedConsents();
            const response = await getHiuConsentList();
            const rawConsents = response.consents || [];

            // Map backend consents and enrich with stored created details
            const mapped: HiuConsentRow[] = rawConsents.map((c) => {
                const stored = findStoredConsent({
                    consentId: c.consent_id,
                    consentInitId: c.consent_init_id,
                    abhaAddress: c.abha_address,
                });

                const abha = stored?.abha_address || c.abha_address || "testinguser12@sbx";

                const matched = patientList.find(
                    (p) =>
                        p.abhaaddress === abha ||
                        (stored?.care_context_id && p.carecontextid === stored.care_context_id) ||
                        (c.care_context_id && p.carecontextid === c.care_context_id)
                );
                const pName = matched?.patientname || c.patient_name || abha.split("@")[0].toUpperCase();
                const uhid = String(matched?.uhid || stored?.hiu_request_id || "3995999");
                const careCtx = stored?.care_context_id || c.care_context_id || matched?.carecontextid;
                const ekaOid = stored?.eka_oid || matched?.ekaoid;

                return {
                    consentId: c.consent_id,
                    consentInitId: c.consent_init_id || stored?.consent_init_id,
                    requestedOnDate: formatDateSafe(c.c_at, "dd MMM yy"),
                    requestedOnTime: formatDateSafe(c.c_at, "hh:mm a").toLowerCase(),
                    lastUpdatedDate: formatDateSafe(c.u_at || c.c_at, "dd MMM yy"),
                    lastUpdatedTime: formatDateSafe(c.u_at || c.c_at, "hh:mm a").toLowerCase(),
                    sharedFor: "6 months",
                    expiresInDays: formatDateSafe(c.period?.expiry || stored?.consent_metadata?.expiry, "dd MMM yy"),
                    expiresOnDate: formatDateSafe(c.period?.expiry || stored?.consent_metadata?.expiry, "dd MMM yy"),
                    status: (c.status || stored?.status || "REQUESTED").toUpperCase(),
                    patientName: pName,
                    uhidNo: uhid,
                    hiTypes: (c.hi_types && c.hi_types.length > 0 ? c.hi_types : stored?.consent_metadata?.record_types || []).join(", "),
                    purpose: stored?.consent_metadata?.purpose || "Care management",
                    abhaAddress: abha,
                    careContextId: careCtx,
                    ekaOid: ekaOid,
                    periodFrom: c.period?.from || stored?.consent_metadata?.period_from,
                    periodTo: c.period?.to || stored?.consent_metadata?.period_to,
                    recordTypes: c.hi_types && c.hi_types.length > 0 ? c.hi_types : stored?.consent_metadata?.record_types,
                };
            });

            // Include any stored created consent that has not yet appeared in backend list
            storedConsents.forEach((sc) => {
                const alreadyExists = mapped.some(
                    (m) =>
                        (sc.consent_id && m.consentId === sc.consent_id) ||
                        (sc.consent_init_id && m.consentInitId === sc.consent_init_id)
                );
                if (!alreadyExists) {
                    const matched = patientList.find(
                        (p) =>
                            p.abhaaddress === sc.abha_address ||
                            (sc.care_context_id && p.carecontextid === sc.care_context_id)
                    );
                    const now = new Date();
                    mapped.unshift({
                        consentId: sc.consent_id || `REQ-${sc.hiu_request_id || Date.now()}`,
                        consentInitId: sc.consent_init_id,
                        requestedOnDate: formatDateSafe(now.toISOString(), "dd MMM yy"),
                        requestedOnTime: formatDateSafe(now.toISOString(), "hh:mm a").toLowerCase(),
                        lastUpdatedDate: formatDateSafe(now.toISOString(), "dd MMM yy"),
                        lastUpdatedTime: formatDateSafe(now.toISOString(), "hh:mm a").toLowerCase(),
                        sharedFor: "6 months",
                        expiresInDays: formatDateSafe(sc.consent_metadata?.expiry, "dd MMM yy"),
                        expiresOnDate: formatDateSafe(sc.consent_metadata?.expiry, "dd MMM yy"),
                        status: (sc.status || "REQUESTED").toUpperCase(),
                        patientName: matched?.patientname || sc.abha_address?.split("@")[0].toUpperCase() || "Suresh Babu",
                        uhidNo: String(matched?.uhid || sc.hiu_request_id || "3995999"),
                        hiTypes: (sc.consent_metadata?.record_types || []).join(", "),
                        purpose: sc.consent_metadata?.purpose || "Care management",
                        abhaAddress: sc.abha_address,
                        careContextId: sc.care_context_id,
                        ekaOid: sc.eka_oid || matched?.ekaoid,
                        periodFrom: sc.consent_metadata?.period_from,
                        periodTo: sc.consent_metadata?.period_to,
                        recordTypes: sc.consent_metadata?.record_types,
                    });
                }
            });

            setRecords(mapped);
        } catch (error) {
            console.error("Error loading backend consents:", error);
        } finally {
            setIsLoadingConsents(false);
        }
    }, []);

    useEffect(() => {
        loadConsents();
    }, [loadConsents]);

    // Helper to calculate expiry date based on quick pills (e.g. "6 months" -> "2027-03-09")
    const computeExpiryDate = (expireStr: string): string => {
        const d = new Date();
        if (expireStr.includes("1 week")) {
            d.setDate(d.getDate() + 7);
        } else if (expireStr.includes("1 month")) {
            d.setMonth(d.getMonth() + 1);
        } else if (expireStr.includes("3 month")) {
            d.setMonth(d.getMonth() + 3);
        } else if (expireStr.includes("6 month")) {
            d.setMonth(d.getMonth() + 6);
        } else if (expireStr.includes("12 month") || expireStr.includes("1 year")) {
            d.setFullYear(d.getFullYear() + 1);
        } else {
            d.setMonth(d.getMonth() + 6);
        }
        return format(d, "yyyy-MM-dd");
    };

    // Handle fetching patient ABHA Address by UHID
    const handleGetPatientDetails = async () => {
        const trimmedUhid = uhidInput.trim();
        if (!trimmedUhid) {
            notify.validationError("Please enter a valid UHID.");
            return;
        }
        if (isFetchingPatient) return;

        setIsFetchingPatient(true);
        try {
            const res = await getPatientByUhid(trimmedUhid);
            const abhaAddress = res?.data?.abha_address?.trim();
            if (res?.success && abhaAddress) {
                setRequestTo(abhaAddress);
                notify.saveSuccess("ABHA Address fetched successfully.");
            } else {
                notify.serverError(res?.message || "No ABHA Address found for the given UHID.");
            }
        } catch (err: any) {
            notify.serverError(err?.message || "Failed to fetch patient details. Please try again.");
        } finally {
            setIsFetchingPatient(false);
        }
    };

    // Handle New Consent Request via centralized Axios API
    const handleRequestSubmit = async () => {
        const trimmedAddress = requestTo.trim();
        if (!trimmedAddress) {
            notify.validationError("Please enter ABHA address / Request To user.");
            return;
        }

        if (selectedRecordTypes.length === 0) {
            notify.validationError("Please select at least one medical record type.");
            return;
        }

        const periodFrom = startDate ? format(startDate, "yyyy-MM-dd") : "2026-09-03";
        const periodTo = endDate ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        const expiryDate = computeExpiryDate(expireInQuick);

        const payload: StartConsentPayload = {
            abha_address: trimmedAddress,
            dry_run: false,
            expiry: expiryDate,
            period_from: periodFrom,
            period_to: periodTo,
            purpose: purpose || "Care management",
            record_types: selectedRecordTypes,
        };

        setIsSubmitting(true);
        try {
            const response = await startHiuConsent(payload);

            setIsRequestModalOpen(false);
            setCreatedConsentResponse(response);
            notify.saveSuccess(response.message || "Consent request created successfully.");

            // Refresh backend consent list immediately so created consent appears in Consent Management
            await loadConsents();
        } catch (error: any) {
            const errorMessage = error?.message || "Unable to create consent request. Please try again.";
            notify.serverError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnDef<HiuConsentRow>[] = [
        {
            accessorKey: "consentId",
            header: "CONSENT ID",
            cell: ({ row }) => (
                <div className="space-y-0.5 max-w-[260px]">
                    <span className="text-[12.5px] text-slate-800 select-all font-mono font-medium block truncate" title={row.original.consentId}>
                        {row.original.consentId}
                    </span>
                    {/* {row.original.abhaAddress && (
                        <span className="text-[11px] text-blue-600 font-mono block truncate" title={row.original.abhaAddress}>
                            {row.original.abhaAddress}
                        </span>
                    )} */}
                </div>
            ),
        },
        {
            accessorKey: "requestedOnDate",
            header: "REQUESTED ON",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-800 text-[13px]">
                        {row.original.requestedOnDate}
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                        {row.original.requestedOnTime}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "lastUpdatedDate",
            header: "LAST UPDATED",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-800 text-[13px]">
                        {row.original.lastUpdatedDate}
                    </div>
                    <div className="text-[11.5px] text-slate-400">
                        {row.original.lastUpdatedTime}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "sharedFor",
            header: "SHARED FOR",
            cell: ({ row }) => (
                <span className="text-[13px] text-slate-700 font-medium">
                    {row.original.sharedFor}
                </span>
            ),
        },
        {
            accessorKey: "expiresInDays",
            header: "EXPIRES IN",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-emerald-600 text-[13px]">
                        {row.original.expiresInDays}
                    </div>
                    {/* <div className="text-[11.5px] text-slate-400">
                        {row.original.expiresOnDate}
                    </div> */}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => {
                const status = (row.original.status || "").toUpperCase();
                if (status === "REQUESTED" || status === "PENDING") {
                    return (
                        <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-medium bg-[#feefeb] text-[#f97316]">
                            REQUESTED
                        </span>
                    );
                }
                if (status === "GRANTED" || status === "SUCCESS") {
                    return (
                        <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-medium bg-[#e6f4ea] text-[#16a34a]">
                            GRANTED
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-medium bg-[#fee2e2] text-[#ef4444]">
                        {status || "INIT_ERROR"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "ACTION",
            enableSorting: false,
            cell: ({ row }) => {
                const status = (row.original.status || "").toUpperCase();
                if (status === "GRANTED" || status === "SUCCESS") {
                    return (
                        <ActionMenu
                            item={row.original}
                            onView={() => {
                                const consentId = row.original.consentId || row.original.consentInitId;
                                if (consentId) {
                                    navigate(`/approved?consent_id=${encodeURIComponent(consentId)}`);
                                }
                            }}
                        />
                    );
                }
                return <span className="text-slate-400 text-[13px]">-</span>;
            },
        },
    ];

    if (viewingConsent) {
        return (
            <div className="space-y-4">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="text-slate-400">HIU</span>
                    <span className="text-slate-400">/</span>
                    <button
                        type="button"
                        onClick={() => setViewingConsent(null)}
                        className="text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                        Consent Management
                    </button>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-900 font-semibold">FHIR Clinical Record View</span>
                </nav>

                <FhirParsedViewer
                    consentDetails={viewingConsent}
                    onBack={() => setViewingConsent(null)}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Standardized Card & Table */}
            <StandardModuleTable
                title="Consent Management"
                subtitle="Manage Health Information User (HIU) consent requests and patient data access"
                countUnit="Consents"
                searchPlaceholder="Search consent ID, status, date..."
                columns={columns}
                data={records}
                isLoading={isLoadingConsents}
                hideDateFilters={true}
                filterFields={[
                    {
                        label: "Status",
                        key: "status",
                        type: "select",
                        options: ["REQUESTED", "GRANTED", "INIT_ERROR"],
                    },
                    { label: "Consent ID", key: "consentId", type: "text" },
                    { label: "ABHA Address", key: "abhaAddress", type: "text" },
                    { label: "Patient Name", key: "patientName", type: "text" },
                ]}
                searchField={(r) =>
                    `${r.consentId} ${r.consentInitId || ""} ${r.status} ${r.requestedOnDate} ${r.lastUpdatedDate} ${r.expiresOnDate} ${r.patientName || ""} ${r.uhidNo || ""} ${r.abhaAddress || ""} ${r.ekaOid || ""}`
                }
                headerExtra={
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => setIsRequestModalOpen(true)}
                            className="h-9 w-9 p-0 shrink-0 text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 cursor-pointer shadow-xs rounded-md"
                            title="Request Consent"
                        >
                            <FileKey className="h-4 w-4" />
                        </Button>
                    </div>
                }
            />

            {/* Request Consent Drawer / CustomPanel */}
            <CustomPanel
                isOpen={isRequestModalOpen}
                title="Request Medical Records"
                onClose={() => {
                    if (!isSubmitting) setIsRequestModalOpen(false);
                }}
                onSave={handleRequestSubmit}
                saveLabel={isSubmitting ? "Requesting..." : "Request Medical Records"}
                isLoading={isSubmitting}
                width="580px"
            >
                <div className="space-y-5 text-sm text-slate-700 font-sans">
                    {/* Inner Card Container */}
                    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-6">

                        {/* 0. UHID & Get Details */}
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <User className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="text-[13.5px] font-medium text-slate-700 shrink-0">UHID:</span>
                            <input
                                type="text"
                                value={uhidInput}
                                onChange={(e) => setUhidInput(e.target.value)}
                                placeholder="Enter UHID (e.g. 10000005)"
                                className="h-8 flex-1 px-2.5 text-sm font-bold text-slate-900 border-0 focus:ring-0 focus:outline-none bg-slate-50/50 rounded"
                                disabled={isFetchingPatient}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleGetPatientDetails();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleGetPatientDetails}
                                disabled={isFetchingPatient || !uhidInput.trim()}
                                className="blue-btn text-white font-medium text-xs shadow-xs h-8 px-3 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isFetchingPatient ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-1.5 h-3.5 w-3.5" />
                                        Get Details
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* 1. Request to */}
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <CreditCard className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="text-[13.5px] font-medium text-slate-700 shrink-0">Request to:</span>
                            <input
                                type="text"
                                value={requestTo}
                                onChange={(e) => setRequestTo(e.target.value)}
                                placeholder="e.g. testinguser12@sbx"
                                className="h-8 flex-1 px-2.5 text-sm font-bold text-slate-900 border-0 focus:ring-0 focus:outline-none bg-slate-50/50 rounded"
                            />
                        </div>

                        {/* 2. Request records from */}
                        <div className="space-y-3 pb-4 border-b border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsRecordRangeOpen(!isRecordRangeOpen)}
                                className="flex items-center justify-between w-full text-left text-[13.5px] cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span>Request records from:</span>
                                    <span className="font-bold text-slate-900">
                                        {recordRangeQuick === "Custom"
                                            ? `${startDate ? format(startDate, "dd MMM yyyy") : "Start date"} – ${endDate ? format(endDate, "dd MMM yyyy") : "Today"}`
                                            : `${recordRangeQuick} – Today`}
                                    </span>
                                </div>
                                {isRecordRangeOpen ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>

                            {isRecordRangeOpen && (
                                <div className="space-y-3 pt-1">
                                    {/* Quick Selection Pills */}
                                    <div className="flex items-center gap-2.5 pt-1">
                                        {["Last 3 months", "Last 6 months", "Last 12 months"].map((range) => {
                                            const isSelected = recordRangeQuick === range;
                                            return (
                                                <button
                                                    key={range}
                                                    type="button"
                                                    onClick={() => handleQuickRangeSelect(range)}
                                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${isSelected
                                                        ? "border-blue-600 text-blue-600 bg-blue-50/60 font-semibold shadow-xs"
                                                        : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {range}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Application's DateField Components */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="flex-1">
                                            <DateField
                                                value={startDate}
                                                minDate={(() => {
                                                    const d = new Date();
                                                    if (recordRangeQuick === "Last 3 months") d.setMonth(d.getMonth() - 3);
                                                    else if (recordRangeQuick === "Last 6 months") d.setMonth(d.getMonth() - 6);
                                                    else d.setFullYear(d.getFullYear() - 1);
                                                    return d;
                                                })()}
                                                maxDate={new Date()}
                                                onChange={(d) => {
                                                    setStartDate(d);
                                                    setRecordRangeQuick("Custom");
                                                }}
                                                placeholder="Start date"
                                            />
                                        </div>
                                        <span className="text-slate-400 font-semibold shrink-0">-</span>
                                        <div className="flex-1">
                                            <DateField
                                                value={endDate}
                                                minDate={(() => {
                                                    const d = new Date();
                                                    if (recordRangeQuick === "Last 3 months") d.setMonth(d.getMonth() - 3);
                                                    else if (recordRangeQuick === "Last 6 months") d.setMonth(d.getMonth() - 6);
                                                    else d.setFullYear(d.getFullYear() - 1);
                                                    return d;
                                                })()}
                                                maxDate={new Date()}
                                                onChange={(d) => {
                                                    setEndDate(d);
                                                    setRecordRangeQuick("Custom");
                                                }}
                                                placeholder="End date"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Shared records will expire in */}
                        <div className="space-y-3 pb-4 border-b border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsExpireInOpen(!isExpireInOpen)}
                                className="flex items-center justify-between w-full text-left text-[13.5px] cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-slate-700">
                                    <AlertTriangle className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span>Shared records will expire in:</span>
                                    <span className="font-bold text-slate-900">{expireInQuick}</span>
                                </div>
                                {isExpireInOpen ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>

                            {isExpireInOpen && (
                                <div className="space-y-3 pt-1">
                                    <p className="text-xs text-blue-600/90 font-normal">
                                        The expiry date of records can be changed by the patient
                                    </p>

                                    {/* Quick Selection Pills */}
                                    <div className="flex items-center flex-wrap gap-2 pt-1">
                                        {["1 week", "1 month", "3 months", "6 months", "12 months"].map((exp) => {
                                            const isSelected = expireInQuick === exp;
                                            return (
                                                <button
                                                    key={exp}
                                                    type="button"
                                                    onClick={() => setExpireInQuick(exp)}
                                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${isSelected
                                                        ? "border-blue-600 text-blue-600 bg-blue-50/60 font-semibold shadow-xs"
                                                        : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {exp}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Advanced Options */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className="flex items-center justify-between w-full text-left text-sm font-bold text-blue-700 cursor-pointer"
                            >
                                <span>Advanced Options:</span>
                                {isAdvancedOpen ? (
                                    <ChevronUp className="h-4 w-4 text-blue-700" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-blue-700" />
                                )}
                            </button>

                            {isAdvancedOpen && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {/* Purpose of Request matching screenshot exact 3 items & styling */}
                                    <div className="relative">
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                            Purpose of Request
                                        </label>
                                        <div
                                            onClick={() => setIsPurposeDropdownOpen(!isPurposeDropdownOpen)}
                                            className={`w-full h-9 px-3 border rounded-lg bg-white flex items-center justify-between cursor-pointer transition-all ${isPurposeDropdownOpen
                                                ? "border border-blue-500 shadow-xs"
                                                : "border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            <span className="text-xs font-semibold text-slate-400/90 truncate">
                                                {purpose}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
                                        </div>

                                        {/* Custom Dropdown Popup matching screenshot */}
                                        {isPurposeDropdownOpen && (
                                            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 space-y-1">
                                                {[
                                                    "Care management",
                                                    "Public Health",
                                                    "Disease Specific Healthcare Research",
                                                ].map((opt) => {
                                                    const isSelected = purpose === opt;
                                                    return (
                                                        <div
                                                            key={opt}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPurpose(opt);
                                                                setIsPurposeDropdownOpen(false);
                                                            }}
                                                            className={`px-3 py-2 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors ${isSelected
                                                                ? "bg-[#e6f4ff] text-slate-900"
                                                                : "text-slate-800 hover:bg-slate-50"
                                                                }`}
                                                        >
                                                            {opt}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Medical record type matching screenshot exact style */}
                                    <div className="relative">
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                            Medical record type
                                        </label>

                                        {/* Input Container Box */}
                                        <div
                                            onClick={() => setIsRecordTypeDropdownOpen(!isRecordTypeDropdownOpen)}
                                            className={`w-full min-h-[38px] px-2 py-1 border rounded-lg bg-[#f4f4f6]/90 flex items-center justify-between gap-1 cursor-pointer transition-all ${isRecordTypeDropdownOpen
                                                ? "border-2 border-blue-500 bg-white shadow-xs"
                                                : "border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center flex-wrap gap-1.5">
                                                {selectedRecordTypes.length > 0 ? (
                                                    <>
                                                        <span className="inline-flex items-center gap-1.5 bg-[#e4e4e7] text-slate-900 text-xs font-medium px-2.5 py-1 rounded">
                                                            {selectedRecordTypes[0]}
                                                            <X
                                                                className="h-3.5 w-3.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedRecordTypes((prev) =>
                                                                        prev.filter((t) => t !== selectedRecordTypes[0])
                                                                    );
                                                                }}
                                                            />
                                                        </span>
                                                        {selectedRecordTypes.length > 1 && (
                                                            <span className="bg-[#e4e4e7] text-slate-700 text-xs font-medium px-2.5 py-1 rounded">
                                                                + {selectedRecordTypes.length - 1} ...
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 text-xs px-1">Select record types...</span>
                                                )}
                                            </div>
                                            <Search className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
                                        </div>

                                        {/* Multi Select Blue Dropdown Popup */}
                                        {isRecordTypeDropdownOpen && (
                                            <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#eef7ff] border border-blue-200/80 rounded-xl shadow-lg p-2 z-50 max-h-60 overflow-y-auto space-y-0.5">
                                                {ALL_RECORD_TYPES.map((type) => {
                                                    const isChecked = selectedRecordTypes.includes(type);
                                                    return (
                                                        <div
                                                            key={type}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isChecked) {
                                                                    setSelectedRecordTypes((prev) => prev.filter((t) => t !== type));
                                                                } else {
                                                                    setSelectedRecordTypes((prev) => [...prev, type]);
                                                                }
                                                            }}
                                                            className="flex items-center justify-between px-3 py-2 text-[13.5px] font-medium text-slate-800 hover:bg-blue-100/70 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <span>{type}</span>
                                                            {isChecked && <Check className="h-4 w-4 text-[#2563eb] stroke-[2.5]" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Primary Action Button Row */}
                    {/* <div className="pt-2 flex justify-center">
                        <Button
                            onClick={handleRequestSubmit}
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold gap-2 rounded-md shadow-md text-sm cursor-pointer"
                        >
                            <FilePenLine className="h-4 w-4" />
                            Request Medical Records
                        </Button>
                    </div> */}
                </div>
            </CustomPanel>

            {/* Success Consent Response Modal */}
            {createdConsentResponse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-emerald-50/90 border-b border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Check className="h-5 w-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-950">Consent Request Created</h3>
                                    <p className="text-xs text-emerald-700">Waiting for patient to approve</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreatedConsentResponse(null)}
                                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3 text-xs">
                            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Status</span>
                                <span className="col-span-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                                        {createdConsentResponse.status}
                                    </span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Consent ID</span>
                                <span className="col-span-2 font-mono text-slate-900 break-all select-all font-semibold">
                                    {createdConsentResponse.consent_id || "-"}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Consent Init ID</span>
                                <span className="col-span-2 font-mono text-slate-700 break-all select-all">
                                    {createdConsentResponse.consent_init_id || "-"}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">HIU Request ID</span>
                                <span className="col-span-2 font-semibold text-slate-900">
                                    {createdConsentResponse.hiu_request_id}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">ABHA Address</span>
                                <span className="col-span-2 font-mono text-slate-800">
                                    {createdConsentResponse.abha_address}
                                </span>
                            </div>
                            {createdConsentResponse.eka_oid && (
                                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Eka OID</span>
                                    <span className="col-span-2 font-mono text-slate-900 font-bold select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                        {createdConsentResponse.eka_oid}
                                    </span>
                                </div>
                            )}
                            {createdConsentResponse.care_context_id && (
                                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Care Context ID</span>
                                    <span className="col-span-2 font-mono text-slate-600 break-all">
                                        {createdConsentResponse.care_context_id}
                                    </span>
                                </div>
                            )}
                            <div className="pt-1.5">
                                <span className="text-slate-500 font-medium block mb-1">Message</span>
                                <p className="bg-slate-50 rounded-lg p-2.5 text-slate-700 border border-slate-200/80 leading-relaxed text-[11.5px]">
                                    {createdConsentResponse.message}
                                </p>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button
                                size="sm"
                                onClick={() => setCreatedConsentResponse(null)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs font-semibold px-4"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}