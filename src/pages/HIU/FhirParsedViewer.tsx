import { useState, useMemo, useRef } from "react";
import { useFhirParser } from "@/hooks/useFhirParser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import viewJsonData from "@/data/view.json";
import { notify } from "@/lib/notify";
import {
  FileText,
  ArrowLeft,
  Download,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  Phone,
  UploadCloud,
  FileCode2,
  Copy,
  Sparkles,
  RotateCcw,
  FileJson,
  User,
  CreditCard,
  Tag,
  Stethoscope,
  Pill,
  Syringe,
  Layers,
  Clock,
  Fingerprint,
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
    gender?: string;
    dob?: string;
    phone?: string;
  };
  patientDetails?: {
    patientname?: string;
    abhano?: string;
    abhaaddress?: string;
    uhid?: string | number;
    carecontextid?: string;
    ekaoid?: string;
    ekauuid?: string;
    visitedat?: string;
    RequestedAt?: string;
    Responsed?: string;
  };
  onBack?: () => void;
  initialData?: any;
  backLabel?: string;
}

export function FhirParsedViewer({
  consentDetails,
  patientDetails,
  onBack,
  initialData = viewJsonData,
  backLabel = "Back to Consent",
}: FhirParsedViewerProps) {
  const {
    data: parsedData,
    hiTypes,
    activeHiTypeIndex,
    setActiveHiTypeIndex,
    activeHiTypeItem,
    isLoading,
    parseJson,
    exportJson,
    copyJson,
  } = useFhirParser(initialData);

  // Control whether upload screen or parsed view is shown
  const [showUploadScreen, setShowUploadScreen] = useState<boolean>(() => !initialData);

  // Upload UI State
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonInput, setRawJsonInput] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"Resources" | "Overview" | "RawJson">("Resources");
  const [selectedPdfModal, setSelectedPdfModal] = useState<{ url: string; title: string } | null>(null);

  // Search & filter for parsed resources view
  const [resourceSearch, setResourceSearch] = useState("");
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] = useState("ALL");
  const [expandedResourceKeys, setExpandedResourceKeys] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Patient Info resolution
  const patientName = useMemo(() => {
    if (patientDetails?.patientname) return patientDetails.patientname;
    if (consentDetails?.patientName) return consentDetails.patientName;
    if (!parsedData?.patient) return "Unknown Patient";
    const p = parsedData.patient;
    if (typeof p.name === "string") return p.name;
    if (Array.isArray(p.name) && p.name[0]) {
      return typeof p.name[0] === "string" ? p.name[0] : String(p.name[0]?.text || p.name[0]?.family || "Unknown");
    }
    return "Unknown Patient";
  }, [parsedData, consentDetails, patientDetails]);

  const uhidNo = patientDetails?.uhid || consentDetails?.uhidNo || parsedData?.patient?.id || "-";
  const abhaAddress = patientDetails?.abhaaddress || "-";
  const abhaNumber = patientDetails?.abhano || "-";
  const careContextId = patientDetails?.carecontextid || "-";

  const patientInitials = useMemo(() => {
    return (
      String(patientName)
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "PT"
    );
  }, [patientName]);

  const patientGender =
    consentDetails?.gender || parsedData?.patient?.gender || "Unknown";
  const patientBirthDate =
    consentDetails?.dob || parsedData?.patient?.birthDate || "-";
  const rawPhone =
    consentDetails?.phone || parsedData?.patient?.telecom?.[0]?.value || "-";
  const patientPhone = rawPhone && rawPhone !== "-" ? (rawPhone.startsWith("+") ? rawPhone : `+91 ${rawPhone}`) : "-";

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

  // Icon selector based on resource or hi_type
  const getHiTypeIcon = (hiType: string) => {
    const lower = hiType.toLowerCase();
    if (lower.includes("consult")) return <Stethoscope className="h-4 w-4" />;
    if (lower.includes("prescript") || lower.includes("medic")) return <Pill className="h-4 w-4" />;
    if (lower.includes("immuniz") || lower.includes("vaccin")) return <Syringe className="h-4 w-4" />;
    if (lower.includes("doc") || lower.includes("record")) return <FileText className="h-4 w-4" />;
    return <Layers className="h-4 w-4" />;
  };

  // RENDER: Upload Screen (Shown when no JSON is parsed OR when user clicks Upload New JSON)
  if (showUploadScreen || !parsedData) {
    return (
      <div className="space-y-6 font-sans text-slate-800 max-w-6xl mx-auto pb-8">
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
                <span>{backLabel}</span>
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

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  uploadMode === "file"
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
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  uploadMode === "text"
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
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                  dragOver
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
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedFile ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
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
                  className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-900 text-emerald-400 placeholder:text-slate-500"
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
              <span>{backLabel}</span>
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">FHIR Clinical Record View</h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                Parsed JSON View
              </Badge>
              {activeHiTypeItem && (
                <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200">
                  {activeHiTypeItem.displayTitle}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured clinical records parsed from ABDM FHIR R4 Bundle
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

      {/* Patient Demographic & Identification Context Banner */}
      <div className="bg-[#f0f7ff] border border-blue-100 rounded-xl p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-blue-200/60">
          {/* 1. Patient Name */}
          <div className="flex items-center gap-3.5 px-3 py-1 first:pl-1">
            <div className="h-10 w-10 rounded-full bg-blue-100/90 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
              {patientInitials}
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-xs block font-normal">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block">
                {patientName}
              </span>
            </div>
          </div>

          {/* 2. UHID */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="h-10 w-10 rounded-full bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-xs block font-normal">UHID</span>
              <span className="font-bold text-slate-900 text-sm tracking-tight font-mono">
                {uhidNo}
              </span>
            </div>
          </div>

          {/* 3. ABHA Address */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="h-10 w-10 rounded-full bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
              <Fingerprint className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-xs block font-normal">ABHA Address</span>
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate block font-mono">
                {abhaAddress}
              </span>
            </div>
          </div>

          {/* 4. ABHA Number */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="h-10 w-10 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-xs block font-normal">ABHA Number</span>
              <span className="font-bold text-slate-900 text-sm tracking-tight font-mono">
                {abhaNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Context Meta (Care Context, Gender, DOB, Phone) */}
        {(careContextId !== "-" || patientPhone !== "-") && (
          <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap items-center gap-4 text-xs text-slate-600 px-1">
            {careContextId !== "-" && (
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-blue-500" />
                <span>Care Context: <strong className="font-mono text-slate-800">{careContextId}</strong></span>
              </span>
            )}
            {patientGender !== "Unknown" && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span>Gender: <strong className="capitalize text-slate-800">{patientGender}</strong></span>
              </span>
            )}
            {patientBirthDate !== "-" && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span>DOB: <strong className="text-slate-800">{patientBirthDate}</strong></span>
              </span>
            )}
            {patientPhone !== "-" && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                <span>Phone: <strong className="text-slate-800">{patientPhone}</strong></span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Health Information Types Selector (When multiple hi_types exist) */}
      {hiTypes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Health Information Types ({hiTypes.length})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Select a record type to view bundle details</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hiTypes.map((item, idx) => {
              const isSelected = idx === activeHiTypeIndex;
              const resourceCount = item.parsed?.allResources?.length || 0;
              return (
                <button
                  key={`${item.hiType}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveHiTypeIndex(idx);
                    setExpandedResourceKeys({});
                    setIsAllExpanded(false);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {getHiTypeIcon(item.hiType)}
                  <span>{item.displayTitle}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white text-blue-700" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {resourceCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FHIR Bundle Meta Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="flex items-center gap-3 pr-2">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileCode2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 block uppercase">Bundle Type</span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm capitalize block">
                {parsedData.bundleType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 block uppercase">Bundle Identifier</span>
              <span className="font-bold text-slate-800 text-xs font-mono truncate block" title={parsedData.bundleId}>
                {parsedData.bundleId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:px-4 pt-2 sm:pt-0">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 block uppercase">Timestamp</span>
              <span className="font-bold text-slate-800 text-xs block">
                {parsedData.timestamp ? new Date(parsedData.timestamp).toLocaleString() : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Resources / Overview / Raw JSON */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 text-xs font-semibold text-slate-500 overflow-x-auto">
          {[
            { id: "Resources" as const, label: "FHIR Resources", count: parsedData.allResources.length },
            { id: "Overview" as const, label: "Clinical Summary" },
            { id: "RawJson" as const, label: "View Raw JSON" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-blue-50 text-blue-600"
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
          {/* 1. Resources Tab: Search, Filter & Collapsible resource list */}
          {activeTab === "Resources" && (
            <div className="space-y-4 text-xs">
              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="Search resources by type, id, code, or value..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-medium">Type:</span>
                  <select
                    value={selectedResourceTypeFilter}
                    onChange={(e) => setSelectedResourceTypeFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
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
              {Object.keys(groupedResources).length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                  No resources matching your search or filter.
                </div>
              ) : (
                Object.entries(groupedResources).map(([type, list]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        {type} ({list.length})
                      </span>
                    </div>

                    {list.map((item, idx) => {
                      const key = `${type}-${idx}`;
                      const isExpanded = Boolean(expandedResourceKeys[key]);
                      const res = item.resource;

                      // Display title heuristics
                      const title =
                        res?.title ||
                        res?.code?.text ||
                        res?.code?.coding?.[0]?.display ||
                        res?.name?.[0]?.text ||
                        (typeof res?.name === "string" ? res.name : null) ||
                        res?.medicationCodeableConcept?.text ||
                        res?.medicationCodeableConcept?.coding?.[0]?.display ||
                        res?.vaccineCode?.text ||
                        res?.vaccineCode?.coding?.[0]?.display ||
                        res?.description ||
                        `${type} #${idx + 1}`;

                      const subtitle =
                        res?.category?.[0]?.text ||
                        res?.category?.[0]?.coding?.[0]?.display ||
                        res?.type?.text ||
                        res?.type?.coding?.[0]?.display ||
                        `ID: ${res?.id || item.fullUrl || "N/A"}`;

                      return (
                        <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                          <div
                            onClick={() => toggleResourceExpand(key)}
                            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition"
                          >
                            <div className="min-w-0 pr-3">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {title}
                              </h4>
                              <p className="text-slate-400 text-[11px] font-mono mt-0.5 truncate">
                                {type} · {subtitle}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {res?.status && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] capitalize">
                                  {res.status}
                                </Badge>
                              )}
                              {res?.valueQuantity && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                  {res.valueQuantity.value} {res.valueQuantity.unit}
                                </Badge>
                              )}
                              {res?.valueString && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                  {res.valueString}
                                </Badge>
                              )}
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400">
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-slate-700 text-xs space-y-3 font-mono">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                                <div><strong className="text-slate-500 font-sans">Resource Type:</strong> {res.resourceType}</div>
                                <div><strong className="text-slate-500 font-sans">ID:</strong> {res.id || "N/A"}</div>
                                {res.status && <div><strong className="text-slate-500 font-sans">Status:</strong> {res.status}</div>}
                                {res.date && <div><strong className="text-slate-500 font-sans">Date:</strong> {res.date}</div>}
                                {res.effectiveDateTime && <div><strong className="text-slate-500 font-sans">Effective:</strong> {res.effectiveDateTime}</div>}
                                {res.authoredOn && <div><strong className="text-slate-500 font-sans">Authored:</strong> {res.authoredOn}</div>}
                                {res.occurrenceDateTime && <div><strong className="text-slate-500 font-sans">Occurrence:</strong> {res.occurrenceDateTime}</div>}
                              </div>

                              <div>
                                <span className="text-[11px] text-slate-400 font-sans block mb-1">
                                  Resource JSON Content:
                                </span>
                                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-[300px]">
                                  <code>{JSON.stringify(res, null, 2)}</code>
                                </pre>
                              </div>
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

          {/* 2. Clinical Overview Summary */}
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                  <span>DIAGNOSES / OBSERVATIONS</span>
                </div>
                <div className="p-4 text-slate-600 space-y-2">
                  {parsedData.conditions.length > 0 ? (
                    parsedData.conditions.map((c, i) => (
                      <div key={i} className="text-slate-800 font-medium py-1 border-b border-slate-100 last:border-0">
                        • {c.code?.text || c.code?.coding?.[0]?.display || "Condition details"}
                      </div>
                    ))
                  ) : parsedData.observations.length > 0 ? (
                    parsedData.observations.slice(0, 6).map((o, i) => (
                      <div key={i} className="text-slate-800 font-medium py-1 border-b border-slate-100 last:border-0">
                        • {o.code?.text || o.code?.coding?.[0]?.display || "Observation"}:{" "}
                        <span className="text-blue-600">
                          {o.valueQuantity ? `${o.valueQuantity.value} ${o.valueQuantity.unit || ""}` : o.valueString || "Recorded"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="italic text-slate-400">No recorded conditions or observations</span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Pill className="h-3.5 w-3.5 text-emerald-600" />
                  <span>MEDICATIONS / PRESCRIPTIONS</span>
                </div>
                <div className="p-4 text-slate-600 space-y-2">
                  {parsedData.medications.length > 0 ? (
                    parsedData.medications.map((m, i) => (
                      <div key={i} className="text-slate-800 font-medium py-1 border-b border-slate-100 last:border-0">
                        • {m.medicationCodeableConcept?.text || m.medicationCodeableConcept?.coding?.[0]?.display || "Prescription item"}
                      </div>
                    ))
                  ) : (
                    <span className="italic text-slate-400">No medications in this record</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. View Raw JSON Tab */}
          {activeTab === "RawJson" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5 rounded-t-xl text-slate-300 text-xs border-b border-slate-700">
                <span className="font-semibold text-slate-100 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-blue-400" />
                  ABDM FHIR Bundle JSON Payload ({parsedData.bundleId})
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
