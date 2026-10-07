import { type ReactNode, useEffect, useRef } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRoutesProps {
  children: ReactNode
  isAuthenticated?: boolean
  redirectTo?: string
  requiredRoles?: string[]
  loadingComponent?: ReactNode
}

// Existing HIU and HIP routes accessible to ABHA_ADMIN
const isAbhaAdminRoute = (pathname: string) => {
  return (
    pathname === "/hiu" ||
    pathname.startsWith("/hiu/") ||
    pathname === "/consent" ||
    pathname.startsWith("/consent") ||
    pathname === "/consent-management" ||
    pathname === "/approved" ||
    pathname.startsWith("/approved") ||
    pathname === "/patient-approvals" ||
    pathname.startsWith("/patient-approvals") ||
    pathname === "/fhir" ||
    pathname.startsWith("/fhir") ||
    pathname === "/abdm-viewer" ||
    pathname === "/fhir-viewer" ||
    pathname === "/care-context" ||
    pathname.startsWith("/care-context") ||
    pathname === "/hip" ||
    pathname.startsWith("/hip") ||
    pathname === "/profile"
  )
}

const ProtectedRoutes = ({
  children,
  isAuthenticated = false,
  redirectTo = "/",
  requiredRoles = [],
  loadingComponent,
}: ProtectedRoutesProps) => {
  const location = useLocation()
  const { user } = useAuth()
  const hasShownToast = useRef(false)

  const userRole = user?.role || (user?.roles && user.roles[0]) || (user?.email === "abhaadmin@gmail.com" ? "ABHA_ADMIN" : "HIS_ADMIN")
  const userRoles = user?.roles || (user?.role ? [user.role] : [userRole])

  // Access rules:
  // HIS_ADMIN: access to ALL existing screens
  // ABHA_ADMIN: access to HIU, HIP, Care Context, and Approved screens
  const isAllowed = (() => {
    if (userRole === "HIS_ADMIN") return true
    if (userRole === "ABHA_ADMIN") {
      if (!isAbhaAdminRoute(location.pathname)) return false
      if (requiredRoles.length > 0 && !requiredRoles.includes("ABHA_ADMIN")) return false
      return true
    }
    return (
      requiredRoles.length === 0 ||
      requiredRoles.some((role) => userRoles.includes(role))
    )
  })()

  const fallbackPath = userRole === "ABHA_ADMIN" ? "/consent" : "/dashboard"

  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      toast.error("Please login to access this page")
      hasShownToast.current = true
    } else if (isAuthenticated && !isAllowed && !hasShownToast.current) {
      toast.error("You don't have permission to access this page")
      hasShownToast.current = true
    } else if (isAuthenticated && isAllowed) {
      hasShownToast.current = false
    }
  }, [isAuthenticated, isAllowed])

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (!isAllowed) {
    return <Navigate to={fallbackPath} replace />
  }

  if (loadingComponent) {
    return <>{loadingComponent}</>
  }

  return <>{children}</>
}

export default ProtectedRoutes