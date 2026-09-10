import { useState, useEffect } from "react";
import { format } from "date-fns";
import CustomPanel from "@/common/CustomPanel";
import { DateField } from "@/components/FormPrimitives";
import { GENERATED_HIU_RECORDS, type HiuConsentRow } from "@/data/sampleData";
import { notify } from "@/lib/notify";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Search,
} from "lucide-react";
import type { Patient } from "@/types/op_register";

const ALL_RECORD_TYPES = [
  "OPConsultation",
  "Prescription",
  "DischargeSummary",
  "DiagnosticReport",
  "ImmunizationRecord",
  "HealthDocumentRecord",
  "WellnessRecord",
];

interface RequestConsentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess?: (record: HiuConsentRow) => void;
}

export function RequestConsentDrawer({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: RequestConsentDrawerProps) {
  const [requestTo, setRequestTo] = useState("testinguser12@sbx");
  const [recordRangeQuick, setRecordRangeQuick] = useState("Last 6 months");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2026, 2, 9));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2026, 8, 9));

  const [expireInQuick, setExpireInQuick] = useState("6 months");
  const [purpose, setPurpose] = useState("Care management");
  const [selectedRecordTypes, setSelectedRecordTypes] = useState<string[]>(ALL_RECORD_TYPES);

  const [isRecordRangeOpen, setIsRecordRangeOpen] = useState(true);
  const [isExpireInOpen, setIsExpireInOpen] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
  const [isRecordTypeDropdownOpen, setIsRecordTypeDropdownOpen] = useState(false);
  const [isPurposeDropdownOpen, setIsPurposeDropdownOpen] = useState(false);

  // Sync default user when patient is selected
  useEffect(() => {
    if (patient) {
      if (patient.email) {
        setRequestTo(patient.email);
      } else if (patient.patientName) {
        const cleanName = patient.patientName.toLowerCase().replace(/[^a-z0-9]/g, "");
        setRequestTo(`${cleanName || "user"}@sbx`);
      }
    } else {
      setRequestTo("testinguser12@sbx");
    }
  }, [patient, isOpen]);

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

  const handleSubmit = () => {
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
      patientName: patient?.patientName || requestTo.split("@")[0].toUpperCase(),
      uhidNo: patient?.id || "3995999",
      hiTypes: selectedRecordTypes.join(", "),
      purpose: purpose,
    };

    GENERATED_HIU_RECORDS.unshift(newRecord);
    if (onSuccess) {
      onSuccess(newRecord);
    }
    notify.saveSuccess("Medical records consent request sent successfully.");
    onClose();
  };

  return (
    <CustomPanel
      isOpen={isOpen}
      title="Request Medical Records"
      onClose={onClose}
      onSave={handleSubmit}
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

                {/* DateField Components */}
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
                {/* Purpose of Request */}
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

                {/* Medical record type */}
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Medical record type
                  </label>

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
      </div>
    </CustomPanel>
  );
}
