import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";
import { FhirParsedViewer } from "./FhirParsedViewer";
import {
    startHiuConsent,
    getHiuConsentListFromDB,
    getHealthRecords,
    getPatientByUhid,
} from "@/api/hiu";
import type { StartConsentPayload, StartConsentResponse, HiuConsent } from "@/types/hiu";
import {
    FileKey,
    Calendar,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    CreditCard,
    X,
    Check,
    Clock,
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
    const location = useLocation();
    const locationState = location.state as { openRequestModal?: boolean; patient?: any } | null;
    const [records, setRecords] = useState<HiuConsent[]>([]);
    const [isLoadingConsents, setIsLoadingConsents] = useState<boolean>(true);
    const [, setTotalCount] = useState<number>(0);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdConsentResponse, setCreatedConsentResponse] = useState<StartConsentResponse | null>(null);
    const [viewingConsent, setViewingConsent] = useState<HiuConsent | null>(null);
    const [viewingFhirData, setViewingFhirData] = useState<any>(null);
    const [loadingConsentId, setLoadingConsentId] = useState<string | null>(null);

    // Request Consent Form States matching screenshot
    const [uhidInput, setUhidInput] = useState("");
    const [isFetchingPatient, setIsFetchingPatient] = useState(false);
    const [requestTo, setRequestTo] = useState("");
    const [recordRangeQuick, setRecordRangeQuick] = useState("Last 6 months");
    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        return d;
    });
    const [endDate, setEndDate] = useState<Date | undefined>(() => new Date());

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

    const formatDateSafe = (dateStr?: string, fmt = "dd MMM yyyy") => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return format(d, fmt);
        } catch { }
        return dateStr;
    };

    // Load live consents from centralized database API (GET /api/hiu/ConsentListFromDB)
    const loadConsents = useCallback(async () => {
        setIsLoadingConsents(true);
        try {
            const response = await getHiuConsentListFromDB();
            const list = Array.isArray(response?.data) ? response.data : [];
            setRecords(list);
            setTotalCount(response?.count ?? list.length);
        } catch (error: any) {
            console.error("Error loading backend consents from DB:", error);
            const msg = error?.message || "Failed to load consents from database.";
            notify.serverError(msg);
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
        if (isSubmitting) return;

        const trimmedAddress = requestTo.trim();
        if (!trimmedAddress) {
            notify.validationError("Please enter ABHA address / Request To user.");
            return;
        }

        if (!startDate) {
            notify.validationError("Please select a start date for the record period.");
            return;
        }

        if (!endDate) {
            notify.validationError("Please select an end date for the record period.");
            return;
        }

        if (startDate > endDate) {
            notify.validationError("Start date cannot be after end date.");
            return;
        }

        if (!expireInQuick) {
            notify.validationError("Please select consent expiration period.");
            return;
        }

        if (selectedRecordTypes.length === 0) {
            notify.validationError("Please select at least one medical record type.");
            return;
        }

        const periodFrom = format(startDate, "yyyy-MM-dd");
        const periodTo = format(endDate, "yyyy-MM-dd");
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

    const handleView = async (row: HiuConsent) => {
        const consentId = row.consent_id;
        if (!consentId) {
            notify.validationError("Missing consent ID for this record.");
            return;
        }

        // Prevent duplicate calls
        if (loadingConsentId) return;

        setLoadingConsentId(consentId);
        try {
            const fhirResponse = await getHealthRecords(consentId);

            const recordsList = fhirResponse?.records;
            if (!recordsList || !Array.isArray(recordsList) || recordsList.length === 0) {
                notify.serverError("No FHIR health records are available for this consent.");
                return;
            }

            const fhirBundleData =
                recordsList.length === 1 && recordsList[0].bundle
                    ? recordsList[0].bundle
                    : recordsList;

            setViewingFhirData(fhirBundleData);
            setViewingConsent(row);
        } catch (error: any) {
            console.error("Failed to fetch FHIR records:", error);
            const msg = error?.message || "Failed to fetch FHIR Bundles";
            notify.serverError(msg);
        } finally {
            setLoadingConsentId(null);
        }
    };

    const columns: ColumnDef<HiuConsent>[] = [
        {
            accessorKey: "uhid",
            header: "UHID",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-800 text-[13px]">
                    {row.original.uhid || "-"}
                </span>
            ),
        },
        {
            accessorKey: "patient_name",
            header: "PATIENT NAME",
            cell: ({ row }) => (
                <span className="text-[13px] text-slate-800 font-medium capitalize">
                    {row.original.patient_name || "-"}
                </span>
            ),
        },
        {
            accessorKey: "abha_address",
            header: "ABHA ADDRESS",
            cell: ({ row }) => (
                <span className="text-[12.5px] text-blue-600 font-mono font-medium block truncate max-w-[220px]" title={row.original.abha_address}>
                    {row.original.abha_address || "-"}
                </span>
            ),
        },
        {
            accessorKey: "consent_id",
            header: "CONSENT ID",
            cell: ({ row }) => (
                <div className="space-y-0.5 max-w-[260px]">
                    <span className="text-[12.5px] text-slate-800 select-all font-mono font-medium block truncate" title={row.original.consent_id || ""}>
                        {row.original.consent_id || "—"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "from",
            header: "FROM",
            cell: ({ row }) => (
                <span className="text-[13px] text-slate-700 font-medium">
                    {formatDateSafe(row.original.from, "dd MMM yyyy")}
                </span>
            ),
        },
        {
            accessorKey: "to",
            header: "TO",
            cell: ({ row }) => (
                <span className="text-[13px] text-slate-700 font-medium">
                    {formatDateSafe(row.original.to, "dd MMM yyyy")}
                </span>
            ),
        },
        {
            accessorKey: "expiry",
            header: "EXPIRY",
            cell: ({ row }) => (
                <span className="font-semibold text-emerald-600 text-[13px]">
                    {formatDateSafe(row.original.expiry, "dd MMM yyyy")}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => {
                const rawStatus = (row.original.status || "").trim();
                const status = rawStatus.toUpperCase();

                // Specific badge for INIT_ERROR PENDING / INIT_ERROR_PENDING
                if (
                    status === "INIT_ERROR PENDING" ||
                    status === "INIT_ERROR_PENDING" ||
                    status === "INIT ERROR PENDING" ||
                    (status.includes("INIT") && status.includes("ERROR") && status.includes("PENDING"))
                ) {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe]">
                            {rawStatus || "INIT_ERROR PENDING"}
                        </span>
                    );
                }

                // Match INIT_ERROR
                if (status === "INIT_ERROR" || status === "INIT ERROR" || status.startsWith("INIT_ERR")) {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                            {rawStatus || "INIT_ERROR"}
                        </span>
                    );
                }

                // Match PENDING
                if (status === "PENDING") {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#fef9c3] text-[#a16207] border border-[#fef08a]">
                            PENDING
                        </span>
                    );
                }

                // Match REQUESTED
                if (status === "REQUESTED") {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#feefeb] text-[#ea580c] border border-[#fed7aa]">
                            REQUESTED
                        </span>
                    );
                }

                // Match GRANTED / SUCCESS / APPROVED
                if (status === "GRANTED" || status === "SUCCESS" || status === "APPROVED") {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#e6f4ea] text-[#16a34a] border border-[#bbf7d0]">
                            GRANTED
                        </span>
                    );
                }

                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                        {rawStatus || "UNKNOWN"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "ACTION",
            enableSorting: false,
            cell: ({ row }) => {
                const isGranted = (row.original.status || "").toUpperCase() === "GRANTED" && Boolean(row.original.consent_id);
                return (
                    <ActionMenu
                        item={row.original}
                        onView={isGranted ? () => handleView(row.original) : undefined}
                        isViewLoading={loadingConsentId === row.original.consent_id}
                    />
                );
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
                        onClick={() => {
                            setViewingConsent(null);
                            setViewingFhirData(null);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                        Consent Management
                    </button>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-900 font-semibold">FHIR Clinical Record View</span>
                </nav>

                <FhirParsedViewer
                    consentDetails={{
                        consentId: viewingConsent.consent_id || "",
                        patientName: viewingConsent.patient_name,
                        uhidNo: String(viewingConsent.uhid || ""),
                        status: viewingConsent.status,
                        expiresOnDate: formatDateSafe(viewingConsent.expiry, "dd MMM yyyy"),
                        sharedFor: "6 months",
                    }}
                    patientDetails={{
                        patientname: viewingConsent.patient_name,
                        uhid: viewingConsent.uhid,
                        abhaaddress: viewingConsent.abha_address,
                    }}
                    initialData={viewingFhirData}
                    onBack={() => {
                        setViewingConsent(null);
                        setViewingFhirData(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Loading overlay during FHIR fetch */}
            {loadingConsentId && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-5 shadow-xl border border-slate-200 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-slate-800">
                            Fetching FHIR Health Records...
                        </span>
                    </div>
                </div>
            )}

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
                        options: ["REQUESTED", "GRANTED", "PENDING", "INIT_ERROR", "INIT_ERROR PENDING"],
                    },
                    { label: "Consent ID", key: "consent_id", type: "text" },
                    { label: "ABHA Address", key: "abha_address", type: "text" },
                    { label: "Patient Name", key: "patient_name", type: "text" },
                    { label: "UHID", key: "uhid", type: "text" },
                ]}
                searchField={(r) =>
                    `${r.uhid || ""} ${r.patient_name || ""} ${r.abha_address || ""} ${r.consent_id || ""} ${r.status || ""} ${r.from || ""} ${r.to || ""} ${r.expiry || ""}`
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
                        <div className="px-6 py-4 bg-amber-50/90 border-b border-amber-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                    <Clock className="h-5 w-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-amber-950">Consent Request Created</h3>
                                    <p className="text-xs text-amber-800">Waiting for patient to approve</p>
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
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                        (createdConsentResponse.status || "").toLowerCase() === "granted"
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                            : "bg-amber-100 text-amber-800 border border-amber-200"
                                    }`}>
                                        {createdConsentResponse.status || "Pending"}
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
                            {createdConsentResponse.consent_metadata && (
                                <>
                                    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                        <span className="text-slate-500 font-medium">Purpose</span>
                                        <span className="col-span-2 text-slate-800">
                                            {createdConsentResponse.consent_metadata.purpose || "-"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                        <span className="text-slate-500 font-medium">Record Period</span>
                                        <span className="col-span-2 text-slate-800 font-mono text-[11px]">
                                            {createdConsentResponse.consent_metadata.period_from} to {createdConsentResponse.consent_metadata.period_to}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                        <span className="text-slate-500 font-medium">Expiry</span>
                                        <span className="col-span-2 text-slate-800 font-mono text-[11px]">
                                            {createdConsentResponse.consent_metadata.expiry}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                                        <span className="text-slate-500 font-medium">Record Types</span>
                                        <div className="col-span-2 flex flex-wrap gap-1">
                                            {createdConsentResponse.consent_metadata.record_types?.map((type) => (
                                                <span key={type} className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded border border-slate-200">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
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
                                className="blue-btn text-white cursor-pointer text-xs font-semibold px-4"
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