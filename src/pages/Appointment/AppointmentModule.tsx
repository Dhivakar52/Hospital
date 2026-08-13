import React, { useState, useMemo, useRef, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
    SlidersHorizontal,
    FileSpreadsheet,
    Printer,
    Plus,
    CheckCircle2,
    Filter,
    Eye,
    Pencil,
    Trash2,
    ChevronRight,
    CalendarClock,
    UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/common/Datatable";
import Pagination from "@/common/Pagination";
import TableSearch from "@/common/TableSearch";
import CustomPanel from "@/common/CustomPanel";
import { DeleteConfirmationDialog } from "@/common/DeleteConfirmationDialog";
import { Field, TextField, SelectField, DateField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";
import { toast } from "@/components/ui/toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================
export interface Appointment {
    id: string;
    apptNo: string;
    patient: string;
    uhid: string;
    regNo: string;
    doctor: string;
    apptOn: string;
    rawDate: string;
    rawTime: string;
    type: "Online" | "Reception" | "Phone";
    status: "Upcoming" | "Visited" | "Cancelled";
    gender?: string;
    age?: number;
    mobile?: string;
    bookedOn?: string;
    dept?: string;
}

export interface PatientProfile {
    id: string;
    name: string;
    age: number;
    gender: string;
    uhid: string;
    mobile: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: "1",
        apptNo: "APT-20260801-01",
        patient: "Priya Kumar",
        uhid: "UHID-100234",
        regNo: "–",
        doctor: "Dr. Madhumitha",
        apptOn: "12-08-2026 09:30 AM",
        rawDate: "2026-08-12",
        rawTime: "09:30",
        type: "Online",
        status: "Upcoming",
        gender: "Female",
        age: 29,
        mobile: "9876543210",
        bookedOn: "05-08-2026 11:20 AM",
        dept: "Gynecology",
    },
    {
        id: "2",
        apptNo: "APT-20260801-02",
        patient: "Anitha Raj",
        uhid: "UHID-100987",
        regNo: "–",
        doctor: "Dr. Ravi",
        apptOn: "12-08-2026 10:00 AM",
        rawDate: "2026-08-12",
        rawTime: "10:00",
        type: "Reception",
        status: "Upcoming",
        gender: "Female",
        age: 41,
        mobile: "9884512233",
        bookedOn: "06-08-2026 09:05 AM",
        dept: "Cardiology",
    },
    {
        id: "3",
        apptNo: "APT-20260801-03",
        patient: "Meena Sundar",
        uhid: "–",
        regNo: "REG-55110",
        doctor: "Dr. Ganesh",
        apptOn: "11-08-2026 04:15 PM",
        rawDate: "2026-08-11",
        rawTime: "16:15",
        type: "Phone",
        status: "Visited",
        gender: "Female",
        age: 34,
        mobile: "9790123456",
        bookedOn: "10-08-2026 02:40 PM",
        dept: "Orthopedics",
    },
    {
        id: "4",
        apptNo: "APT-20260801-04",
        patient: "Kavya Iyer",
        uhid: "–",
        regNo: "REG-55144",
        doctor: "Dr. Anu",
        apptOn: "10-08-2026 11:45 AM",
        rawDate: "2026-08-10",
        rawTime: "11:45",
        type: "Online",
        status: "Upcoming",
        gender: "Female",
        age: 26,
        mobile: "9345678901",
        bookedOn: "08-08-2026 04:15 PM",
        dept: "Dermatology",
    },
    {
        id: "5",
        apptNo: "APT-20260801-05",
        patient: "Divya Prasad",
        uhid: "–",
        regNo: "REG-55190",
        doctor: "Dr. Madhumitha",
        apptOn: "09-08-2026 09:00 AM",
        rawDate: "2026-08-09",
        rawTime: "09:00",
        type: "Reception",
        status: "Visited",
        gender: "Female",
        age: 31,
        mobile: "9944556677",
        bookedOn: "02-08-2026 10:00 AM",
        dept: "Gynecology",
    },
];

const INITIAL_PATIENTS_DB: Record<string, PatientProfile[]> = {
    "9876543210": [
        { id: "p1", name: "Manikandan", age: 25, gender: "Male", uhid: "UH202600001", mobile: "9876543210" },
        { id: "p2", name: "Rohit Kumar", age: 27, gender: "Male", uhid: "UH202600002", mobile: "9876543210" },
        { id: "p3", name: "Varun Kumar", age: 23, gender: "Male", uhid: "UH202600003", mobile: "9876543210" },
    ],
    "9884512233": [
        { id: "p4", name: "Anitha Raj", age: 41, gender: "Female", uhid: "UH202600004", mobile: "9884512233" },
    ],
};

const DEPT_DOCTORS_MAP: Record<string, string[]> = {
    Gynecology: ["Dr. Madhumitha", "Dr. Subha"],
    Cardiology: ["Dr. Ravi", "Dr. Suresh"],
    Orthopedics: ["Dr. Ganesh", "Dr. Ramesh"],
    Dermatology: ["Dr. Anu", "Dr. Priya"],
};

const UNIT_SLOTS: Record<string, string[]> = {
    "Unit 1": ["08:00-08:10", "08:10-08:20", "08:20-08:30", "08:30-08:40", "08:40-08:50", "08:50-09:00", "09:00-09:10", "09:10-09:20", "09:20-09:30"],
    "Unit 2": ["09:00-09:10", "09:10-09:20", "09:20-09:30", "09:30-09:40", "09:40-09:50", "09:50-10:00", "10:00-10:10", "10:10-10:20", "10:20-10:30"],
    "Unit 3": ["10:00-10:10", "10:10-10:20", "10:20-10:30", "10:30-10:40", "10:40-10:50", "10:50-11:00", "11:00-11:10", "11:10-11:20", "11:20-11:30"],
    "Unit 4": ["11:00-11:10", "11:10-11:20", "11:20-11:30", "11:30-11:40", "11:40-11:50", "11:50-12:00", "12:00-12:10", "12:10-12:20", "12:20-12:30"],
};

const UNIT_BOOKED: Record<string, string[]> = {
    "Unit 1": ["08:10-08:20", "08:40-08:50"],
    "Unit 2": ["09:20-09:30", "10:00-10:10", "10:10-10:20"],
    "Unit 3": ["10:30-10:40"],
    "Unit 4": ["11:10-11:20", "11:40-11:50", "12:10-12:20"],
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function formatDateTime(dateStr: string, timeStr: string): string {
    if (!dateStr || !timeStr) return "";
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const month = parts[1];
    const year = parts[0];
    const tParts = timeStr.split(":");
    const hours = parseInt(tParts[0], 10);
    const minutes = tParts[1] || "00";
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const padH = String(hours12).padStart(2, "0");
    return `${day}-${month}-${year} ${padH}:${minutes} ${ampm}`;
}

function formatTodayDateTime(): string {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const padH = String(hours12).padStart(2, "0");
    return `${day}-${month}-${year} ${padH}:${minutes} ${ampm}`;
}

function slotTo24(slotStr: string): string {
    if (!slotStr) return "09:30";
    const parts = slotStr.split(" ");
    const timeParts = parts[0].split("-")[0].split(":");
    let h = parseInt(timeParts[0], 10);
    const m = timeParts[1] || "00";
    if (parts[1] === "PM" && h < 12) h += 12;
    if (parts[1] === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}`;
}

// ==========================================
// MAIN APPOINTMENT MODULE COMPONENT
// ==========================================
const AppointmentModule: React.FC = () => {
    // Main Tabs State: "appointments" | "patient"
    const [activeTab, setActiveTab] = useState<"appointments" | "patient">("appointments");

    // Appointments Data State
    const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

    // Search & Filter State
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        apptNo: "",
        patientName: "",
        doctorName: "",
        type: "",
        status: "",
        from: "",
        to: "",
    });
    const [tempFilters, setTempFilters] = useState({ ...filters });

    // Popover Tools state
    const [isToolsPopoverOpen, setIsToolsPopoverOpen] = useState(false);
    const toolsRef = useRef<HTMLDivElement>(null);

    // Drawer States
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Delete Modal State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Add Form State
    const [addForm, setAddForm] = useState({
        patient: "",
        uhid: "",
        regNo: "",
        doctor: "Dr. Madhumitha",
        apptDate: new Date().toISOString().split("T")[0],
        apptTime: "10:00",
        type: "Online" as "Online" | "Reception" | "Phone",
        status: "Upcoming" as "Upcoming" | "Visited" | "Cancelled",
    });

    // Edit Form State
    const [editForm, setEditForm] = useState<Appointment | null>(null);

    // ----------------------------------------------------
    // PATIENT BOOKING MODULE STATES
    // ----------------------------------------------------
    const [patientsDb, setPatientsDb] = useState(INITIAL_PATIENTS_DB);
    const [uhidCounter, setUhidCounter] = useState(5);
    const [patientStep, setPatientStep] = useState<"search" | "select" | "register" | "book">("search");
    const [searchMobile, setSearchMobile] = useState("");
    const [selectedPatientProfile, setSelectedPatientProfile] = useState<PatientProfile | null>(null);

    // New Patient Registration State
    const [regForm, setRegForm] = useState({
        name: "",
        gender: "Male",
        dob: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [regErrors, setRegErrors] = useState({ name: "", dob: "" });

    // Booking Form State
    const [bookDept, setBookDept] = useState("");
    const [bookDoctor, setBookDoctor] = useState("");
    const [bookDate, setBookDate] = useState(new Date().toISOString().split("T")[0]);
    const [bookUnit, setBookUnit] = useState("");
    const [bookSlot, setBookSlot] = useState("");
    const [bookSource, setBookSource] = useState<"Reception" | "Phone" | "">("");
    const [bookErrors, setBookErrors] = useState({
        dept: "",
        doctor: "",
        date: "",
        unit: "",
        slot: "",
        source: "",
    });

    // OTP Modal State
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [_generatedOtp, setGeneratedOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    // Success Modal State
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [bookedSuccessData, setBookedSuccessData] = useState<Appointment | null>(null);

    // Close tools popover on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
                setIsToolsPopoverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtered Appointments
    const filteredAppointments = useMemo(() => {
        let result = [...appointments];

        // Global Search
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter(
                (a) =>
                    a.apptNo.toLowerCase().includes(q) ||
                    a.patient.toLowerCase().includes(q) ||
                    a.uhid.toLowerCase().includes(q) ||
                    a.regNo.toLowerCase().includes(q) ||
                    a.doctor.toLowerCase().includes(q) ||
                    a.apptOn.toLowerCase().includes(q) ||
                    a.type.toLowerCase().includes(q) ||
                    a.status.toLowerCase().includes(q)
            );
        }

        // Advanced Drawer Filters
        if (filters.apptNo.trim()) {
            result = result.filter((a) => a.apptNo.toLowerCase().includes(filters.apptNo.toLowerCase().trim()));
        }
        if (filters.patientName.trim()) {
            result = result.filter((a) => a.patient.toLowerCase().includes(filters.patientName.toLowerCase().trim()));
        }
        if (filters.doctorName.trim()) {
            result = result.filter((a) => a.doctor.toLowerCase().includes(filters.doctorName.toLowerCase().trim()));
        }
        if (filters.type) {
            result = result.filter((a) => a.type === filters.type);
        }
        if (filters.status) {
            result = result.filter((a) => a.status === filters.status);
        }
        if (filters.from) {
            result = result.filter((a) => a.rawDate >= filters.from);
        }
        if (filters.to) {
            result = result.filter((a) => a.rawDate <= filters.to);
        }

        return result;
    }, [appointments, search, filters]);

    // Active Filter Flag
    const hasActiveDrawerFilters = Boolean(
        filters.apptNo || filters.patientName || filters.doctorName || filters.type || filters.status || filters.from || filters.to
    );

    // Pagination calculation
    const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));
    const paginatedAppointments = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAppointments.slice(start, start + itemsPerPage);
    }, [filteredAppointments, currentPage, itemsPerPage]);

    const tableObject = {
        setPageSize: (size: number) => {
            setItemsPerPage(size);
            setCurrentPage(1);
        },
        setPageIndex: (index: number) => setCurrentPage(index + 1),
        previousPage: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
        nextPage: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
        getCanPreviousPage: () => currentPage > 1,
        getCanNextPage: () => currentPage < totalPages,
        getState: () => ({ pagination: { pageIndex: currentPage - 1, pageSize: itemsPerPage } }),
    };

    // Export CSV
    const handleExportCSV = () => {
        if (!filteredAppointments.length) {
            notify.validationError("No data to export.");
            return;
        }
        const headers = ["Appointment No", "Patient Name", "UHID No", "Register No", "Doctor Name", "Appointment On", "Type", "Status"];
        const rows = filteredAppointments.map((a) => [
            `"${a.apptNo}"`,
            `"${a.patient}"`,
            `"${a.uhid}"`,
            `"${a.regNo}"`,
            `"${a.doctor}"`,
            `"${a.apptOn}"`,
            `"${a.type}"`,
            `"${a.status}"`,
        ]);
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Appointments_Report_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredAppointments.length} records to CSV`);
        setIsToolsPopoverOpen(false);
    };

    // Print Table
    const handlePrint = () => {
        setIsToolsPopoverOpen(false);
        window.print();
    };

    // ----------------------------------------------------
    // TABLE COLUMNS CONFIGURATION
    // ----------------------------------------------------
    const columns: ColumnDef<Appointment>[] = [
        {
            accessorKey: "apptNo",
            header: "APPOINTMENT NO",
            cell: ({ row }) => <span className="text-[#14213D]">{row.original.apptNo}</span>,
        },
        {
            accessorKey: "patient",
            header: "NAME",
            cell: ({ row }) => <span className="text-foreground">{row.original.patient}</span>,
        },
        {
            accessorKey: "uhid",
            header: "UHID NO",
            cell: ({ row }) => (
                <span className={row.original.uhid === "–" ? "text-muted-foreground opacity-60" : "text-muted-foreground "}>
                    {row.original.uhid}
                </span>
            ),
        },
        {
            accessorKey: "regNo",
            header: "REGISTER NO",
            cell: ({ row }) => (
                <span className={row.original.regNo === "–" ? "text-muted-foreground opacity-60" : "text-muted-foreground "}>
                    {row.original.regNo}
                </span>
            ),
        },
        {
            accessorKey: "doctor",
            header: "DOCTOR NAME",
            cell: ({ row }) => <span>{row.original.doctor}</span>,
        },
        {
            accessorKey: "apptOn",
            header: "APPOINTMENT ON",
            cell: ({ row }) => <span className="whitespace-nowrap text-xs">{row.original.apptOn}</span>,
        },
        {
            accessorKey: "type",
            header: "TYPE",
            cell: ({ row }) => {
                const type = row.original.type;
                let colorClasses = "bg-[#e8f1fb] text-[#2952CC]";
                if (type === "Reception") colorClasses = "bg-[#eef7ee] text-[#1f8a4c]";
                if (type === "Phone") colorClasses = "bg-[#fdf0e6] text-[#b0631f]";
                return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClasses}`}>{type}</span>;
            },
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => {
                const status = row.original.status;
                let colorClasses = "bg-[#fff6e0] text-[#8a6d00]";
                if (status === "Visited") colorClasses = "bg-[#e6f4ea] text-[#1f8a4c]";
                if (status === "Cancelled") colorClasses = "bg-[#fef2f2] text-[#dc2626]";
                return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${colorClasses}`}>{status}</span>;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">ACTIONS</div>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger >
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedAppointment(item);
                                        setIsViewDrawerOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Eye className="mr-2 h-4 w-4 text-blue-600" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setEditForm({ ...item });
                                        setIsEditDrawerOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Pencil className="mr-2 h-4 w-4 text-slate-600" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setDeleteTargetId(item.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Add Appointment Handler
    const handleSaveAddAppointment = () => {
        if (!addForm.patient || !addForm.doctor || !addForm.apptDate || !addForm.apptTime) {
            toast.error("Please fill in all required fields (*)");
            return;
        }
        const numStr = String(appointments.length + 1).padStart(2, "0");
        const dateCompact = addForm.apptDate.replace(/-/g, "");
        const apptNo = `APT-${dateCompact}-${numStr}`;
        const formattedOn = formatDateTime(addForm.apptDate, addForm.apptTime);

        const newAppt: Appointment = {
            id: String(Date.now()),
            apptNo,
            patient: addForm.patient,
            uhid: addForm.uhid.trim() || "–",
            regNo: addForm.regNo.trim() || "–",
            doctor: addForm.doctor,
            apptOn: formattedOn,
            rawDate: addForm.apptDate,
            rawTime: addForm.apptTime,
            type: addForm.type,
            status: addForm.status,
            bookedOn: formatTodayDateTime(),
        };

        setAppointments([newAppt, ...appointments]);
        setIsAddDrawerOpen(false);
        toast.success(`Appointment ${apptNo} created successfully!`);
    };

    // Save Edit Handler
    const handleSaveEditAppointment = () => {
        if (!editForm || !editForm.patient || !editForm.doctor || !editForm.rawDate || !editForm.rawTime) {
            toast.error("Please fill in all required fields (*)");
            return;
        }
        const formattedOn = formatDateTime(editForm.rawDate, editForm.rawTime);
        const updated = {
            ...editForm,
            apptOn: formattedOn,
            uhid: editForm.uhid.trim() || "–",
            regNo: editForm.regNo.trim() || "–",
        };

        setAppointments(appointments.map((a) => (a.id === editForm.id ? updated : a)));
        setIsEditDrawerOpen(false);
        toast.success(`Appointment ${editForm.apptNo} updated!`);
    };

    // Delete Confirmation Handler
    const handleConfirmDelete = () => {
        if (deleteTargetId) {
            setAppointments(appointments.filter((a) => a.id !== deleteTargetId));
            setDeleteTargetId(null);
            setIsDeleteDialogOpen(false);
            notify.deleteSuccess("Appointment deleted successfully.");
        }
    };

    // ----------------------------------------------------
    // PATIENT MODULE LOGIC HANDLERS
    // ----------------------------------------------------
    const handleSearchMobile = () => {
        if (searchMobile.length !== 10) return;
        const list = patientsDb[searchMobile];
        if (list && list.length > 0) {
            setPatientStep("select");
        } else {
            setRegForm({
                name: "",
                gender: "Male",
                dob: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
            });
            setRegErrors({ name: "", dob: "" });
            setPatientStep("register");
        }
    };

    const handleRegisterPatient = () => {
        let valid = true;
        const errors = { name: "", dob: "" };
        if (!regForm.name.trim()) {
            errors.name = "Please enter full name.";
            valid = false;
        }
        if (!regForm.dob) {
            errors.dob = "Please select date of birth.";
            valid = false;
        }
        setRegErrors(errors);
        if (!valid) return;

        // Calculate age
        const diff = Date.now() - new Date(regForm.dob).getTime();
        const ageDate = new Date(diff);
        const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970) || 25;
        const genUhid = `UH2026${String(uhidCounter).padStart(5, "0")}`;
        setUhidCounter((prev) => prev + 1);

        const newProfile: PatientProfile = {
            id: `p${Date.now()}`,
            name: regForm.name.trim(),
            age: calculatedAge,
            gender: regForm.gender,
            uhid: genUhid,
            mobile: searchMobile,
        };

        setPatientsDb((prev) => ({
            ...prev,
            [searchMobile]: [...(prev[searchMobile] || []), newProfile],
        }));

        setSelectedPatientProfile(newProfile);
        setBookDept("");
        setBookDoctor("");
        setBookDate(new Date().toISOString().split("T")[0]);
        setBookUnit("");
        setBookSlot("");
        setBookSource("");
        setBookErrors({ dept: "", doctor: "", date: "", unit: "", slot: "", source: "" });
        setPatientStep("book");
    };

    const handleConfirmBookClick = () => {
        let valid = true;
        const errs = { dept: "", doctor: "", date: "", unit: "", slot: "", source: "" };
        if (!bookDept) {
            errs.dept = "Please choose department.";
            valid = false;
        }
        if (!bookDoctor) {
            errs.doctor = "Please select doctor.";
            valid = false;
        }
        if (!bookDate) {
            errs.date = "Please select appointment date.";
            valid = false;
        }
        if (!bookUnit) {
            errs.unit = "Please select unit.";
            valid = false;
        }
        if (!bookSlot) {
            errs.slot = "Please select an available time slot.";
            valid = false;
        }
        if (!bookSource) {
            errs.source = "Please select booking source.";
            valid = false;
        }
        setBookErrors(errs);
        if (!valid) return;

        // Generate random 4-digit OTP
        const genOtp = String(Math.floor(1000 + Math.random() * 9000));
        setGeneratedOtp(genOtp);
        setOtpValue(genOtp);
        setOtpError("");
        setIsOtpModalOpen(true);
    };

    const handleVerifyOtp = () => {
        if (otpValue.trim().length !== 4) {
            setOtpError("Please enter valid 4-digit OTP.");
            return;
        }
        setIsOtpModalOpen(false);

        if (!selectedPatientProfile) return;

        const apptNo = `APT-${bookDate.replace(/-/g, "")}-0${appointments.length + 1}`;
        const formattedOn = formatDateTime(bookDate, slotTo24(bookSlot));

        const newAppt: Appointment = {
            id: String(Date.now()),
            apptNo,
            patient: selectedPatientProfile.name,
            uhid: selectedPatientProfile.uhid,
            regNo: "–",
            doctor: bookDoctor,
            apptOn: formattedOn,
            rawDate: bookDate,
            rawTime: slotTo24(bookSlot),
            type: bookSource as "Reception" | "Phone",
            status: "Upcoming",
            gender: selectedPatientProfile.gender,
            age: selectedPatientProfile.age,
            mobile: selectedPatientProfile.mobile,
            bookedOn: formatTodayDateTime(),
            dept: bookDept,
        };

        setAppointments([newAppt, ...appointments]);
        setBookedSuccessData(newAppt);
        setIsSuccessModalOpen(true);
    };

    const resetPatientFlow = () => {
        setSearchMobile("");
        setSelectedPatientProfile(null);
        setPatientStep("search");
    };

    return (
        <div className="space-y-5">
            {/* Module Header Bar matching Application Architecture */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        style={{
                            background: "var(--side-menu)",
                            color: "var(--blue-text-color)",
                        }}
                    >
                        <CalendarClock className="h-5 w-5" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[17px] font-semibold text-foreground">Appointments & Patient Booking</h1>
                            <Badge variant="secondary" className="text-xs">
                                {filteredAppointments.length} Records
                            </Badge>
                        </div>
                        <p className="text-[12.5px] text-muted-foreground">
                            Manage doctor appointments, patient registration, and slot bookings
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Button
                        variant={activeTab === "appointments" ? "default" : "outline"}
                        onClick={() => setActiveTab("appointments")}
                        className="cursor-pointer text-[13px]"
                        style={activeTab === "appointments" ? { background: "var(--blue-btn)" } : undefined}
                    >
                        Appointments List
                    </Button>

                    <Button
                        variant={activeTab === "patient" ? "default" : "outline"}
                        onClick={() => {
                            setActiveTab("patient");
                            resetPatientFlow();
                        }}
                        className="cursor-pointer text-[13px]"
                        style={activeTab === "patient" ? { background: "var(--blue-btn)" } : undefined}
                    >
                        <UserPlus className="h-4 w-4 mr-1.5" /> Book Appointment
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden p-6">
                {/* ==================================================== */}
                {/* TAB 1: APPOINTMENTS ADMIN LIST VIEW */}
                {/* ==================================================== */}
                {activeTab === "appointments" && (
                    <div>
                        {/* Header Toolbar Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-foreground relative inline-block pb-1">
                                    Appointments
                                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-blue-600 rounded-full"></span>
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
                                {/* Search Box Pill */}
                                <div className="shrink-0">
                                    <TableSearch
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(val) => {
                                            setSearch(val);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>

                                {/* Horizontal Options Popover Trigger */}
                                <div className="relative" ref={toolsRef}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsToolsPopoverOpen(!isToolsPopoverOpen)}
                                        className={`h-9 w-9 cursor-pointer ${hasActiveDrawerFilters ? "border-blue-600 text-blue-600 bg-blue-50/50" : ""
                                            }`}
                                        title="Options Menu"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </Button>

                                    {/* Options Menu Popover Dropdown */}
                                    {isToolsPopoverOpen && (
                                        <div className="absolute right-0 top-11 bg-background border border-border rounded-xl shadow-lg p-1.5 flex items-center gap-1 z-50">
                                            <button
                                                onClick={() => {
                                                    setIsToolsPopoverOpen(false);
                                                    setTempFilters({ ...filters });
                                                    setIsFilterDrawerOpen(true);
                                                }}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-blue-600 transition cursor-pointer"
                                                title="Filter Appointments"
                                            >
                                                <Filter className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={handleExportCSV}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-green-600 transition cursor-pointer"
                                                title="Export to Excel / CSV"
                                            >
                                                <FileSpreadsheet className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={handlePrint}
                                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-purple-600 transition cursor-pointer"
                                                title="Print Appointments"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Primary Add Appointment Button */}
                                <Button
                                    onClick={() => {
                                        setAddForm({
                                            patient: "",
                                            uhid: "",
                                            regNo: "",
                                            doctor: "Dr. Madhumitha",
                                            apptDate: new Date().toISOString().split("T")[0],
                                            apptTime: "10:00",
                                            type: "Online",
                                            status: "Upcoming",
                                        });
                                        setIsAddDrawerOpen(true);
                                    }}
                                    className="h-9 px-4 text-white font-medium cursor-pointer"
                                    style={{ background: "var(--blue-btn)" }}
                                    title="Add Appointment"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                </Button>
                            </div>
                        </div>

                        {/* Active Drawer Filters Reset Indicator */}
                        {hasActiveDrawerFilters && (
                            <div className="flex items-center gap-2 mb-4 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                                <span className="font-semibold">Active Filters:</span>
                                {filters.apptNo && <Badge variant="secondary">Appt No: {filters.apptNo}</Badge>}
                                {filters.patientName && <Badge variant="secondary">Patient: {filters.patientName}</Badge>}
                                {filters.doctorName && <Badge variant="secondary">Doctor: {filters.doctorName}</Badge>}
                                {filters.type && <Badge variant="secondary">Type: {filters.type}</Badge>}
                                {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
                                {filters.from && <Badge variant="secondary">From: {filters.from}</Badge>}
                                {filters.to && <Badge variant="secondary">To: {filters.to}</Badge>}
                                <button
                                    onClick={() =>
                                        setFilters({
                                            apptNo: "",
                                            patientName: "",
                                            doctorName: "",
                                            type: "",
                                            status: "",
                                            from: "",
                                            to: "",
                                        })
                                    }
                                    className="ml-auto text-blue-600 hover:underline font-semibold cursor-pointer"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Reusable Data Table Component */}
                        <DataTable columns={columns} data={paginatedAppointments} />

                        {/* Reusable Pagination Component */}
                        <div className="mt-4 border-t border-border pt-4">
                            <Pagination table={tableObject} totalCount={filteredAppointments.length} />
                        </div>
                    </div>
                )}

                {/* ==================================================== */}
                {/* TAB 2: PATIENT BOOKING MODULE FLOW */}
                {/* ==================================================== */}
                {activeTab === "patient" && (
                    <div className="max-w-3xl mx-auto">
                        {/* Step Progress Indicator Bar */}
                        <div className="flex items-center justify-start gap-4 p-3.5 px-5 bg-card border border-border rounded-lg mb-6">
                            <div className={`flex items-center gap-2 text-sm font-semibold ${patientStep !== "book" ? "text-blue-600" : "text-emerald-600"}`}>
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${patientStep !== "book" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                                        }`}
                                >
                                    1
                                </span>
                                <span>{patientStep === "register" ? "Register Patient" : "Select Patient"}</span>
                            </div>

                            <ChevronRight className="h-4 w-4 text-muted-foreground" />

                            <div className={`flex items-center gap-2 text-sm font-semibold ${patientStep === "book" ? "text-blue-600" : "text-muted-foreground"}`}>
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${patientStep === "book" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800"
                                        }`}
                                >
                                    2
                                </span>
                                <span>Book Appointment</span>
                            </div>
                        </div>

                        {/* STEP 1A: SEARCH MOBILE SCREEN */}
                        {patientStep === "search" && (
                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden max-w-md mx-auto">
                                <div className="p-5 text-white" style={{ background: "var(--sidebar-top-bg)" }}>
                                    <h3 className="text-base font-bold">Search Patient</h3>
                                    <p className="text-xs text-slate-300">Enter the registered 10-digit mobile number</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <Field label="Search Mobile Number" required>
                                        <div className="flex items-center border border-border rounded-md overflow-hidden bg-background focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20">
                                            <span className="px-3 bg-muted font-bold text-foreground text-sm border-r border-border h-9 flex items-center">
                                                +91
                                            </span>
                                            <TextField
                                                placeholder="Enter 10-digit mobile number"
                                                value={searchMobile}
                                                onChange={(val) => setSearchMobile(val.replace(/\D/g, ""))}
                                            />
                                        </div>
                                    </Field>
                                    <Button
                                        onClick={handleSearchMobile}
                                        disabled={searchMobile.length !== 10}
                                        className="w-full h-10 text-white font-semibold cursor-pointer"
                                        style={{ background: "var(--blue-btn)" }}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 1B: SELECT PATIENT CARDS SCREEN */}
                        {patientStep === "select" && (
                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden max-w-md mx-auto">
                                <div className="p-5 text-white" style={{ background: "var(--sidebar-top-bg)" }}>
                                    <h3 className="text-base font-bold">Select Patient</h3>
                                    <p className="text-xs text-slate-300">Profiles linked to +91 {searchMobile}</p>
                                </div>

                                <div className="p-5 space-y-3">
                                    {(patientsDb[searchMobile] || []).map((p) => {
                                        const isSelected = selectedPatientProfile?.id === p.id;
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedPatientProfile(p)}
                                                className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${isSelected
                                                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-600/20"
                                                    : "border-border hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-bold text-foreground text-base">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">{p.age}Y / {p.gender}</div>
                                                    <div className="text-xs text-blue-600 font-semibold mt-1">UHID : {p.uhid}</div>
                                                </div>
                                                {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add New Patient Trigger */}
                                <button
                                    onClick={() => {
                                        setRegForm({
                                            name: "",
                                            gender: "Male",
                                            dob: "",
                                            address: "",
                                            city: "",
                                            state: "",
                                            pincode: "",
                                        });
                                        setRegErrors({ name: "", dob: "" });
                                        setPatientStep("register");
                                    }}
                                    className="w-full p-4 border-t border-b border-border bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-left flex items-center gap-3 cursor-pointer transition-colors"
                                >
                                    <span className="text-blue-600 font-bold text-lg">+</span>
                                    <div>
                                        <div className="font-bold text-sm text-foreground">Add Patient</div>
                                        <div className="text-xs text-muted-foreground">Register new patient</div>
                                    </div>
                                </button>

                                <div className="p-5">
                                    <Button
                                        onClick={() => {
                                            if (selectedPatientProfile) {
                                                setBookDept("");
                                                setBookDoctor("");
                                                setBookDate(new Date().toISOString().split("T")[0]);
                                                setBookUnit("");
                                                setBookSlot("");
                                                setBookSource("");
                                                setBookErrors({ dept: "", doctor: "", date: "", unit: "", slot: "", source: "" });
                                                setPatientStep("book");
                                            }
                                        }}
                                        disabled={!selectedPatientProfile}
                                        className="w-full h-10 text-white font-semibold cursor-pointer"
                                        style={{ background: "var(--blue-btn)" }}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 1C: REGISTER PATIENT SCREEN */}
                        {patientStep === "register" && (
                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden max-w-xl mx-auto">
                                <div className="p-5 text-white" style={{ background: "var(--sidebar-top-bg)" }}>
                                    <h3 className="text-lg font-bold">Register Patient</h3>
                                    <p className="text-xs text-slate-300">New account setup</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-xs text-muted-foreground">
                                        We couldn't find an account for this number. Please complete your details to continue.
                                    </p>

                                    <Field label="MOBILE NUMBER">
                                        <div className="px-3 py-2 border border-border rounded bg-muted text-muted-foreground text-sm font-semibold">
                                            +91 {searchMobile}
                                        </div>
                                    </Field>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="FULL NAME" required>
                                            <TextField
                                                placeholder="e.g. Priya Kumar"
                                                value={regForm.name}
                                                onChange={(val) => setRegForm({ ...regForm, name: val })}
                                            />
                                            {regErrors.name && <span className="text-xs text-red-500 mt-1 block">{regErrors.name}</span>}
                                        </Field>

                                        <Field label="GENDER">
                                            <SelectField
                                                options={["Male", "Female", "Other"]}
                                                value={regForm.gender}
                                                onChange={(val) => setRegForm({ ...regForm, gender: val })}
                                            />
                                        </Field>

                                        <Field label="DATE OF BIRTH" required>
                                            <DateField
                                                value={regForm.dob ? new Date(regForm.dob) : undefined}
                                                onChange={(d) => setRegForm({ ...regForm, dob: d ? format(d, "yyyy-MM-dd") : "" })}
                                            />
                                            {regErrors.dob && <span className="text-xs text-red-500 mt-1 block">{regErrors.dob}</span>}
                                        </Field>

                                        <Field label="AGE">
                                            <div className="px-3 py-2 border border-border rounded bg-muted text-muted-foreground text-sm font-semibold h-9 flex items-center">
                                                {regForm.dob
                                                    ? `${Math.abs(new Date(Date.now() - new Date(regForm.dob).getTime()).getUTCFullYear() - 1970)} Years`
                                                    : "—"}
                                            </div>
                                        </Field>

                                        <Field label="ADDRESS">
                                            <TextField
                                                placeholder="House no, street"
                                                value={regForm.address}
                                                onChange={(val) => setRegForm({ ...regForm, address: val })}
                                            />
                                        </Field>

                                        <Field label="CITY">
                                            <TextField
                                                placeholder="e.g. Chennai"
                                                value={regForm.city}
                                                onChange={(val) => setRegForm({ ...regForm, city: val })}
                                            />
                                        </Field>

                                        <Field label="STATE">
                                            <TextField
                                                placeholder="e.g. Tamil Nadu"
                                                value={regForm.state}
                                                onChange={(val) => setRegForm({ ...regForm, state: val })}
                                            />
                                        </Field>

                                        <Field label="PIN CODE">
                                            <TextField
                                                placeholder="6-digit PIN"
                                                value={regForm.pincode}
                                                onChange={(val) => setRegForm({ ...regForm, pincode: val.replace(/\D/g, "") })}
                                            />
                                        </Field>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if ((patientsDb[searchMobile] || []).length > 0) {
                                                    setPatientStep("select");
                                                } else {
                                                    setPatientStep("search");
                                                }
                                            }}
                                            className="flex-1 cursor-pointer"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleRegisterPatient}
                                            className="flex-[2] text-white font-semibold cursor-pointer"
                                            style={{ background: "var(--blue-btn)" }}
                                        >
                                            Register & Continue
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: BOOK APPOINTMENT SCREEN */}
                        {patientStep === "book" && selectedPatientProfile && (
                            <div className="space-y-4">
                                {/* Patient Summary Header Bar */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-blue-900 dark:text-blue-200 text-base">
                                            {selectedPatientProfile.name}
                                        </span>
                                        <span className="text-xs font-semibold bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2.5 py-0.5 rounded-full">
                                            {selectedPatientProfile.age}Y / {selectedPatientProfile.gender}
                                        </span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                            UHID: {selectedPatientProfile.uhid}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if ((patientsDb[searchMobile] || []).length > 1) {
                                                setPatientStep("select");
                                            } else {
                                                setPatientStep("search");
                                            }
                                        }}
                                        className="cursor-pointer text-xs"
                                    >
                                        Change Patient
                                    </Button>
                                </div>

                                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-5 text-white" style={{ background: "var(--sidebar-top-bg)" }}>
                                        <h3 className="text-base font-bold">Book Appointment</h3>
                                        <p className="text-xs text-slate-300">Select department, doctor, date, unit, slot, and source</p>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Department" required>
                                                <SelectField
                                                    options={["Gynecology", "Cardiology", "Orthopedics", "Dermatology"]}
                                                    placeholder="Choose Department"
                                                    value={bookDept}
                                                    onChange={(val) => {
                                                        setBookDept(val);
                                                        setBookDoctor("");
                                                        setBookErrors((prev) => ({ ...prev, dept: "" }));
                                                    }}
                                                />
                                                {bookErrors.dept && <span className="text-xs text-red-500 mt-1 block">{bookErrors.dept}</span>}
                                            </Field>

                                            <Field label="Doctor" required>
                                                <SelectField
                                                    options={DEPT_DOCTORS_MAP[bookDept] || []}
                                                    placeholder="Choose Doctor"
                                                    value={bookDoctor}
                                                    onChange={(val) => {
                                                        setBookDoctor(val);
                                                        setBookErrors((prev) => ({ ...prev, doctor: "" }));
                                                    }}
                                                />
                                                {bookErrors.doctor && <span className="text-xs text-red-500 mt-1 block">{bookErrors.doctor}</span>}
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Appointment Date" required>
                                                <DateField
                                                    value={bookDate ? new Date(bookDate) : undefined}
                                                    onChange={(d) => {
                                                        setBookDate(d ? format(d, "yyyy-MM-dd") : "");
                                                        setBookErrors((prev) => ({ ...prev, date: "" }));
                                                    }}
                                                />
                                                {bookErrors.date && <span className="text-xs text-red-500 mt-1 block">{bookErrors.date}</span>}
                                            </Field>

                                            <Field label="Unit" required>
                                                <SelectField
                                                    options={["Unit 1", "Unit 2", "Unit 3", "Unit 4"]}
                                                    placeholder="Choose Unit"
                                                    value={bookUnit}
                                                    onChange={(val) => {
                                                        setBookUnit(val);
                                                        setBookSlot("");
                                                        setBookErrors((prev) => ({ ...prev, unit: "" }));
                                                    }}
                                                />
                                                {bookErrors.unit && <span className="text-xs text-red-500 mt-1 block">{bookErrors.unit}</span>}
                                            </Field>
                                        </div>

                                        {/* Time Slot Grid Section */}
                                        <Field label="Available Time Slots" required>
                                            {!bookUnit ? (
                                                <div className="text-xs text-muted-foreground py-2">
                                                    Please select a Unit to view available time slots.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2 mt-1">
                                                    {(UNIT_SLOTS[bookUnit] || []).map((slot) => {
                                                        const isBooked = (UNIT_BOOKED[bookUnit] || []).includes(slot);
                                                        const isSelected = bookSlot === slot;
                                                        return (
                                                            <button
                                                                key={slot}
                                                                disabled={isBooked}
                                                                onClick={() => {
                                                                    setBookSlot(slot);
                                                                    setBookErrors((prev) => ({ ...prev, slot: "" }));
                                                                }}
                                                                className={`py-2 px-1 text-center text-xs font-semibold rounded border transition-all cursor-pointer ${isBooked
                                                                    ? "bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                                                                    : isSelected
                                                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                                        : "bg-background text-foreground border-border hover:border-blue-500 hover:text-blue-600"
                                                                    }`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <i className="w-3 h-3 rounded bg-background border border-border inline-block"></i> Available
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <i className="w-3 h-3 rounded bg-blue-600 inline-block"></i> Selected
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <i className="w-3 h-3 rounded bg-slate-200 inline-block"></i> Booked/Full
                                                </span>
                                            </div>
                                            {bookErrors.slot && <span className="text-xs text-red-500 mt-1 block">{bookErrors.slot}</span>}
                                        </Field>

                                        {/* Booking Source (Reception / Phone) */}
                                        <Field label="Type" required>
                                            <SelectField
                                                options={["Reception", "Phone"]}
                                                placeholder="Select Type"
                                                value={bookSource}
                                                onChange={(val) => {
                                                    setBookSource(val as "Reception" | "Phone");
                                                    setBookErrors((prev) => ({ ...prev, source: "" }));
                                                }}
                                            />
                                            {bookErrors.source && <span className="text-xs text-red-500 mt-1 block">{bookErrors.source}</span>}
                                        </Field>

                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if ((patientsDb[searchMobile] || []).length > 0) {
                                                        setPatientStep("select");
                                                    } else {
                                                        setPatientStep("search");
                                                    }
                                                }}
                                                className="flex-1 cursor-pointer"
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={handleConfirmBookClick}
                                                className="flex-[2] text-white font-semibold cursor-pointer"
                                                style={{ background: "var(--blue-btn)" }}
                                            >
                                                Confirm & Book Appointment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ==================================================== */}
            {/* FILTER APPOINTMENTS DRAWER */}
            {/* ==================================================== */}
            <CustomPanel
                isOpen={isFilterDrawerOpen}
                title="Filter Appointments"
                onClose={() => setIsFilterDrawerOpen(false)}
                onSave={() => {
                    setFilters({ ...tempFilters });
                    setCurrentPage(1);
                    setIsFilterDrawerOpen(false);
                }}
                saveLabel="Apply Filters"
                width="440px"
            >
                <div className="space-y-4">
                    <Field label="Appointment No">
                        <TextField
                            placeholder="e.g. APT-20260801-01"
                            value={tempFilters.apptNo}
                            onChange={(val) => setTempFilters({ ...tempFilters, apptNo: val })}
                        />
                    </Field>

                    <Field label="Patient Name">
                        <TextField
                            placeholder="Enter patient name"
                            value={tempFilters.patientName}
                            onChange={(val) => setTempFilters({ ...tempFilters, patientName: val })}
                        />
                    </Field>

                    <Field label="Doctor Name">
                        <TextField
                            placeholder="Enter doctor name"
                            value={tempFilters.doctorName}
                            onChange={(val) => setTempFilters({ ...tempFilters, doctorName: val })}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type">
                            <SelectField
                                options={["Online", "Reception", "Phone"]}
                                placeholder="All Types"
                                value={tempFilters.type}
                                onChange={(val) => setTempFilters({ ...tempFilters, type: val })}
                            />
                        </Field>

                        <Field label="Status">
                            <SelectField
                                options={["Upcoming", "Visited", "Cancelled"]}
                                placeholder="All Statuses"
                                value={tempFilters.status}
                                onChange={(val) => setTempFilters({ ...tempFilters, status: val })}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Date From">
                            <DateField
                                value={tempFilters.from ? new Date(tempFilters.from) : undefined}
                                onChange={(d) => setTempFilters({ ...tempFilters, from: d ? format(d, "yyyy-MM-dd") : "" })}
                            />
                        </Field>

                        <Field label="Date To">
                            <DateField
                                value={tempFilters.to ? new Date(tempFilters.to) : undefined}
                                onChange={(d) => setTempFilters({ ...tempFilters, to: d ? format(d, "yyyy-MM-dd") : "" })}
                            />
                        </Field>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setTempFilters({
                                apptNo: "",
                                patientName: "",
                                doctorName: "",
                                type: "",
                                status: "",
                                from: "",
                                to: "",
                            })
                        }
                        className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer pt-2"
                    >
                        Reset Filters
                    </button>
                </div>
            </CustomPanel>

            {/* ==================================================== */}
            {/* ADD APPOINTMENT DRAWER */}
            {/* ==================================================== */}
            <CustomPanel
                isOpen={isAddDrawerOpen}
                title="Add Appointment"
                onClose={() => setIsAddDrawerOpen(false)}
                onSave={handleSaveAddAppointment}
                saveLabel="Save Appointment"
                width="450px"
            >
                <div className="space-y-4">
                    <Field label="Patient Name" required>
                        <TextField
                            placeholder="Enter patient name"
                            value={addForm.patient}
                            onChange={(val) => setAddForm({ ...addForm, patient: val })}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="UHID No">
                            <TextField
                                placeholder="e.g. UHID-100234"
                                value={addForm.uhid}
                                onChange={(val) => setAddForm({ ...addForm, uhid: val })}
                            />
                        </Field>

                        <Field label="Register No">
                            <TextField
                                placeholder="e.g. REG-55110"
                                value={addForm.regNo}
                                onChange={(val) => setAddForm({ ...addForm, regNo: val })}
                            />
                        </Field>
                    </div>

                    <Field label="Doctor Name" required>
                        <SelectField
                            options={["Dr. Madhumitha", "Dr. Ravi", "Dr. Ganesh", "Dr. Anu"]}
                            value={addForm.doctor}
                            onChange={(val) => setAddForm({ ...addForm, doctor: val })}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Appointment Date" required>
                            <DateField
                                value={addForm.apptDate ? new Date(addForm.apptDate) : undefined}
                                onChange={(d) => setAddForm({ ...addForm, apptDate: d ? format(d, "yyyy-MM-dd") : "" })}
                            />
                        </Field>

                        <Field label="Appointment Time" required>
                            <TextField
                                placeholder="10:00"
                                value={addForm.apptTime}
                                onChange={(val) => setAddForm({ ...addForm, apptTime: val })}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Appointment Type" required>
                            <SelectField
                                options={["Online", "Reception", "Phone"]}
                                value={addForm.type}
                                onChange={(val) => setAddForm({ ...addForm, type: val as any })}
                            />
                        </Field>

                        <Field label="Status" required>
                            <SelectField
                                options={["Upcoming", "Visited", "Cancelled"]}
                                value={addForm.status}
                                onChange={(val) => setAddForm({ ...addForm, status: val as any })}
                            />
                        </Field>
                    </div>
                </div>
            </CustomPanel>

            {/* ==================================================== */}
            {/* VIEW APPOINTMENT DRAWER */}
            {/* ==================================================== */}
            <CustomPanel
                isOpen={isViewDrawerOpen}
                title="Appointment Details"
                onClose={() => setIsViewDrawerOpen(false)}
                onSave={() => setIsViewDrawerOpen(false)}
                saveLabel="Close"
                width="450px"
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider pb-1 mb-3 border-b-2 border-blue-100 dark:border-blue-900">
                                Appointment Information
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Appointment Number</label>
                                    <span className="font-semibold text-foreground">{selectedAppointment.apptNo}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Status</label>
                                    <Badge variant="secondary">{selectedAppointment.status}</Badge>
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-bold text-muted-foreground uppercase">Booked On</label>
                                    <span className="text-foreground">{selectedAppointment.bookedOn || "—"}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Appointment Date</label>
                                    <span className="text-foreground">{selectedAppointment.apptOn.split(" ")[0]}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Appointment Time</label>
                                    <span className="text-foreground">{selectedAppointment.apptOn.split(" ").slice(1).join(" ")}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Type</label>
                                    <Badge variant="outline">{selectedAppointment.type}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider pb-1 mb-3 border-b-2 border-blue-100 dark:border-blue-900">
                                Patient Information
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="col-span-2">
                                    <label className="block font-bold text-muted-foreground uppercase">Patient Name</label>
                                    <span className="font-semibold text-foreground text-sm">{selectedAppointment.patient}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">UHID</label>
                                    <span className="text-foreground">{selectedAppointment.uhid}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Registration Number</label>
                                    <span className="text-foreground">{selectedAppointment.regNo}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Gender</label>
                                    <span className="text-foreground">{selectedAppointment.gender || "Female"}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Age</label>
                                    <span className="text-foreground">{selectedAppointment.age || 29} Years</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Mobile Number</label>
                                    <span className="text-foreground">{selectedAppointment.mobile || "9876543210"}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider pb-1 mb-3 border-b-2 border-blue-100 dark:border-blue-900">
                                Doctor Information
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Doctor Name</label>
                                    <span className="font-semibold text-foreground">{selectedAppointment.doctor}</span>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase">Department</label>
                                    <span className="text-foreground">{selectedAppointment.dept || "General Medicine"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CustomPanel>

            {/* ==================================================== */}
            {/* EDIT APPOINTMENT DRAWER */}
            {/* ==================================================== */}
            <CustomPanel
                isOpen={isEditDrawerOpen}
                title="Edit Appointment"
                onClose={() => setIsEditDrawerOpen(false)}
                onSave={handleSaveEditAppointment}
                saveLabel="Update Appointment"
                width="450px"
            >
                {editForm && (
                    <div className="space-y-4">
                        <Field label="Appointment Number">
                            <TextField value={editForm.apptNo} disabled />
                        </Field>

                        <Field label="Patient Name" required>
                            <TextField
                                value={editForm.patient}
                                onChange={(val) => setEditForm({ ...editForm, patient: val })}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="UHID No">
                                <TextField
                                    value={editForm.uhid === "–" ? "" : editForm.uhid}
                                    onChange={(val) => setEditForm({ ...editForm, uhid: val })}
                                />
                            </Field>

                            <Field label="Register No">
                                <TextField
                                    value={editForm.regNo === "–" ? "" : editForm.regNo}
                                    onChange={(val) => setEditForm({ ...editForm, regNo: val })}
                                />
                            </Field>
                        </div>

                        <Field label="Doctor Name" required>
                            <SelectField
                                options={["Dr. Madhumitha", "Dr. Ravi", "Dr. Ganesh", "Dr. Anu"]}
                                value={editForm.doctor}
                                onChange={(val) => setEditForm({ ...editForm, doctor: val })}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Appointment Date" required>
                                <DateField
                                    value={editForm.rawDate ? new Date(editForm.rawDate) : undefined}
                                    onChange={(d) => setEditForm({ ...editForm, rawDate: d ? format(d, "yyyy-MM-dd") : "" })}
                                />
                            </Field>

                            <Field label="Appointment Time" required>
                                <TextField
                                    value={editForm.rawTime}
                                    onChange={(val) => setEditForm({ ...editForm, rawTime: val })}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Appointment Type" required>
                                <SelectField
                                    options={["Online", "Reception", "Phone"]}
                                    value={editForm.type}
                                    onChange={(val) => setEditForm({ ...editForm, type: val as any })}
                                />
                            </Field>

                            <Field label="Status" required>
                                <SelectField
                                    options={["Upcoming", "Visited", "Cancelled"]}
                                    value={editForm.status}
                                    onChange={(val) => setEditForm({ ...editForm, status: val as any })}
                                />
                            </Field>
                        </div>
                    </div>
                )}
            </CustomPanel>

            {/* ==================================================== */}
            {/* DELETE CONFIRMATION DIALOG */}
            {/* ==================================================== */}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Appointment?"
                description="Are you sure you want to delete this appointment? This action cannot be undone."
            />

            {/* ==================================================== */}
            {/* BOOKING OTP MODAL DIALOG POPUP */}
            {/* ==================================================== */}
            {isOtpModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-border animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsOtpModalOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl font-bold cursor-pointer"
                        >
                            ✕
                        </button>
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xl mb-3">
                            🔒
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-1">Confirm your appointment</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Enter the OTP sent to <b className="text-foreground">+91 {selectedPatientProfile?.mobile}</b>
                        </p>

                        <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                            <input
                                type="text"
                                maxLength={4}
                                value={otpValue}
                                onChange={(e) => {
                                    setOtpValue(e.target.value.replace(/\D/g, ""));
                                    setOtpError("");
                                }}
                                className="w-full h-12 bg-background border border-border rounded-lg text-center text-2xl font-extrabold tracking-[12px] text-blue-900 dark:text-blue-100 outline-none focus:border-blue-600"
                                placeholder="••••"
                            />
                            {otpError && <span className="text-xs text-red-500 mt-2 block text-center font-medium">{otpError}</span>}
                        </div>

                        <Button
                            onClick={handleVerifyOtp}
                            className="w-full h-11 text-white font-bold text-sm cursor-pointer"
                            style={{ background: "var(--blue-btn)" }}
                        >
                            Verify & Continue
                        </Button>

                        <div className="text-center mt-3">
                            <button
                                onClick={() => {
                                    const newOtp = String(Math.floor(1000 + Math.random() * 9000));
                                    setGeneratedOtp(newOtp);
                                    setOtpValue(newOtp);
                                    setOtpError("");
                                    toast.info("Resent new OTP to mobile number!");
                                }}
                                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* BOOKING SUCCESS MODAL DIALOG POPUP */}
            {/* ==================================================== */}
            {isSuccessModalOpen && bookedSuccessData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-1">Appointment Booked Successfully!</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Appointment Number: <b className="text-blue-600 font-bold">{bookedSuccessData.apptNo}</b>
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-4 text-left space-y-2 mb-6 text-xs text-muted-foreground">
                            <div>
                                Patient: <b className="text-foreground font-semibold">{bookedSuccessData.patient} ({bookedSuccessData.uhid})</b>
                            </div>
                            <div>
                                Doctor: <b className="text-foreground font-semibold">{bookedSuccessData.doctor} ({bookedSuccessData.dept || "General"} - {bookUnit || "Unit 1"})</b>
                            </div>
                            <div>
                                Date & Slot: <b className="text-foreground font-semibold">{bookedSuccessData.rawDate} @ {bookSlot || "09:30 AM"}</b>
                            </div>
                            <div>
                                Source: <b className="text-foreground font-semibold">{bookedSuccessData.type}</b>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsSuccessModalOpen(false);
                                    setActiveTab("appointments");
                                }}
                                className="cursor-pointer text-xs"
                            >
                                View in Appointments Tab
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsSuccessModalOpen(false);
                                    resetPatientFlow();
                                }}
                                className="text-white text-xs font-semibold cursor-pointer"
                                style={{ background: "var(--blue-btn)" }}
                            >
                                Book Another Appointment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentModule;