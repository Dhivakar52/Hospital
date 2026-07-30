import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Suspense } from "react"
import { routes } from "./routes.config"
import ProtectedRoutes from "./ProtectedRoutes"
import { Layout } from "@/layout/Layout"
import { useAuth } from "@/context/AuthContext"

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export const AppRoutes = () => {
  const location = useLocation()


  const { isAuthenticated } = useAuth()

  const publicRoutes = routes.filter(route => !route.protected)
  const protectedRoutes = routes.filter(route => route.protected)

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
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
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  )
}