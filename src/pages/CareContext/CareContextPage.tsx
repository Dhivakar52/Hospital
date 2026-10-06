import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Link2,
  FileText,
  User,
  Calendar,
  Clock,
  Building2,
  Fingerprint,
  KeyRound,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { format } from "date-fns";
import type { CareContextResponse } from "@/types/op_register";
import { SAMPLE_CARE_CONTEXT_RESPONSE } from "@/data/careContextData";

interface CareContextRouteState {
  careContext?: CareContextResponse;
  patient?: {
    id?: string;
    opNo?: string;
    title?: string;
    patientName?: string;
    department?: string;
    gender?: string;
    phone?: string;
  };
  returnUrl?: string;
  backLabel?: string;
}

export default function CareContextPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CareContextRouteState | null) || null;

  // If no dynamic careContext was passed, provide an option to inspect sample or return
  const [data, setData] = useState<CareContextResponse | null>(state?.careContext || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const patient = state?.patient;
  const returnUrl = state?.returnUrl || "/registered-patients";
  const backLabel = state?.backLabel || "Back to Registration";

  const handleCopy = (text: string, label: string, key: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.success(`${label} copied`);
    }
  };

  const formatTimestamp = (ts: number | string | undefined) => {
    if (!ts) return "—";
    try {
      let num = typeof ts === "string" ? parseInt(ts, 10) : ts;
      if (isNaN(num)) return String(ts);
      // If unix seconds (10 digits), convert to ms
      if (num < 10000000000) {
        num = num * 1000;
      }
      return format(new Date(num), "dd MMM yyyy, hh:mm:ss a");
    } catch {
      return String(ts);
    }
  };

  // Safe Fallback if data is missing
  if (!data) {
    return (
      <div className="p-4 sm:p-6  space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(returnUrl)}
            className="h-9 px-3 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            {/* <ArrowLeft className="h-4 w-4" /> */}
            <span>{backLabel}</span>
          </Button>
        </div>

        <Card className="border border-dashed border-slate-300 bg-white">
          <CardHeader className="text-center py-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
              <Link2 className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-semibold text-slate-900">
              No Care Context Data Found
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-sm text-slate-500 mt-2">
              No active ABDM Care Context response was provided in the route navigation state.
              You can return to the Registration screen or load sample ABDM Care Context data.
            </CardDescription>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => navigate(returnUrl)}
                className="cursor-pointer"
              >
                Return to Registration
              </Button>
              <Button
                onClick={() => setData(SAMPLE_CARE_CONTEXT_RESPONSE)}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              >
                Load Sample ABDM Data
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const {
    service = "abdm",
    event = "abha.link_care_context",
    event_time,
    transaction_id,
    timestamp,
    business_id,
    client_id,
    data: careData,
  } = data;

  const abhaAddress = careData?.abha_address || "—";
  const careContextId = careData?.care_context_id || "—";
  const hipId = careData?.hip_id || "—";
  const oid = careData?.oid || "—";
  const partnerPatientId = careData?.partner_patient_id || "—";
  const status = careData?.status || "LINKED";
  const isLinked = status.toUpperCase() === "LINKED";

  return (
    <div className="p-4 sm:p-6 space-y-6 ">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-400">OP</span>
            <span className="text-slate-400">/</span>
            <button
              type="button"
              onClick={() => navigate(returnUrl)}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Registration
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Care Context</span>
          </nav>
          <div className="pt-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Care Context</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              ABDM Care Context Linking Details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(returnUrl)}
            className="h-9 px-3 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span> {backLabel}</span>
          </Button>
        </div>
      </div>

      {/* Patient Banner (if navigated from Patient row) */}
      {patient && (
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/40 border border-blue-100 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {patient.patientName ? patient.patientName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 text-base">
                  {patient.title ? `${patient.title}. ` : ""}
                  {patient.patientName}
                </span>
                <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 text-xs px-2 py-0.5">
                  OP No: {patient.opNo || patient.id}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                {patient.department && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {patient.department}
                  </span>
                )}
                {patient.phone && (
                  <span>• Tel: {patient.phone}</span>
                )}
                {patient.gender && (
                  <span>• {patient.gender}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs text-slate-500 font-medium">ABDM Status:</span>
            <Badge className={isLinked ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-0.5 font-medium" : "bg-amber-600 text-white text-xs px-2.5 py-0.5 font-medium"}>
              ● {status}
            </Badge>
          </div>
        </div>
      )}

      {/* SECTION 1: ABDM Event */}
      <Card className="border border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  ABDM Event
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  High-level ABDM webhook and lifecycle event metadata
                </CardDescription>
              </div>
            </div>
            <Badge
              className={
                isLinked
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs px-3 py-1 flex items-center gap-1.5"
                  : "bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs px-3 py-1 flex items-center gap-1.5"
              }
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-medium text-slate-500 block mb-1">Service</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {service}
                </span>
                <span className="text-[11px] text-slate-400">Ayushman Bharat Digital Mission</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-medium text-slate-500 block mb-1">Event</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  {event}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-medium text-slate-500 block mb-1">Status</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Care Context Details */}
      <Card className="border border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Care Context Details
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Patient ABDM identifiers, hospital link codes, and linking context
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ABHA Address */}
            <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  ABHA Address
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(abhaAddress, "ABHA Address", "abha")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy ABHA Address"
                >
                  {copiedKey === "abha" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-sm font-semibold text-blue-700 break-all select-all">
                {abhaAddress}
              </div>
            </div>

            {/* Care Context ID */}
            <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                  Care Context ID
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(careContextId, "Care Context ID", "care_context_id")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Care Context ID"
                >
                  {copiedKey === "care_context_id" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900 break-all select-all">
                {careContextId}
              </div>
            </div>

            {/* HIP ID */}
            <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  HIP ID
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(hipId, "HIP ID", "hip_id")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy HIP ID"
                >
                  {copiedKey === "hip_id" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-semibold text-sm text-slate-900 select-all">
                {hipId}
              </div>
            </div>

            {/* OID */}
            <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                  OID
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(oid, "OID", "oid")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy OID"
                >
                  {copiedKey === "oid" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-sm font-medium text-slate-800 break-all select-all">
                {oid}
              </div>
            </div>

            {/* Partner Patient ID */}
            <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Partner Patient ID
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(partnerPatientId, "Partner Patient ID", "partner_patient_id")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Partner Patient ID"
                >
                  {copiedKey === "partner_patient_id" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-sm font-medium text-slate-800 break-all select-all">
                {partnerPatientId}
              </div>
            </div>

            {/* Status */}
            <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  Status
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    isLinked
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs px-2.5 py-0.5 border-emerald-300 font-semibold"
                      : "bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 font-semibold"
                  }
                >
                  ● {status}
                </Badge>
                <span className="text-xs text-slate-500">Record successfully linked on ABDM Gateway</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Transaction Information */}
      <Card className="border border-slate-200/80 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Transaction Information
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Audit trail, system identifiers, and cryptographic transaction logging
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Transaction ID */}
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Transaction ID</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(transaction_id, "Transaction ID", "tx_id")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copiedKey === "tx_id" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-slate-900 break-all select-all">
                {transaction_id}
              </div>
            </div>

            {/* Business ID */}
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Business ID</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(business_id, "Business ID", "biz_id")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Business ID"
                >
                  {copiedKey === "biz_id" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-slate-900 break-all select-all">
                {business_id}
              </div>
            </div>

            {/* Client ID */}
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Client ID</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(client_id, "Client ID", "cli_id")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Client ID"
                >
                  {copiedKey === "cli_id" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-slate-900 break-all select-all">
                {client_id}
              </div>
            </div>

            {/* Event Time */}
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Event Time
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(String(event_time), "Event Time", "event_time")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Raw Event Time"
                >
                  {copiedKey === "event_time" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-medium text-sm text-slate-900">
                {formatTimestamp(event_time)}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Raw epoch: {event_time}
              </div>
            </div>

            {/* Timestamp */}
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/40 md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Timestamp
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(String(timestamp), "Timestamp", "timestamp")}
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Raw Timestamp"
                >
                  {copiedKey === "timestamp" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="font-medium text-sm text-slate-900">
                {formatTimestamp(timestamp)}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Raw epoch: {timestamp}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional: Raw JSON Viewer for Technical Operators */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs text-slate-500 hover:text-slate-800 gap-1.5 cursor-pointer font-medium"
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>{showRawJson ? "Hide Raw ABDM Payload" : "View Raw ABDM Payload (JSON)"}</span>
          {showRawJson ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {showRawJson && (
          <div className="mt-3 relative rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400">ABDM Care Context JSON Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(JSON.stringify(data, null, 2), "JSON payload", "json")}
                className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1 cursor-pointer"
              >
                {copiedKey === "json" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy JSON</span>
              </Button>
            </div>
            <pre className="text-xs font-mono overflow-x-auto text-emerald-400 max-h-80 select-all p-2 rounded bg-slate-950/60">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
