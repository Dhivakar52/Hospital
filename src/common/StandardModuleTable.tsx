import { useState, useMemo, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/common/Datatable";
import TableSearch from "@/common/TableSearch";
import Pagination from "@/common/Pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { BarcodePreviewModal } from "@/components/BarcodePreviewModal";
import { PatientPrintPreviewModal } from "@/components/PatientPrintPreviewModal";

interface StandardModuleTableProps<TData> {
  title: string;
  searchPlaceholder?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  searchField?: (item: TData) => string;
  isLoading?: boolean;
}

export function StandardModuleTable<TData extends Record<string, any>>({
  title,
  searchPlaceholder = "Search...",
  columns,
  data,
  searchField,
  isLoading = false,
}: StandardModuleTableProps<TData>) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showActions, setShowActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPrintItem, setSelectedPrintItem] = useState<TData | null>(null);
  const [selectedBarcodeItem, setSelectedBarcodeItem] = useState<TData | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // Filter data based on search and dates
  const filteredData = useMemo(() => {
    let result = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        if (searchField) {
          return searchField(item).toLowerCase().includes(q);
        }
        return Object.values(item).some((val) =>
          String(val ?? "").toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [data, search, searchField]);

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
      toast.error("No data to export on current page");
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
      toast.error("Failed to export data");
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
                    "justify-start text-left font-normal",
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
                    "justify-start text-left font-normal",
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
              className="shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-1 z-50">
                <button
                  onClick={() => {
                    setShowActions(false);
                  }}
                  className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground transition"
                  title="Filter"
                >
                  <Filter size={18} />
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition"
                  title="Export"
                >
                  <FileSpreadsheet size={18} />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition"
                  title="Print"
                >
                  <Printer size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredData.length} records
          </span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable columns={columns} data={paginatedData} isLoading={isLoading} />

      {/* Pagination Controls */}
      <div className="mt-4">
        <Pagination table={paginationTable} totalCount={filteredData.length} />
      </div>

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
