import { useState, useMemo, useRef, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CalendarIcon,
  ArrowRight,
  SlidersHorizontal,
  FileSpreadsheet,
  Printer,
  Filter,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/common/Datatable";
import TableSearch from "@/common/TableSearch";
import Pagination from "@/common/Pagination";
import CustomPanel from "@/common/CustomPanel";
import { Field, TextField, SelectField } from "@/components/FormPrimitives";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { notify } from "@/lib/notify";

import { BarcodePreviewModal } from "@/components/BarcodePreviewModal";
import { PatientPrintPreviewModal } from "@/components/PatientPrintPreviewModal";

export interface FilterOption {
  label: string;
  key: string;
  type?: "text" | "select";
  options?: string[];
}

interface StandardModuleTableProps<TData> {
  title: string;
  searchPlaceholder?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  searchField?: (item: TData) => string;
  isLoading?: boolean;
  filterFields?: FilterOption[];
}

export function StandardModuleTable<TData extends Record<string, any>>({
  title,
  searchPlaceholder = "Search...",
  columns,
  data,
  searchField,
  isLoading = false,
  filterFields,
}: StandardModuleTableProps<TData>) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showActions, setShowActions] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPrintItem, setSelectedPrintItem] = useState<TData | null>(null);
  const [selectedBarcodeItem, setSelectedBarcodeItem] = useState<TData | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // Active filters & temp filters
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [tempFilters, setTempFilters] = useState<Record<string, string>>({});

  const hasActiveFilters =
    Object.keys(filters).length > 0 || Boolean(fromDate) || Boolean(toDate) || Boolean(search.trim());

  // Automatically derive default filter fields if not provided
  const derivedFilterFields: FilterOption[] = useMemo(() => {
    if (filterFields && filterFields.length > 0) return filterFields;
    if (!data || data.length === 0) return [];

    const sample = data[0];
    const keysToExclude = ["id", "uhidNo", "opNo", "ancNo", "contactNo", "phone", "email"];

    return Object.keys(sample)
      .filter((k) => typeof sample[k] === "string" && !keysToExclude.includes(k))
      .slice(0, 4)
      .map((k) => {
        const uniqueValues = Array.from(new Set(data.map((d) => String(d[k] || "")).filter(Boolean)));
        const isSelect = uniqueValues.length > 0 && uniqueValues.length <= 15;
        const formattedLabel = k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        return {
          label: formattedLabel,
          key: k,
          type: isSelect ? "select" : "text",
          options: isSelect ? uniqueValues : undefined,
        };
      });
  }, [filterFields, data]);

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

  // Filter data based on Search, Date range, and Field filters
  const filteredData = useMemo(() => {
    let result = data;

    // Search Filter (case-insensitive, trimmed)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => {
        if (searchField) {
          return searchField(item).toLowerCase().includes(q);
        }
        return Object.values(item).some((val) =>
          String(val ?? "").toLowerCase().includes(q)
        );
      });
    }

    // Dynamic Field Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => {
          const itemVal = item[key];
          if (itemVal === undefined || itemVal === null) return false;
          return String(itemVal).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // From Date -> To Date Filtering
    if (fromDate || toDate) {
      result = result.filter((item) => {
        const dateStr = item.registrationDate || item.ancDate || item.cancelledDate || item.date || item.createdDate;
        if (!dateStr) return true;
        const itemDate = new Date(dateStr);
        if (isNaN(itemDate.getTime())) return true;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    return result;
  }, [data, search, filters, fromDate, toDate, searchField]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, fromDate, toDate]);

  // Open Filter Panel
  const handleOpenFilterPanel = () => {
    setTempFilters({ ...filters });
    setIsFilterPanelOpen(true);
    setShowActions(false);
  };

  // Apply Filter
  const handleApplyFilter = () => {
    setFilters({ ...tempFilters });
    setIsFilterPanelOpen(false);
  };

  // Reset / Clear All Filters
  const handleResetFilters = () => {
    setSearch("");
    setFilters({});
    setTempFilters({});
    setFromDate(undefined);
    setToDate(undefined);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  // Paginated Data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
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

  const handleExportExcel = () => {
    if (!paginatedData.length) {
      notify.validationError("No data to export on current page");
      return;
    }
    try {
      const headers = Object.keys(paginatedData[0] || {});
      const csvContent = [
        headers.join(","),
        ...paginatedData.map((row) =>
          headers
            .map((key) => {
              const val = row[key];
              if (
                typeof val === "string" &&
                (val.includes(",") || val.includes('"') || val.includes("\n"))
              ) {
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
      link.download = `${title.replace(/\s+/g, "_")}_Page${currentPage}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`Exported ${paginatedData.length} records`);
    } catch (err) {
      console.error(err);
      notify.serverError("Failed to export data");
    } finally {
      setShowActions(false);
    }
  };

  const handlePrint = () => {
    setShowActions(false);
    window.print();
  };

  return (
    <div className="bg-card border border-border rounded-md p-6">
      {/* Title & Top Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <Badge variant="secondary" className="text-xs">
            {filteredData.length} records
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="flex-1 sm:flex-none">
            <TableSearch
              placeholder={searchPlaceholder}
              value={search}
              onChange={(val: string) => setSearch(val)}
            />
          </div>

          {/* Date Pickers */}
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

          {/* Action Menu (Filter / Export / Print) */}
          <div className="relative" ref={actionRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className={cn("shrink-0 cursor-pointer", hasActiveFilters && "border-blue-500 text-blue-600 bg-blue-50/50")}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Clear all filters"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shadow-md hover:bg-blue-700 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}

            {showActions && (
              <div className="absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-1 z-50">
                <button
                  onClick={handleOpenFilterPanel}
                  className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition cursor-pointer"
                  title="Open Filter Panel"
                >
                  <Filter size={18} />
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition cursor-pointer"
                  title="Export to CSV"
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Indicators & Record Count Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredData.length} records
          </span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1 px-2 cursor-pointer"
            >
              <X className="h-3 w-3" /> Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable columns={columns} data={paginatedData} isLoading={isLoading} />

      {/* Pagination Controls */}
      <div className="mt-4">
        <Pagination table={paginationTable} totalCount={filteredData.length} />
      </div>

      {/* Filter Custom Panel Slide-over (Matching Registered Patients) */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Filter Records"
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilter}
        saveLabel="Apply Filter"
        width="580px"
      >
        <div className="space-y-6 text-slate-700">
          <p className="text-xs text-muted-foreground">
            Specify filter criteria below to refine matching records.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {derivedFilterFields.map((field) => (
              <Field key={field.key} label={field.label}>
                {field.type === "select" && field.options ? (
                  <SelectField
                    options={field.options}
                    placeholder={`Any ${field.label.toLowerCase()}`}
                    value={tempFilters[field.key] || ""}
                    onChange={(val: string) =>
                      setTempFilters((prev) => {
                        const next = { ...prev };
                        if (val) next[field.key] = val;
                        else delete next[field.key];
                        return next;
                      })
                    }
                  />
                ) : (
                  <TextField
                    placeholder={`Filter by ${field.label.toLowerCase()}`}
                    value={tempFilters[field.key] || ""}
                    onChange={(val: string) =>
                      setTempFilters((prev) => {
                        const next = { ...prev };
                        if (val) next[field.key] = val;
                        else delete next[field.key];
                        return next;
                      })
                    }
                  />
                )}
              </Field>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="text-xs text-slate-600 cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        </div>
      </CustomPanel>

      {/* Print Preview Modal */}
      <PatientPrintPreviewModal
        patient={selectedPrintItem ? {
          id: selectedPrintItem.uhidNo || selectedPrintItem.id || selectedPrintItem.ancNo || "PAT000123",
          patientName: selectedPrintItem.patientName || selectedPrintItem.hospital || selectedPrintItem.referralName || "Patient",
          opNo: selectedPrintItem.opNo,
          department: selectedPrintItem.department || selectedPrintItem.designation,
          city: selectedPrintItem.city || selectedPrintItem.cityName,
        } : null}
        isOpen={Boolean(selectedPrintItem)}
        onClose={() => setSelectedPrintItem(null)}
      />

      {/* Barcode Preview Modal */}
      <BarcodePreviewModal
        patient={selectedBarcodeItem ? {
          id: selectedBarcodeItem.uhidNo || selectedBarcodeItem.id || selectedBarcodeItem.ancNo || "PAT000123",
          patientName: selectedBarcodeItem.patientName || selectedBarcodeItem.hospital || selectedBarcodeItem.referralName || "Patient",
          opNo: selectedBarcodeItem.opNo,
          department: selectedBarcodeItem.department || selectedBarcodeItem.designation,
        } : null}
        isOpen={Boolean(selectedBarcodeItem)}
        onClose={() => setSelectedBarcodeItem(null)}
      />
    </div>
  );
}
