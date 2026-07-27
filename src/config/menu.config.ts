import {
  LayoutDashboard,
  BarChart,
  Users,
  UserPlus,
  UserCog,
  Settings,
  Bell,
  Palette,
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

// Only the menu data
export const menuConfig: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: BarChart,
    //  badge: "New" 
    },
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
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  //   items: [
  //     { title: "General", url: "/settings", icon: Settings },
  //     { title: "Notifications", url: "/settings/notifications", icon: Bell },
  //     { title: "Appearance", url: "/settings/appearance", icon: Palette },
  //   ],
  // },
]

// Manually define routes (more control)
export const getRoutes = () => {
  return [
    {
      path: "/dashboard",
      name: "Dashboard",
      component: lazy(() => import("@/pages/Dashboard")),
      exact: true,
    },
    {
      path: "/analytics",
      name: "Analytics",
      component: lazy(() => import("@/pages/Analytics")),
    },

  ]
}