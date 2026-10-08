import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { DataTable } from "@/common/Datatable";
import TableSearch from "@/common/TableSearch";
import Pagination from "@/common/Pagination";
import CustomPanel from "@/common/CustomPanel";
import { ActionMenu } from "@/common/ActionMenu";
import { RequestConsentDrawer } from "@/components/RequestConsentDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Loader2,
  CalendarIcon,
  ArrowRight,
  SlidersHorizontal,
  FileSpreadsheet,
  Printer,
  Filter,
  RotateCcw,
  AlertCircle,
  Search,
  Link2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { notify } from "@/lib/notify";
import type { HipPatient } from "@/types/hip";
import {
  fetchHipPatients,
  hasValidFhirData,
  parseFhirBundleData,
  linkCareContextBatch,
} from "@/services/hipService";
import { FhirParsedViewer } from "@/pages/HIU/FhirParsedViewer";

export default function HipTable() {
  const [data, setData] = useState<HipPatient[]>([]);
  const [filteredData, setFilteredData] = useState<HipPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Multi-select state for eligible patients by unique row id (Max 50)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isLinkingBatch, setIsLinkingBatch] = useState<boolean>(false);

  // Viewing FHIR Patient state
  const [viewingFhirPatient, setViewingFhirPatient] = useState<HipPatient | null>(null);

  // Request Consent drawer states
  const [isConsentDrawerOpen, setIsConsentDrawerOpen] = useState(false);
  const [selectedConsentPatient, setSelectedConsentPatient] = useState<HipPatient | null>(null);

  // Actions dropdown (Filter / Export / Print / Refresh)
  const [showActions, setShowActions] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  // From Date -> To Date (header filter)
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // Filter panel state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Record<string, string>>({
    responseStatus: "ALL",
    patientName: "",
    abhaAddress: "",
    careContextId: "",
  });
  const [filters, setFilters] = useState<Record<string, string>>({
    responseStatus: "ALL",
    patientName: "",
    abhaAddress: "",
    careContextId: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    filters.responseStatus !== "ALL" ||
    Boolean(filters.patientName) ||
    Boolean(filters.abhaAddress) ||
    Boolean(filters.careContextId) ||
    Boolean(fromDate) ||
    Boolean(toDate);

  // Close actions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Patients from API
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const patients = await fetchHipPatients();
      const withUniqueIds = patients.map((patient, index) => ({
        ...patient,
        id:
          patient.id ||
          (patient.carecontextid
            ? `hip_${patient.carecontextid}_${index}`
            : `hip_row_${patient.uhid ?? "pt"}_${index + 1}`),
      }));
      setData(withUniqueIds);
      setFilteredData(withUniqueIds);
    } catch (error) {
      console.error("Error fetching HIP patients:", error);
      const friendlyMessage = "Unable to load patient data. Please try again.";
      setApiError(friendlyMessage);
      notify.serverError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Search and Filter logic
  useEffect(() => {
    let result = data;

    // 1. Search across useful patient fields
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => {
        const uhidStr = p.uhid !== undefined && p.uhid !== null ? String(p.uhid).toLowerCase() : "";
        const nameStr = p.patientname ? p.patientname.toLowerCase() : "";
        const abhaNoStr = p.abhano ? p.abhano.toLowerCase() : "";
        const abhaAddrStr = p.abhaaddress ? p.abhaaddress.toLowerCase() : "";
        const careContextStr = p.carecontextid ? p.carecontextid.toLowerCase() : "";
        const ekaoidStr = p.ekaoid ? p.ekaoid.toLowerCase() : "";
        const ekauuidStr = p.ekauuid ? p.ekauuid.toLowerCase() : "";
        const linkedStr = p.Linked ? p.Linked.toLowerCase() : "";
        const linkedatStr = p.Linkedat ? p.Linkedat.toLowerCase() : "";

        return (
          uhidStr.includes(q) ||
          nameStr.includes(q) ||
          abhaNoStr.includes(q) ||
          abhaAddrStr.includes(q) ||
          careContextStr.includes(q) ||
          ekaoidStr.includes(q) ||
          ekauuidStr.includes(q) ||
          linkedStr.includes(q) ||
          linkedatStr.includes(q)
        );
      });
    }

    // 2. Response Status Filter (Responsed)
    if (filters.responseStatus && filters.responseStatus !== "ALL") {
      result = result.filter((p) => {
        const val = (p.Responsed || "").trim().toLowerCase();
        return val === filters.responseStatus.toLowerCase();
      });
    }

    // 3. Patient Name Filter
    if (filters.patientName?.trim()) {
      const nameQ = filters.patientName.trim().toLowerCase();
      result = result.filter((p) => (p.patientname || "").toLowerCase().includes(nameQ));
    }

    // 4. ABHA Address Filter
    if (filters.abhaAddress?.trim()) {
      const abhaQ = filters.abhaAddress.trim().toLowerCase();
      result = result.filter((p) => (p.abhaaddress || "").toLowerCase().includes(abhaQ));
    }

    // 5. Care Context ID Filter
    if (filters.careContextId?.trim()) {
      const ccQ = filters.careContextId.trim().toLowerCase();
      result = result.filter((p) => (p.carecontextid || "").toLowerCase().includes(ccQ));
    }

    // 6. From Date / To Date filters (on visitedat or RequestedAt)
    if (fromDate || toDate) {
      result = result.filter((p) => {
        let recordDate: Date | null = null;
        if (p.visitedat) {
          // visitedat format e.g. "01-08-2026" (DD-MM-YYYY)
          const parts = p.visitedat.split("-");
          if (parts.length === 3) {
            recordDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
        }
        if (!recordDate || isNaN(recordDate.getTime())) {
          if (p.RequestedAt) {
            recordDate = new Date(p.RequestedAt);
          }
        }
        if (!recordDate || isNaN(recordDate.getTime())) return true;

        if (fromDate && recordDate < fromDate) return false;
        if (toDate && recordDate > toDate) return false;
        return true;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [search, filters, data, fromDate, toDate]);

  // Reset Filters
  const handleClearFilters = () => {
    setFilters({
      responseStatus: "ALL",
      patientName: "",
      abhaAddress: "",
      careContextId: "",
    });
    setTempFilters({
      responseStatus: "ALL",
      patientName: "",
      abhaAddress: "",
      careContextId: "",
    });
    setFromDate(undefined);
    setToDate(undefined);
    setSearch("");
    toast.info("All filters cleared");
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setIsFilterPanelOpen(false);
    toast.info("Filters applied");
  };

  const openFilterPanel = () => {
    setTempFilters({ ...filters });
    setIsFilterPanelOpen(true);
    setShowActions(false);
  };

  // Safe Date Formatter helper
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return format(d, "dd MMM yyyy, HH:mm");
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  // Format visitedat
  const formatVisitedDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    // Check if DD-MM-YYYY
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
      try {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) {
          return format(d, "dd MMM yyyy");
        }
      } catch {
        // Fallback
      }
    }
    return dateStr;
  };

  // Action Handlers
  const handleRequestConsent = useCallback((patient: HipPatient) => {
    setSelectedConsentPatient(patient);
    setIsConsentDrawerOpen(true);
  }, []);

  const handleFhirViewer = useCallback((patient: HipPatient) => {
    setViewingFhirPatient(patient);
  }, []);

  // Helper to determine if a patient has Link = Yes
  const isPatientLinked = useCallback((p: HipPatient) => {
    const rawLinked = String(p.Linked ?? (p as any).Link ?? "").trim().toLowerCase();
    return rawLinked === "yes";
  }, []);

  // Eligible patients for Care Context linking (where Link !== "Yes" and valid unique row id exists)
  const eligiblePatients = useMemo(() => {
    return filteredData.filter(
      (p) => !isPatientLinked(p) && p.id !== undefined && p.id !== ""
    );
  }, [filteredData, isPatientLinked]);

  // Is all eligible selected (up to max limit of 50)
  const isAllEligibleSelected = useMemo(() => {
    if (eligiblePatients.length === 0) return false;
    const targetSet = eligiblePatients.slice(0, 50);
    return targetSet.every((p) => p.id && selectedRowIds.includes(p.id));
  }, [eligiblePatients, selectedRowIds]);

  const isSomeEligibleSelected = useMemo(() => {
    return selectedRowIds.length > 0 && !isAllEligibleSelected;
  }, [selectedRowIds, isAllEligibleSelected]);

  // Header Select All toggle (respects max 50 limit and skips Link = Yes)
  const handleToggleSelectAll = useCallback(() => {
    if (isAllEligibleSelected) {
      setSelectedRowIds([]);
    } else {
      if (eligiblePatients.length > 50) {
        const first50 = eligiblePatients.slice(0, 50).map((p) => p.id!);
        setSelectedRowIds(first50);
        notify.info("Selected maximum allowed limit of 50 records for Care Context linking.");
      } else {
        const allEligible = eligiblePatients.map((p) => p.id!);
        setSelectedRowIds(allEligible);
      }
    }
  }, [isAllEligibleSelected, eligiblePatients]);

  // Individual row selection toggle by unique row id (skips Link = Yes, caps at 50)
  const handleToggleRow = useCallback((rowId: string) => {
    setSelectedRowIds((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      } else {
        if (prev.length >= 50) {
          notify.warning("Maximum 50 records allowed per batch. Please unselect some rows first.");
          return prev;
        }
        return [...prev, rowId];
      }
    });
  }, []);

  // Batch Care Context Linking handler (POST /api/care-context/link-batch)
  const handleLinkCareContextBatch = useCallback(async () => {
    if (!selectedRowIds || selectedRowIds.length === 0) {
      notify.warning("Please select at least one eligible patient to link Care Context.");
      return;
    }

    if (selectedRowIds.length > 50) {
      notify.warning("Maximum 50 records allowed per batch. Please reduce your selection.");
      return;
    }

    // Collect corresponding rows from table data
    const selectedRows = data.filter((p) => p.id && selectedRowIds.includes(p.id));

    // Extract valid UHIDs from the selected rows, excluding Link = Yes, deduplicated strings
    const cleanUhids = Array.from(
      new Set(
        selectedRows
          .filter(
            (p) =>
              !isPatientLinked(p) &&
              p.uhid !== undefined &&
              p.uhid !== null &&
              String(p.uhid).trim() !== ""
          )
          .map((p) => String(p.uhid).trim())
      )
    );

    if (cleanUhids.length === 0) {
      notify.info("Selected patients do not have valid UHIDs or are already linked.");
      return;
    }

    setIsLinkingBatch(true);
    try {
      await linkCareContextBatch(cleanUhids);
      // 202 Accepted: treat as request accepted/submitted (final result received later via webhook /webhooks/eka)
      toast.success("Care Context linking request accepted and submitted successfully (202).");
      // Clear selected checkboxes, keep table data unchanged
      setSelectedRowIds([]);
    } catch (err: any) {
      console.error("Care Context linking batch error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit Care Context linking request.";
      notify.serverError(msg);
    } finally {
      setIsLinkingBatch(false);
    }
  }, [selectedRowIds, data, isPatientLinked]);

  // Table Columns
  const columns: ColumnDef<HipPatient>[] = useMemo(
    () => [
      // Multi-Select Checkbox Column (identified by unique row id)
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              aria-label="Select all eligible rows"
              checked={isAllEligibleSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeEligibleSelected;
              }}
              onChange={handleToggleSelectAll}
              disabled={eligiblePatients.length === 0}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        ),
        size: 48,
        cell: ({ row }) => {
          const patient = row.original;
          const isLinked = isPatientLinked(patient);
          const rowId = patient.id || `row_${row.index}`;
          const isSelected = selectedRowIds.includes(rowId);

          if (isLinked) {
            return (
              <div
                className="flex items-center justify-center"
                title="Already linked (Care Context Link = Yes)"
              >
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  aria-label={`Row disabled - ${patient.patientname || "Patient"} already linked`}
                  className="h-4 w-4 rounded border-slate-300 text-slate-300 opacity-40 cursor-not-allowed"
                />
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                aria-label={`Select row for ${patient.patientname || "Patient"}`}
                checked={isSelected}
                onChange={() => handleToggleRow(rowId)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "uhid",
        header: "UHID",
        size: 110,
        cell: ({ row }) => (
          <span className="font-medium text-slate-800">{row.original.uhid || "-"}</span>
        ),
      },
      {
        accessorKey: "patientname",
        header: "Patient Name",
        size: 170,
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900 capitalize">
            {row.original.patientname || "-"}
          </span>
        ),
      },
      {
        accessorKey: "abhano",
        header: "ABHA Number",
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-700">
            {row.original.abhano || "-"}
          </span>
        ),
      },
      {
        accessorKey: "abhaaddress",
        header: "ABHA Address",
        size: 170,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-700">
            {row.original.abhaaddress || "-"}
          </span>
        ),
      },
      {
        accessorKey: "carecontextid",
        header: "Care Context ID",
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 truncate block max-w-[170px]" title={row.original.carecontextid}>
            {row.original.carecontextid || "-"}
          </span>
        ),
      },
      {
        accessorKey: "ekaoid",
        header: "EKAO ID",
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600">
            {row.original.ekaoid || "-"}
          </span>
        ),
      },
      {
        accessorKey: "ekauuid",
        header: "EKA UUID",
        size: 180,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 truncate block max-w-[170px]" title={row.original.ekauuid}>
            {row.original.ekauuid || "-"}
          </span>
        ),
      },
      {
        accessorKey: "visitedat",
        header: "Visited At",
        size: 120,
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">{formatVisitedDate(row.original.visitedat)}</span>
        ),
      },
      {
        accessorKey: "RequestedAt",
        header: "Requested At",
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">{formatDateTime(row.original.RequestedAt)}</span>
        ),
      },
      {
        accessorKey: "Responsed",
        header: "Response Status",
        size: 130,
        cell: ({ row }) => {
          const resp = (row.original.Responsed || "").trim().toLowerCase();
          const isYes = resp === "yes";
          return (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                isYes
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {row.original.Responsed || "No"}
            </span>
          );
        },
      },

      {
        accessorKey: "Linked",
        header: "Linked",
        size: 110,
        cell: ({ row }) => {
          const resp = (row.original.Linked || "").trim().toLowerCase();
          const isYes = resp === "yes";
          return (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                isYes
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {row.original.Linked || "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "Linkedat",
        header: "Linked At",
        size: 160,
        cell: ({ row }) => (
          <span className="text-xs text-slate-700">
            {formatDateTime(row.original.Linkedat)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        size: 120,
        cell: ({ row }) => {
          const patient = row.original;
          const hasFHIRData =
            patient?.FHIRBundleJSON !== null &&
            patient?.FHIRBundleJSON !== undefined &&
            patient?.FHIRBundleJSON !== "" &&
            hasValidFhirData(patient?.FHIRBundleJSON);

          return (
            <div className="relative flex items-center">
              <ActionMenu
                item={patient}
                requestConsentLabel="Request Consents"
                onRequestConsent={handleRequestConsent}
                onFhirViewer={hasFHIRData ? handleFhirViewer : undefined}
              />
            </div>
          );
        },
      },
    ],
    [
      handleRequestConsent,
      handleFhirViewer,
      isPatientLinked,
      selectedRowIds,
      isAllEligibleSelected,
      isSomeEligibleSelected,
      handleToggleSelectAll,
      handleToggleRow,
      eligiblePatients,
    ]
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage, itemsPerPage]);

  const paginationTable = {
    getState: () => ({
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: itemsPerPage,
      },
    }),
    setPageIndex: (index: number) => setCurrentPage(index + 1),
    setPageSize: (size: number) => {
      setItemsPerPage(size);
      setCurrentPage(1);
    },
    previousPage: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
    nextPage: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
    getCanPreviousPage: () => currentPage > 1,
    getCanNextPage: () => currentPage < totalPages,
  };

  // Export current page to CSV
  const handleExportCsv = () => {
    if (!paginatedData.length) {
      toast.error("No data to export on current page");
      return;
    }

    try {
      const exportColumns: { key: keyof HipPatient; header: string }[] = [
        { key: "uhid", header: "UHID" },
        { key: "patientname", header: "Patient Name" },
        { key: "abhano", header: "ABHA Number" },
        { key: "abhaaddress", header: "ABHA Address" },
        { key: "carecontextid", header: "Care Context ID" },
        { key: "ekaoid", header: "EKAO ID" },
        { key: "ekauuid", header: "EKA UUID" },
        { key: "visitedat", header: "Visited At" },
        { key: "RequestedAt", header: "Requested At" },
        { key: "Responsed", header: "Response Status" },
      ];

      const exportRows = paginatedData.map((row, index) => {
        const rowData: Record<string, string | number> = {
          "S.No": (currentPage - 1) * itemsPerPage + index + 1,
        };
        exportColumns.forEach((col) => {
          const val = row[col.key];
          rowData[col.header] = val !== undefined && val !== null ? String(val) : "-";
        });
        return rowData;
      });

      const headers = Object.keys(exportRows[0] || {});
      const csvContent = [
        headers.join(","),
        ...exportRows.map((row) =>
          headers
            .map((key) => {
              const val = String(row[key]);
              if (val.includes(",") || val.includes('"') || val.includes("\n")) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `HIP_Patients.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success(`Exported ${paginatedData.length} records to HIP_Patients.csv`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data.");
    } finally {
      setShowActions(false);
    }
  };

  // Print current page
  const handlePrint = () => {
    setShowActions(false);
    const originalTitle = document.title;
    document.title = "HIP Patient Records";
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // FHIR Clinical Record View mode
  if (viewingFhirPatient) {
    const fhirBundleData = parseFhirBundleData(viewingFhirPatient.FHIRBundleJSON);

    return (
      <div className="space-y-4">
        {/* Breadcrumb matching Registration */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">HIP</span>
          <span className="text-slate-400">/</span>
          <button
            type="button"
            onClick={() => setViewingFhirPatient(null)}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Patients
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-semibold">FHIR Clinical Record View</span>
        </nav>

        <FhirParsedViewer
          patientDetails={{
            uhid: viewingFhirPatient.uhid,
            patientname: viewingFhirPatient.patientname,
            abhano: viewingFhirPatient.abhano,
            abhaaddress: viewingFhirPatient.abhaaddress,
            carecontextid: viewingFhirPatient.carecontextid,
            ekaoid: viewingFhirPatient.ekaoid,
            ekauuid: viewingFhirPatient.ekauuid,
            visitedat: viewingFhirPatient.visitedat,
            RequestedAt: viewingFhirPatient.RequestedAt,
            Responsed: viewingFhirPatient.Responsed,
          }}
          initialData={fhirBundleData}
          onBack={() => setViewingFhirPatient(null)}
          backLabel="Back to HIP"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-card border border-border rounded-md p-6">
        {/* Top Header Row: Icon, Title, Search, Date Pickers, Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Title & Icon matching Registration */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
              style={{
                background: "var(--side-menu)",
                color: "var(--blue-text-color)",
              }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold text-foreground">HIP</h1>
              <p className="text-[12.5px] text-muted-foreground">
                View and manage Health Information Provider (HIP) patient records
              </p>
            </div>
          </div>

          {/* Search, Date Pickers, Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Top Care-Context Batch Button & Selection Counter */}
            {/* <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleLinkCareContextBatch}
                disabled={isLinkingBatch || selectedRowIds.length === 0}
                className="blue-btn text-white font-medium text-xs shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-9 transition-colors"
                title={
                  selectedRowIds.length === 0
                    ? "Select eligible rows below to link Care Context"
                    : `Link Care Context for ${selectedRowIds.length} selected row(s)`
                }
              >
                {isLinkingBatch ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                    Care Context
                  </>
                )}
              </Button>
              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-1.5 rounded-md border shrink-0 transition-colors",
                  selectedRowIds.length > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                )}
              >
                Selected: {selectedRowIds.length} / 50
              </span>
            </div> */}

            {/* Table Search */}
            <div className="flex-1 sm:flex-none">
              <TableSearch
                placeholder="Search UHID / Name / ABHA / Care Context"
                value={search}
                onChange={(value: string) => setSearch(value)}
              />
            </div>

            {/* From Date -> To Date header calendar filter */}
            <div className="flex items-center gap-2 shrink-0">
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal cursor-pointer",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd MMM yyyy") : <span>From Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date: any) => setFromDate(date)}
                  />
                </PopoverContent>
              </Popover>

              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal cursor-pointer",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd MMM yyyy") : <span>To Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date: any) => setToDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Actions Menu (Filter / Export / Print / Refresh) */}
            <div className="relative" ref={actionRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="shrink-0 cursor-pointer"
                title="Options"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  title="Clear all filters"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shadow-md hover:bg-blue-700 cursor-pointer"
                >
                  <SlidersHorizontal size={11} />
                </button>
              )}

              {showActions && (
                <div className="absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-1 z-50">
                  <button
                    onClick={openFilterPanel}
                    className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition cursor-pointer"
                    title="Open Filters"
                  >
                    <Filter size={18} />
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition cursor-pointer"
                    title={`Export ${paginatedData.length} records`}
                  >
                    <FileSpreadsheet size={18} />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition cursor-pointer"
                    title="Print Table"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      loadPatients();
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-slate-900 transition cursor-pointer"
                    title="Refresh Data"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={loadPatients}
              disabled={loading}
              className="h-9 w-9 p-0 shrink-0 cursor-pointer"
              title="Refresh Records"
            >
              <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* API Error State */}
        {apiError && !loading && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50/70 text-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{apiError}</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Failed to fetch records from backend. Please check network connection and try again.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPatients}
              className="border-red-300 text-red-700 hover:bg-red-100 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Loading HIP patients from server...</span>
          </div>
        )}

        {/* Empty States when not loading and no error */}
        {!loading && !apiError && data.length === 0 && (
          <div className="p-12 text-center border rounded-lg bg-slate-50/50">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No patients found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No patient records returned from the HIP database.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPatients}
              className="mt-4 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span>Refresh</span>
            </Button>
          </div>
        )}

        {/* Search / Filter Empty State */}
        {!loading && !apiError && data.length > 0 && filteredData.length === 0 && (
          <div className="p-12 text-center border rounded-lg bg-slate-50/50">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No matching patients found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Your search and filter criteria did not match any patient records.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearFilters}
              className="mt-4 cursor-pointer"
            >
              <span>Clear Filters</span>
            </Button>
          </div>
        )}

        {/* Data Table */}
        {(!loading || data.length > 0) && filteredData.length > 0 && (
          <>
            {/* Active Selection Banner */}
            {selectedRowIds.length > 0 && (
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg themeColor border  text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold">
                    {selectedRowIds.length} eligible record{selectedRowIds.length > 1 ? "s" : ""} selected for Care Context linking (Max 50)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRowIds([])}
                    className="themeColor hover:underline font-medium cursor-pointer px-2 py-0.5 rounded"
                  >
                    Clear selection
                  </button>
                  <Button
                    size="sm"
                    onClick={handleLinkCareContextBatch}
                    disabled={isLinkingBatch}
                    className="blue-btn text-white font-medium text-xs shadow-xs h-7 px-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLinkingBatch ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-1.5 h-3 w-3" />
                        Care Context ({selectedRowIds.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <DataTable
              columns={columns}
              data={paginatedData}
              isLoading={loading}
              skeletonRows={5}
            />

            {/* Pagination Component */}
            <Pagination
              table={paginationTable}
              totalCount={filteredData.length}
            />
          </>
        )}
      </div>

      {/* Filter Panel (CustomPanel) */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Filter HIP Patients"
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={applyFilters}
        saveLabel="Apply Filters"
      >
        <div className="space-y-4">
          {/* Response Status */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-response-status">Response Status</Label>
            <NativeSelect
              id="filter-response-status"
              className="w-full"
              value={tempFilters.responseStatus}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, responseStatus: e.target.value })
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </NativeSelect>
          </div>

          {/* Patient Name */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-patient-name">Patient Name</Label>
            <Input
              id="filter-patient-name"
              placeholder="e.g. Suresh, Divya"
              value={tempFilters.patientName}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, patientName: e.target.value })
              }
            />
          </div>

          {/* ABHA Address */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-abha-address">ABHA Address</Label>
            <Input
              id="filter-abha-address"
              placeholder="e.g. user@sbx"
              value={tempFilters.abhaAddress}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, abhaAddress: e.target.value })
              }
            />
          </div>

          {/* Care Context ID */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-care-context">Care Context ID</Label>
            <Input
              id="filter-care-context"
              placeholder="Care Context UUID"
              value={tempFilters.careContextId}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, careContextId: e.target.value })
              }
            />
          </div>

          {/* Reset Filters button inside panel */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setTempFilters({
                  responseStatus: "ALL",
                  patientName: "",
                  abhaAddress: "",
                  careContextId: "",
                });
              }}
              className="w-full cursor-pointer text-xs"
            >
              Reset Form Values
            </Button>
          </div>
        </div>
      </CustomPanel>

      {/* Request Consent Drawer matching Registered Patients */}
      <RequestConsentDrawer
        isOpen={isConsentDrawerOpen}
        onClose={() => {
          setIsConsentDrawerOpen(false);
          setSelectedConsentPatient(null);
        }}
        patient={
          selectedConsentPatient
            ? {
              id: String(selectedConsentPatient.uhid),
              opNo: String(selectedConsentPatient.uhid),
              title: "Mr",
              patientName: selectedConsentPatient.patientname,
              fhwo: "",
              area: "",
              city: "",
              department: "General Medicine",
              registrationDate: "",
              email: selectedConsentPatient.abhaaddress || `${selectedConsentPatient.patientname?.toLowerCase().replace(/[^a-z0-9]/g, "")}@sbx`,
              phone: selectedConsentPatient.abhano,
            }
            : null
        }
      />
    </div>
  );
}
