"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  UserCheck,
  CalendarClock,
  Baby,
  Stethoscope,
  Building2,
  UserPlus,
  Bell,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Eye,
  LayoutDashboard,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OpStatisticsModal } from "@/components/OpStatisticsModal"
import { DashboardCalendarWidget } from "@/components/DashboardCalendarWidget"

// ---------------------------------------------------------------------------
// 1. Core 6 KPI Summary Cards Data (Single Horizontal Row on Desktop)
// ---------------------------------------------------------------------------
const summaryCards = [
  {
    label: "Total Patients",
    value: "1,248",
    change: "+12.5%",
    desc: "Cumulative EMR",
    icon: Users,
  },
  {
    label: "Today's OP",
    value: "142",
    change: "+8.4%",
    desc: "New Outpatients",
    icon: UserCheck,
  },
  {
    label: "Revisit Patients",
    value: "385",
    change: "+15.2%",
    desc: "Follow-up visits",
    icon: CalendarClock,
  },
  {
    label: "ANC Registrations",
    value: "64",
    change: "+6.1%",
    desc: "Antenatal care",
    icon: Baby,
  },
  {
    label: "Total Doctors",
    value: "48",
    change: "On Duty",
    desc: "Attending team",
    icon: Stethoscope,
  },
  {
    label: "Notifications",
    value: "3",
    change: "Unread",
    desc: "Clinical alerts",
    icon: Bell,
  },
]

// ---------------------------------------------------------------------------
// 2. Chart Datasets (Using Theme Primary & Secondary Palette)
// ---------------------------------------------------------------------------
const opTrendData = [
  { day: "Mon", newPatients: 110, revisits: 280, total: 390 },
  { day: "Tue", newPatients: 135, revisits: 310, total: 445 },
  { day: "Wed", newPatients: 128, revisits: 340, total: 468 },
  { day: "Thu", newPatients: 142, revisits: 385, total: 527 },
  { day: "Fri", newPatients: 150, revisits: 360, total: 510 },
  { day: "Sat", newPatients: 165, revisits: 410, total: 575 },
  { day: "Sun", newPatients: 95, revisits: 210, total: 305 },
]

const genderDistribution = [
  { name: "Female Patients", value: 680, color: "#2952CC" },
  { name: "Male Patients", value: 510, color: "#64748b" },
  { name: "Pediatric", value: 58, color: "#94a3b8" },
]

const departmentStats = [
  { name: "Gen. Medicine", count: 124, fill: "#2952CC" },
  { name: "Orthopedics", count: 86, fill: "#3E6EF5" },
  { name: "Cardiology", count: 65, fill: "#475569" },
  { name: "Obstetrics", count: 58, fill: "#64748b" },
  { name: "Dermatology", count: 32, fill: "#94a3b8" },
  { name: "Urology", count: 24, fill: "#cbd5e1" },
]

// ---------------------------------------------------------------------------
// 3. Recent Registrations & Activities Data
// ---------------------------------------------------------------------------
const recentRegistrations = [
  { uhid: "3995988", opNo: "26602286", name: "NITESH KUMAR", dept: "General Medicine", doctor: "Dr. Kavitha R", time: "10:15 AM", status: "Completed" },
  { uhid: "3489205", opNo: "26602285", name: "SUVETHA", dept: "Urology", doctor: "Dr. Sundar M", time: "10:30 AM", status: "In Consultation" },
  { uhid: "4137281", opNo: "26602284", name: "ERGAMREDDY SHARMILA", dept: "Psychiatry", doctor: "Dr. Priya S", time: "10:45 AM", status: "Waiting" },
  { uhid: "3709448", opNo: "26602281", name: "PRIYANSHU PANDA", dept: "Dermatology", doctor: "Dr. Ramesh K", time: "11:00 AM", status: "Completed" },
  { uhid: "2879469", opNo: "26602280", name: "MURUGESAN", dept: "Family Medicine", doctor: "Dr. Deepa V", time: "11:15 AM", status: "Waiting" },
]

const recentActivities = [
  { title: "New Patient Registered", desc: "NITESH KUMAR (UHID: 3995988)", time: "5 mins ago", user: "OP Receptionist" },
  { title: "Revisit Token Generated", desc: "SUVETHA assigned to Dr. Sundar M", time: "12 mins ago", user: "Sister Mary" },
  { title: "ANC Registration Completed", desc: "AMUTHA (ANC No: 263208)", time: "25 mins ago", user: "Nurse Anitha" },
  { title: "Hospital Master Updated", desc: "Apollo Speciality - Vanagaram Branch", time: "1 hour ago", user: "Admin" },
  { title: "Referral Doctor Added", desc: "Dr. Meena Kumar (Consultant Cardiologist)", time: "2 hours ago", user: "Admin" },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [isStatsOpen, setIsStatsOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
          style={{
            background: "var(--side-menu)",
            color: "var(--blue-text-color)",
          }}
        >
          <LayoutDashboard className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-[17px] font-semibold text-slate-900">Dashboard</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Hospital Management Dashboard
          </p>
        </div>
      </div>

      {/* 2. KPI Cards (Single Horizontal Row on Desktop: lg:grid-cols-6) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
                    {card.label}
                  </span>
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 line-clamp-1">{card.desc}</span>
                  <span className="font-bold text-slate-700 flex items-center gap-0.5 shrink-0">
                    <TrendingUp className="h-3 w-3 text-blue-600" /> {card.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 3. Charts & OPD Statistics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* OP Trend Chart (2 Cols) */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Outpatient (OP) Registration & Revisit Volume Trend
              </CardTitle>
              <CardDescription className="text-xs">
                Weekly comparison of new outpatient registrations vs revisit follow-ups
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-slate-50">
              This Week
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={opTrendData}>
                  <defs>
                    <linearGradient id="colorRevisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2952CC" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2952CC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="revisits" name="Revisits" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevisits)" />
                  <Area type="monotone" dataKey="newPatients" name="New Patients" stroke="#2952CC" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender & Demographics Donut (1 Col) */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Patient Demographics & Gender Split
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of registered outpatients by category
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                  <Pie
                    data={genderDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {genderDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              {genderDistribution.map((g) => (
                <div key={g.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block font-semibold text-slate-900">{g.value}</span>
                  <span className="text-[10.5px] text-slate-500">{g.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departmental Distribution Bar Chart */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Department-wise OPD Consultation Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Active patient consultations by specialty department today
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="count" name="Patients" radius={[8, 8, 0, 0]}>
                  {departmentStats.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. Calendar Widget */}
      <DashboardCalendarWidget />

      {/* 5. Recent Activities & Recent Registrations Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity Stream (1 Col) */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Recent System Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Live audit trail of staff actions in EMR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((act, index) => (
              <div key={index} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div
                  className="p-2 rounded-xl shrink-0 mt-0.5"
                  style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
                >
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {act.time}
                    </span>
                  </div>
                  <p className="text-slate-600">{act.desc}</p>
                  <span className="text-[10.5px] text-slate-400 font-medium">By {act.user}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Registrations Table (2 Cols) */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 shadow-2xs bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Outpatient (OP) Registrations
              </CardTitle>
              <CardDescription className="text-xs">
                Latest patients admitted for OPD consultation
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/registered-patients")}
              className="text-xs text-blue-600 border-slate-300 hover:bg-slate-50 cursor-pointer gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="p-3">UHID / OP No</th>
                    <th className="p-3">Patient Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Time</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {recentRegistrations.map((reg) => (
                    <tr key={reg.uhid} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono text-slate-900 font-bold">{reg.uhid}</td>
                      <td className="p-3 font-bold text-slate-900">{reg.name}</td>
                      <td className="p-3 font-semibold text-slate-800">{reg.dept}</td>
                      <td className="p-3 text-slate-600">{reg.doctor}</td>
                      <td className="p-3 text-slate-500">{reg.time}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/registered-patients")}
                          className="h-7 text-xs text-slate-700 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Quick Access & Module Shortcuts
        </h3>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <button
            onClick={() => navigate("/registered-patients")}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <Users className="h-5 w-5" />
            </div>
            <span className="block font-bold text-sm text-slate-900">Registered Patients</span>
            <span className="text-xs text-slate-500 mt-0.5 block">View patient list</span>
          </button>

          <button
            onClick={() => navigate("/revisit-records")}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <CalendarClock className="h-5 w-5" />
            </div>
            <span className="block font-bold text-sm text-slate-900">Revisit Records</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Manage revisits</span>
          </button>

          <button
            onClick={() => navigate("/registered-anc-records")}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <Baby className="h-5 w-5" />
            </div>
            <span className="block font-bold text-sm text-slate-900">ANC Records</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Antenatal care</span>
          </button>

          <button
            onClick={() => navigate("/hospital-master-records")}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <span className="block font-bold text-sm text-slate-900">Hospital Master</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Partner centers</span>
          </button>

          <button
            onClick={() => navigate("/referral-master-records")}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="block font-bold text-sm text-slate-900">Referral Master</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Referring doctors</span>
          </button>

          <button
            onClick={() => navigate("/notifications")}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div
              className="p-2.5 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
            >
              <Bell className="h-5 w-5" />
            </div>
            <span className="block font-bold text-sm text-slate-900">Notifications</span>
            <span className="text-xs text-slate-500 mt-0.5 block">View clinical alerts</span>
          </button>
        </div>
      </div>

      {/* 7. System Status Footer Bar */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">EMR System Health</span>
            <span className="text-sm font-bold text-slate-900">99.9% Operational</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Active Staff Online</span>
            <span className="text-sm font-bold text-slate-900">24 Users Logged In</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Online Duty Doctors</span>
            <span className="text-sm font-bold text-slate-900">18 Doctors Available</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Last Data Sync</span>
            <span className="text-sm font-bold text-slate-900">Just Now (Real-time)</span>
          </div>
        </div>
      </div>

      {/* OP Statistics Modal */}
      <OpStatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  )
}