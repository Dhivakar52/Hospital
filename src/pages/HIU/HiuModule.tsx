import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/FormPrimitives";
import { GENERATED_HIU_RECORDS, type HiuConsentRow } from "@/data/sampleData";
import { notify } from "@/lib/notify";
import { FhirParsedViewer } from "./FhirParsedViewer";
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
    const [records, setRecords] = useState<HiuConsentRow[]>(GENERATED_HIU_RECORDS);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [viewingConsent, setViewingConsent] = useState<HiuConsentRow | null>(null);

    // Request Consent Form States matching screenshot
    const [requestTo, setRequestTo] = useState("testinguser12@sbx");
    const [recordRangeQuick, setRecordRangeQuick] = useState("Last 6 months");
    const [startDate, setStartDate] = useState<Date | undefined>(new Date(2026, 2, 9));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date(2026, 8, 9));

    useEffect(() => {
        if (locationState?.openRequestModal) {
            setIsRequestModalOpen(true);
            if (locationState.patient) {
                const p = locationState.patient;
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

    // Handle New Consent Request
    const handleRequestSubmit = () => {
        if (!requestTo.trim()) {
            notify.validationError("Please enter ABHA ID / Request To user.");
            return;
        }

        const randomHex = Math.random().toString(36).substring(2, 10);
        const randomHex2 = Math.random().toString(36).substring(2, 10);
        const newId = `${randomHex}-${randomHex2.slice(0, 4)}-4${randomHex2.slice(4, 7)}-9a2b-${Math.random().toString(36).substring(2, 14)}`;

        const newRecord: HiuConsentRow = {
            consentId: newId,
            requestedOnDate: "09 Sept 26",
            requestedOnTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase(),
            lastUpdatedDate: "09 Sept 26",
            lastUpdatedTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase(),
            sharedFor: `${expireInQuick}`,
            expiresInDays: `${expireInQuick}`,
            expiresOnDate: "09 Mar 27",
            status: "Pending",
            patientName: locationState?.patient?.patientName || requestTo.split("@")[0].toUpperCase(),
            uhidNo: locationState?.patient?.id || "3995999",
            hiTypes: selectedRecordTypes.join(", "),
            purpose: purpose,
        };

        setRecords((prev) => [newRecord, ...prev]);
        notify.saveSuccess("Medical records consent request sent successfully.");
        setIsRequestModalOpen(false);
    };

    const columns: ColumnDef<HiuConsentRow>[] = [
        {
            accessorKey: "consentId",
            header: "CONSENT ID",
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-700 select-all font-normal">
                    {row.original.consentId}
                </span>
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
                    <div className="text-[11.5px] text-slate-400">
                        {row.original.expiresOnDate}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => {
                const status = row.original.status;
                if (status === "Pending") {
                    return (
                        <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-medium bg-[#feefeb] text-[#f97316]">
                            Pending
                        </span>
                    );
                }
                if (status === "Success") {
                    return (
                        <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-medium bg-[#e6f4ea] text-[#16a34a]">
                            Success
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-medium bg-[#fee2e2] text-[#ef4444]">
                        INIT_ERROR
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "ACTION",
            enableSorting: false,
            cell: ({ row }) => {
                if (row.original.status === "Success") {
                    return (
                        <ActionMenu
                            item={row.original}
                            onView={() => setViewingConsent(row.original)}
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
                hideDateFilters={true}
                filterFields={[
                    {
                        label: "Status",
                        key: "status",
                        type: "select",
                        options: ["Pending", "Success", "INIT_ERROR"],
                    },
                    { label: "Consent ID", key: "consentId", type: "text" },
                    { label: "Patient Name", key: "patientName", type: "text" },
                ]}
                searchField={(r) =>
                    `${r.consentId} ${r.status} ${r.requestedOnDate} ${r.lastUpdatedDate} ${r.expiresOnDate} ${r.patientName || ""} ${r.uhidNo || ""}`
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
                onClose={() => setIsRequestModalOpen(false)}
                onSave={handleRequestSubmit}
                saveLabel="Request Medical Records"
                width="580px"
            >
                <div className="space-y-5 text-sm text-slate-700 font-sans">
                    {/* Inner Card Container */}
                    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-6">

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
                                        <span className="text-slate-400 font-semibold shrink-0">→</span>
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
        </div>
    );
}