"use client"

import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import  type{
  ChartConfig,
 
} from "@/components/ui/chart"

// ---------------------------------------------------------------------------
// Stat card data — swap these for real query results
// ---------------------------------------------------------------------------
const stats = [
  {
    label: "Total Users",
    value: "1,234",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "Revenue",
    value: "$12,345",
    change: "+8.2%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    label: "Orders",
    value: "456",
    change: "-3.1%",
    trend: "down" as const,
    icon: ShoppingCart,
  },
  {
    label: "Active Users",
    value: "789",
    change: "+4.6%",
    trend: "up" as const,
    icon: Activity,
  },
]

// ---------------------------------------------------------------------------
// Chart data
// ---------------------------------------------------------------------------
const revenueData = [
  { month: "Jan", revenue: 4200, orders: 240 },
  { month: "Feb", revenue: 3800, orders: 221 },
  { month: "Mar", revenue: 5100, orders: 289 },
  { month: "Apr", revenue: 4700, orders: 265 },
  { month: "May", revenue: 6200, orders: 312 },
  { month: "Jun", revenue: 5800, orders: 298 },
  { month: "Jul", revenue: 7100, orders: 356 },
]

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig

const usersData = [
  { day: "Mon", users: 186 },
  { day: "Tue", users: 205 },
  { day: "Wed", users: 237 },
  { day: "Thu", users: 173 },
  { day: "Fri", users: 260 },
  { day: "Sat", users: 301 },
  { day: "Sun", users: 245 },
]

const usersConfig = {
  users: { label: "Active users", color: "var(--chart-1)" },
} satisfies ChartConfig

const trafficData = [
  { source: "Direct", visits: 4200, fill: "var(--chart-1)" },
  { source: "Search", visits: 3100, fill: "var(--chart-2)" },
  { source: "Social", visits: 1800, fill: "var(--chart-3)" },
  { source: "Referral", visits: 900, fill: "var(--chart-4)" },
]

const trafficConfig = {
  visits: { label: "Visits" },
  Direct: { label: "Direct", color: "var(--chart-1)" },
  Search: { label: "Search", color: "var(--chart-2)" },
  Social: { label: "Social", color: "var(--chart-3)" },
  Referral: { label: "Referral", color: "var(--chart-4)" },
} satisfies ChartConfig

const conversionData = [
  { week: "W1", rate: 2.1 },
  { week: "W2", rate: 2.4 },
  { week: "W3", rate: 2.2 },
  { week: "W4", rate: 2.8 },
  { week: "W5", rate: 3.1 },
  { week: "W6", rate: 2.9 },
]

const conversionConfig = {
  rate: { label: "Conversion rate", color: "var(--chart-2)" },
} satisfies ChartConfig

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
}: (typeof stats)[number]) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div
          className={`mt-3 flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
          <span className="font-normal text-muted-foreground">
            vs last month
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store's performance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Row 1: Revenue area chart + traffic donut */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue &amp; Orders</CardTitle>
            <CardDescription>
              Monthly revenue against order volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[280px] w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-orders)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-orders)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  stackId="a"
                />
                <Area
                  dataKey="orders"
                  type="monotone"
                  fill="url(#fillOrders)"
                  stroke="var(--color-orders)"
                  stackId="b"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where visits came from this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trafficConfig}
              className="mx-auto h-[280px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={trafficData}
                  dataKey="visits"
                  nameKey="source"
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={4}
                >
                  {trafficData.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="source" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Active users bar chart + conversion line chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Daily active users this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usersConfig} className="h-[240px] w-full">
              <BarChart data={usersData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Weekly conversion rate trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={conversionConfig} className="h-[240px] w-full">
              <LineChart data={conversionData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="rate"
                  type="monotone"
                  stroke="var(--color-rate)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-rate)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}