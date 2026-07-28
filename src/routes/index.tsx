import { Routes, Route, Navigate } from "react-router-dom"
import { Suspense, useEffect, useState } from "react"
import { routes } from "./routes.config"
import ProtectedRoutes from "./ProtectedRoutes"
import { Layout } from "@/layout/Layout"

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true'
    setIsAuthenticated(auth)
    setLoading(false)
  }, [])

  if (loading) {
    return <PageLoader />
  }

  // Separate routes
  const publicRoutes = routes.filter(route => !route.protected)
  const protectedRoutes = routes.filter(route => route.protected)

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes - No Layout */}
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}

        {/* Protected Routes - With Layout */}
        <Route
          element={
            <ProtectedRoutes isAuthenticated={isAuthenticated}>
              <Layout />
            </ProtectedRoutes>
          }
        >
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Route>

        {/* Redirect */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Suspense>
  )
}