import type { ReactNode } from "react"

import { Navigate, useLocation } from "react-router-dom"
import { toast } from "sonner"

interface ProtectedRoutesProps {
  children: ReactNode
  isAuthenticated?: boolean
  redirectTo?: string
  requiredRoles?: string[]
}

const ProtectedRoutes = ({ 
  children, 
  isAuthenticated = false,
  redirectTo = "/",
  requiredRoles = []
}: ProtectedRoutesProps) => {
  const location = useLocation()

  // Get user roles from localStorage (or your auth context)
  const user = localStorage.getItem('user')
  const userData = user ? JSON.parse(user) : null
  const userRoles = userData?.roles || ['user']

  // Check if user has required role
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => userRoles.includes(role))

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location they tried to access
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // If authenticated but doesn't have required role
  if (!hasRequiredRole) {
    toast.error("You don't have permission to access this page")
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoutes