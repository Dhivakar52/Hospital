import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { Header } from "../components/Header"
import { Outlet, useLocation } from "react-router-dom"

interface LayoutProps {
  children?: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  notificationCount?: number
  breadcrumbItems?: {
    label: string
    href?: string
  }[]
}

// Acronyms that should be uppercase
const ACRONYMS = new Set(["op", "ip", "mrd", "anc", "uhid", "abha", "vip", "kin", "opd", "ipd"])

// Format label function
const formatLabel = (str: string): string => {
  const lowerStr = str.toLowerCase()
  
  // Check if it's an acronym
  if (ACRONYMS.has(lowerStr)) {
    return str.toUpperCase()
  }
  
  // Check for combined words like "diagnosisentry"
  const wordMap: Record<string, string> = {
    'diagnosisentry': 'Diagnosis Entry',
    'patientregistration': 'Patient Registration',
    'appointmentschedule': 'Appointment Schedule',
    'billingreport': 'Billing Report',
    'labtest': 'Lab Test',
    'bloodtest': 'Blood Test',
    'opconsultation': 'OP Consultation',
    'ippatient': 'IP Patient',
    'mrdrecord': 'MRD Record',
    'registration': 'Registration',
    'register': 'Register',
    'diagnosis': 'Diagnosis',
    'entry': 'Entry',
    'patient': 'Patient',
    'appointment': 'Appointment',
    'billing': 'Billing',
    'report': 'Report',
  }
  
  if (wordMap[lowerStr]) {
    return wordMap[lowerStr]
  }
  
  // Split by '-' if any
  const parts = str.split('-')
  if (parts.length > 1) {
    return parts
      .map(part => {
        const partLower = part.toLowerCase()
        if (ACRONYMS.has(partLower)) {
          return part.toUpperCase()
        }
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join(' ')
  }
  
  // Default: capitalize first letter
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function Layout({ 
  children, 
  breadcrumbItems = []
}: LayoutProps) {
  const location = useLocation()
  
  // Generate breadcrumbs from path (without href/links)
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '')
    
    // If no segments, show Dashboard
    if (pathSegments.length === 0) {
      return [{ label: "Dashboard" }]
    }
    
    const breadcrumbs: { label: string }[] = []
    
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      const label = formatLabel(segment)
      
      breadcrumbs.push({
        label,
      })
    }
    
    return breadcrumbs
  }
  
  // Use provided breadcrumbItems or auto-generate from path
  const autoBreadcrumbs = breadcrumbItems.length > 0 
    ? breadcrumbItems 
    : generateBreadcrumbs()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex-1 flex flex-col min-h-screen w-0">
          <Header breadcrumbItems={autoBreadcrumbs} />

          <main className="flex-1 p-6 layerBg">{children || <Outlet/>}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}