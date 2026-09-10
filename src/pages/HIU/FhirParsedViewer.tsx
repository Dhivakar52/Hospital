import { useState, useMemo, useRef } from "react";
import { useFhirParser } from "@/hooks/useFhirParser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import viewJsonData from "@/data/view.json";
import { notify } from "@/lib/notify";
import {
  FileText,
  FlaskConical,
  ArrowLeft,
  Download,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  ExternalLink,
  UploadCloud,
  FileCode2,
  Copy,
  Sparkles,
  RotateCcw,
  FileJson,
} from "lucide-react";

interface FhirParsedViewerProps {
  consentDetails?: {
    consentId: string;
    patientName?: string;
    uhidNo?: string;
    purpose?: string;
    status?: string;
    expiresOnDate?: string;
    sharedFor?: string;
  };
  onBack?: () => void;
  initialData?: any;
}

export function FhirParsedViewer({ consentDetails, onBack, initialData = viewJsonData }: FhirParsedViewerProps) {
  const { data: parsedData, isLoading, parseJson, exportJson, copyJson } = useFhirParser(initialData);

  // Control whether upload screen or parsed view is shown
  const [showUploadScreen, setShowUploadScreen] = useState<boolean>(() => !initialData);

  // Upload UI State
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonInput, setRawJsonInput] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"Reports" | "Overview" | "Encounters" | "Documents" | "AllResources" | "RawJson">("Reports");
  const [selectedPdfModal, setSelectedPdfModal] = useState<{ url: string; title: string } | null>(null);

  // Search & filter for All Resources parsed view
  const [resourceSearch, setResourceSearch] = useState("");
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] = useState("ALL");
  const [expandedResourceKeys, setExpandedResourceKeys] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Derived values from parsed JSON
  const patientName = useMemo(() => {
    if (consentDetails?.patientName) return consentDetails.patientName;
    if (!parsedData?.patient) return "Tanmay Pandey";
    const p = parsedData.patient;
    if (typeof p.name === "string") return p.name;
    if (Array.isArray(p.name) && p.name[0]) {
      if (typeof p.name[0] === "string") return p.name[0];
      return String(p.name[0]?.text || "Tanmay Pandey");
    }
    return "Tanmay Pandey";
  }, [parsedData, consentDetails]);

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

  // Grouped resources
  const groupedResources = useMemo(() => {
    if (!parsedData) return {};
    const groups: Record<string, typeof parsedData.allResources> = {};
    parsedData.allResources.forEach((item) => {
      if (selectedResourceTypeFilter !== "ALL" && item.type !== selectedResourceTypeFilter) {
        return;
      }
      if (resourceSearch.trim()) {
        const q = resourceSearch.toLowerCase().trim();
        const str = JSON.stringify(item.resource).toLowerCase();
        if (!str.includes(q) && !item.type.toLowerCase().includes(q)) {
          return;
        }
      }
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  }, [parsedData, selectedResourceTypeFilter, resourceSearch]);

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

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        notify.validationError("Please select a valid .json file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Process File Upload
  const handleFileUploadSubmit = () => {
    if (!selectedFile) {
      notify.validationError("Please select a FHIR JSON file to upload.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = parseJson(text);
        if (success) {
          setShowUploadScreen(false);
        }
      }
    };
    reader.onerror = () => {
      notify.apiError("Failed to read file.");
    };
    reader.readAsText(selectedFile);
  };

  // Process Raw Text Upload
  const handleTextUploadSubmit = () => {
    if (!rawJsonInput.trim()) {
      notify.validationError("Please paste raw FHIR JSON content.");
      return;
    }
    const success = parseJson(rawJsonInput);
    if (success) {
      setShowUploadScreen(false);
    }
  };

  // Load Sample FHIR JSON
  const handleLoadSample = () => {
    const success = parseJson(viewJsonData);
    if (success) {
      setShowUploadScreen(false);
      notify.saveSuccess("Sample ABDM FHIR Bundle loaded successfully!");
    }
  };

  // Clear or Reset to Upload Screen
  const handleResetToUpload = () => {
    setSelectedFile(null);
    setRawJsonInput("");
    setShowUploadScreen(true);
  };

  // RENDER: Upload Screen (Shown when no JSON is parsed OR when user clicks Upload New JSON)
  if (showUploadScreen || !parsedData) {
    return (
      <div className="space-y-6 font-sans text-slate-800 max-w-6xl mx-auto pb-8">
        {/* Top Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="h-9 px-3 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Upload ABDM FHIR R4 JSON</h2>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
                  FHIR Parser
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload or paste ABDM FHIR R4 Bundle JSON to inspect clinical reports, prescriptions, and health records
              </p>
            </div>
          </div>

          {parsedData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadScreen(false)}
              className="h-8 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
            >
              <span>View Current Parsed Data</span>
            </Button>
          )}
        </div>

        {/* Upload Container Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${uploadMode === "file"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload JSON File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("text")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${uploadMode === "text"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <FileCode2 className="h-4 w-4" />
                <span>Paste Raw JSON</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="h-9 px-3.5 gap-1.5 text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 cursor-pointer font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Load Sample ABDM Bundle</span>
            </Button>
          </div>

          {/* Mode 1: Drag & Drop File Upload */}
          {uploadMode === "file" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (!file.name.endsWith(".json") && file.type !== "application/json") {
                      notify.validationError("Please drop a valid .json file.");
                      return;
                    }
                    setSelectedFile(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${dragOver
                  ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                  : selectedFile
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/30"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${selectedFile
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {selectedFile ? <FileJson className="h-7 w-7" /> : <UploadCloud className="h-7 w-7" />}
                </div>

                {selectedFile ? (
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{selectedFile.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to parse
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Drag and drop your FHIR JSON file here
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      or click to browse local files (Supports ABDM FHIR R4 Bundle .json)
                    </span>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Selected: <strong>{selectedFile.name}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-600 hover:underline font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              <Button
                onClick={handleFileUploadSubmit}
                disabled={!selectedFile || isLoading}
                className="w-full h-11 text-sm font-semibold text-white gap-2 rounded-xl shadow-sm cursor-pointer"
                style={{ background: "var(--blue-btn)" }}
              >
                <FileCode2 className="h-4 w-4" />
                <span>{isLoading ? "Parsing JSON..." : "Parse & Load FHIR JSON"}</span>
              </Button>
            </div>
          )}

          {/* Mode 2: Paste Raw JSON */}
          {uploadMode === "text" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Paste FHIR Bundle JSON Payload:
                </label>
                <textarea
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                  placeholder={`{\n  "resourceType": "Bundle",\n  "type": "document",\n  "entry": [...]\n}`}
                  rows={10}
                  className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-900/90 text-emerald-400 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRawJsonInput("")}
                  disabled={!rawJsonInput}
                  className="h-9 px-3 gap-1.5 text-xs text-slate-600 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear Input</span>
                </Button>

                <Button
                  onClick={handleTextUploadSubmit}
                  disabled={!rawJsonInput.trim() || isLoading}
                  className="h-10 px-6 text-xs font-semibold text-white gap-2 rounded-xl shadow-sm cursor-pointer"
                  style={{ background: "var(--blue-btn)" }}
                >
                  <FileCode2 className="h-4 w-4" />
                  <span>{isLoading ? "Parsing..." : "Parse & Load Raw JSON"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER: Full Parsed FHIR Viewer Screen
  return (
    <div className="space-y-5 font-sans text-slate-800">
      {/* Top Header with Navigation & Action Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-9 px-3 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Consent</span>
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">FHIR Clinical Record View</h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                Parsed JSON View
              </Badge>
              {consentDetails && (
                <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-50">
                  Consent: {consentDetails.consentId.slice(0, 13)}...
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured clinical records extracted and parsed from ABDM FHIR R4 JSON Bundle
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToUpload}
            className="h-9 px-3 gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
            title="Upload another FHIR JSON file"
          >
            <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
            <span>Upload New JSON</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copyJson}
            className="h-9 px-3 gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
            title="Copy Raw JSON"
          >
            <Copy className="h-3.5 w-3.5 text-slate-500" />
            <span>Copy JSON</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportJson}
            className="h-9 px-3 gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
            title="Export JSON"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* Consent Context Banner (if viewing inside Consent Module) */}
      {consentDetails && (
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Patient Name</span>
              <span className="font-bold text-slate-900">{patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">UHID No</span>
              <span className="font-semibold text-slate-800">{consentDetails.uhidNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Purpose of Request</span>
              <span className="font-semibold text-slate-800">{consentDetails.purpose || "Care management"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Consent Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {consentDetails.status || "Success"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card 1: Diagnostic Report Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-700">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                {parsedData.composition?.type?.text || reportTitle}
              </h3>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
                Diagnostic Report
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                Status: {parsedData.composition?.status || "Final"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span>Category: Lab / Radiology</span>
              <span>•</span>
              <span>Date: <strong className="text-slate-700 font-medium">{reportDate}</strong></span>
              <span>•</span>
              <span>Facility: <strong className="text-slate-700 font-medium">{orgName}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Patient Demographic Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center shrink-0">
          {patientName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "PT"}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{patientName}</h3>
          <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500 mt-1">
            <span>DOB: <strong className="text-slate-700 font-medium">{patientBirthDate}</strong></span>
            <span>•</span>
            <span className="capitalize">Gender: <strong className="text-slate-700 font-medium">{patientGender}</strong></span>
            <span>•</span>
            <span className="font-mono text-slate-700">MRN: {patientAbha}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-slate-400" />
              {patientPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Two Quick Info Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Healthcare Facility
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">{orgName}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Document Issue Date
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">{reportDate}</span>
          </div>
        </div>
      </div>

      {/* Tabs: Strictly Parsed Views */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 text-xs font-semibold text-slate-500 overflow-x-auto">
          {[
            { id: "Reports" as const, label: "Reports & PDF", count: parsedData.diagnosticReports.length || 1 },
            { id: "Overview" as const, label: "Clinical Overview" },
            { id: "Encounters" as const, label: "Compositions", count: 1 },
            { id: "Documents" as const, label: "Documents", count: parsedData.documentReferences.length || 1 },
            { id: "AllResources" as const, label: "Parsed Resources", count: parsedData.allResources.length },
            { id: "RawJson" as const, label: "Raw JSON" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${isActive
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* 1. Reports & PDF Tab */}
          {activeTab === "Reports" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition shadow-2xs text-xs">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/50">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{reportTitle}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Diagnostic studies report · Verified Lab Results
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedPdfModal({
                            url: pdfUrl,
                            title: reportTitle,
                          })
                        }
                        className="h-8 text-xs gap-1.5 cursor-pointer text-slate-700 border-slate-300 bg-white hover:bg-slate-50 font-medium shadow-2xs"
                      >
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>View PDF Document</span>
                      </Button>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium px-2 py-1"
                      >
                        <span>Open in New Tab</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 self-start sm:self-center font-mono">
                  {reportDate}
                </div>
              </div>
            </div>
          )}

          {/* 2. Clinical Overview Tab */}
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  DIAGNOSES / CONDITIONS
                </div>
                <div className="p-4 text-slate-500">
                  {parsedData.conditions.length > 0 ? (
                    parsedData.conditions.map((c, i) => (
                      <div key={i} className="text-slate-800 font-medium py-1">
                        • {c.code?.text || c.code?.coding?.[0]?.display || "Condition details"}
                      </div>
                    ))
                  ) : (
                    <span className="italic text-slate-400">No recorded conditions</span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  MEDICATIONS
                </div>
                <div className="p-4 text-slate-500">
                  {parsedData.medications.length > 0 ? (
                    parsedData.medications.map((m, i) => (
                      <div key={i} className="text-slate-800 font-medium py-1">
                        • {m.medicationCodeableConcept?.text || "Prescription item"}
                      </div>
                    ))
                  ) : (
                    <span className="italic text-slate-400">No medications prescribed</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Compositions Tab */}
          {activeTab === "Encounters" && (
            <div className="space-y-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-100">
                    C
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {parsedData.composition?.title || reportTitle}
                    </h4>
                    <p className="text-slate-400 text-xs">ABDM Diagnostic Studies Composition</p>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      Type: {parsedData.composition?.type?.text || "Diagnostic Report"}
                    </span>
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

          {/* 4. Documents Tab */}
          {activeTab === "Documents" && (
            <div className="space-y-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
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
                    })
                  }
                  className="h-8 text-xs gap-1.5 cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50 font-medium"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View PDF</span>
                </Button>
              </div>
            </div>
          )}

          {/* 5. All Parsed Resources Tab */}
          {activeTab === "AllResources" && (
            <div className="space-y-4 text-xs">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="Search parsed resources..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

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
                    <span>{isAllExpanded ? "Collapse All" : "Expand All"}</span>
                  </Button>
                </div>
              </div>

              {/* Grouped Resource Cards */}
              {Object.entries(groupedResources).map(([type, list]) => (
                <div key={type} className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {type} ({list.length})
                  </span>

                  {list.map((item, idx) => {
                    const key = `${type}-${idx}`;
                    const isExpanded = Boolean(expandedResourceKeys[key]);
                    const res = item.resource;

                    return (
                      <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <div
                          onClick={() => toggleResourceExpand(key)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition"
                        >
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {res?.name?.[0]?.text || res?.name || res?.title || res?.code?.text || res?.id || type}
                            </h4>
                            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                              {type} · ID: {res?.id || "N/A"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {res?.status && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] capitalize">
                                {res.status}
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400">
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-slate-50 border-t border-slate-100 text-slate-700 text-xs space-y-2 font-mono">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div><strong className="text-slate-500">Resource Type:</strong> {res.resourceType}</div>
                              <div><strong className="text-slate-500">ID:</strong> {res.id || "N/A"}</div>
                              {res.status && <div><strong className="text-slate-500">Status:</strong> {res.status}</div>}
                              {res.gender && <div><strong className="text-slate-500">Gender:</strong> {res.gender}</div>}
                              {res.birthDate && <div><strong className="text-slate-500">Birth Date:</strong> {res.birthDate}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* 6. Raw JSON Tab */}
          {activeTab === "RawJson" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5 rounded-t-xl text-slate-300 text-xs border-b border-slate-700">
                <span className="font-semibold text-slate-100 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-blue-400" />
                  ABDM FHIR R4 Bundle Raw Payload ({parsedData.bundleId})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyJson}
                    className="h-7 text-xs gap-1.5 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy JSON</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportJson}
                    className="h-7 text-xs gap-1.5 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
              <pre className="p-4 bg-slate-900 text-white rounded-b-xl border border-slate-800 overflow-x-auto text-xs leading-relaxed max-h-[550px] shadow-inner font-mono">
                <code>{parsedData.rawString}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal Viewer */}
      {selectedPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    {selectedPdfModal.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">ABDM Diagnostic Report PDF Document</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPdfModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setSelectedPdfModal(null)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF iframe */}
            <div className="flex-1 w-full bg-slate-100 relative">
              <iframe
                src={`${selectedPdfModal.url}#toolbar=1`}
                className="w-full h-full border-0"
                title={selectedPdfModal.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
