import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Bell,
  CheckCheck,
  Search,
  FlaskConical,
  CalendarClock,
  User,
  Pill,
  Bed,
  Info,
  Eye,
  AlertTriangle,
  Stethoscope,
  LogOut,
  Siren,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/common/Datatable";
import Pagination from "@/common/Pagination";
import { Field, TextField } from "@/components/FormPrimitives";
import { useNotifications, type NotificationItem } from "@/context/NotificationContext";
import { NotificationDetailModal } from "@/components/NotificationDetailModal";

const typeIcons: Record<NotificationItem["type"], React.ReactNode> = {
  critical_lab: <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />,
  lab_result: <FlaskConical className="h-4 w-4 text-purple-600" />,
  appointment: <CalendarClock className="h-4 w-4 text-blue-600" />,
  patient: <User className="h-4 w-4 text-emerald-600" />,
  doctor: <Stethoscope className="h-4 w-4 text-indigo-600" />,
  prescription: <Pill className="h-4 w-4 text-amber-600" />,
  admission: <Bed className="h-4 w-4 text-cyan-600" />,
  discharge: <LogOut className="h-4 w-4 text-teal-600" />,
  emergency: <Siren className="h-4 w-4 text-red-600" />,
  document: <FileText className="h-4 w-4 text-slate-600" />,
  approval: <CheckCircle className="h-4 w-4 text-blue-600" />,
  system: <Info className="h-4 w-4 text-slate-600" />,
};

const priorityStyles: Record<NotificationItem["priority"], string> = {
  Critical: "bg-red-600 text-white border-red-700",
  High: "bg-amber-500 text-white border-amber-600",
  Medium: "bg-blue-500 text-white border-blue-600",
  Low: "bg-slate-400 text-white border-slate-500",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (activeTab === "unread") {
      list = list.filter((n) => n.unread);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          (n.patientName && n.patientName.toLowerCase().includes(q)) ||
          (n.patientId && n.patientId.includes(q))
      );
    }
    return list;
  }, [notifications, activeTab, searchTerm]);

  // Paginated Data
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

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

  const columns: ColumnDef<NotificationItem>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {typeIcons[row.original.type]}
          <span className="capitalize text-[12.5px] font-medium text-slate-700">
            {row.original.type.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Notification Title & Description",
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-semibold text-slate-900 text-[13px] flex items-center gap-2">
            {row.original.title}
            {row.original.unread && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px]">
                New
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-[12px] truncate">{row.original.description}</p>
        </div>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Patient / Reference",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-800 text-[13px]">
            {row.original.patientName || "N/A"}
          </div>
          {row.original.patientId && (
            <div className="text-[11px] text-slate-400">ID: {row.original.patientId}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-[12.5px] text-slate-600">{row.original.department || "General"}</span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge className={`text-[11px] font-medium ${priorityStyles[row.original.priority]}`}>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">
          {row.original.date} - {row.original.time}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            markAsRead(row.original.id);
            setSelectedNotification(row.original);
          }}
          className="gap-1.5 text-[12px] h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{
              background: "var(--side-menu)",
              color: "var(--blue-text-color)",
            }}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Hospital Notifications</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage all system and patient activity alerts
            </p>
          </div>
        </div>

        <Button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          variant="outline"
          className="gap-2 text-[13px] border-slate-300"
        >
          <CheckCheck className="h-4 w-4 text-emerald-600" />
          Mark All as Read
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 rounded-md border border-slate-200 p-4" style={{ background: "var(--background)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 max-w-sm flex-1">
            <div className="w-full">
              <Field label="Search Notifications">
                <TextField
                  placeholder="Search by title, patient, or ID..."
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                  }}
                />
              </Field>
            </div>
            <Button
              className="gap-1.5 text-white text-[13px]"
              style={{ background: "var(--blue-btn)", marginTop: "22px" }}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className="text-[12.5px] h-9 cursor-pointer"
              style={activeTab === "all" ? { background: "var(--blue-btn)", color: "white" } : {}}
            >
              All Notifications ({notifications.length})
            </Button>
            <Button
              variant={activeTab === "unread" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("unread");
                setCurrentPage(1);
              }}
              className="text-[12.5px] h-9 cursor-pointer"
              style={activeTab === "unread" ? { background: "var(--blue-btn)", color: "white" } : {}}
            >
              Unread ({unreadCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="my-4">
        <DataTable columns={columns} data={paginatedData} />
      </div>

      {/* Pagination Controls (Supporting 10, 25, 50, 100 per page) */}
      <Pagination table={paginationTable} totalCount={filteredNotifications.length} />

      {/* Notification Detail View Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
