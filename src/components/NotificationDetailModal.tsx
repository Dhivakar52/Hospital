import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useNotifications,
  type HospitalNotificationCategory,
  type PriorityLevel,
} from "@/context/NotificationContext"
import {
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
  Bell,
  ArrowLeft,
  ExternalLink,
  Check,
  Loader2,
  Building,
  User,
  Hash,
  UserCog,
  FileText,
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
  { label: string; badgeClass: string }
> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  high: {
    label: "High",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  low: {
    label: "Low",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
}

export const NotificationDetailModal: React.FC = () => {
  const navigate = useNavigate()
  const {
    selectedNotification,
    closeNotificationDetail,
    markAsRead,
    loadingIds,
  } = useNotifications()

  if (!selectedNotification) return null

  const catInfo =
    categoryConfig[selectedNotification.category] || categoryConfig.system_notification
  const prioInfo = priorityConfig[selectedNotification.priority]
  const CategoryIcon = catInfo.icon
  const isItemLoading = loadingIds.has(selectedNotification.id)

  const handleNavigateToRecord = () => {
    if (selectedNotification.targetUrl) {
      closeNotificationDetail()
      navigate(selectedNotification.targetUrl)
    }
  }

  return (
    <Dialog open={Boolean(selectedNotification)} onOpenChange={(open) => !open && closeNotificationDetail()}>
      <DialogContent className="max-w-xl p-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-3 space-y-0">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", catInfo.bgClass)}>
            <CategoryIcon className={cn("h-5 w-5", catInfo.colorClass)} />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", prioInfo.badgeClass)}>
                {prioInfo.label} Priority
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {catInfo.label}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded-md",
                  selectedNotification.unread
                    ? "bg-blue-100 text-[#2563EB] dark:bg-blue-950 dark:text-blue-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                )}
              >
                {selectedNotification.unread ? "Unread" : "Read"}
              </span>
            </div>
            <DialogTitle className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {selectedNotification.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Detailed Fields Grid */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            {selectedNotification.patientName && (
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Patient</p>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                    {selectedNotification.patientName}
                  </p>
                </div>
              </div>
            )}

            {selectedNotification.patientId && (
              <div className="flex items-center gap-2.5">
                <Hash className="h-4 w-4 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Patient ID</p>
                  <p className="text-[13px] font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {selectedNotification.patientId}
                  </p>
                </div>
              </div>
            )}

            {selectedNotification.department && (
              <div className="flex items-center gap-2.5">
                <Building className="h-4 w-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Department</p>
                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                    {selectedNotification.department}
                  </p>
                </div>
              </div>
            )}

            {selectedNotification.referenceId && (
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-sky-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Reference ID</p>
                  <p className="text-[13px] font-mono font-semibold text-[#2563EB] dark:text-blue-400">
                    {selectedNotification.referenceId}
                  </p>
                </div>
              </div>
            )}

            {selectedNotification.createdBy && (
              <div className="flex items-center gap-2.5">
                <UserCog className="h-4 w-4 text-purple-600 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Created By</p>
                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                    {selectedNotification.createdBy}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Date & Time</p>
                <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">
                  {selectedNotification.date} at {selectedNotification.time}
                </p>
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="space-y-1.5">
            <h4 className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
              Notification Description
            </h4>
            <p className="text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {selectedNotification.fullDescription || selectedNotification.message}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeNotificationDetail}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Notifications</span>
          </button>

          <div className="flex items-center gap-2">
            {selectedNotification.unread && (
              <button
                type="button"
                onClick={() => markAsRead(selectedNotification.id)}
                disabled={isItemLoading}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2563EB] bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 px-3.5 py-2 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isItemLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Mark as Read</span>
              </button>
            )}

            {selectedNotification.targetUrl && (
              <button
                type="button"
                onClick={handleNavigateToRecord}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-[#3B5BDB] hover:bg-[#2F4FC4] px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>Open Related Record</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationDetailModal
