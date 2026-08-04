import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/common/Datatable"
import TableSearch from "@/common/TableSearch"
// import { FilterTable } from "@/common/FilterTable"
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
  // UserPlus,
  Loader2,
  CalendarIcon,
  ArrowRight,
  // Menu,
  SlidersHorizontal,
  FileSpreadsheet,
  Printer,
  Filter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { notify } from "@/lib/notify"
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives"
import type { RegistrationDraft } from "./Registration"

// ✅ Import types and mock data
import type { Patient, PatientFormData } from "@/types/op_register"
import { mockPatients } from "@/data/mockPatients"

import { BarcodePreviewModal } from "@/components/BarcodePreviewModal"
import { PatientPrintPreviewModal } from "@/components/PatientPrintPreviewModal"

interface RegisteredPatientsTableProps {
  newPatient?: RegistrationDraft | null
}

export default function RegisteredPatientsTable({ newPatient }: RegisteredPatientsTableProps) {
  const navigate = useNavigate()
  const [data, setData] = useState<Patient[]>([])
  const [filteredData, setFilteredData] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Print & Barcode preview states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedPrintPatient, setSelectedPrintPatient] = useState<Patient | null>(null)
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false)
  const [selectedBarcodePatient, setSelectedBarcodePatient] = useState<Patient | null>(null)

  // Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Panel states
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>(null)

  // ✅ Actions dropdown (Filter / Export / Print) - Accessories pattern
  const [showActions, setShowActions] = useState(false)
  const actionRef = useRef<HTMLDivElement>(null)

  // ✅ From Date -> To Date (header) - NEW
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)

  // Form state
  const [formData, setFormData] = useState<PatientFormData>({
    opNo: "",
    title: "Mr",
    patientName: "",
    fhwo: "",
    area: "",
    city: "",
    department: "",
    registrationDate: "",
    email: "",
    phone: "",
  })

  // ✅ Filter panel state - now field-based (Title, Patient Name, F/H/W/O, Area, City, Department)
  const [tempFilters, setTempFilters] = useState<Record<string, string>>({})

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filters
  const [filters, setFilters] = useState<Record<string, string>>({})

  const hasActiveFilters = Object.keys(filters).length > 0 || Boolean(fromDate) || Boolean(toDate)

  type PanelMode = "view" | "edit" | "add" | "filter" | null

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

  // Load data - using mock data from separate file
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Use mock data from the separate file
        setData(mockPatients)
        setFilteredData(mockPatients)
      } catch (error) {
        console.error("Error fetching data:", error)
        notify.serverError("Failed to load patient data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle new patient from registration
  useEffect(() => {
    if (!newPatient) return
    const id = `${Date.now()}`
    const patient: Patient = {
      id,
      opNo: id,
      title: newPatient.title || "Mr",
      patientName: newPatient.patientName,
      fhwo: newPatient.fhwo,
      area: newPatient.area,
      city: newPatient.city,
      department: newPatient.department || "General Medicine",
      registrationDate: format(new Date(), "yyyy-MM-dd"),
      email: newPatient.email,
      phone: newPatient.mobile,
    }
    setData((current) => [patient, ...current])
  }, [newPatient])

  // Filter and search data
  useEffect(() => {
    let result = data

    if (search.trim()) {
      const searchLower = search.trim().toLowerCase()
      result = result.filter((patient) =>
        patient.patientName.toLowerCase().includes(searchLower) ||
        patient.id.toLowerCase().includes(searchLower) ||
        patient.opNo.toLowerCase().includes(searchLower) ||
        (patient.phone && patient.phone.toLowerCase().includes(searchLower)) ||
        patient.department.toLowerCase().includes(searchLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower))
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
          // Title and Department are dropdowns, so match exactly; everything else is a typed field, so match partially
          if (key === "title" || key === "department") {
            return stringValue === value.toLowerCase()
          }
          return stringValue.includes(value.toLowerCase())
        })
      }
    })

    // ✅ From Date -> To Date header filter (NEW)
    if (fromDate) {
      result = result.filter((patient) => new Date(patient.registrationDate) >= fromDate)
    }
    if (toDate) {
      result = result.filter((patient) => new Date(patient.registrationDate) <= toDate)
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [search, filters, data, fromDate, toDate])

  // Reset form
  const resetForm = () => {
    setFormData({
      opNo: "",
      title: "Mr",
      patientName: "",
      fhwo: "",
      area: "",
      city: "",
      department: "",
      registrationDate: "",
      email: "",
      phone: "",
    })
  }

  // Reset filters
  const resetFilters = () => {
    setTempFilters({})
  }

  // CRUD Operations
  // const handleAdd = () => {
  //   resetForm()
  //   setPanelMode("add")
  //   setIsPanelOpen(true)
  // }

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient)
    setPanelMode("view")
    setIsPanelOpen(true)
  }

  const handleEdit = (patient: Patient) => {
    navigate("/op/registration", { state: { patient } })
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
      id: `${26588922 + data.length}`,
      ...formData,
    }
    setData([newPatient, ...data])
    handlePanelClose()
    notify.saveSuccess("Record saved successfully.")
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
    notify.updateSuccess("Record updated successfully.")
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
      notify.deleteSuccess("Record deleted successfully.")
    } catch (error) {
      notify.serverError("Failed to delete the record. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Apply filters from panel
  const applyFilters = () => {
    setFilters(tempFilters)
    handlePanelClose()
    if (Object.keys(tempFilters).length > 0) {
      toast.info(`Applied ${Object.keys(tempFilters).length} filter(s)`)
    } else {
      toast.info("All filters cleared")
    }
  }

  const handleCloseFilter = () => {
    setFilters({})
    setFromDate(undefined)
    setToDate(undefined)
    toast.info("Filters cleared")
  }

  // Open filter panel
  const openFilterPanel = () => {
    setTempFilters({ ...filters })
    setPanelMode("filter")
    setIsPanelOpen(true)
    setShowActions(false)
  }

  // Columns definition - ✅ updated to match: UHID No, OP No, Title, Patient Name, F/H/W/O, Area, City, Department
  const columns: ColumnDef<Patient>[] = [
    { accessorKey: "id", header: "UHID No", size: 110 },
    { accessorKey: "opNo", header: "OP No", size: 110 },
    { accessorKey: "title", header: "Title", size: 80 },
    { accessorKey: "patientName", header: "Patient Name", size: 180 },
    { accessorKey: "fhwo", header: "F/H/W/O", size: 160 },
    { accessorKey: "area", header: "Area", size: 150 },
    { accessorKey: "city", header: "City", size: 140 },
    { accessorKey: "department", header: "Department", size: 140 },
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
              onPrint={(p) => {
                setSelectedPrintPatient(p)
                setIsPrintModalOpen(true)
              }}
              onBarcode={(p) => {
                setSelectedBarcodePatient(p)
                setIsBarcodeModalOpen(true)
              }}
              onDelete={handleDelete}
            />
          </div>
        )
      },
    },
  ]

  // ✅ Options for the Title / Department select fields in the filter panel
  const titleOptions = ["Mr", "Mrs", "Ms", "Dr"] as const
  const departmentOptions = ["Neurology", "Cardiology", "Orthopedics", "General Medicine"] as const

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
      setItemsPerPage(size)
      setCurrentPage(1)
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
        { key: "id", header: "UHID No" },
        { key: "opNo", header: "OP No" },
        { key: "title", header: "Title" },
        { key: "patientName", header: "Patient Name" },
        { key: "fhwo", header: "F/H/W/O" },
        { key: "area", header: "Area" },
        { key: "city", header: "City" },
        { key: "department", header: "Department" },
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
      <div className="bg-card  border border-border rounded-md p-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Registered Patients</h1>
            <Badge variant="secondary" className="text-xs">
              {filteredData.length} patients
            </Badge>
          </div>

          {/* Search, From Date -> To Date (NEW), Menu Actions (Filter/Export/Print), Add - All in One Row */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="flex-1 sm:flex-none ">
              <TableSearch
                placeholder="Search Patient / UHID / Mobile"
                value={search}
                onChange={(value: string) => setSearch(value)}
              />
            </div>

            {/* ✅ From Date -> To Date (NEW) */}
            <div className="flex items-center gap-2 shrink-0">
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd MMM yyyy") : <span>From Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date: any) => setFromDate(date)}
                  />
                </PopoverContent>
              </Popover>

              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd MMM yyyy") : <span>To Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date: any) => setToDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Add Button */}
            {/* <Button onClick={handleAdd} size="sm" className="shrink-0"
             style={
                         {
                          color: "var(--blue-text-color)",
                            background: "var(--side-menu)",
                          
                            }
                          }
            
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </Button> */}

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
                    className={`p-2 rounded-lg hover:bg-blue-50 text-muted-foreground transition    
                    `}
                     style={
                        hasActiveFilters
                        ? {
                          color: "var(--blue-text-color)",
                            background: "var(--side-menu)",
                          
                            }
                        : undefined
                    }
                    title="Filter"
                  >
                    <Filter size={18} />
                    {/* {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs align-middle">
                        {Object.keys(filters).length}
                      </Badge>
                    )} */}
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
        {loading && (
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

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
          panelMode === "view" ? `View Patient: ${selectedPatient?.patientName || ""}` :
          panelMode === "edit" ? `Edit Patient: ${selectedPatient?.patientName || ""}` :
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
              <div className="space-y-2 w-full">
                <Label htmlFor="add-title">Title</Label>
                <NativeSelect
                  id="add-title"
                  className="w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-patientName">Patient Name</Label>
                <Input
                  id="add-patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-opNo">OP No</Label>
                <Input
                  id="add-opNo"
                  value={formData.opNo}
                  onChange={(e) => setFormData({ ...formData, opNo: e.target.value })}
                  placeholder="OP number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-fhwo">F/H/W/O</Label>
                <Input
                  id="add-fhwo"
                  value={formData.fhwo}
                  onChange={(e) => setFormData({ ...formData, fhwo: e.target.value })}
                  placeholder="Father/Husband/Wife of"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-area">Area</Label>
                <Input
                  id="add-area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Area"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-city">City</Label>
                <Input
                  id="add-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-department">Department</Label>
                <Input
                  id="add-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Department"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="add-registrationDate">Registration Date</Label>
                <Popover>
                  <PopoverTrigger >
                    <Button
                      id="add-registrationDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.registrationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.registrationDate ? format(new Date(formData.registrationDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.registrationDate ? new Date(formData.registrationDate) : undefined}
                      onSelect={(date : any) =>
                        setFormData({ ...formData, registrationDate: date ? format(date, "yyyy-MM-dd") : "" })
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
                <Label className="text-muted-foreground text-sm">UHID No</Label>
                <p className="font-medium text-lg text-foreground">{selectedPatient.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">OP No</Label>
                <p className="font-medium text-lg text-foreground">{selectedPatient.opNo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Title</Label>
                <p className="font-medium text-foreground">{selectedPatient.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Patient Name</Label>
                <p className="font-medium text-foreground">{selectedPatient.patientName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">F/H/W/O</Label>
                <p className="font-medium text-foreground">{selectedPatient.fhwo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Department</Label>
                <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  {selectedPatient.department}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Area</Label>
                <p className="font-medium text-foreground">{selectedPatient.area}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">City</Label>
                <p className="font-medium text-foreground">{selectedPatient.city}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Registration Date</Label>
                <p className="font-medium text-foreground">{selectedPatient.registrationDate}</p>
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
              <div className="space-y-2 w-full">
                <Label htmlFor="edit-title">Title</Label>
                <NativeSelect
                  id="edit-title"
                  className="w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patientName">Patient Name</Label>
                <Input
                  id="edit-patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-opNo">OP No</Label>
                <Input
                  id="edit-opNo"
                  value={formData.opNo}
                  onChange={(e) => setFormData({ ...formData, opNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fhwo">F/H/W/O</Label>
                <Input
                  id="edit-fhwo"
                  value={formData.fhwo}
                  onChange={(e) => setFormData({ ...formData, fhwo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-area">Area</Label>
                <Input
                  id="edit-area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="edit-registrationDate">Registration Date</Label>
                <Popover>
                  <PopoverTrigger >
                    <Button
                      id="edit-registrationDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.registrationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.registrationDate ? format(new Date(formData.registrationDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.registrationDate ? new Date(formData.registrationDate) : undefined}
                      onSelect={(date :any) =>
                        setFormData({ ...formData, registrationDate: date ? format(date, "yyyy-MM-dd") : "" })
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

        {/* Filter Mode - ✅ now uses Field/TextField/SelectField/DateField, wired into tempFilters */}
        {panelMode === "filter" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <SelectField
                  options={titleOptions}
                  placeholder="Any title"
                  value={tempFilters.title || ""}
                  onChange={(value : any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (value) next.title = value
                      else delete next.title
                      return next
                    })
                  }
                />
              </Field>
              <Field label="Patient Name">
                <TextField
                  placeholder="Search by name"
                  value={tempFilters.patientName || ""}
                  onChange={(value : any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (value) next.patientName = value
                      else delete next.patientName
                      return next
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="F/H/W/O">
                <TextField
                  placeholder="Father/Husband/Wife of"
                  value={tempFilters.fhwo || ""}
                  onChange={(value: any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (value) next.fhwo = value
                      else delete next.fhwo
                      return next
                    })
                  }
                />
              </Field>
              <Field label="Department">
                <SelectField
                  options={departmentOptions}
                  placeholder="Any department"
                  value={tempFilters.department || ""}
                  onChange={(value : any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (value) next.department = value
                      else delete next.department
                      return next
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Area">
                <TextField
                  placeholder="Search by area"
                  value={tempFilters.area || ""}
                  onChange={(value : any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (value) next.area = value
                      else delete next.area
                      return next
                    })
                  }
                />
              </Field>
              <Field label="City">
                <TextField
                  placeholder="Search by city"
                  value={tempFilters.city || ""}
                  onChange={(value : any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (value) next.city = value
                      else delete next.city
                      return next
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Registration Date">
                <DateField
                  placeholder="Pick a date"
                  value={tempFilters.registrationDate ? new Date(tempFilters.registrationDate) : undefined}
                  onChange={(date : any) =>
                    setTempFilters((prev) => {
                      const next = { ...prev }
                      if (date) next.registrationDate = format(date, "yyyy-MM-dd")
                      else delete next.registrationDate
                      return next
                    })
                  }
                />
              </Field>
            </div>

            {/* Selected Filters Summary */}
            {Object.keys(tempFilters).length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(tempFilters).length} filter(s) selected
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
        itemName={selectedPatient?.patientName || "this patient"}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDeleting={isDeleting}
      />

      {/* Patient Print Preview Modal */}
      <PatientPrintPreviewModal
        patient={selectedPrintPatient}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setSelectedPrintPatient(null)
        }}
      />

      {/* Barcode & QR Code Preview Modal */}
      <BarcodePreviewModal
        patient={selectedBarcodePatient}
        isOpen={isBarcodeModalOpen}
        onClose={() => {
          setIsBarcodeModalOpen(false)
          setSelectedBarcodePatient(null)
        }}
      />
    </div>
  )
}
