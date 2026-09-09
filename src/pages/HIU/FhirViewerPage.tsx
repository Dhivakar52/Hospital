import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFhirParser } from "@/hooks/useFhirParser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import viewJsonData from "@/data/view.json";
import {
  FileCode2,
  FileUp,
  FileText,
  ExternalLink,
  Download,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  FlaskConical,
  Sparkles,
} from "lucide-react";

const SUPPORTED_DOC_CHIPS = [
  "OPD Consultation",
  "Discharge Summary",
  "Lab Report",
  "Prescription",
  "Immunization",
  "Invoice",
  "Wellness Record",
  "Health Document",
];

export default function FhirViewerPage() {
  const navigate = useNavigate();

  // Use custom FHIR Parser hook
  const { data: parsedData, isLoading, parseJson, clear, exportJson, copyJson } = useFhirParser(viewJsonData);

  const [pastedJsonText, setPastedJsonText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("Reports");
  const [selectedPdfModal, setSelectedPdfModal] = useState<{ url: string; title: string; contentType?: string } | null>(null);

  // Advanced features for "All Resources" tab
  const [resourceSearch, setResourceSearch] = useState("");
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] = useState("ALL");
  const [expandedResourceKeys, setExpandedResourceKeys] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [copiedResourceKey, setCopiedResourceKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse action from pasted JSON or file
  const handleParseAction = () => {
    if (!pastedJsonText.trim()) {
      // Default to view.json if empty
      parseJson(viewJsonData);
      return;
    }
    parseJson(pastedJsonText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      toast.error("Invalid file format. Please upload a .json file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPastedJsonText(text);
        parseJson(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      toast.error("Invalid file format. Please upload a .json file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPastedJsonText(text);
        parseJson(text);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clear();
    setPastedJsonText("");
  };

  const toggleResourceExpand = (key: string) => {
    setExpandedResourceKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedResourceKeys({});
      setIsAllExpanded(false);
    } else {
      const newMap: Record<string, boolean> = {};
      parsedData?.allResources.forEach((_, idx) => {
        newMap[String(idx)] = true;
      });
      setExpandedResourceKeys(newMap);
      setIsAllExpanded(true);
    }
  };

  const handleCopySingleResource = (resObj: any, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(resObj, null, 2));
    setCopiedResourceKey(key);
    toast.success("Resource JSON copied!");
    setTimeout(() => setCopiedResourceKey(null), 2000);
  };

  // Grouped resources for All Resources tab
  const groupedResources = useMemo(() => {
    if (!parsedData) return {};
    const groups: Record<string, typeof parsedData.allResources> = {};
    parsedData.allResources.forEach((item) => {
      // Apply search & type filter
      if (selectedResourceTypeFilter !== "ALL" && item.type !== selectedResourceTypeFilter) {
        return;
      }
      if (resourceSearch.trim()) {
        const q = resourceSearch.toLowerCase().trim();
        const str = JSON.stringify(item.resource).toLowerCase();
        if (!str.includes(q) && !item.type.toLowerCase().includes(q) && !item.fullUrl.toLowerCase().includes(q)) {
          return;
        }
      }

      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  }, [parsedData, selectedResourceTypeFilter, resourceSearch]);

  // Derived values from parsed data
  const patientName = useMemo(() => {
    if (!parsedData?.patient) return "Tanmay Pandey";
    const p = parsedData.patient;
    if (typeof p.name === "string") return p.name;
    if (Array.isArray(p.name) && p.name[0]) {
      if (typeof p.name[0] === "string") return p.name[0];
      return String(p.name[0]?.text || "Tanmay Pandey");
    }
    return "Tanmay Pandey";
  }, [parsedData]);

  const patientGender = parsedData?.patient?.gender || "female";
  const patientBirthDate = parsedData?.patient?.birthDate || "2004-06-18";
  const patientPhone = parsedData?.patient?.telecom?.[0]?.value || "8864893203";
  const patientAbha = parsedData?.patient?.id || "Patient-6a577523918f5dbdca136c9c-1";
  const orgName = parsedData?.organization?.name || "Dhwaj Gupta Lab - Haryana";

  const pdfUrl =
    parsedData?.diagnosticReports?.[0]?.presentedForm?.[0]?.url ||
    parsedData?.documentReferences?.[0]?.content?.[0]?.attachment?.url ||
    "https://flabs-lab.s3.ap-south-1.amazonaws.com/report/6a577523918f5dbdca136c9c.pdf";

  const reportTitle =
    parsedData?.diagnosticReports?.[0]?.presentedForm?.[0]?.title ||
    parsedData?.diagnosticReports?.[0]?.code?.text ||
    parsedData?.documentReferences?.[0]?.content?.[0]?.attachment?.title ||
    "Flabs Lab Report 15-7-2026";

  const reportDate =
    parsedData?.diagnosticReports?.[0]?.issued?.slice(0, 10) ||
    parsedData?.composition?.date?.slice(0, 10) ||
    "2026-07-15";

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-4 sm:p-6 space-y-5 font-sans text-slate-800">
      {/* Global Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <FileCode2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">ABDM FHIR Viewer</h1>
              <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                R4 / NDHM
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Upload, parse, and inspect ABDM/NDHM conformant FHIR Bundle documents
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/consent-management")}
            className="h-8 text-xs gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Consent Management
          </Button>

          {parsedData && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={copyJson}
                className="h-8 text-xs gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy JSON
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportJson}
                className="h-8 text-xs gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download JSON
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs gap-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Mode 1: Upload / Dropzone Section (when no data parsed) */}
      {!parsedData && (
        <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-12">
          {/* Dropzone Card */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all rounded-3xl p-10 text-center cursor-pointer shadow-2xs group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <FileUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Drop a FHIR Bundle JSON here
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              or click to browse · Supports all ABDM / NDHM document types
            </p>

            {/* Document Type Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUPPORTED_DOC_CHIPS.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100/80 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-200/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-[#f4f5f7] px-4 text-xs font-medium text-slate-400 shrink-0">
              or paste JSON
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Textarea Box */}
          <div>
            <textarea
              value={pastedJsonText}
              onChange={(e) => setPastedJsonText(e.target.value)}
              placeholder='{"resourceType":"Bundle","type":"document","entry":[...]}'
              className="w-full h-36 p-4 rounded-2xl border border-slate-200 bg-white font-mono text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs resize-y"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={isLoading}
              onClick={handleParseAction}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2.5 rounded-xl shadow-xs text-xs cursor-pointer gap-2"
            >
              {isLoading && <Sparkles className="h-4 w-4 animate-spin" />}
              Parse & view
            </Button>
            <span className="text-xs text-slate-400 font-medium">
              R4 · eka.care · HAPI · any NDHM-conformant bundle
            </span>
          </div>
        </div>
      )}

      {/* Main Mode 2: Structured ABDM FHIR Viewer (when data parsed) */}
      {parsedData && (
        <div className="space-y-4">
          {/* Top Status Banner */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-700 text-lg tracking-tight">ABDM FHIR</span>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">VIEWER</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>
                {parsedData.allResources.length} resources · Composition · Patient · Organization · DiagnosticReport · DocumentReference
              </span>
            </div>
          </div>

          {/* Card 1: Diagnostic Report / Health Document Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-700">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {parsedData.composition?.type?.text || "Diagnostic Report"}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>Lab / radiology</span>
                  <span>·</span>
                  <span>{reportDate}</span>
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
              onClick={handleClearAll}
              className="gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer h-9 px-4 rounded-md border-slate-300"
            >
              <FileUp className="h-4 w-4" />
              Upload New Bundle
            </Button>
          </div>

          {/* Card 2: Patient Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center shrink-0">
              {patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "TP"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{patientName}</h3>
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-1">
                <span>DOB: {patientBirthDate}</span>
                <span>·</span>
                <span>Age 22</span>
                <span>·</span>
                <span className="capitalize">{patientGender}</span>
                <span>·</span>
                <span className="font-mono font-medium text-slate-700">MRN: {patientAbha}</span>
                <span>·</span>
                <span>📞 {patientPhone}</span>
              </div>
            </div>
          </div>

          {/* Info Grid: 2 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                DOCUMENT DATE
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {reportDate}
              </span>
            </div>
          </div>

          {/* Tab Navigation & Panel Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center gap-6 px-6 border-b border-slate-200 text-xs font-semibold text-slate-500 overflow-x-auto">
              {[
                { id: "Overview", label: "Overview" },
                { id: "Encounters", label: "Encounters", count: 1 },
                { id: "Reports", label: "Reports", count: parsedData.diagnosticReports.length || 1 },
                { id: "Documents", label: "Documents", count: parsedData.documentReferences.length || 1 },
                { id: "AllResources", label: "All Resources" },
                { id: "RawJson", label: "Raw JSON" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-6">
              {/* 1. Overview Tab */}
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Card 1: Diagnoses / Conditions */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-[#faf9f6] px-4 py-3 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      DIAGNOSES / CONDITIONS
                    </div>
                    <div className="p-5 text-slate-400 italic">
                      {parsedData.conditions.length > 0
                        ? parsedData.conditions.map((c, i) => (
                            <div key={i} className="text-slate-800 not-italic font-medium">
                              {c.code?.text || c.code?.coding?.[0]?.display || "Condition details"}
                            </div>
                          ))
                        : "No conditions recorded"}
                    </div>
                  </div>

                  {/* Card 2: Medications */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-[#faf9f6] px-4 py-3 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      MEDICATIONS
                    </div>
                    <div className="p-5 text-slate-400 italic">
                      {parsedData.medications.length > 0
                        ? parsedData.medications.map((m, i) => (
                            <div key={i} className="text-slate-800 not-italic font-medium">
                              {m.medicationCodeableConcept?.text || "Medication details"}
                            </div>
                          ))
                        : "No medications prescribed"}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Encounters Tab */}
              {activeTab === "Encounters" && (
                <div className="space-y-3 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    COMPOSITIONS
                  </span>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-100">
                        D
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {parsedData.composition?.title || "Flabs Lab Report 15-7-2026"}
                        </h4>
                        <p className="text-slate-400 text-xs">—</p>
                        <span className="text-[11px] text-slate-400 font-mono mt-1 block">Composition</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize">
                        {parsedData.composition?.status || "Final"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{reportDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Reports Tab */}
              {activeTab === "Reports" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition shadow-2xs text-xs">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{reportTitle}</h4>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedPdfModal({
                              url: pdfUrl,
                              title: reportTitle,
                              contentType: "application/pdf",
                            })
                          }
                          className="h-8 text-xs gap-1.5 cursor-pointer text-slate-700 border-slate-300 bg-white hover:bg-slate-50 font-medium shadow-2xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          View PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 self-start">{reportDate}</div>
                </div>
              )}

              {/* 4. Documents Tab */}
              {activeTab === "Documents" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition shadow-2xs text-xs">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{reportTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">application/pdf · current · {reportDate}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedPdfModal({
                        url: pdfUrl,
                        title: reportTitle,
                        contentType: "application/pdf",
                      })
                    }
                    className="h-8 text-xs gap-1.5 cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50 font-medium"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View PDF
                  </Button>
                </div>
              )}

              {/* 5. All Resources Tab (Image 3 layout + Search & Filtering) */}
              {activeTab === "AllResources" && (
                <div className="space-y-6 text-xs">
                  {/* Toolbar: Search, Filter, Expand All */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={resourceSearch}
                        onChange={(e) => setResourceSearch(e.target.value)}
                        placeholder="Search across all parsed resources..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Resource Type Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-medium">Type:</span>
                      <select
                        value={selectedResourceTypeFilter}
                        onChange={(e) => setSelectedResourceTypeFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="ALL">All Types ({parsedData.allResources.length})</option>
                        {Object.keys(parsedData.resourceCounts).map((type) => (
                          <option key={type} value={type}>
                            {type} ({parsedData.resourceCounts[type]})
                          </option>
                        ))}
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleExpandAll}
                        className="h-8 text-xs gap-1 cursor-pointer bg-white"
                      >
                        {isAllExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {isAllExpanded ? "Collapse All" : "Expand All"}
                      </Button>
                    </div>
                  </div>

                  {/* Grouped Resource Sections */}
                  {Object.keys(groupedResources).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic">
                      No resources match the search or filter criteria.
                    </div>
                  ) : (
                    Object.entries(groupedResources).map(([type, list]) => (
                      <div key={type} className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {type.toUpperCase()} ({list.length})
                        </span>

                        {list.map((item, idx) => {
                          const key = `${type}-${idx}`;
                          const isExpanded = Boolean(expandedResourceKeys[key]);

                          return (
                            <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                              {/* Header Card Row */}
                              <div
                                onClick={() => toggleResourceExpand(key)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition"
                              >
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {item.resource?.name?.[0]?.text ||
                                      item.resource?.name ||
                                      item.resource?.title ||
                                      item.resource?.code?.text ||
                                      item.resource?.id ||
                                      type}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                    {type} · {item.resource?.id || "ID-N/A"}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.resource?.gender && (
                                    <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize">
                                      {item.resource.gender}
                                    </span>
                                  )}
                                  {item.resource?.status && (
                                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize">
                                      {item.resource.status}
                                    </span>
                                  )}
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400">
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded JSON Inspector */}
                              {isExpanded && (
                                <div className="bg-slate-950 p-4 border-t border-slate-800 text-emerald-400 font-mono text-[11px] relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopySingleResource(item.resource, key);
                                    }}
                                    className="absolute right-4 top-4 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedResourceKey === key ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    {copiedResourceKey === key ? "Copied" : "Copy JSON"}
                                  </button>
                                  <pre className="overflow-x-auto max-h-80">
                                    {JSON.stringify(item.resource, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 6. Raw JSON Tab */}
              {activeTab === "RawJson" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Complete FHIR Bundle JSON Payload</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyJson}
                      className="h-8 text-xs gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Raw JSON
                    </Button>
                  </div>
                  <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px]">
                    <pre>{parsedData.rawString}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal Viewer Dialog (Matching Screenshot 1) */}
      {selectedPdfModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  {selectedPdfModal.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> PDF · {selectedPdfModal.contentType || "application/pdf"}
                </p>
              </div>
              <button
                onClick={() => setSelectedPdfModal(null)}
                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action Toolbar */}
            <div className="bg-[#faf9f6] px-4 py-3 border-b border-slate-200 flex items-center gap-3">
              <a href={selectedPdfModal.url} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 font-medium border-slate-300 bg-white hover:bg-slate-50 cursor-pointer text-slate-700 shadow-2xs"
                >
                  Open in new tab
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </Button>
              </a>

              <a href={selectedPdfModal.url} download target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 font-medium border-slate-300 bg-white hover:bg-slate-50 cursor-pointer text-slate-700 shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  Download PDF
                </Button>
              </a>
            </div>

            {/* Modal Body: Embedded PDF Viewer */}
            <div className="w-full h-[620px] bg-slate-900 flex flex-col items-center justify-center">
              <iframe src={selectedPdfModal.url} className="w-full h-full border-0" title={selectedPdfModal.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
