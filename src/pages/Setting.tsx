import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { NativeSelect } from "@/components/ui/native-select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  User,
  Bell,
  ShieldCheck,
  Palette,
  Monitor,
  Sun,
  Moon,
  KeyRound,
  LogOut,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

type NotificationKey =
  | "emailUpdates"
  | "taskAssigned"
  | "weeklyDigest"
  | "securityAlerts"
  | "productAnnouncements"

const Settings = () => {
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    username: "",
  })

  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    emailUpdates: true,
    taskAssigned: true,
    weeklyDigest: false,
    securityAlerts: true,
    productAnnouncements: false,
  })

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [twoFactor, setTwoFactor] = useState(false)

  const toggleNotification = (key: NotificationKey) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveAccount = () => {
    toast.success("Account settings saved")
  }

  const handleChangePassword = () => {
    toast.info("Password reset link sent to your email")
  }

  const handleSignOutAll = () => {
    toast.success("Signed out from all other sessions")
  }

  const notificationItems: { key: NotificationKey; title: string; description: string }[] = [
    { key: "emailUpdates", title: "Email updates", description: "Get notified by email when something changes." },
    { key: "taskAssigned", title: "Task assigned", description: "Receive an alert when a task is assigned to you." },
    { key: "weeklyDigest", title: "Weekly digest", description: "A summary of activity, sent every Monday." },
    { key: "securityAlerts", title: "Security alerts", description: "Sign-ins from new devices or locations." },
    { key: "productAnnouncements", title: "Product announcements", description: "News about new features and updates." },
  ]

  return (
    <div className=" space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, notifications, security, and appearance preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <User className="mr-1.5 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-1.5 h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>This information is used across your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="acc-name">Full name</Label>
                  <Input
                    id="acc-name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-username">Username</Label>
                  <Input
                    id="acc-username"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="acc-email">Email address</Label>
                <Input
                  id="acc-email"
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acc-language">Language</Label>
                <NativeSelect id="acc-language" className="w-full sm:w-64" defaultValue="en">
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                </NativeSelect>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button onClick={handleSaveAccount}>Save changes</Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>These actions are irreversible. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your account and all associated data.
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {notificationItems.map((item, index) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={() => toggleNotification(item.key)}
                    />
                  </div>
                  {index < notificationItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleChangePassword}>
                  Change password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Authenticator app</p>
                    {twoFactor && (
                      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-xs text-green-600">
                        Enabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use an authenticator app to generate one-time codes.
                  </p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Devices currently signed in to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Chrome on Windows · Chennai</p>
                    <p className="text-sm text-muted-foreground">Current session</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">This device</Badge>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button variant="outline" size="sm" onClick={handleSignOutAll}>
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out of all other sessions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose how the interface looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { key: "light" as const, label: "Light", icon: Sun },
                  { key: "dark" as const, label: "Dark", icon: Moon },
                  { key: "system" as const, label: "System", icon: Monitor },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition ${
                      theme === key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings