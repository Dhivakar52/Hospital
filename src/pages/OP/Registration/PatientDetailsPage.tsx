import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Pencil,
  HeartPulse,
  Activity,
  AlertCircle,
  CreditCard,
  Stethoscope,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPatients } from "@/data/mockPatients";
import { resolvePatientDetails, type Patient } from "@/types/op_register";
import { cn } from "@/lib/utils";

type StepTab = "all" | 1 | 2 | 3 | 4;

const STEPS_NAV = [
  { id: 1, label: "Patient Details", count: 18 },
  { id: 2, label: "Address & Contact", count: 8 },
  { id: 3, label: "Insurance Details", count: 14 },
  { id: 4, label: "Additional Information", count: 14 },
] as const;

export default function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = useState<ReturnType<typeof resolvePatientDetails> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StepTab>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 1. Check if patient was passed via router state
    const statePatient = (location.state as { patient?: Patient } | null)?.patient;
    if (statePatient && statePatient.id === id) {
      setPatient(resolvePatientDetails(statePatient));
      setLoading(false);
      return;
    }

    // 2. Fallback lookup from mockPatients by :id
    const timer = setTimeout(() => {
      const found = mockPatients.find((p) => p.id === id || p.opNo === id);
      if (found) {
        setPatient(resolvePatientDetails(found));
      } else {
        setError(`No patient record found for UHID: "${id}".`);
      }
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-xs text-slate-500 font-medium">Loading patient details...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-4 shadow-xs">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Patient Record Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {error || "The requested patient details could not be retrieved. Please check the UHID and try again."}
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate("/registered-patients")}
              variant="outline"
              size="sm"
              className="gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Registered Patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="text-slate-400">Registration</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link
          to="/registered-patients"
          className="hover:text-blue-600 hover:underline transition-colors"
        >
          Registered Patients
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">View Details</span>
      </nav>

      {/* Top Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/registered-patients")}
            className="h-9 w-9 p-0 rounded-lg shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            title="Back to Registered Patients"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Registered Patient Details
              </h1>
              <Badge variant="outline" className="text-[11px] font-semibold bg-slate-50 border-slate-300 text-slate-700">
                UHID: {patient.id}
              </Badge>
              <Badge className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {patient.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete details across all 4 registration steps: Patient Details, Address & Contact, Insurance Details, and Additional Information
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            onClick={() => navigate("/op/registration", { state: { patient } })}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer font-medium"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Patient</span>
          </Button>

          <Button
            onClick={() => navigate("/registered-patients")}
            size="sm"
            className="h-9 px-3.5 gap-1.5 text-xs text-white cursor-pointer font-medium shadow-xs"
            style={{ background: "var(--blue-btn)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Patients</span>
          </Button>
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xs shrink-0"
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)" }}
          >
            {patient.patientName.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                {patient.title ? `${patient.title} ` : ""}{patient.patientName}
              </h2>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold">
                {patient.department}
              </Badge>
              <Badge variant="outline" className="text-[11px] font-medium text-slate-600 bg-slate-50">
                {patient.gender}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span>OP No: <strong className="text-slate-700 font-semibold">{patient.opNo}</strong></span>
              <span>•</span>
              <span>Age: <strong className="text-slate-700 font-semibold">{patient.age} Yrs</strong></span>
              <span>•</span>
              <span>Blood Group: <strong className="text-rose-600 font-semibold">{patient.bloodGroup}</strong></span>
              <span>•</span>
              <span>City: <strong className="text-slate-700 font-semibold">{patient.city}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 w-full md:w-auto">
          <div className="text-xs">
            <span className="text-slate-400 block text-[11px]">Primary Contact</span>
            <span className="font-semibold text-slate-800">{patient.phone || patient.contactNo1 || "N/A"}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[11px]">Registered Date</span>
            <span className="font-semibold text-slate-800">{patient.registrationDate}</span>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Sections</span>
          </button>

          {STEPS_NAV.map((step) => {
            const isActive = activeTab === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveTab(step.id)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer",
                  isActive
                    ? "text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
                style={isActive ? { background: "var(--blue-text-color)" } : undefined}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {step.id}
                </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Detailed Sections */}
      <div className="space-y-6">
        {/* Step 1: Patient Details */}
        {(activeTab === "all" || activeTab === 1) && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Patient Details
                    <Badge variant="outline" className="text-[10px] bg-blue-50/50 text-blue-700 border-blue-200">
                      Step 1
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-400">Demographic info, patient identifiers, and contact details</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Dr. App. Ref No</span>
                <span className="font-semibold text-slate-900">{patient.drAppRefNo || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Mobile No</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-blue-500" />
                  {patient.phone || patient.contactNo1 || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">UHID No</span>
                <span className="font-bold text-blue-700">{patient.id}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">OP No</span>
                <span className="font-bold text-blue-700">{patient.opNo}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Patient Name</span>
                <span className="font-semibold text-slate-900">{patient.patientName}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Title</span>
                <span className="font-medium text-slate-800">{patient.title || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Gender</span>
                <span className="font-medium text-slate-800">{patient.gender || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">DOB</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {patient.dob || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Age / Month / Day</span>
                <span className="font-medium text-slate-800">
                  {patient.age} Yrs / {patient.ageMonths ?? 0} Mos / {patient.ageDays ?? 0} Days
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Father / Husband / Wife Name</span>
                <span className="font-medium text-slate-800">{patient.fhwo || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Marital Status</span>
                <span className="font-medium text-slate-800">{patient.maritalStatus || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/40 border border-rose-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Blood Group</span>
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <HeartPulse className="h-3 w-3 text-rose-500" />
                  {patient.bloodGroup || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Religion</span>
                <span className="font-medium text-slate-800">{patient.religion || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Nationality</span>
                <span className="font-medium text-slate-800">{patient.nationality || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Contact No 1</span>
                <span className="font-medium text-slate-800">{patient.contactNo1 || patient.phone || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Contact No 2</span>
                <span className="font-medium text-slate-800">{patient.contactNo2 || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5">Email Address</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  {patient.email || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">ABHA ID</span>
                <span className="font-medium text-blue-700">{patient.abhaId || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Reg Date</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {patient.registrationDate || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address & Contact */}
        {(activeTab === "all" || activeTab === 2) && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Address & Contact
                    <Badge variant="outline" className="text-[10px] bg-emerald-50/50 text-emerald-700 border-emerald-200">
                      Step 2
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-400">Residential building, locality, city, and postal details</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Door No</span>
                <span className="font-medium text-slate-800">{patient.doorNo || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Building Name</span>
                <span className="font-medium text-slate-800">{patient.buildingName || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Street</span>
                <span className="font-medium text-slate-800">{patient.street || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Area</span>
                <span className="font-medium text-slate-800">{patient.area || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">City / Town</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  {patient.city || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">State</span>
                <span className="font-medium text-slate-800">{patient.state || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Country</span>
                <span className="font-medium text-slate-800">{patient.country || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">PIN Code</span>
                <span className="font-semibold text-slate-900">{patient.pincode || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 sm:col-span-2 md:col-span-3 lg:col-span-4">
                <span className="text-slate-400 block text-[11px] mb-0.5">Complete Address</span>
                <span className="font-medium text-slate-800 leading-relaxed">{patient.address}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Insurance Details */}
        {(activeTab === "all" || activeTab === 3) && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Insurance Details
                    <Badge variant="outline" className="text-[10px] bg-indigo-50/50 text-indigo-700 border-indigo-200">
                      Step 3
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-400">Coverage provider, category, billing type, and registration fee</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Patient Category</span>
                <span className="font-semibold text-slate-900">{patient.patientCategory || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Sub Category</span>
                <span className="font-medium text-slate-800">{patient.subCategory || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Corporate Company</span>
                <span className="font-medium text-slate-800">{patient.corporateCompany || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Insurance Company</span>
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-indigo-500" />
                  {patient.insuranceCompany || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5">Insurance Plan Name</span>
                <span className="font-medium text-slate-800">{patient.insuranceName || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Employee No</span>
                <span className="font-medium text-slate-800">{patient.employeeNo || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Card ID No</span>
                <span className="font-medium text-slate-800">{patient.cardIdNo || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Comprehensive OPD Type</span>
                <span className="font-medium text-slate-800">{patient.comprehensiveOpdType || "No"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Bill Type</span>
                <span className="font-medium text-slate-800">{patient.billType || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Pay Type</span>
                <span className="font-medium text-slate-800">{patient.payType || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Mode of Pay</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-slate-400" />
                  {patient.modeOfPay || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Bank Name</span>
                <span className="font-medium text-slate-800">{patient.bankName || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Net Reg Fee</span>
                <span className="font-bold text-emerald-700">{patient.netRegFee || "₹ 0"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Reg Fee</span>
                <span className="font-bold text-emerald-700">{patient.regFee || "₹ 0"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Additional Information */}
        {(activeTab === "all" || activeTab === 4) && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Additional Information
                    <Badge variant="outline" className="text-[10px] bg-amber-50/50 text-amber-700 border-amber-200">
                      Step 4
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-400">Department, doctor, visit mode, KIN / guardian, and NRI details</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Department</span>
                <span className="font-bold text-blue-800">{patient.department}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Consulting Doctor</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3 text-blue-500" />
                  {patient.doctor || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Unit</span>
                <span className="font-medium text-slate-800">{patient.unit || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">COVID Vaccination</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {patient.covidVaccination || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">VIP</span>
                <span className="font-medium text-slate-800">{patient.vip || "No"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Mode of Visit</span>
                <span className="font-medium text-slate-800">{patient.modeOfVisit || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Referred By</span>
                <span className="font-medium text-slate-800">{patient.referredBy || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Reason for Fee</span>
                <span className="font-medium text-slate-800">{patient.reasonForFee || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">Disc %</span>
                <span className="font-medium text-slate-800">{patient.discountPercent || "0%"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">KIN Name</span>
                <span className="font-medium text-slate-800">{patient.kinName || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">KIN Relationship</span>
                <span className="font-medium text-slate-800">{patient.kinRelationship || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">KIN Contact No</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-amber-500" />
                  {patient.kinContactNo || "—"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">NRI Relationship</span>
                <span className="font-medium text-slate-800">{patient.nriRelationship || "—"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">NRI Contact No</span>
                <span className="font-medium text-slate-800">{patient.nriContactNo || "—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

