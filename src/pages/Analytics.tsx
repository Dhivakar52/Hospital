import { useState, useEffect, useRef, useMemo } from "react"
import { DataTable } from "@/common/Datatable"
import TableSearch from "@/common/TableSearch"
import { FilterTable } from "@/common/FilterTable"
import Pagination from "@/common/Pagination"
import { ActionMenu } from "@/common/ActionMenu"
import CustomPanel from "@/common/CustomPanel"
import { DeleteConfirmationDialog } from "@/common/DeleteConfirmationDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import {
  UserPlus,
  Loader2,
  X,
  CalendarIcon,
  Menu,
  SlidersHorizontal,
  FileSpreadsheet,
  Printer,
  Filter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Patient = {
  id: string
  name: string
  age: number
  gender: string
  condition: string
  status: "Active" | "Recovered" | "Critical"
  lastVisit: string
  email?: string
  phone?: string
}

type PatientFormData = Omit<Patient, 'id'>
type PanelMode = "view" | "edit" | "add" | "filter" | null

export default function Analytics() {
  const [data, setData] = useState<Patient[]>([])
  const [filteredData, setFilteredData] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Panel states
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>(null)

  // ✅ Actions dropdown (Filter / Export / Print) - Accessories pattern
  const [showActions, setShowActions] = useState(false)
  const actionRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: 0,
    gender: "",
    condition: "",
    status: "Active",
    lastVisit: "",
    email: "",
    phone: "",
  })

  // Filter state for filter panel
  const [tempFilters, setTempFilters] = useState<Record<string, string>>({})
  const [tempSelectedFilters, setTempSelectedFilters] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filters
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const hasActiveFilters = selectedFilters.length > 0

  // ✅ Close actions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setShowActions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))

        const sampleData: Patient[] = [
          { id: "P001", name: "John Doe", age: 45, gender: "Male", condition: "Hypertension", status: "Active", lastVisit: "2024-01-15", email: "john@example.com", phone: "+1 234-567-8900" },
          { id: "P002", name: "Jane Smith", age: 32, gender: "Female", condition: "Diabetes", status: "Recovered", lastVisit: "2024-01-10", email: "jane@example.com", phone: "+1 234-567-8901" },
          { id: "P003", name: "Robert Johnson", age: 67, gender: "Male", condition: "Heart Disease", status: "Critical", lastVisit: "2024-01-20", email: "robert@example.com", phone: "+1 234-567-8902" },
          { id: "P004", name: "Emily Wilson", age: 28, gender: "Female", condition: "Asthma", status: "Active", lastVisit: "2024-01-18", email: "emily@example.com", phone: "+1 234-567-8903" },
          { id: "P005", name: "Michael Brown", age: 52, gender: "Male", condition: "Arthritis", status: "Recovered", lastVisit: "2024-01-12", email: "michael@example.com", phone: "+1 234-567-8904" },
          { id: "P006", name: "Sarah Davis", age: 41, gender: "Female", condition: "Diabetes", status: "Critical", lastVisit: "2024-01-22", email: "sarah@example.com", phone: "+1 234-567-8905" },
          { id: "P007", name: "David Wilson", age: 55, gender: "Male", condition: "Hypertension", status: "Active", lastVisit: "2024-01-19", email: "david@example.com", phone: "+1 234-567-8906" },
          { id: "P008", name: "Lisa Anderson", age: 34, gender: "Female", condition: "Asthma", status: "Recovered", lastVisit: "2024-01-14", email: "lisa@example.com", phone: "+1 234-567-8907" },
        ]
        setData(sampleData)
        setFilteredData(sampleData)
        toast.success("Data loaded successfully!")
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load patient data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and search data
  useEffect(() => {
    let result = data

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((patient) =>
        patient.name.toLowerCase().includes(searchLower) ||
        patient.id.toLowerCase().includes(searchLower) ||
        patient.condition.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower)
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((patient) => {
          const patientValue = patient[key as keyof Patient]
          if (patientValue === undefined || patientValue === null) {
            return false
          }
          const stringValue = String(patientValue).toLowerCase()
          return stringValue === value.toLowerCase()
        })
      }
    })

    setFilteredData(result)
    setCurrentPage(1)
  }, [search, filters, data])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      age: 0,
      gender: "",
      condition: "",
      status: "Active",
      lastVisit: "",
      email: "",
      phone: "",
    })
  }

  // Reset filters
  const resetFilters = () => {
    setTempFilters({})
    setTempSelectedFilters([])
  }

  // CRUD Operations
  const handleAdd = () => {
    resetForm()
    setPanelMode("add")
    setIsPanelOpen(true)
  }

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient)
    setPanelMode("view")
    setIsPanelOpen(true)
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      condition: patient.condition,
      status: patient.status,
      lastVisit: patient.lastVisit,
      email: patient.email || "",
      phone: patient.phone || "",
    })
    setPanelMode("edit")
    setIsPanelOpen(true)
  }

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDeleteOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setPanelMode(null)
    setSelectedPatient(null)
    resetForm()
    resetFilters()
  }

  const confirmAdd = () => {
    const newPatient: Patient = {
      id: `P${String(data.length + 1).padStart(3, '0')}`,
      ...formData,
    }
    setData([newPatient, ...data])
    handlePanelClose()
    toast.success("Patient added successfully!")
  }

  const confirmEdit = () => {
    if (!selectedPatient) return
    const updatedData = data.map((patient) =>
      patient.id === selectedPatient.id
        ? { ...patient, ...formData }
        : patient
    )
    setData(updatedData)
    handlePanelClose()
    toast.success("Patient updated successfully!")
  }

  const confirmDelete = async () => {
    if (!selectedPatient) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedData = data.filter((patient) => patient.id !== selectedPatient.id)
      setData(updatedData)
      setIsDeleteOpen(false)
      setSelectedPatient(null)
      toast.success("Patient deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete patient")
    } finally {
      setIsDeleting(false)
    }
  }

  // Apply filters from panel
  const applyFilters = () => {
    setFilters(tempFilters)
    setSelectedFilters(tempSelectedFilters)
    handlePanelClose()
    if (Object.keys(tempFilters).length > 0) {
      toast.info(`Applied ${Object.keys(tempFilters).length} filter(s)`)
    } else {
      toast.info("All filters cleared")
    }
  }

  const handleCloseFilter = () => {
    setFilters({})
    setSelectedFilters([])
    toast.info("Filters cleared")
  }

  // Open filter panel
  const openFilterPanel = () => {
    setTempFilters({ ...filters })
    setTempSelectedFilters([...selectedFilters])
    setPanelMode("filter")
    setIsPanelOpen(true)
    setShowActions(false)
  }

  // Columns definition
  const columns: ColumnDef<Patient>[] = [
    { accessorKey: "id", header: "Patient ID", size: 100 },
    { accessorKey: "name", header: "Name", size: 150 },
    { accessorKey: "age", header: "Age", size: 80 },
    { accessorKey: "gender", header: "Gender", size: 100 },
    { accessorKey: "condition", header: "Condition", size: 150 },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusColors = {
          Active: "bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400",
          Recovered: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
          Critical: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
        }
        return (
          <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
            {status}
          </Badge>
        )
      },
    },
    { accessorKey: "lastVisit", header: "Last Visit", size: 120 },
    {
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => {
        const patient = row.original
        return (
          <div className="relative flex items-center">
            <ActionMenu
              item={patient}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )
      },
    },
  ]

  // Filter options for FilterTable
  const filterOptions = [
    { id: "active", label: "Active", icon: <span className="h-2 w-2 rounded-full bg-green-500" /> },
    { id: "recovered", label: "Recovered", icon: <span className="h-2 w-2 rounded-full bg-blue-500" /> },
    { id: "critical", label: "Critical", icon: <span className="h-2 w-2 rounded-full bg-red-500" /> },
    { id: "male", label: "Male", icon: <span className="h-2 w-2 rounded-full bg-purple-500" /> },
    { id: "female", label: "Female", icon: <span className="h-2 w-2 rounded-full bg-pink-500" /> },
  ]

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // ✅ Current page data (used for export) - Accessories pattern
  const pagedData = useMemo(() => paginatedData, [paginatedData])

  const paginationTable = {
    getState: () => ({
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: itemsPerPage,
      }
    }),
    setPageIndex: (index: number) => setCurrentPage(index + 1),
    setPageSize: (size: number) => {
      console.log("Page size changed to:", size)
    },
    previousPage: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
    nextPage: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
    getCanPreviousPage: () => currentPage > 1,
    getCanNextPage: () => currentPage < totalPages,
  }

  // ✅ Export current page to CSV - Accessories pattern
  const handleExportExcel = () => {
    if (!pagedData.length) {
      toast.error("No data to export on current page")
      return
    }

    try {
      const exportColumns: { key: keyof Patient; header: string }[] = [
        { key: "id", header: "Patient ID" },
        { key: "name", header: "Name" },
        { key: "age", header: "Age" },
        { key: "gender", header: "Gender" },
        { key: "condition", header: "Condition" },
        { key: "status", header: "Status" },
        { key: "lastVisit", header: "Last Visit" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
      ]

      const exportData = pagedData.map((row, index) => {
        const rowData: Record<string, string | number> = {
          "S.No": (currentPage - 1) * itemsPerPage + index + 1,
        }
        exportColumns.forEach((col) => {
          const value = row[col.key]
          rowData[col.header] = value !== undefined && value !== null ? value : "-"
        })
        return rowData
      })

      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((key) => {
              const val = row[key]
              if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
                return `"${val.replace(/"/g, '""')}"`
              }
              return val
            })
            .join(",")
        ),
      ].join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `Patients_Page${currentPage}_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)

      toast.success(`Exported ${pagedData.length} records from current page`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data. Please try again.")
    } finally {
      setShowActions(false)
    }
  }

  // ✅ Print current page - Accessories pattern
  const handlePrint = () => {
    setShowActions(false)
    window.print()
  }

  return (
    <div className="">
      <div className="bg-card shadow-lg border border-border rounded-lg p-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Patient Details</h1>
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} patients
            </Badge>
          </div>

          {/* Search, Menu Actions (Filter/Export/Print), Add - All in One Row */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="flex-1 sm:flex-none ">
              <TableSearch
                placeholder="Search patients..."
                value={search}
                onChange={(value: string) => setSearch(value)}
              />
            </div>

            {/* Add Button */}
            <Button onClick={handleAdd} size="sm" className="shrink-0">
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </Button>

            {/* ✅ Menu → Filter / Export / Print dropdown - Accessories pattern */}
            <div className="relative" ref={actionRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              {hasActiveFilters && (
                <button
                  onClick={handleCloseFilter}
                  title="Clear filters"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shadow-md hover:bg-blue-700"
                >
                  <SlidersHorizontal size={12} />
                </button>
              )}

              {showActions && (
                <div className="absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-1 z-50">
                  <button
                    onClick={openFilterPanel}
                    className={`p-2 rounded-lg hover:bg-blue-50 text-muted-foreground transition ${
                      hasActiveFilters ? "bg-blue-100 text-blue-600" : ""
                    }`}
                    title="Filter"
                  >
                    <Filter size={18} />
                    {selectedFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs align-middle">
                        {selectedFilters.length}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition relative"
                    title={`Export ${pagedData.length} records from current page`}
                  >
                    <FileSpreadsheet size={18} />
                    {pagedData.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {pagedData.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} patients
            </span>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={loading}
          skeletonRows={5}
        />

        {/* Pagination */}
        <Pagination
          table={paginationTable}
          totalCount={filteredData.length}
        />
      </div>

      {/* Custom Panel for Add, View, Edit, and Filter */}
      <CustomPanel
        isOpen={isPanelOpen}
        title={
          panelMode === "add" ? "Add New Patient" :
          panelMode === "view" ? `View Patient: ${selectedPatient?.name || ""}` :
          panelMode === "edit" ? `Edit Patient: ${selectedPatient?.name || ""}` :
          panelMode === "filter" ? "Filter Patients" :
          "Patient Details"
        }
        onClose={handlePanelClose}
        onSave={
          panelMode === "add" ? confirmAdd :
          panelMode === "edit" ? confirmEdit :
          panelMode === "filter" ? applyFilters :
          handlePanelClose
        }
        saveLabel={
          panelMode === "add" ? "Add Patient" :
          panelMode === "edit" ? "Save Changes" :
          panelMode === "filter" ? "Apply Filters" :
          "Close"
        }
      >
        {/* Add Mode */}
        {panelMode === "add" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Name</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-age">Age</Label>
                <Input
                  id="add-age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  placeholder="Age"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="add-gender">Gender</Label>
                <NativeSelect
                  id="add-gender"
                  className="w-full"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-condition">Condition</Label>
                <Input
                  id="add-condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Medical condition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="add-status">Status</Label>
                <NativeSelect
                  id="add-status"
                  className="w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Recovered" | "Critical" })}
                >
                  <option value="Active">Active</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Critical">Critical</option>
                </NativeSelect>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="add-lastVisit">Last Visit</Label>
                <Popover>
                  <PopoverTrigger >
                    <Button
                      id="add-lastVisit"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.lastVisit && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.lastVisit ? format(new Date(formData.lastVisit), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.lastVisit ? new Date(formData.lastVisit) : undefined}
                      onSelect={(date) =>
                        setFormData({ ...formData, lastVisit: date ? format(date, "yyyy-MM-dd") : "" })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
        )}

        {/* View Mode */}
        {panelMode === "view" && selectedPatient && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Patient ID</Label>
                <p className="font-medium text-lg text-foreground">{selectedPatient.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Name</Label>
                <p className="font-medium text-lg text-foreground">{selectedPatient.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Age</Label>
                <p className="font-medium text-foreground">{selectedPatient.age}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Gender</Label>
                <p className="font-medium text-foreground">{selectedPatient.gender}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Condition</Label>
                <p className="font-medium text-foreground">{selectedPatient.condition}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Status</Label>
                <Badge className={
                  selectedPatient.status === "Active" ? "bg-green-500/15 text-green-600 dark:text-green-400" :
                  selectedPatient.status === "Recovered" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                  "bg-red-500/15 text-red-600 dark:text-red-400"
                }>
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Last Visit</Label>
                <p className="font-medium text-foreground">{selectedPatient.lastVisit}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Email</Label>
                <p className="font-medium text-foreground">{selectedPatient.email || "N/A"}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Phone</Label>
              <p className="font-medium text-foreground">{selectedPatient.phone || "N/A"}</p>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {panelMode === "edit" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="edit-gender">Gender</Label>
                <NativeSelect
                  id="edit-gender"
                  className="w-full"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-condition">Condition</Label>
                <Input
                  id="edit-condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="edit-status">Status</Label>
                <NativeSelect
                  id="edit-status"
                  className="w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Recovered" | "Critical" })}
                >
                  <option value="Active">Active</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Critical">Critical</option>
                </NativeSelect>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="edit-lastVisit">Last Visit</Label>
                <Popover>
                  <PopoverTrigger >
                    <Button
                      id="edit-lastVisit"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.lastVisit && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.lastVisit ? format(new Date(formData.lastVisit), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.lastVisit ? new Date(formData.lastVisit) : undefined}
                      onSelect={(date) =>
                        setFormData({ ...formData, lastVisit: date ? format(date, "yyyy-MM-dd") : "" })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Mode */}
        {panelMode === "filter" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Filter by Status</h3>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTempSelectedFilters(prev => {
                        if (prev.includes(option.id)) {
                          const newFilters = prev.filter(id => id !== option.id)
                          const newTempFilters: Record<string, string> = {}
                          newFilters.forEach(id => {
                            if (id === "active") newTempFilters.status = "Active"
                            else if (id === "recovered") newTempFilters.status = "Recovered"
                            else if (id === "critical") newTempFilters.status = "Critical"
                            else if (id === "male") newTempFilters.gender = "Male"
                            else if (id === "female") newTempFilters.gender = "Female"
                          })
                          setTempFilters(newTempFilters)
                          return newFilters
                        } else {
                          const newFilters = [...prev, option.id]
                          const newTempFilters: Record<string, string> = {}
                          newFilters.forEach(id => {
                            if (id === "active") newTempFilters.status = "Active"
                            else if (id === "recovered") newTempFilters.status = "Recovered"
                            else if (id === "critical") newTempFilters.status = "Critical"
                            else if (id === "male") newTempFilters.gender = "Male"
                            else if (id === "female") newTempFilters.gender = "Female"
                          })
                          setTempFilters(newTempFilters)
                          return newFilters
                        }
                      })
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      tempSelectedFilters.includes(option.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground/50 text-foreground"
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm">{option.label}</span>
                    {tempSelectedFilters.includes(option.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Filters Summary */}
            {tempSelectedFilters.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tempSelectedFilters.length} filter(s) selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CustomPanel>

      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        itemName={selectedPatient?.name || "this patient"}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDeleting={isDeleting}
      />
    </div>
  )
}