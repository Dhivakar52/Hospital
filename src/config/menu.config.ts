import {
  LayoutDashboard,
  // BarChart,
  // Users,
  // UserPlus,
  // UserCog,
  // Settings,
  // Bell,
  // Palette,
  // LogIn,
  // FileText,
  // Calendar,
  // MessageSquare,
  // Activity,
  // User,
  // Shield,
  // UserCircle,
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

  // { 
  //   title: "OP", 
  //   url: "/registration", 
  //   icon: LayoutDashboard 
  // },

{
    title: "OP",
    url: "/op",
    icon: LayoutDashboard,
    items: [
      { title: "Registration", url: "/op/registration", icon: LayoutDashboard },
      { title: "Diagnosis Entry", url: "/op/diagnosisentry", icon: LayoutDashboard },
       { title: "Revisit", url: "/op/revisit", icon: LayoutDashboard },
      { title: "Revisit Cancellation", url: "/op/revisit-cancellation", icon: LayoutDashboard },
      // { title: "Appearance", url: "/settings/appearance", icon: LayoutDashboard },
    ],
  },



  { 
    title: "AntenatalRegistration", 
    url: "/antenatal-registration", 
    icon: LayoutDashboard 
  },
   { 
    title: "Hospital Master", 
    url: "/hospital-master", 
    icon: LayoutDashboard 
  },
    { 
    title: "Referral Master", 
    url: "/referral-master", 
    icon: LayoutDashboard 
  },

  //     { 
  //   title: "Referral Master", 
  //   url: "/referral-master", 
  //   icon: LayoutDashboard 
  // },




  // { 
  //   title: "Analytics", 
  //   url: "/analytics", 
  //   icon: BarChart 
  // },
  // {
  //   title: "Users",
  //   url: "/users",
  //   icon: Users,
  //   badge: "12",
  //   items: [
  //     { title: "All Users", url: "/users", icon: Users },
  //     { title: "Add User", url: "/users/new", icon: UserPlus },
  //     { title: "Roles", url: "/users/roles", icon: UserCog },
  //   ],
  // },
  // {
  //   title: "Profile",
  //   url: "/profile",
  //   icon: UserCircle,
  // },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  //   // items: [
  //   //   { title: "General", url: "/settings", icon: Settings },
  //   //   { title: "Notifications", url: "/settings/notifications", icon: Bell },
  //   //   { title: "Appearance", url: "/settings/appearance", icon: Palette },
  //   // ],
  // },
]

// Routes configuration (public and protected)
export const getRoutes = () => {
  return [
    // ============ PUBLIC ROUTES ============
    // {
    //   path: "/login",
    //   name: "Login",
    //   component: lazy(() => import("@/pages/Login")),
    //   exact: true,
    //   protected: false,
    // },
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
  // OP Screen
     {
      path: "/op/registration",
      name: "Registrtaion",
      component: lazy(() => import("@/pages/OP/Registration/Registration")),
      exact: true,
      protected: true,
    },
     {
      path: "/op/diagnosisentry",
      name: "OP",
      component: lazy(() => import("@/pages/OP/Diagnosisentry/DiagnoModule")),
      exact: true,
      protected: true,
    },
{
      path: "/op/revisit",
      name: "Revisit",
      component: lazy(() => import("@/pages/OP/Revisit/RevisitModule")),
      exact: true,
      protected: true,
    },
     {
      path: "/op/revisit-cancellation",
      name: "Revisit Cancellation",
      component: lazy(() => import("@/pages/OP/RevisitCancellation/RevisitCancelModule")),
      exact: true,
      protected: true,
    },


     {
      path: "/antenatal-registration",
      name: "AntenatalRegistration",
      component: lazy(() => import("@/pages/AntenatalRegistration/AthenaModule")),
      exact: true,
      protected: true,
    },
     {
      path: "/hospital-master",
      name: "Athena",
      component: lazy(() => import("@/pages/HospitalMaster/HospitalModule")),
      exact: true,
      protected: true,
    },
    {
      path: "/referral-master",
      name: "Referral Master",
      component: lazy(() => import("@/pages/Referralmaster/ReferralModule")),
      exact: true,
      protected: true,
    },



    // {
    //   path: "/analytics",
    //   name: "Analytics",
    //   component: lazy(() => import("@/pages/Analytics")),
    //   protected: true,
    // },
    // {
    //   path: "/users",
    //   name: "Users",
    //   component: lazy(() => import("@/pages/Users")),
    //   protected: true,
    //   roles: ["admin"],
    // },
    // {
    //   path: "/users/new",
    //   name: "Add User",
    //   component: lazy(() => import("@/pages/Users/AddUser")),
    //   protected: true,
    //   roles: ["admin"],
    // },
    // {
    //   path: "/users/roles",
    //   name: "Roles",
    //   component: lazy(() => import("@/pages/Users/Roles")),
    //   protected: true,
    //   roles: ["admin"],
    // },
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
    // {
    //   path: "/settings/notifications",
    //   name: "Notifications",
    //   component: lazy(() => import("@/pages/Settings/Notifications")),
    //   protected: true,
    // },
    // {
    //   path: "/settings/appearance",
    //   name: "Appearance",
    //   component: lazy(() => import("@/pages/Settings/Appearance")),
    //   protected: true,
    // },
  ]
}