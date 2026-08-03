import React, { useState } from "react"
import {
  useNotifications,
  type HospitalNotificationCategory,
  type PriorityLevel,
} from "@/context/NotificationContext"
import NotificationDetailModal from "@/components/NotificationDetailModal"
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  UserPlus,
  Calendar,
  CalendarClock,
  CalendarX,
  UserCheck,
  TestTube,
  FileSpreadsheet,
  AlertTriangle,
  Pill,
  Building2,
  LogOut,
  Siren,
  Activity,
  Clock,
  FileUp,
  FileCheck,
  Search,
  ChevronRight,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryConfig: Record<
  HospitalNotificationCategory,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  patient_registration: {
    label: "Patient Registration",
    icon: UserPlus,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100/80 dark:bg-blue-950/60",
  },
  appointment_scheduled: {
    label: "Appointment Scheduled",
    icon: Calendar,
    colorClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-100/80 dark:bg-sky-950/60",
  },
  appointment_rescheduled: {
    label: "Appointment Rescheduled",
    icon: CalendarClock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100/80 dark:bg-amber-950/60",
  },
  appointment_cancelled: {
    label: "Appointment Cancelled",
    icon: CalendarX,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-100/80 dark:bg-rose-950/60",
  },
  doctor_assignment: {
    label: "Doctor Assignment",
    icon: UserCheck,
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-100/80 dark:bg-indigo-950/60",
  },
  lab_test_ordered: {
    label: "Lab Test Ordered",
    icon: TestTube,
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgClass: "bg-cyan-100/80 dark:bg-cyan-950/60",
  },
  lab_result_available: {
    label: "Lab Result Available",
    icon: FileSpreadsheet,
    colorClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-100/80 dark:bg-teal-950/60",
  },
  critical_lab_result: {
    label: "Critical Lab Result",
    icon: AlertTriangle,
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100/90 dark:bg-red-950/70",
  },
  prescription_created: {
    label: "Prescription Created",
    icon: Pill,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100/80 dark:bg-emerald-950/60",
  },
  prescription_updated: {
    label: "Prescription Updated",
    icon: Pill,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100/80 dark:bg-emerald-950/60",
  },
  patient_admission: {
    label: "Patient Admission",
    icon: Building2,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100/80 dark:bg-blue-950/60",
  },
  patient_discharge: {
    label: "Patient Discharge",
    icon: LogOut,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100/80 dark:bg-emerald-950/60",
  },
  emergency_alert: {
    label: "Emergency Alert",
    icon: Siren,
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100/90 dark:bg-red-950/70",
  },
  surgery_scheduled: {
    label: "Surgery Scheduled",
    icon: Activity,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-100/80 dark:bg-purple-950/60",
  },
  follow_up_reminder: {
    label: "Follow-up Reminder",
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100/80 dark:bg-amber-950/60",
  },
  document_uploaded: {
    label: "Document Uploaded",
    icon: FileUp,
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-100 dark:bg-slate-800",
  },
  approval_required: {
    label: "Approval Required",
    icon: FileCheck,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100/80 dark:bg-amber-950/60",
  },
  system_notification: {
    label: "System Notification",
    icon: Bell,
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-100 dark:bg-slate-800",
  },
}

const priorityConfig: Record<
  PriorityLevel,
  { label: string; badgeClass: string; dotClass: string }
> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    dotClass: "bg-red-500 animate-pulse",
  },
  high: {
    label: "High",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    dotClass: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  low: {
    label: "Low",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dotClass: "bg-slate-400",
  },
}

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    openNotificationDetail,
    loadingIds,
    isMarkingAllLoading,
  } = useNotifications()

  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredNotifications = notifications.filter((item) => {
    // Filter condition
    if (activeFilter === "unread" && !item.unread) return false
    if (activeFilter === "critical" && item.priority !== "critical") return false
    if (activeFilter === "high" && item.priority !== "high") return false
    if (activeFilter === "medium" && item.priority !== "medium") return false

    // Search condition
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      const titleMatch = item.title.toLowerCase().includes(q)
      const patientMatch = item.patientName?.toLowerCase().includes(q)
      const refMatch = item.referenceId?.toLowerCase().includes(q)
      const msgMatch = item.message.toLowerCase().includes(q)
      return titleMatch || patientMatch || refMatch || msgMatch
    }

    return true
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Detail Modal */}
      <NotificationDetailModal />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-[#2563EB]">
            <Bell className="h-5.5 w-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Notifications Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-[12px] font-semibold rounded-full bg-blue-100 text-[#2563EB] dark:bg-blue-950 dark:text-blue-300">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Manage clinical alerts, lab results, and patient status updates
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={isMarkingAllLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold text-white bg-[#3B5BDB] hover:bg-[#2F4FC4] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isMarkingAllLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: "all", label: `All (${notifications.length})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "critical", label: "Critical" },
            { id: "high", label: "High" },
            { id: "medium", label: "Medium" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer border",
                activeFilter === tab.id
                  ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, title, ref ID..."
            className="w-full pl-9 pr-4 py-1.5 text-[13px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#3B5BDB]"
          />
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.map((item) => {
              const catInfo = categoryConfig[item.category] || categoryConfig.system_notification
              const prioInfo = priorityConfig[item.priority]
              const CategoryIcon = catInfo.icon
              const isItemLoading = loadingIds.has(item.id)

              return (
                <div
                  key={item.id}
                  onClick={() => openNotificationDetail(item)}
                  className={cn(
                    "relative flex items-start gap-4 p-4.5 transition-colors duration-150 cursor-pointer group text-left",
                    item.unread
                      ? "bg-[#F4F8FF] dark:bg-blue-950/20 hover:bg-blue-100/40 dark:hover:bg-blue-950/40"
                      : "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  )}
                >
                  {/* Left indicator bar */}
                  {item.unread && (
                    <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-[#3B5BDB]" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                      catInfo.bgClass
                    )}
                  >
                    <CategoryIcon className={cn("h-5 w-5", catInfo.colorClass)} />
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "text-[14.5px] truncate",
                            item.unread
                              ? "font-bold text-slate-900 dark:text-slate-100"
                              : "font-semibold text-slate-800 dark:text-slate-200"
                          )}
                        >
                          {item.title}
                        </h3>

                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", prioInfo.badgeClass)}>
                          {prioInfo.label}
                        </span>
                      </div>

                      <span className="text-[12px] text-slate-400 dark:text-slate-500 font-normal">
                        {item.date} at {item.time}
                      </span>
                    </div>

                    {/* Patient & Ref row */}
                    <div className="flex items-center gap-3 text-[12.5px] mb-1 flex-wrap">
                      {item.patientName && (
                        <span className="font-semibold text-[#2563EB] dark:text-blue-400">
                          Patient: {item.patientName} {item.patientId ? `(${item.patientId})` : ""}
                        </span>
                      )}
                      {item.department && (
                        <span className="text-slate-500 dark:text-slate-400">
                          Dept: {item.department}
                        </span>
                      )}
                      {item.referenceId && (
                        <span className="font-mono text-slate-400">
                          Ref: {item.referenceId}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p
                      className={cn(
                        "text-[13px] leading-relaxed line-clamp-2 mb-2",
                        item.unread
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {item.message}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openNotificationDetail(item)
                        }}
                        className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#2563EB] hover:text-[#1D4ED8] dark:text-blue-400 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      {item.unread ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(item.id)
                          }}
                          disabled={isItemLoading}
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#2563EB] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isItemLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Mark as Read</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] text-slate-400 font-normal">
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] dark:bg-blue-950 dark:text-blue-400 mb-3">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              No notifications found
            </p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              There are no notifications matching your current filter or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
