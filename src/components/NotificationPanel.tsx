import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  useNotifications,
  type HospitalNotificationCategory,
  type PriorityLevel,
  type NotificationItem,
} from "@/context/NotificationContext"
import NotificationDetailModal from "./NotificationDetailModal"
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
  ChevronRight,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryConfig: Record<
  HospitalNotificationCategory,
  { icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  patient_registration: {
    icon: UserPlus,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100/80 dark:bg-blue-950/60",
  },
  appointment_scheduled: {
    icon: Calendar,
    colorClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-100/80 dark:bg-sky-950/60",
  },
  appointment_rescheduled: {
    icon: CalendarClock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100/80 dark:bg-amber-950/60",
  },
  appointment_cancelled: {
    icon: CalendarX,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-100/80 dark:bg-rose-950/60",
  },
  doctor_assignment: {
    icon: UserCheck,
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-100/80 dark:bg-indigo-950/60",
  },
  lab_test_ordered: {
    icon: TestTube,
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgClass: "bg-cyan-100/80 dark:bg-cyan-950/60",
  },
  lab_result_available: {
    icon: FileSpreadsheet,
    colorClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-100/80 dark:bg-teal-950/60",
  },
  critical_lab_result: {
    icon: AlertTriangle,
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100/90 dark:bg-red-950/70",
  },
  prescription_created: {
    icon: Pill,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100/80 dark:bg-emerald-950/60",
  },
  prescription_updated: {
    icon: Pill,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100/80 dark:bg-emerald-950/60",
  },
  patient_admission: {
    icon: Building2,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100/80 dark:bg-blue-950/60",
  },
  patient_discharge: {
    icon: LogOut,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100/80 dark:bg-emerald-950/60",
  },
  emergency_alert: {
    icon: Siren,
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100/90 dark:bg-red-950/70",
  },
  surgery_scheduled: {
    icon: Activity,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-100/80 dark:bg-purple-950/60",
  },
  follow_up_reminder: {
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100/80 dark:bg-amber-950/60",
  },
  document_uploaded: {
    icon: FileUp,
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-100 dark:bg-slate-800",
  },
  approval_required: {
    icon: FileCheck,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100/80 dark:bg-amber-950/60",
  },
  system_notification: {
    icon: Bell,
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-100 dark:bg-slate-800",
  },
}

const priorityConfig: Record<
  PriorityLevel,
  { label: string; dotClass: string }
> = {
  critical: {
    label: "Critical",
    dotClass: "bg-red-500 ring-2 ring-red-200 dark:ring-red-900/50 animate-pulse",
  },
  high: {
    label: "High",
    dotClass: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    dotClass: "bg-blue-500",
  },
  low: {
    label: "Low",
    dotClass: "bg-slate-400",
  },
}

export const NotificationPanel: React.FC = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    openNotificationDetail,
    loadingIds,
    isMarkingAllLoading,
  } = useNotifications()

  const handleViewAll = () => {
    setIsOpen(false)
    navigate("/notifications")
  }

  const handleItemClick = (notification: NotificationItem) => {
    setIsOpen(false)
    openNotificationDetail(notification)
  }

  return (
    <>
      {/* Detail Modal */}
      <NotificationDetailModal />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-background text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB]"
              aria-label="Open notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] font-bold bg-[#3B5BDB] text-white hover:bg-[#2F4FC4] border-2 border-background rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </button>
          }
        />

        <SheetContent
          side="right"
          className="w-full sm:w-[420px] sm:max-w-[440px] p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 rounded-l-2xl shadow-2xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 pr-12 shrink-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-[#2563EB] dark:bg-blue-950 dark:text-blue-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={isMarkingAllLoading}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-blue-400 transition-colors cursor-pointer disabled:opacity-50"
                  title="Mark all notifications as read"
                >
                  {isMarkingAllLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {notifications.length > 0 ? (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
              {notifications.map((notification) => {
                const catInfo =
                  categoryConfig[notification.category] || categoryConfig.system_notification
                const prioInfo = priorityConfig[notification.priority]
                const CategoryIcon = catInfo.icon
                const isItemLoading = loadingIds.has(notification.id)

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleItemClick(notification)}
                    className={cn(
                      "relative flex items-start gap-3.5 p-4 transition-colors duration-150 cursor-pointer text-left group",
                      notification.unread
                        ? "bg-[#F4F8FF] dark:bg-blue-950/20 hover:bg-blue-100/40 dark:hover:bg-blue-950/40"
                        : "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    )}
                  >
                    {/* Visual Unread Left Indicator Bar */}
                    {notification.unread && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-[#3B5BDB]" />
                    )}

                    {/* Category Icon Badge */}
                    <div
                      className={cn(
                        "flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                        catInfo.bgClass
                      )}
                    >
                      <CategoryIcon className={cn("h-4.5 w-4.5", catInfo.colorClass)} />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4
                          className={cn(
                            "text-[13.5px] truncate leading-snug",
                            notification.unread
                              ? "font-semibold text-slate-900 dark:text-slate-100"
                              : "font-medium text-slate-800 dark:text-slate-200"
                          )}
                        >
                          {notification.title}
                        </h4>

                        {/* Priority Dot */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={cn("h-2 w-2 rounded-full", prioInfo.dotClass)}
                            title={`Priority: ${prioInfo.label}`}
                          />
                        </div>
                      </div>

                      {/* Patient Reference */}
                      {notification.patientName && (
                        <p className="text-[12px] font-medium text-[#2563EB] dark:text-blue-400 mb-0.5 truncate">
                          Patient: {notification.patientName}
                        </p>
                      )}

                      {/* Notification Description */}
                      <p
                        className={cn(
                          "text-[12.5px] leading-relaxed line-clamp-2 mb-1.5",
                          notification.unread
                            ? "text-slate-700 dark:text-slate-300"
                            : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {notification.message}
                      </p>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                          {notification.time}
                        </span>

                        {notification.unread ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            disabled={isItemLoading}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Mark as Read"
                          >
                            {isItemLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Mark Read</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                            <CheckCheck className="h-3 w-3 text-emerald-500" />
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
            /* Clean Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] dark:bg-blue-950 dark:text-blue-400 mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                No new notifications
              </p>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                You're all caught up.
              </p>
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3 text-center shrink-0">
              <button
                type="button"
                onClick={handleViewAll}
                className="inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-full cursor-pointer py-1"
              >
                <span>View All Notifications</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default NotificationPanel