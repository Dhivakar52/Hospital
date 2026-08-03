import React, { createContext, useContext, useState } from "react"
import { toast } from "sonner"

export type HospitalNotificationCategory =
  | "patient_registration"
  | "appointment_scheduled"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "doctor_assignment"
  | "lab_test_ordered"
  | "lab_result_available"
  | "critical_lab_result"
  | "prescription_created"
  | "prescription_updated"
  | "patient_admission"
  | "patient_discharge"
  | "emergency_alert"
  | "surgery_scheduled"
  | "follow_up_reminder"
  | "document_uploaded"
  | "approval_required"
  | "system_notification"

export type PriorityLevel = "critical" | "high" | "medium" | "low"

export interface NotificationItem {
  id: number
  category: HospitalNotificationCategory
  title: string
  patientName?: string
  patientId?: string
  department?: string
  message: string
  fullDescription?: string
  referenceId?: string
  referenceType?: "patient" | "lab_result" | "appointment" | "prescription" | "admission" | "document" | "emergency"
  createdBy?: string
  time: string
  date: string
  unread: boolean
  priority: PriorityLevel
  targetUrl?: string
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    category: "critical_lab_result",
    title: "Critical Lab Result Available",
    patientName: "John Doe",
    patientId: "PAT-000123",
    department: "Laboratory",
    message: "Critical potassium result (6.8 mEq/L) requires immediate clinical attention.",
    fullDescription:
      "Critical potassium level of 6.8 mEq/L detected in stat blood panel. Value exceeds critical high threshold (> 6.0 mEq/L). Immediate clinical evaluation and ECG monitoring recommended.",
    referenceId: "LAB-2026-00125",
    referenceType: "lab_result",
    createdBy: "Laboratory Department",
    date: "31 July 2026",
    time: "10:35 AM",
    unread: true,
    priority: "critical",
    targetUrl: "/registration",
  },
  {
    id: 2,
    category: "emergency_alert",
    title: "Emergency Trauma Admission",
    patientName: "Unidentified Male",
    patientId: "PAT-000199",
    department: "Emergency Medicine",
    message: "Patient admitted via Ambulance with acute chest trauma.",
    fullDescription:
      "Grade 3 polytrauma patient admitted via EMS to Trauma Bay 2. On-call orthopedic and thoracic surgery teams dispatched.",
    referenceId: "EMG-2026-00088",
    referenceType: "emergency",
    createdBy: "Triage Desk",
    date: "31 July 2026",
    time: "10:15 AM",
    unread: true,
    priority: "critical",
    targetUrl: "/dashboard",
  },
  {
    id: 3,
    category: "doctor_assignment",
    title: "Cardiologist Assigned",
    patientName: "Sarah Jenkins",
    patientId: "PAT-000142",
    department: "Cardiology",
    message: "Dr. Robert Vance assigned as primary cardiologist.",
    fullDescription:
      "Dr. Robert Vance (Senior Cardiologist) assigned for inpatient cardiac management following abnormal Echo scan results.",
    referenceId: "DOC-2026-00311",
    referenceType: "patient",
    createdBy: "Chief Medical Officer Desk",
    date: "31 July 2026",
    time: "09:50 AM",
    unread: true,
    priority: "high",
    targetUrl: "/profile",
  },
  {
    id: 4,
    category: "patient_registration",
    title: "New OP Patient Registered",
    patientName: "Michael Chang",
    patientId: "PAT-000155",
    department: "Outpatient Department",
    message: "Registration completed for OP Cardiology consultation.",
    fullDescription:
      "Initial registration completed for Michael Chang. All demographic and insurance details verified. Queued for OP Room 4.",
    referenceId: "REG-2026-00412",
    referenceType: "patient",
    createdBy: "Registration Counter 1",
    date: "31 July 2026",
    time: "09:15 AM",
    unread: true,
    priority: "medium",
    targetUrl: "/registration",
  },
  {
    id: 5,
    category: "lab_result_available",
    title: "Lab Report Finalized",
    patientName: "Emily Watson",
    patientId: "PAT-000108",
    department: "Hematology",
    message: "CBC and Lipid Profile reports are now available for review.",
    fullDescription:
      "Complete Blood Count (CBC) and Comprehensive Lipid Panel reports signed off by Pathologist Dr. Anita Roy.",
    referenceId: "LAB-2026-00099",
    referenceType: "lab_result",
    createdBy: "Central Pathology Lab",
    date: "31 July 2026",
    time: "08:40 AM",
    unread: true,
    priority: "medium",
    targetUrl: "/registration",
  },
  {
    id: 6,
    category: "surgery_scheduled",
    title: "OR Surgery Scheduled",
    patientName: "Eleanor Vance",
    patientId: "PAT-000087",
    department: "General Surgery",
    message: "Laparoscopic Cholecystectomy set for Tomorrow at 08:00 AM in OR-3.",
    fullDescription:
      "Elective Laparoscopic Cholecystectomy scheduled for Eleanor Vance in Operation Theater 3 under General Anesthesia.",
    referenceId: "SUR-2026-00045",
    referenceType: "appointment",
    createdBy: "Surgical Coordination Unit",
    date: "30 July 2026",
    time: "04:30 PM",
    unread: false,
    priority: "high",
    targetUrl: "/dashboard",
  },
  {
    id: 7,
    category: "prescription_updated",
    title: "Prescription Modified",
    patientName: "David Miller",
    patientId: "PAT-000119",
    department: "Internal Medicine",
    message: "Amoxicillin dosage updated by Dr. Clara Oswald.",
    fullDescription:
      "Amoxicillin 500mg capsule dosage revised from 2x daily to 3x daily for 7 days. Pharmacy notified for dispensing.",
    referenceId: "RX-2026-00781",
    referenceType: "prescription",
    createdBy: "Dr. Clara Oswald",
    date: "30 July 2026",
    time: "02:15 PM",
    unread: false,
    priority: "medium",
    targetUrl: "/profile",
  },
  {
    id: 8,
    category: "follow_up_reminder",
    title: "Post-Op Follow-up Reminder",
    patientName: "Robert Garcia",
    patientId: "PAT-000062",
    department: "Orthopedics",
    message: "Post-op consultation scheduled in 2 days.",
    fullDescription:
      "Routine 2-week post-op arthroscopy review scheduled with Dr. Steven Strange. Patient SMS notification sent.",
    referenceId: "APT-2026-00922",
    referenceType: "appointment",
    createdBy: "Outpatient Desk",
    date: "29 July 2026",
    time: "11:00 AM",
    unread: false,
    priority: "low",
    targetUrl: "/registration",
  },
]

interface NotificationContextType {
  notifications: NotificationItem[]
  unreadCount: number
  selectedNotification: NotificationItem | null
  loadingIds: Set<number>
  isMarkingAllLoading: boolean
  setSelectedNotification: (notification: NotificationItem | null) => void
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  openNotificationDetail: (notification: NotificationItem) => void
  closeNotificationDetail: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())
  const [isMarkingAllLoading, setIsMarkingAllLoading] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAsRead = async (id: number) => {
    if (loadingIds.has(id)) return

    setLoadingIds((prev) => new Set(prev).add(id))

    try {
      await new Promise((resolve) => setTimeout(resolve, 250))
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      )
      setSelectedNotification((prev) =>
        prev && prev.id === id ? { ...prev, unread: false } : prev
      )
    } catch {
      toast.error("Failed to mark notification as read.")
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const markAllAsRead = async () => {
    if (isMarkingAllLoading || unreadCount === 0) return

    setIsMarkingAllLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
      setSelectedNotification((prev) => (prev ? { ...prev, unread: false } : null))
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark all notifications as read.")
    } finally {
      setIsMarkingAllLoading(false)
    }
  }

  const openNotificationDetail = (notification: NotificationItem) => {
    setSelectedNotification(notification)
    if (notification.unread) {
      markAsRead(notification.id)
    }
  }

  const closeNotificationDetail = () => {
    setSelectedNotification(null)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        selectedNotification,
        loadingIds,
        isMarkingAllLoading,
        setSelectedNotification,
        markAsRead,
        markAllAsRead,
        openNotificationDetail,
        closeNotificationDetail,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
