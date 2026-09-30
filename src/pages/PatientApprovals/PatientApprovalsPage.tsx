import { useState, useMemo, useEffect } from "react";
import initialApprovalsData from "@/data/patientApprovals.json";
import { type PatientApproval, type ApprovalStatus } from "@/types/patientApproval";
import { ApprovalTabs } from "./components/ApprovalTabs";
import { PatientApprovalCard } from "./components/PatientApprovalCard";
import Pagination from "@/common/Pagination";
import { ApproveConfirmationModal } from "./components/ApproveConfirmationModal";
import { DenyConfirmationModal } from "./components/DenyConfirmationModal";
import { RevokeAccessModal } from "./components/RevokeAccessModal";
import { notify } from "@/lib/notify";
import { format } from "date-fns";
import { Search, Inbox, RefreshCw } from "lucide-react";


export default function PatientApprovalsPage() {
  // Local state initialized dynamically from the JSON file without mutating the imported JSON
  const [approvals, setApprovals] = useState<PatientApproval[]>(() => {
    return (initialApprovalsData as PatientApproval[]).map((item) => ({ ...item }));
  });

  const [activeTab, setActiveTab] = useState<ApprovalStatus>("pending");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [selectedForApprove, setSelectedForApprove] = useState<PatientApproval | null>(null);
  const [selectedForDeny, setSelectedForDeny] = useState<PatientApproval | null>(null);
  const [selectedForRevoke, setSelectedForRevoke] = useState<PatientApproval | null>(null);

  // Dynamically calculate counts directly from state
  const tabCounts = useMemo<Record<ApprovalStatus, number>>(() => {
    return {
      pending: approvals.filter((item) => item.status === "pending").length,
      approved: approvals.filter((item) => item.status === "approved").length,
      denied: approvals.filter((item) => item.status === "denied").length,
    };
  }, [approvals]);

  // When switching tabs, always reset pagination to page 1
  const handleTabChange = (newTab: ApprovalStatus) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  };

  // Filter records based on current active tab and optional search query
  const filteredApprovals = useMemo(() => {
    const tabFiltered = approvals.filter((item) => item.status === activeTab);
    const query = searchQuery.trim().toLowerCase();

    if (!query) return tabFiltered;

    return tabFiltered.filter((item) => {
      const matchName = item.patientName.toLowerCase().includes(query);
      const matchId = item.patientId.toLowerCase().includes(query);
      const matchApprId = item.id.toLowerCase().includes(query);
      const matchDoctor = item.doctorName.toLowerCase().includes(query);
      const matchHospital = item.hospitalName.toLowerCase().includes(query);
      const matchReason = item.reason.toLowerCase().includes(query);
      return matchName || matchId || matchApprId || matchDoctor || matchHospital || matchReason;
    });
  }, [approvals, activeTab, searchQuery]);

  // Total pages for the current tab's records
  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage) || 1;

  // Ensure currentPage remains valid if records change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Paginated records: Never display more than itemsPerPage (5) cards at once
  const paginatedApprovals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApprovals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApprovals, currentPage, itemsPerPage]);

  // Standard PaginationTable interface for existing Pagination.tsx component
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

  // Handle Approve Confirmation
  const handleConfirmApprove = (approvalToApprove: PatientApproval) => {
    const today = format(new Date(), "yyyy-MM-dd");

    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id === approvalToApprove.id) {
          return {
            ...item,
            status: "approved",
            approvedDate: today,
            denialReason: null,
          };
        }
        return item;
      })
    );

    notify.approveSuccess(`Medical records access approved for ${approvalToApprove.doctorName}.`);
  };

  // Handle Deny Confirmation
  const handleConfirmDeny = (approvalToDeny: PatientApproval, reason: string) => {
    const today = format(new Date(), "yyyy-MM-dd");

    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id === approvalToDeny.id) {
          return {
            ...item,
            status: "denied",
            denialReason: reason || "Declined by patient",
            deniedDate: today,
          };
        }
        return item;
      })
    );

    notify.rejectSuccess(`Access request denied for ${approvalToDeny.doctorName}.`);
  };

  // Handle Revoke Confirmation
  const handleConfirmRevoke = (approvalToRevoke: PatientApproval) => {
    const today = format(new Date(), "yyyy-MM-dd");

    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id === approvalToRevoke.id) {
          return {
            ...item,
            status: "denied",
            denialReason: "Access revoked by patient",
            deniedDate: today,
          };
        }
        return item;
      })
    );

    notify.info(`Access revoked for ${approvalToRevoke.doctorName}.`);
  };

  // Reset to original JSON state for easy demonstration testing
  const handleReset = () => {
    setApprovals((initialApprovalsData as PatientApproval[]).map((item) => ({ ...item })));
    setCurrentPage(1);
    setSearchQuery("");
    notify.saveSuccess("Reset to initial approval records from JSON.");
  };

  return (
    <div className=" px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Subtitle matching the reference screen design language */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14212b] dark:text-slate-100">
            Patient Approvals
          </h1>
          <p className="text-sm text-[#5b6b78] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Patients who have requested access to their medical records. Review and manage their approval status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            title="Reload initial mock JSON dataset"
            className="blue-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Dynamic 3 Tabs with live computed counts */}
          <ApprovalTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />

          {/* Search box */}
          <div className="relative w-full md:w-72 self-start md:self-auto mb-2 md:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search patient, doctor, ID..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0b6b6f] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Dynamic Card List - maximum 5 per page */}
        <div className="space-y-3 pt-1">
          {paginatedApprovals.length > 0 ? (
            paginatedApprovals.map((approval) => (
              <PatientApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={setSelectedForApprove}
                onDeny={setSelectedForDeny}
                onRevoke={setSelectedForRevoke}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center shadow-2xs">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {searchQuery
                  ? "No matching approval requests found"
                  : `No ${activeTab} requests`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No approval records match "${searchQuery}". Try clearing the search query.`
                  : "New requests from doctors and clinics will show up here."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs text-[#0b6b6f] hover:underline font-medium cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Existing Reusable Pagination Component */}
        {filteredApprovals.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              table={paginationTable}
              totalCount={filteredApprovals.length}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ApproveConfirmationModal
        isOpen={Boolean(selectedForApprove)}
        approval={selectedForApprove}
        onClose={() => setSelectedForApprove(null)}
        onConfirm={handleConfirmApprove}
      />

      <DenyConfirmationModal
        isOpen={Boolean(selectedForDeny)}
        approval={selectedForDeny}
        onClose={() => setSelectedForDeny(null)}
        onConfirm={handleConfirmDeny}
      />

      <RevokeAccessModal
        isOpen={Boolean(selectedForRevoke)}
        approval={selectedForRevoke}
        onClose={() => setSelectedForRevoke(null)}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
}
