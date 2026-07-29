import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  userId: string
  name: string
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  )

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (userData: User) => {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true) // ✅ synchronous — no render lag, no race condition
  }

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}