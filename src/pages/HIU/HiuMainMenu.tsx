import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  FileKey, 
  FileCode2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  FileCheck2,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HiuMainMenu() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 shadow-xs"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">HIU Main Menu</h1>
              <Badge variant="secondary" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5">
                ABDM M3 Ready
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Health Information User module — Manage digital patient consent requests and inspect ABDM-compliant FHIR health records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Badge variant="outline" className="text-xs py-1 px-3 border-slate-200 text-slate-600 bg-slate-50 gap-1.5 font-normal">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Gateway Connected
          </Badge>
        </div>
      </div>

      {/* Main Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Consent Management */}
        <div 
          onClick={() => navigate("/consent")}
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <FileKey className="h-6 w-6" />
              </div>
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium group-hover:border-blue-200 transition-colors">
                Module 01
              </Badge>
            </div>

            <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
              Consent Management
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Create, track, and manage ABDM patient consent requests. Monitor consent status across pending, approved, and expired states with real-time ABHA verification.
            </p>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Request medical records via ABHA address</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Granular date range & purpose configurations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>View consent artifact details & audit history</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
              Route: /consent
            </span>
            <Button
              size="sm"
              className="gap-1.5 text-xs text-white font-medium cursor-pointer group-hover:translate-x-0.5 transition-transform"
              style={{ background: "var(--blue-btn)" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate("/consent");
              }}
            >
              <span>Open Consent</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Module 2: FHIR Viewer */}
        <div 
          onClick={() => navigate("/fhir")}
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <FileCode2 className="h-6 w-6" />
              </div>
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium group-hover:border-indigo-200 transition-colors">
                Module 02
              </Badge>
            </div>

            <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
              FHIR Viewer
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Upload, parse, and analyze ABDM/NDHM compliant FHIR R4 Bundle documents. Interactive visual inspector for diagnostic reports, prescriptions, discharge summaries, and vitals.
            </p>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Drop & parse raw FHIR JSON bundle files</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Categorized tabs: Prescription, Diagnostic, Vitals</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Full JSON payload inspector & copy capabilities</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
              Route: /fhir
            </span>
            <Button
              size="sm"
              className="gap-1.5 text-xs text-white font-medium cursor-pointer group-hover:translate-x-0.5 transition-transform"
              style={{ background: "var(--blue-btn)" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate("/fhir");
              }}
            >
              <span>Open FHIR Viewer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Integration & Standards Overview */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            HIU Architecture & Compliance Standards
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3 bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <Share2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Consent Flow</div>
              <div className="text-slate-500 mt-0.5 text-[11.5px]">HIU Request &rarr; Gateway &rarr; Patient Approval &rarr; Data Transfer</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <Layers className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">FHIR R4 Structure</div>
              <div className="text-slate-500 mt-0.5 text-[11.5px]">ABDM Profiles for Consultations, Diagnostics, & Summaries</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Secure Decryption</div>
              <div className="text-slate-500 mt-0.5 text-[11.5px]">End-to-end encrypted DH key exchange for health data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
