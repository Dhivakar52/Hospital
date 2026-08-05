import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Hospital,
  ShieldCheck,
  LineChart,
  Users,
  Zap,
} from "lucide-react"
import { toast } from "@/components/ui/toast";
import WhiteLogo from "@/assets/images/white-logo.png";
import leftImage from "@/assets/images/left-image.png"
import { useAuth } from "@/context/AuthContext"

const features = [
  { icon: ShieldCheck, label: "Secure Access" },
  { icon: LineChart, label: "Real-time Insights" },
  { icon: Users, label: "Role Based Access" },
  { icon: Zap, label: "Smart Workflows" },
]

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({})

  const VALID_USER_ID = 'admin@gmail.com'
  const VALID_PASSWORD = '123'

  const validateForm = () => {
    const newErrors: { userId?: string; password?: string } = {}

    if (!userId) {
      newErrors.userId = 'User ID is required'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (userId === VALID_USER_ID && password === VALID_PASSWORD) {
      toast.success('Welcome back! Redirecting...')
      // ✅ Goes through AuthContext instead of only writing to localStorage,
      // so isAuthenticated updates immediately for every component that
      // reads it via useAuth() — no reliance on a route change to notice.
      login({ userId, name: 'HIS Admin' })
      navigate('/dashboard')
    } else {
      toast.error('Invalid user ID or password. Please try again.')
      setPassword('')
    }

    setIsLoading(false)
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white">

      {/* ================= LEFT HERO PANEL ================= */}
      <div className="relative lg:flex lg:w-[56%] flex-col items-center justify-between overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${leftImage})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800/50 via-blue-700/40 to-blue-900/85" />

        {/* Logo + Title */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-10 pt-8 sm:pt-16">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
            <img src={WhiteLogo} alt="Logo" className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-white text-lg sm:text-2xl xl:text-3xl font-bold leading-snug">
            SRM Medical College Hospital
            <br className="hidden sm:block" /> &amp; Research Centre
          </h1>
          <p className="text-blue-100/90 text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.25em] mt-2 sm:mt-3 font-semibold">
            COMPASSIONATE &nbsp;•&nbsp; ADVANCED &nbsp;•&nbsp; TRUSTED
          </p>
        </div>

        {/* Feature strip - Responsive grid */}
        <div className="relative z-10 w-full px-4 sm:px-8 pb-6 sm:pb-8 mt-4 sm:mt-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 max-w-[560px] w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 sm:p-4">
              {features.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex flex-col items-center gap-1 sm:gap-1.5 text-white text-center px-2 sm:px-4 py-3 sm:py-4 ${
                    i > 0 && i % 2 === 0 ? "sm:border-l-0 md:border-l" : ""
                  } ${
                    i >= 2 ? "border-t sm:border-t-0" : ""
                  } ${
                    i > 0 ? "sm:border-l border-white/20" : ""
                  }`}
                >
                  <f.icon className="h-5 w-5 sm:h-7 sm:w-8 mb-1 sm:mb-2" />
                  <span className="text-[11px] sm:text-[14px] leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile spacer to push content up */}
        <div className="lg:hidden h-4" />
      </div>

      {/* ================= RIGHT LOGIN PANEL ================= */}
      <div className="relative flex-1 flex items-center justify-center bg-white px-4 sm:px-8 lg:px-16 py-8 sm:py-10 min-h-[60vh] lg:min-h-screen">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-6 sm:mb-7">
            <Hospital 
              className="h-5 w-5 sm:h-6 sm:w-6 mb-2 sm:mb-3" 
              style={{ color: "var(--blue-text-color)" }}
            />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">SRMMCH HIS Portal</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID Field */}
            <div className="space-y-1.5">
              <Label htmlFor="userId" className="text-xs font-medium text-slate-600">
                User ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your user id"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    setErrors(prev => ({ ...prev, userId: undefined }))
                  }}
                  className={`pl-9 h-10 text-sm ${errors.userId ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.userId && (
                <p className="text-xs sm:text-sm text-destructive">{errors.userId}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-600">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }}
                  className={`pl-9 pr-10 h-10 text-sm ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs sm:text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Button
                variant="link"
                type="button"
                className="px-0 h-auto text-xs font-normal"
                style={{ color: "var(--blue-text-color)" }}
              >
                Forgot password?
              </Button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-10 text-white text-sm"
              disabled={isLoading}
              style={{ 
                background: "var(--blue-btn)", 
                padding: "18px 18px" 
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login