import {
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react"
import { lazy } from "react"

export interface SubMenuItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
  items?: SubMenuItem[]
}

// ✅ Menu data for sidebar
export const menuConfig: MenuItem[] = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    title: "OP", 
    url: "/registration", 
    icon: LayoutDashboard 
  },
  { 
    title: "Registered Patients", 
    url: "/registered-patients", 
    icon: Users 
  },
]

// Routes configuration (public and protected)
export const getRoutes = () => {
  return [
    // ============ PUBLIC ROUTES ============
    {
      path: "/",
      name: "Login",
      component: lazy(() => import("@/pages/Login")),
      exact: true,
      protected: false,
    },

    // ============ PROTECTED ROUTES ============
    {
      path: "/dashboard",
      name: "Dashboard",
      component: lazy(() => import("@/pages/Dashboard")),
      exact: true,
      protected: true,
    },
    {
      path: "/registration",
      name: "OP",
      component: lazy(() => import("@/pages/PatientRegistration/Registration")),
      exact: true,
      protected: true,
    },
    {
      path: "/registered-patients",
      name: "Registered Patients",
      component: lazy(() => import("@/pages/PatientRegistration/RegisteredPatientsPage")),
      exact: true,
      protected: true,
    },
    {
      path: "/notifications",
      name: "Notifications",
      component: lazy(() => import("@/pages/Notifications")),
      exact: true,
      protected: true,
    },
    {
      path: "/profile",
      name: "Profile",
      component: lazy(() => import("@/pages/Profile")),
      protected: true,
    },
    {
      path: "/settings",
      name: "Settings",
      component: lazy(() => import("@/pages/Setting")),
      protected: true,
    },
  ]
}