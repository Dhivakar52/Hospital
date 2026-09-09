import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import CustomPanel from "@/common/CustomPanel";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/FormPrimitives";
import { GENERATED_HIU_RECORDS, type HiuConsentRow } from "@/data/sampleData";
import { notify } from "@/lib/notify";
import viewJsonData from "@/data/view.json";
import {
  FileKey,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FilePenLine,
  CreditCard,
  X,
  Check,
  Download,
  FileText,
  Search,
  ArrowLeft,
  ClipboardList,
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
  const [records, setRecords] = useState<HiuConsentRow[]>(GENERATED_HIU_RECORDS);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // FHIR Viewer Screen State (when View is clicked from ActionMenu)
  const [viewingFhirRecord, setViewingFhirRecord] = useState<HiuConsentRow | null>(null);
  const [activeFhirTab, setActiveFhirTab] = useState<string>("Documents");

  // Request Consent Form States matching screenshot
  const [requestTo, setRequestTo] = useState("testinguser12@sbx");
  const [recordRangeQuick, setRecordRangeQuick] = useState("Last 6 months");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2026, 2, 9));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2026, 8, 9));

  const [expireInQuick, setExpireInQuick] = useState("6 months");
  const [purpose, setPurpose] = useState("Care management");
  const [selectedRecordTypes, setSelectedRecordTypes] = useState<string[]>(ALL_RECORD_TYPES);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
  const [isRecordTypeDropdownOpen, setIsRecordTypeDropdownOpen] = useState(false);

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
      patientName: requestTo.split("@")[0].toUpperCase(),
      uhidNo: "3995999",
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
        <span className="font-mono text-[12.5px] text-slate-700 select-all font-normal">
          {row.original.consentId}
        </span>
      ),
    },
    {
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
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "Pending") {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#feefeb] text-[#f97316]">
              Pending
            </span>
          );
        }
        if (status === "Success") {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#e6f4ea] text-[#16a34a]">
              Success
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#fee2e2] text-[#ef4444]">
            INIT_ERROR
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setViewingFhirRecord(item)}
          onDelete={(item) => {
            setRecords((prev) => prev.filter((r) => r.consentId !== item.consentId));
          }}
        />
      ),
    },
  ];

  // Full Screen ABDM FHIR Viewer when View is clicked from Action Menu
  if (viewingFhirRecord) {
    const compositionRes = viewJsonData.entry.find((e: any) => e.resource?.resourceType === "Composition")?.resource;
    const patientRes = viewJsonData.entry.find((e: any) => e.resource?.resourceType === "Patient")?.resource;
    const practitionerRes = viewJsonData.entry.find((e: any) => e.resource?.resourceType === "Practitioner")?.resource;
    const orgRes = viewJsonData.entry.find((e: any) => e.resource?.resourceType === "Organization")?.resource;
    const encounterRes = viewJsonData.entry.find((e: any) => e.resource?.resourceType === "Encounter")?.resource;

    const patientName = typeof patientRes?.name === "string" 
      ? patientRes.name 
      : Array.isArray(patientRes?.name) && patientRes.name[0]
        ? typeof patientRes.name[0] === "string"
          ? patientRes.name[0]
          : String((patientRes.name[0] as any)?.text || viewingFhirRecord.patientName || "K Manikandan")
        : String(viewingFhirRecord.patientName || "K Manikandan");

    const patientAbha = String(patientRes?.identifier?.find((i: any) => i.type?.coding?.[0]?.code === "ABHA")?.value || viewingFhirRecord.uhidNo || "testingmani@sbx");
    const patientPhone = String(patientRes?.telecom?.[0]?.value || "6382769129");

    const practitionerName = typeof practitionerRes?.name === "string" ? practitionerRes.name : Array.isArray(practitionerRes?.name) && (practitionerRes.name[0] as any)?.text ? String((practitionerRes.name[0] as any).text) : "Dr. Arun Kumar";
    const orgName = typeof orgRes?.name === "string" ? orgRes.name : "SRM_CHENNAI";

    return (
      <div className="min-h-screen bg-[#f4f5f7] p-6 space-y-4 font-sans text-slate-800">
        {/* Top Branding Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-700 text-lg tracking-tight">ABDM FHIR</span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">VIEWER</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>7 resources · Composition · Patient · Practitioner · Organization · Encounter</span>
          </div>
        </div>

        {/* Card 1: Health Document Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{compositionRes?.title || "Health Document"}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>General health record</span>
                <span>·</span>
                <span>{compositionRes?.date?.slice(0, 10) || "2026-09-04"}</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">{orgName}</span>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200">
                  document
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setViewingFhirRecord(null)}
            className="gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer h-9 px-4 rounded-md border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Card 2: Patient Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center shrink-0">
            {patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "KM"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{patientName}</h3>
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-1">
              <span>DOB: {patientRes?.birthDate || "2001-01-01"}</span>
              <span>·</span>
              <span>Age 25</span>
              <span>·</span>
              <span className="capitalize">{patientRes?.gender || "Male"}</span>
              <span>·</span>
              <span className="font-mono font-medium text-slate-700">MRN: {patientAbha}</span>
              <span>·</span>
              <span>☎ {patientPhone}</span>
            </div>
          </div>
        </div>

        {/* Info Grid: 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              CONSULTING DOCTOR
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {practitionerName}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              FACILITY
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {orgName}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              ENCOUNTER
            </span>
            <span className="font-bold text-slate-900 text-sm block capitalize">
              {encounterRes?.class?.display || "ambulatory"}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Finished · {encounterRes?.period?.start || "2026-09-04"} · #{encounterRes?.identifier?.[0]?.value || "ENC-P001-001"}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              DOCUMENT DATE
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {compositionRes?.date?.slice(0, 10) || "2026-09-04"}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              By {practitionerName}
            </span>
          </div>
        </div>

        {/* Tab Navigation & Panel Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tabs Navigation Header */}
          <div className="flex items-center gap-6 px-6 border-b border-slate-200 text-xs font-semibold text-slate-500 overflow-x-auto">
            {[
              { id: "Overview", label: "Overview" },
              { id: "Encounters", label: "Encounters", count: 2 },
              { id: "Documents", label: "Documents", count: 1 },
              { id: "CarePlan", label: "Care Plan", count: 1 },
              { id: "AllResources", label: "All Resources" },
              { id: "RawJson", label: "Raw JSON" },
            ].map((tab) => {
              const isActive = activeFhirTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFhirTab(tab.id)}
                  className={`py-3.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Body Content */}
          <div className="p-6">
            {activeFhirTab === "Documents" && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Health Document</h4>
                    <p className="text-xs text-slate-400 mt-0.5">application/octet-stream · current · 2026-09-04</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => notify.info("Downloading FHIR Health Document...")}
                  className="h-8 text-xs gap-1.5 cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Payload
                </Button>
              </div>
            )}

            {activeFhirTab === "Overview" && (
              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    {compositionRes?.title || "OP Consultation Record"}
                  </h4>
                  <p className="text-slate-500">Status: <span className="text-emerald-600 font-semibold uppercase">{compositionRes?.status || "final"}</span> · Profile: NRCES NDHM FHIR R4</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compositionRes?.section?.map((sec: any, idx: number) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-lg bg-white space-y-1">
                      <span className="font-bold text-slate-900 text-xs block">{sec.title}</span>
                      <p className="text-slate-600 text-xs">
                        {sec.code?.text || sec.code?.coding?.[0]?.display || "Clinical entry details verified"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFhirTab === "Encounters" && (
              <div className="space-y-3 text-xs">
                <div className="p-4 border rounded-xl bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Encounter #{encounterRes?.identifier?.[0]?.value || "ENC-P001-001"}</span>
                    <span className="text-slate-500">Class: Ambulatory Outpatient Consultation</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold text-xs capitalize">
                    {encounterRes?.status || "Finished"}
                  </span>
                </div>
              </div>
            )}

            {activeFhirTab === "CarePlan" && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">General Health Care Plan</h4>
                <p className="text-slate-600">Prescribed diagnostic tests & outpatient follow-up. Patient advised rest & hydration.</p>
              </div>
            )}

            {activeFhirTab === "AllResources" && (
              <div className="space-y-2 text-xs font-mono">
                {viewJsonData.entry.map((e: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-700 text-xs block">{e.resource?.resourceType}</span>
                      <span className="text-[11px] text-slate-400">{e.fullUrl}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] bg-white px-2 py-1 rounded border border-slate-200">
                      {e.resource?.id?.slice(0, 12)}...
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeFhirTab === "RawJson" && (
              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
                <pre>{JSON.stringify(viewJsonData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="HIU"
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
          <Button
            onClick={() => setIsRequestModalOpen(true)}
            className="gap-2 text-[13px] text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 font-medium cursor-pointer shadow-xs h-9 px-3.5 rounded-md"
          >
            Request Consent
            <FileKey className="h-4 w-4" />
          </Button>
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
              <div className="flex items-center justify-between text-[13.5px]">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>Request records from:</span>
                  <span className="font-bold text-slate-900">
                    {recordRangeQuick === "Custom"
                      ? `${startDate ? format(startDate, "dd MMM yyyy") : "Start date"} – ${endDate ? format(endDate, "dd MMM yyyy") : "Today"}`
                      : `${recordRangeQuick} – Today`}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              {/* Quick Selection Pills */}
              <div className="flex items-center gap-2.5 pt-1">
                {["Last 3 months", "Last 6 months", "Last 12 months"].map((range) => {
                  const isSelected = recordRangeQuick === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      onClick={() => handleQuickRangeSelect(range)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
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
                    onChange={(d) => {
                      setEndDate(d);
                      setRecordRangeQuick("Custom");
                    }}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>

            {/* 3. Shared records will expire in */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between text-[13.5px]">
                <div className="flex items-center gap-2 text-slate-700">
                  <AlertTriangle className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>Shared records will expire in:</span>
                  <span className="font-bold text-slate-900">{expireInQuick}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
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
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Purpose of Request
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full h-9 px-3 text-xs font-bold text-slate-900 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Care management">Care management</option>
                      <option value="General consultation">General consultation</option>
                      <option value="Referral evaluation">Referral evaluation</option>
                      <option value="Specialist review">Specialist review</option>
                      <option value="Follow-up treatment">Follow-up treatment</option>
                      <option value="Insurance verification">Insurance verification</option>
                    </select>
                  </div>

                  {/* Medical record type matching screenshot exact style */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Medical record type
                    </label>

                    {/* Input Container Box */}
                    <div
                      onClick={() => setIsRecordTypeDropdownOpen(!isRecordTypeDropdownOpen)}
                      className={`w-full min-h-[38px] px-2 py-1 border rounded-lg bg-[#f4f4f6]/90 flex items-center justify-between gap-1 cursor-pointer transition-all ${
                        isRecordTypeDropdownOpen
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
          <div className="pt-2 flex justify-center">
            <Button
              onClick={handleRequestSubmit}
              className="w-full sm:w-auto px-8 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold gap-2 rounded-md shadow-md text-sm cursor-pointer"
            >
              <FilePenLine className="h-4 w-4" />
              Request Medical Records
            </Button>
          </div>
        </div>
      </CustomPanel>
    </div>
  );
}