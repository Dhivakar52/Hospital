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
    CalendarClock,
    UserPlus,
    ArrowLeft,
    ArrowRight,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/common/Datatable";
import Pagination from "@/common/Pagination";
import TableSearch from "@/common/TableSearch";
import CustomPanel from "@/common/CustomPanel";
import { DeleteConfirmationDialog } from "@/common/DeleteConfirmationDialog";
import { ActionMenu } from "@/common/ActionMenu";
import { Field, TextField, SelectField, DateField, DobDateField } from "@/components/FormPrimitives";
import { notify } from "@/lib/notify";
import { toast } from "@/components/ui/toast";
import { mockAppointments } from "@/data/mockAppointments";

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

// const INITIAL_APPOINTMENTS: Appointment[] = [
//     {
//         id: "1",
//         apptNo: "APT-20260801-01",
//         patient: "Priya Kumar",
//         uhid: "UHID-100234",
//         regNo: "–",
//         doctor: "Dr. Madhumitha",
//         apptOn: "12-08-2026 09:30 AM",
//         rawDate: "2026-08-12",
//         rawTime: "09:30",
//         type: "Online",
//         status: "Upcoming",
//         gender: "Female",
//         age: 29,
//         mobile: "9876543210",
//         bookedOn: "05-08-2026 11:20 AM",
//         dept: "Gynecology",
//     },
//     {
//         id: "2",
//         apptNo: "APT-20260801-02",
//         patient: "Anitha Raj",
//         uhid: "UHID-100987",
//         regNo: "–",
//         doctor: "Dr. Ravi",
//         apptOn: "12-08-2026 10:00 AM",
//         rawDate: "2026-08-12",
//         rawTime: "10:00",
//         type: "Reception",
//         status: "Upcoming",
//         gender: "Female",
//         age: 41,
//         mobile: "9884512233",
//         bookedOn: "06-08-2026 09:05 AM",
//         dept: "Cardiology",
//     },
//     {
//         id: "3",
//         apptNo: "APT-20260801-03",
//         patient: "Meena Sundar",
//         uhid: "–",
//         regNo: "REG-55110",
//         doctor: "Dr. Ganesh",
//         apptOn: "11-08-2026 04:15 PM",
//         rawDate: "2026-08-11",
//         rawTime: "16:15",
//         type: "Phone",
//         status: "Visited",
//         gender: "Female",
//         age: 34,
//         mobile: "9790123456",
//         bookedOn: "10-08-2026 02:40 PM",
//         dept: "Orthopedics",
//     },
//     {
//         id: "4",
//         apptNo: "APT-20260801-04",
//         patient: "Kavya Iyer",
//         uhid: "–",
//         regNo: "REG-55144",
//         doctor: "Dr. Anu",
//         apptOn: "10-08-2026 11:45 AM",
//         rawDate: "2026-08-10",
//         rawTime: "11:45",
//         type: "Online",
//         status: "Upcoming",
//         gender: "Female",
//         age: 26,
//         mobile: "9345678901",
//         bookedOn: "08-08-2026 04:15 PM",
//         dept: "Dermatology",
//     },
//     {
//         id: "5",
//         apptNo: "APT-20260801-05",
//         patient: "Divya Prasad",
//         uhid: "–",
//         regNo: "REG-55190",
//         doctor: "Dr. Madhumitha",
//         apptOn: "09-08-2026 09:00 AM",
//         rawDate: "2026-08-09",
//         rawTime: "09:00",
//         type: "Reception",
//         status: "Visited",
//         gender: "Female",
//         age: 31,
//         mobile: "9944556677",
//         bookedOn: "02-08-2026 10:00 AM",
//         dept: "Gynecology",
//     },
// ];

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
    const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

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
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
    // PATIENT BOOKING 4-STEP WIZARD STATES
    // ----------------------------------------------------
    type WizardStepKey = 1 | 2 | 3 | 4;
    const [wizardStep, setWizardStep] = useState<WizardStepKey>(1);

    const [patientsDb, _setPatientsDb] = useState(INITIAL_PATIENTS_DB);
    const [selectedPatientProfile, setSelectedPatientProfile] = useState<PatientProfile | null>(null);

    // Step 1: Mobile Search State
    const [searchMobile, setSearchMobile] = useState("");
    const [searchMobileError, setSearchMobileError] = useState("");
    const [isSearchCompleted, setIsSearchCompleted] = useState(false);
    const [searchStatus, setSearchStatus] = useState<"idle" | "found" | "not_found">("idle");
    const [foundPatients, setFoundPatients] = useState<PatientProfile[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // Step 2: Patient Details Form State
    const [patientForm, setPatientForm] = useState({
        mobile: "",
        title: "Mr",
        name: "",
        gender: "Male",
        dob: "",
        age: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        bloodGroup: "O+",
        category: "General",
    });
    const [patientErrors, setPatientErrors] = useState({
        mobile: "",
        name: "",
    });

    // Step 3: Appointment Details Form State
    const [bookDept, setBookDept] = useState("");
    const [bookDoctor, setBookDoctor] = useState("");
    const [bookDate, setBookDate] = useState(new Date().toISOString().split("T")[0]);
    const [bookUnit, setBookUnit] = useState("");
    const [bookSlot, setBookSlot] = useState("");
    const [bookSource, setBookSource] = useState<"Reception" | "Phone" | "Online" | "">("Reception");
    const [bookPriority, setBookPriority] = useState("Consultation");
    const [bookRemarks, setBookRemarks] = useState("");
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
                        <ActionMenu
                            item={item}
                            onView={(p) => {
                                setSelectedAppointment(p);
                                setIsViewDrawerOpen(true);
                            }}
                            onEdit={(p) => {
                                setEditForm({ ...p });
                                setIsEditDrawerOpen(true);
                            }}
                            onPrint={() => {
                                handlePrint();
                            }}
                            onDelete={(p) => {
                                setAppointments((prev) => prev.filter((a) => a.id !== p.id));
                                notify.deleteSuccess("Appointment deleted successfully.");
                            }}
                        />
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
    // SEARCH & WIZARD NAVIGATION HANDLERS
    // ----------------------------------------------------
    const isValidMobileNumber = (mobile: string): boolean => {
        return mobile.length === 10 && ["6", "7", "8", "9"].includes(mobile[0]) && /^\d{10}$/.test(mobile);
    };

    const getMobileValidationErrorMsg = (mobile: string): string => {
        if (!mobile) {
            return "Mobile Number is required.";
        }
        if (!["6", "7", "8", "9"].includes(mobile[0])) {
            return "Mobile Number must start with 6, 7, 8, or 9.";
        }
        if (mobile.length < 10) {
            return "Mobile Number must be exactly 10 digits.";
        }
        if (mobile.length > 10) {
            return "Mobile Number cannot exceed 10 digits.";
        }
        return "";
    };

    const handleExecuteSearch = () => {
        if (!validateStep1Search()) {
            return;
        }
        const listFromDb = patientsDb[searchMobile] || [];
        const matchingAppts = appointments.filter((a) => a.mobile === searchMobile);
        const combined: PatientProfile[] = [...listFromDb];

        matchingAppts.forEach((a) => {
            if (!combined.some((p) => (p.uhid && a.uhid && p.uhid === a.uhid) || p.name.toLowerCase() === a.patient.toLowerCase())) {
                combined.push({
                    id: a.id,
                    name: a.patient,
                    age: a.age || 25,
                    gender: a.gender || "Male",
                    uhid: a.uhid || `UH2026${String(Math.floor(10000 + Math.random() * 90000))}`,
                    mobile: searchMobile,
                });
            }
        });

        if (combined.length > 0) {
            setFoundPatients(combined);
            const matched = combined[0];
            setSelectedPatientId(matched.id);
            setSelectedPatientProfile(matched);
            setPatientForm({
                mobile: searchMobile,
                title: "Mr",
                name: matched.name,
                gender: matched.gender,
                dob: "",
                age: String(matched.age),
                address: "12, Main Road",
                city: "Chennai",
                state: "Tamil Nadu",
                pincode: "600028",
                bloodGroup: "O+",
                category: "General",
            });
            setSearchStatus("found");
            setIsSearchCompleted(true);
            toast.success(`${combined.length} patient profile(s) found for +91 ${searchMobile}`);
        } else {
            setFoundPatients([]);
            setSelectedPatientId(null);
            setSelectedPatientProfile(null);
            setPatientForm({
                mobile: searchMobile,
                title: "Mr",
                name: "",
                gender: "Male",
                dob: "",
                age: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                bloodGroup: "O+",
                category: "General",
            });
            setSearchStatus("not_found");
            setIsSearchCompleted(true);
            setWizardStep(2);
            toast.info("Patient not found. Please enter new patient details.");
        }
    };

    const handleSelectPatientCard = (patient: PatientProfile) => {
        setSelectedPatientId(patient.id);
        setSelectedPatientProfile(patient);
        setPatientForm({
            mobile: searchMobile,
            title: "Mr",
            name: patient.name,
            gender: patient.gender,
            dob: "",
            age: String(patient.age),
            address: "12, Main Road",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600028",
            bloodGroup: "O+",
            category: "General",
        });
    };

    const handleAddNewPatientFromSearch = () => {
        setSelectedPatientId(null);
        setSelectedPatientProfile(null);
        setPatientForm({
            mobile: searchMobile,
            title: "Mr",
            name: "",
            gender: "Male",
            dob: "",
            age: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            bloodGroup: "O+",
            category: "General",
        });
        setSearchStatus("not_found");
        setWizardStep(2);
        toast.info("Registering new patient details.");
    };

    const handleContinueFromPatientSelection = () => {
        if (!selectedPatientId || !selectedPatientProfile) {
            toast.error("Please select a patient profile to continue.");
            return;
        }
        setWizardStep(3);
    };

    const validateStep1Search = (): boolean => {
        const errorMsg = getMobileValidationErrorMsg(searchMobile);
        if (errorMsg) {
            setSearchMobileError(errorMsg);
            return false;
        }
        setSearchMobileError("");
        return true;
    };

    const validateStep2Patient = (): boolean => {
        let valid = true;
        const errs = { mobile: "", name: "" };

        const mobileErr = getMobileValidationErrorMsg(patientForm.mobile);
        if (mobileErr) {
            errs.mobile = mobileErr;
            valid = false;
        }
        if (!patientForm.name.trim()) {
            errs.name = "Please enter patient name.";
            valid = false;
        }

        setPatientErrors(errs);
        return valid;
    };

    const validateStep3Appointment = (): boolean => {
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
            errs.source = "Please select booking type.";
            valid = false;
        }

        setBookErrors(errs);
        return valid;
    };

    const handleStepClick = (targetStep: WizardStepKey) => {
        if (targetStep > 1 && !isSearchCompleted) {
            toast.error("Please search 10-digit mobile number first.");
            return;
        }
        if (targetStep === 3) {
            if (!validateStep2Patient()) return;
        }
        if (targetStep === 4) {
            if (!validateStep2Patient() || !validateStep3Appointment()) return;
        }
        setWizardStep(targetStep);
    };

    const goNext = () => {
        if (wizardStep === 1) {
            if (searchStatus === "found") {
                handleContinueFromPatientSelection();
            } else if (validateStep1Search()) {
                handleExecuteSearch();
            }
        } else if (wizardStep === 2) {
            if (validateStep2Patient()) {
                setWizardStep(3);
            }
        } else if (wizardStep === 3) {
            if (validateStep3Appointment()) {
                setWizardStep(4);
            }
        } else if (wizardStep === 4) {
            handleConfirmBookClick();
        }
    };

    const goBack = () => {
        if (wizardStep > 1) {
            setWizardStep((prev) => (prev - 1) as WizardStepKey);
        }
    };

    const clearWizardDraft = () => {
        setSearchMobile("");
        setSearchMobileError("");
        setIsSearchCompleted(false);
        setSearchStatus("idle");
        setFoundPatients([]);
        setSelectedPatientId(null);
        setPatientForm({
            mobile: "",
            title: "Mr",
            name: "",
            gender: "Male",
            dob: "",
            age: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            bloodGroup: "O+",
            category: "General",
        });
        setPatientErrors({ mobile: "", name: "" });
        setBookDept("");
        setBookDoctor("");
        setBookDate(new Date().toISOString().split("T")[0]);
        setBookUnit("");
        setBookSlot("");
        setBookSource("Reception");
        setBookPriority("Consultation");
        setBookRemarks("");
        setBookErrors({ dept: "", doctor: "", date: "", unit: "", slot: "", source: "" });
        setSelectedPatientProfile(null);
        setWizardStep(1);
        toast.info("Form cleared.");
    };

    const handleConfirmBookClick = () => {
        const activeMobile = patientForm.mobile || selectedPatientProfile?.mobile || searchMobile;
        if (!activeMobile || !activeMobile.trim()) {
            toast.error("Mobile Number is required before generating OTP.");
            return;
        }
        const cleanedMobile = activeMobile.replace(/\D/g, "");
        if (!isValidMobileNumber(cleanedMobile)) {
            toast.error("Valid 10-digit Mobile Number is required before generating OTP.");
            return;
        }

        if (!validateStep2Patient() || !validateStep3Appointment()) return;

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

        const apptNo = `APT-${bookDate.replace(/-/g, "")}-0${appointments.length + 1}`;
        const formattedOn = formatDateTime(bookDate, slotTo24(bookSlot));
        const finalUhid = selectedPatientProfile?.uhid || `UH2026${String(Math.floor(10000 + Math.random() * 90000))}`;
        const finalAge = patientForm.age ? parseInt(patientForm.age, 10) : selectedPatientProfile?.age || 25;

        const newAppt: Appointment = {
            id: String(Date.now()),
            apptNo,
            patient: `${patientForm.title ? patientForm.title + ". " : ""}${patientForm.name}`,
            uhid: finalUhid,
            regNo: "–",
            doctor: bookDoctor,
            apptOn: formattedOn,
            rawDate: bookDate,
            rawTime: slotTo24(bookSlot),
            type: (bookSource as "Reception" | "Phone" | "Online") || "Reception",
            status: "Upcoming",
            gender: patientForm.gender,
            age: finalAge,
            mobile: patientForm.mobile,
            bookedOn: formatTodayDateTime(),
            dept: bookDept,
        };

        // Update patientsDb with newly booked patient profile if not present
        const currentMobile = patientForm.mobile || searchMobile;
        if (currentMobile) {
            _setPatientsDb((prev) => {
                const list = prev[currentMobile] || [];
                if (!list.some((p) => p.uhid === finalUhid || p.name.toLowerCase() === patientForm.name.toLowerCase())) {
                    const newProfile: PatientProfile = {
                        id: `p-${Date.now()}`,
                        name: patientForm.name,
                        age: finalAge,
                        gender: patientForm.gender,
                        uhid: finalUhid,
                        mobile: currentMobile,
                    };
                    return { ...prev, [currentMobile]: [...list, newProfile] };
                }
                return prev;
            });
        }

        setAppointments([newAppt, ...appointments]);
        setBookedSuccessData(newAppt);
        setIsSuccessModalOpen(true);
    };

    const resetPatientFlow = () => {
        clearWizardDraft();
    };

    // ----------------------------------------------------
    // WIZARD STEP PANELS
    // ----------------------------------------------------

    // STEP 1: PATIENT SEARCH & SELECTION PANEL
    const renderStep1PatientSearch = () => {
        if (searchStatus === "found" && foundPatients.length > 0) {
            return (
                <div className="py-6 max-w-xl mx-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-800">Select Patient Card</h3>
                            <p className="text-[12.5px] text-muted-foreground">
                                Profiles linked to <b className="text-blue-600 font-bold">+91 {searchMobile}</b>
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddNewPatientFromSearch}
                            className="gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer font-semibold"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            + Add Patient
                        </Button>
                    </div>

                    <div className="space-y-2.5">
                        {foundPatients.map((patient) => {
                            const isSelected = selectedPatientId === patient.id;
                            return (
                                <div
                                    key={patient.id}
                                    onClick={() => handleSelectPatientCard(patient)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                                        ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60"
                                        }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? "border-blue-600 bg-blue-600"
                                                : "border-slate-300 bg-white"
                                                }`}
                                        >
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-900">{patient.name}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[11px] font-medium bg-slate-100 text-slate-700"
                                                >
                                                    {patient.gender} • {patient.age} Yrs
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span>
                                                    UHID: <strong className="text-slate-700 font-semibold">{patient.uhid}</strong>
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Mobile: <strong className="text-slate-700">+91 {patient.mobile}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected ? (
                                        <span className="text-xs font-bold text-blue-600 bg-blue-100/70 px-2.5 py-1 rounded-md">
                                            Selected
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-400">Click to Select</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-3 flex justify-end">
                        <Button
                            onClick={handleContinueFromPatientSelection}
                            disabled={!selectedPatientId}
                            className="gap-1.5 text-white text-[13px] font-semibold cursor-pointer disabled:opacity-50"
                            style={{ background: "var(--blue-btn)", padding: "16px 24px", borderRadius: "8px" }}
                        >
                            Continue
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="py-6 max-w-xl mx-auto space-y-6">
                <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-[15px] font-bold text-slate-800">Step 1: Patient Search</h3>
                    <p className="text-[12.5px] text-muted-foreground">Enter 10-digit mobile number to search existing patient records</p>
                </div>

                <div className="space-y-4">
                    <Field label="Mobile Number" required>
                        <div
                            className={`flex items-center rounded-md border overflow-hidden bg-white transition-all ${searchMobileError
                                ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                                : "border-slate-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                                }`}
                        >
                            <span className="px-3 py-2 bg-slate-100 font-bold text-slate-700 text-xs border-r border-slate-200 shrink-0">
                                +91
                            </span>
                            <TextField
                                placeholder="Enter 10-digit mobile number"
                                value={searchMobile}
                                onChange={(val) => {
                                    const hasNonNumeric = /[^\d]/.test(val);
                                    const cleaned = val.replace(/\D/g, "").slice(0, 10);
                                    setSearchMobile(cleaned);

                                    if (searchStatus !== "idle") {
                                        setSearchStatus("idle");
                                        setFoundPatients([]);
                                        setSelectedPatientId(null);
                                    }

                                    if (hasNonNumeric) {
                                        setSearchMobileError("Only numeric values are allowed.");
                                    } else if (!cleaned) {
                                        setSearchMobileError("Mobile Number is required.");
                                    } else if (!["6", "7", "8", "9"].includes(cleaned[0])) {
                                        setSearchMobileError("Mobile Number must start with 6, 7, 8, or 9.");
                                    } else if (cleaned.length < 10) {
                                        setSearchMobileError("Mobile Number must be exactly 10 digits.");
                                    } else {
                                        setSearchMobileError("");
                                    }
                                }}
                            />
                        </div>
                        {searchMobileError && (
                            <span className="text-xs text-red-500 mt-1 block font-medium">{searchMobileError}</span>
                        )}
                    </Field>

                    <div className="pt-2 flex items-center justify-end">
                        <Button
                            onClick={handleExecuteSearch}
                            disabled={!isValidMobileNumber(searchMobile)}
                            className="gap-1.5 text-white text-[13px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: "var(--blue-btn)", padding: "12px 20px", borderRadius: "8px" }}
                        >
                            Search Patient
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // STEP 2: PATIENT DETAILS PANEL
    const renderStep2PatientDetails = () => (
        <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-[15px] font-bold text-slate-800">Step 2: Patient Information</h3>
                    <p className="text-[12.5px] text-muted-foreground">
                        {searchStatus === "found"
                            ? `Existing profile loaded for +91 ${searchMobile}`
                            : `Patient not found. Complete setup for +91 ${searchMobile}`}
                    </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                    +91 {searchMobile}
                </div>
            </div>

            {searchStatus === "not_found" && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                    Patient Not Found! Please enter full details below to register and proceed with booking.
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-4">
                <Field label="Mobile Number" required>
                    <TextField value={`+91 ${patientForm.mobile}`} disabled />
                </Field>

                <Field label="Title">
                    <SelectField
                        options={["Mr", "Mrs", "Ms", "Dr", "Baby"]}
                        value={patientForm.title}
                        onChange={(val) => setPatientForm({ ...patientForm, title: val })}
                    />
                </Field>

                <Field label="Patient Name" required>
                    <TextField
                        placeholder="Enter full name"
                        value={patientForm.name}
                        onChange={(val) => {
                            setPatientForm({ ...patientForm, name: val });
                            if (patientErrors.name) setPatientErrors((prev) => ({ ...prev, name: "" }));
                        }}
                    />
                    {patientErrors.name && (
                        <span className="text-xs text-red-500 mt-1 block font-medium">{patientErrors.name}</span>
                    )}
                </Field>

                <Field label="Gender">
                    <SelectField
                        options={["Male", "Female", "Other"]}
                        value={patientForm.gender}
                        onChange={(val) => setPatientForm({ ...patientForm, gender: val })}
                    />
                </Field>

                <Field label="Date of Birth">
                    <DobDateField
                        value={patientForm.dob ? new Date(patientForm.dob) : undefined}
                        onChange={(d) => {
                            const dateStr = d ? format(d, "yyyy-MM-dd") : "";
                            const calculatedAge = d
                                ? String(Math.abs(new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970))
                                : "";
                            setPatientForm({ ...patientForm, dob: dateStr, age: calculatedAge });
                        }}
                    />
                </Field>

                <Field label="Age (Years)">
                    <TextField
                        placeholder="Age in years"
                        value={patientForm.age}
                        onChange={(val) => setPatientForm({ ...patientForm, age: val.replace(/\D/g, "") })}
                    />
                </Field>

                <Field label="Blood Group">
                    <SelectField
                        options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
                        value={patientForm.bloodGroup}
                        onChange={(val) => setPatientForm({ ...patientForm, bloodGroup: val })}
                    />
                </Field>

                <Field label="Patient Category">
                    <SelectField
                        options={["General", "Corporate", "Insurance", "Staff", "Senior Citizen"]}
                        value={patientForm.category}
                        onChange={(val) => setPatientForm({ ...patientForm, category: val })}
                    />
                </Field>

                <Field label="Address">
                    <TextField
                        placeholder="House no, street"
                        value={patientForm.address}
                        onChange={(val) => setPatientForm({ ...patientForm, address: val })}
                    />
                </Field>

                <Field label="City">
                    <TextField
                        placeholder="e.g. Chennai"
                        value={patientForm.city}
                        onChange={(val) => setPatientForm({ ...patientForm, city: val })}
                    />
                </Field>

                <Field label="State">
                    <TextField
                        placeholder="e.g. Tamil Nadu"
                        value={patientForm.state}
                        onChange={(val) => setPatientForm({ ...patientForm, state: val })}
                    />
                </Field>

                <Field label="PIN Code">
                    <TextField
                        placeholder="6-digit PIN"
                        value={patientForm.pincode}
                        onChange={(val) => setPatientForm({ ...patientForm, pincode: val.replace(/\D/g, "") })}
                    />
                </Field>
            </div>
        </div>
    );

    // STEP 3: APPOINTMENT DETAILS PANEL
    const renderStep3AppointmentDetails = () => (
        <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
                <h3 className="text-[15px] font-bold text-slate-800">Step 3: Appointment Details & Slots</h3>
                <p className="text-[12.5px] text-muted-foreground">Select department, doctor, unit, date, time slot, visit type, and priority</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-4">
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
                    {bookErrors.dept && <span className="text-xs text-red-500 mt-1 block font-medium">{bookErrors.dept}</span>}
                </Field>

                <Field label="Doctor Name" required>
                    <SelectField
                        options={DEPT_DOCTORS_MAP[bookDept] || []}
                        placeholder="Choose Doctor"
                        value={bookDoctor}
                        onChange={(val) => {
                            setBookDoctor(val);
                            setBookErrors((prev) => ({ ...prev, doctor: "" }));
                        }}
                    />
                    {bookErrors.doctor && <span className="text-xs text-red-500 mt-1 block font-medium">{bookErrors.doctor}</span>}
                </Field>

                <Field label="Appointment Date" required>
                    <DateField
                        value={bookDate ? new Date(bookDate) : undefined}
                        onChange={(d) => {
                            setBookDate(d ? format(d, "yyyy-MM-dd") : "");
                            setBookErrors((prev) => ({ ...prev, date: "" }));
                        }}
                    />
                    {bookErrors.date && <span className="text-xs text-red-500 mt-1 block font-medium">{bookErrors.date}</span>}
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
                    {bookErrors.unit && <span className="text-xs text-red-500 mt-1 block font-medium">{bookErrors.unit}</span>}
                </Field>
            </div>

            {/* Time Slot Selection Grid */}
            <Field label="Available Time Slots" required>
                {!bookUnit ? (
                    <div className="text-xs text-muted-foreground py-2 italic">
                        Please select a Unit to view available time slots.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-1">
                        {(UNIT_SLOTS[bookUnit] || []).map((slot) => {
                            const isBooked = (UNIT_BOOKED[bookUnit] || []).includes(slot);
                            const isSelected = bookSlot === slot;
                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => {
                                        setBookSlot(slot);
                                        setBookErrors((prev) => ({ ...prev, slot: "" }));
                                    }}
                                    className={`py-2 px-2 text-center text-xs font-semibold rounded border transition-all cursor-pointer ${isBooked
                                        ? "bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed"
                                        : isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                            : "bg-white text-slate-800 border-slate-200 hover:border-blue-500 hover:text-blue-600"
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
                        <i className="w-3 h-3 rounded bg-white border border-slate-300 inline-block"></i> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="w-3 h-3 rounded bg-blue-600 inline-block"></i> Selected
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="w-3 h-3 rounded bg-slate-200 inline-block"></i> Booked / Full
                    </span>
                </div>
                {bookErrors.slot && <span className="text-xs text-red-500 mt-1 block font-medium">{bookErrors.slot}</span>}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 md:gap-y-4">
                <Field label="Visit Type" required>
                    <SelectField
                        options={["Reception", "Phone", "Online"]}
                        value={bookSource}
                        onChange={(val) => {
                            setBookSource(val as any);
                            setBookErrors((prev) => ({ ...prev, source: "" }));
                        }}
                    />
                    {bookErrors.source && <span className="text-xs text-red-500 mt-1 block font-medium">{bookErrors.source}</span>}
                </Field>

                <Field label="Priority / Reason">
                    <SelectField
                        options={["Consultation", "Follow-up", "Emergency", "Procedure"]}
                        value={bookPriority}
                        onChange={(val) => setBookPriority(val)}
                    />
                </Field>

                <Field label="Remarks">
                    <TextField
                        placeholder="Enter visit remarks"
                        value={bookRemarks}
                        onChange={(val) => setBookRemarks(val)}
                    />
                </Field>
            </div>
        </div>
    );

    // STEP 4: REVIEW & CONFIRM PANEL
    const renderStep4ReviewConfirm = () => (
        <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
                <h3 className="text-[15px] font-bold text-slate-800">Step 4: Review & Confirm Appointment</h3>
                <p className="text-[12.5px] text-muted-foreground">Verify patient details and appointment booking information before submitting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Summary Card */}
                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Patient Summary</h4>
                        <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                            Edit Patient
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="block text-slate-500 font-medium">Patient Name</span>
                            <span className="font-bold text-slate-900 text-sm">
                                {patientForm.title ? `${patientForm.title}. ` : ""}{patientForm.name}
                            </span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Mobile Number</span>
                            <span className="font-semibold text-slate-900">+91 {patientForm.mobile}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Gender / Age</span>
                            <span className="font-semibold text-slate-900">{patientForm.gender} / {patientForm.age || "25"} Years</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Blood Group</span>
                            <span className="font-semibold text-slate-900">{patientForm.bloodGroup}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Patient Category</span>
                            <span className="font-semibold text-slate-900">{patientForm.category}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-slate-500 font-medium">Address</span>
                            <span className="font-semibold text-slate-900">
                                {[patientForm.address, patientForm.city, patientForm.state, patientForm.pincode].filter(Boolean).join(", ") || "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Appointment Summary Card */}
                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Appointment Summary</h4>
                        <button
                            type="button"
                            onClick={() => setWizardStep(3)}
                            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                            Edit Appointment
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="block text-slate-500 font-medium">Department</span>
                            <span className="font-bold text-slate-900">{bookDept}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Doctor Name</span>
                            <span className="font-bold text-slate-900">{bookDoctor}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Appointment Date</span>
                            <span className="font-semibold text-slate-900">{bookDate}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Unit & Slot</span>
                            <span className="font-semibold text-blue-600">{bookUnit} ({bookSlot})</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Visit Type</span>
                            <Badge variant="outline" className="text-xs font-bold">{bookSource}</Badge>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Priority</span>
                            <span className="font-semibold text-slate-900">{bookPriority}</span>
                        </div>
                        {bookRemarks && (
                            <div className="col-span-2">
                                <span className="block text-slate-500 font-medium">Remarks</span>
                                <span className="font-semibold text-slate-900">{bookRemarks}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                    Please review all patient and appointment details. Clicking <b>Confirm & Book Appointment</b> will issue the booking reference.
                </span>
            </div>
        </div>
    );

    const wizardPanels: Record<WizardStepKey, React.ReactNode> = {
        1: renderStep1PatientSearch(),
        2: renderStep2PatientDetails(),
        3: renderStep3AppointmentDetails(),
        4: renderStep4ReviewConfirm(),
    };

    return (
        <div className="space-y-5">
            {/* Header Bar matching OP Registration Screen design */}
            <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0"
                        style={{
                            background: "var(--side-menu)",
                            color: "var(--blue-text-color)",
                        }}
                    >
                        <CalendarClock className="h-5 w-5" />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[17px] font-semibold text-foreground">Appointments & Patient Booking</h1>
                            <Badge variant="secondary" className="text-xs shrink-0">
                                {filteredAppointments.length} Records
                            </Badge>
                        </div>
                        <p className="text-[12.5px] text-muted-foreground">
                            Manage doctor appointments, patient registration, and slot bookings
                        </p>
                    </div>
                </div>

                {/* Action Buttons styled like OP Registration */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
                    <Button
                        variant={activeTab === "appointments" ? "default" : "outline"}
                        onClick={() => setActiveTab("appointments")}
                        className="gap-2 text-[13px] cursor-pointer flex-1 sm:flex-none justify-center"
                        style={
                            activeTab === "appointments"
                                ? { background: "var(--blue-btn)", color: "#fff" }
                                : { color: "var(--blue-text-color)" }
                        }
                    >
                        Appointments List
                    </Button>

                    <Button
                        variant={activeTab === "patient" ? "default" : "outline"}
                        onClick={() => {
                            setActiveTab("patient");
                            resetPatientFlow();
                        }}
                        className="gap-2 text-[13px] cursor-pointer flex-1 sm:flex-none justify-center"
                        style={
                            activeTab === "patient"
                                ? { background: "var(--blue-btn)", color: "#fff" }
                                : { color: "var(--blue-text-color)" }
                        }
                    >
                        <UserPlus className="h-4 w-4" />
                        Book Appointment
                    </Button>
                </div>
            </div>

            {/* ==================================================== */}
            {/* TAB 1: APPOINTMENTS ADMIN LIST VIEW */}
            {/* ==================================================== */}
            {activeTab === "appointments" && (
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden p-4 sm:p-6">
                    {/* Header Toolbar Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 w-full">
                        <div>
                            <h2 className="text-xl font-bold text-foreground relative inline-block pb-1">
                                Appointments
                                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-blue-600 rounded-full"></span>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto justify-end">
                            {/* Search Box Pill */}
                            <div className="w-full sm:w-auto flex-1 sm:flex-none">
                                <TableSearch
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(val) => {
                                        setSearch(val);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {/* Control Icons & Buttons Row */}
                            <div className="flex items-center gap-2 justify-end">
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

                                {/* Close (X) Reset Button immediately beside Options Menu */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setSearch("");
                                        setFilters({
                                            apptNo: "",
                                            patientName: "",
                                            doctorName: "",
                                            type: "",
                                            status: "",
                                            from: "",
                                            to: "",
                                        });
                                        setCurrentPage(1);
                                        toast.info("Search and filters reset");
                                    }}
                                    className="h-9 w-9 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                    title="Close / Reset Search & Filters"
                                >
                                    <X className="h-4 w-4" />
                                </Button>

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
                                    className="h-9 px-4 text-white font-medium cursor-pointer shrink-0"
                                    style={{ background: "var(--blue-btn)" }}
                                    title="Add Appointment"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Add</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Active Drawer Filters Reset Indicator */}
                    {hasActiveDrawerFilters && (
                        <div className="flex flex-wrap items-center gap-2 mb-4 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
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

                    {/* Desktop View: Reusable Data Table Component (>= 768px) */}
                    <div className="hidden md:block">
                        <DataTable columns={columns} data={paginatedAppointments} />
                    </div>

                    {/* Mobile View: Responsive Card List (< 768px) */}
                    <div className="block md:hidden space-y-3">
                        {paginatedAppointments.length > 0 ? (
                            paginatedAppointments.map((appt) => (
                                <div
                                    key={appt.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-blue-600">{appt.apptNo}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[11px] font-semibold ${appt.status === "Visited"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : appt.status === "Cancelled"
                                                        ? "bg-red-50 text-red-700 border-red-200"
                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                    }`}
                                            >
                                                {appt.status}
                                            </Badge>
                                        </div>
                                        <ActionMenu
                                            item={appt}
                                            onView={(p) => {
                                                setSelectedAppointment(p);
                                                setIsViewDrawerOpen(true);
                                            }}
                                            onEdit={(p) => {
                                                setEditForm({ ...p });
                                                setIsEditDrawerOpen(true);
                                            }}
                                            onPrint={() => handlePrint()}
                                            onDelete={(p) => {
                                                setAppointments((prev) => prev.filter((a) => a.id !== p.id));
                                                notify.deleteSuccess("Appointment deleted successfully.");
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1.5 text-xs text-slate-600">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Patient:</span>
                                            <span className="font-semibold text-slate-800">{appt.patient} ({appt.gender || "–"}, {appt.age || "–"})</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">UHID / Mobile:</span>
                                            <span className="font-medium text-slate-700">{appt.uhid !== "–" ? appt.uhid : appt.mobile || "–"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Doctor / Dept:</span>
                                            <span className="font-medium text-slate-700">{appt.doctor} ({appt.dept || "Gen"})</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Appt Date & Time:</span>
                                            <span className="font-semibold text-slate-900">{appt.apptOn}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No appointment records found.
                            </div>
                        )}
                    </div>

                    {/* Reusable Pagination Component */}
                    <div className="mt-4 border-t border-border pt-4 overflow-x-auto">
                        <Pagination table={tableObject} totalCount={filteredAppointments.length} />
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: 4-STEP BOOK APPOINTMENT WIZARD FORM */}
            {/* Structure matching OP Registration Wizard exactly */}
            {/* ==================================================== */}
            {activeTab === "patient" && (
                <div
                    className="rounded-md border border-slate-200 bg-white"
                    style={{ background: "var(--background)" }}
                >
                    {/* OP Registration Stepper Component */}
                    <div className="flex items-center px-4 sm:px-6 py-4 sm:py-5 overflow-x-auto border-b border-slate-100">
                        {[
                            { key: 1, label: "Patient Search" },
                            { key: 2, label: "Patient Details" },
                            { key: 3, label: "Appointment Details" },
                            { key: 4, label: "Review & Confirm" },
                        ].map((s, index) => {
                            const stepNum = s.key as WizardStepKey;
                            const label = s.label;
                            const isActive = stepNum === wizardStep;
                            const isCompleted = stepNum < wizardStep;

                            return (
                                <div key={label} className="flex flex-1 items-center last:flex-none min-w-fit">
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(stepNum)}
                                        className="flex items-center gap-1 sm:gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity outline-none"
                                    >
                                        <div
                                            style={
                                                isActive || isCompleted
                                                    ? {
                                                        background: "var(--blue-text-color)",
                                                    }
                                                    : undefined
                                            }
                                            className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[11px] sm:text-[14px] font-semibold transition-all duration-200 ${isActive
                                                ? "text-white shadow-md"
                                                : isCompleted
                                                    ? "text-white opacity-80"
                                                    : "border border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                stepNum
                                            )}
                                        </div>

                                        <span
                                            className={`whitespace-nowrap text-[11px] sm:text-[13px] transition-all duration-200 ${isActive
                                                ? "font-bold"
                                                : isCompleted
                                                    ? "font-semibold text-slate-700"
                                                    : "font-medium text-slate-400 hover:text-slate-600"
                                                }`}
                                            style={
                                                isActive
                                                    ? {
                                                        color: "var(--blue-text-color)",
                                                    }
                                                    : undefined
                                            }
                                        >
                                            {label}
                                        </span>
                                    </button>

                                    {index !== 3 && (
                                        <div
                                            className={`mx-2 sm:mx-4 h-px flex-1 transition-all duration-300 ${isCompleted ? "bg-blue-500 opacity-60" : "bg-slate-200"
                                                }`}
                                            style={
                                                isCompleted
                                                    ? {
                                                        background: "var(--blue-text-color)",
                                                        opacity: 0.5,
                                                    }
                                                    : undefined
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Step Panels Content */}
                    <div className="px-6 py-6">
                        {wizardPanels[wizardStep]}

                        {/* Action Buttons matching OP Registration */}
                        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
                            {wizardStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={goBack}
                                    className="gap-1.5 text-[13px] font-medium text-slate-600 cursor-pointer"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Back
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={clearWizardDraft}
                                className="text-[13px] font-medium text-slate-600 cursor-pointer"
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={goNext}
                                disabled={
                                    wizardStep === 1
                                        ? (!isValidMobileNumber(searchMobile) || (searchStatus === "found" && !selectedPatientId))
                                        : false
                                }
                                className="gap-1.5 text-white text-[13px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "var(--blue-btn)", padding: "18px 18px", borderRadius: "8px" }}
                            >
                                {wizardStep === 1
                                    ? searchStatus === "found"
                                        ? "Continue to Appointment"
                                        : "Search & Continue"
                                    : wizardStep === 4
                                        ? "Confirm & Book Appointment"
                                        : "Save & Next"}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                            Enter the OTP sent to <b className="text-foreground">+91 {patientForm.mobile || selectedPatientProfile?.mobile || searchMobile}</b>
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