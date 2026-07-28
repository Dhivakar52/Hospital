import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NativeSelect } from "@/components/ui/native-select"
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Shield, 
  Clock, 
  Pencil,
  User,
  Calendar,
  Heart,
  Stethoscope,
  Syringe,
  UserCircle,
  Hospital,
  FileText,
  Activity
} from "lucide-react"
import { toast } from "sonner"

type ProfileData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  department: string
  location: string
  timezone: string
  bio: string
  // Hospital specific fields
  employeeId: string
  specialization: string
  yearsOfExperience: string
  licenseNumber: string
  hospitalName: string
  shiftTiming: string
  emergencyContact: string
}

const activityLog = [
  { action: "Assigned to new patient - John Doe", time: "2 hours ago" },
  { action: "Updated patient records - Jane Smith", time: "1 day ago" },
  { action: "Completed surgery - Patient #P003", time: "3 days ago" },
  { action: "Changed shift schedule", time: "1 week ago" },
  { action: "Approved medication for Patient #P005", time: "5 days ago" },
]

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 98765 43210",
    role: "Senior Physician",
    department: "Cardiology",
    location: "Chennai, Tamil Nadu",
    timezone: "IST (UTC+5:30)",
    bio: "Experienced cardiologist with 10+ years of practice. Specialized in interventional cardiology and patient care management.",
    // Hospital specific
    employeeId: "EMP-2024-001",
    specialization: "Interventional Cardiology",
    yearsOfExperience: "12 years",
    licenseNumber: "MCI-2024-12345",
    hospitalName: "SRM Medical College Hospital",
    shiftTiming: "9:00 AM - 5:00 PM",
    emergencyContact: "+91 98765 43211",
  })

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        const nameParts = userData.name?.split(' ') || ['User', '']
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userData.email || prev.email,
        }))
      } catch (e) {
        console.error('Error parsing user data', e)
      }
    }
  }, [])

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setIsEditing(false)
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        userData.name = fullName
        userData.email = formData.email
        localStorage.setItem('user', JSON.stringify(userData))
      } catch (e) {
        console.error('Error saving user data', e)
      }
    }
    toast.success("Profile updated successfully")
  }

  const initials = `${formData.firstName[0] ?? ""}${formData.lastName[0] ?? ""}`.toUpperCase()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Hospital className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Doctor Profile</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your professional information and patient care details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Identity card */}
        <Card className="h-fit lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src="" alt={`${formData.firstName} ${formData.lastName}`} />
                <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm transition hover:bg-accent"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{formData.role}</p>
              <p className="text-xs text-muted-foreground">{formData.specialization}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                Active
              </Badge>
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600">
                <Stethoscope className="h-3 w-3 mr-1" />
                On Duty
              </Badge>
            </div>

            <Separator />

            <div className="w-full space-y-3 text-left text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span className="text-foreground">ID: {formData.employeeId}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate text-foreground">{formData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{formData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{formData.department}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{formData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Hospital className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{formData.hospitalName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Tabs (Details / Activity) */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">
                <UserCircle className="h-4 w-4 mr-2" />
                Professional Details
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Recent Activity
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>Update your medical and professional details.</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Medical Professional Details */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <NativeSelect
                        id="role"
                        className="w-full"
                        value={formData.role}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("role", e.target.value)}
                      >
                        <option value="Senior Physician">Senior Physician</option>
                        <option value="Junior Physician">Junior Physician</option>
                        <option value="Surgeon">Surgeon</option>
                        <option value="Specialist">Specialist</option>
                        <option value="Resident Doctor">Resident Doctor</option>
                        <option value="Nurse">Nurse</option>
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <NativeSelect
                        id="department"
                        className="w-full"
                        value={formData.department}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("department", e.target.value)}
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Gynecology">Gynecology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Emergency">Emergency</option>
                      </NativeSelect>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("employeeId", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("licenseNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("specialization", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <NativeSelect
                        id="yearsOfExperience"
                        className="w-full"
                        value={formData.yearsOfExperience}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("yearsOfExperience", e.target.value)}
                      >
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10-15 years">10-15 years</option>
                        <option value="15-20 years">15-20 years</option>
                        <option value="20+ years">20+ years</option>
                      </NativeSelect>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Hospital / Clinic</Label>
                      <Input
                        id="hospitalName"
                        value={formData.hospitalName}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("hospitalName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shiftTiming">Shift Timing</Label>
                      <NativeSelect
                        id="shiftTiming"
                        className="w-full"
                        value={formData.shiftTiming}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("shiftTiming", e.target.value)}
                      >
                        <option value="9:00 AM - 5:00 PM">9:00 AM - 5:00 PM</option>
                        <option value="8:00 AM - 4:00 PM">8:00 AM - 4:00 PM</option>
                        <option value="7:00 AM - 3:00 PM">7:00 AM - 3:00 PM</option>
                        <option value="3:00 PM - 11:00 PM">3:00 PM - 11:00 PM</option>
                        <option value="11:00 PM - 7:00 AM">11:00 PM - 7:00 AM</option>
                        <option value="Flexible">Flexible</option>
                      </NativeSelect>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      disabled={!isEditing}
                      onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      disabled={!isEditing}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      disabled={!isEditing}
                      onChange={(e: any) => handleChange("bio", e.target.value)}
                      placeholder="Tell about your medical experience and expertise"
                    />
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter className="justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="theme-color">
                      Save changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Activity</CardTitle>
                  <CardDescription>A log of your recent patient care activities.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {activityLog.map((entry, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              {entry.action.includes("patient") ? (
                                <Heart className="h-4 w-4 text-red-500" />
                              ) : entry.action.includes("surgery") ? (
                                <Stethoscope className="h-4 w-4 text-blue-500" />
                              ) : entry.action.includes("medication") ? (
                                <Syringe className="h-4 w-4 text-green-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-sm text-foreground">{entry.action}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {entry.time}
                          </div>
                        </div>
                        {index < activityLog.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Profile