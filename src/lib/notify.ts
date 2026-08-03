import { toast } from "sonner";

export const notify = {
  saveSuccess: (message = "Record saved successfully.") => {
    toast.success(`✔ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-emerald-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  updateSuccess: (message = "Record updated successfully.") => {
    toast.success(`✔ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-emerald-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  deleteSuccess: (message = "Record deleted successfully.") => {
    toast.success(`✔ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-emerald-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  draftSuccess: (message = "Draft saved successfully.") => {
    toast.success(`✔ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-emerald-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  approveSuccess: (message = "Record approved successfully.") => {
    toast.success(`✔ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-emerald-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  rejectSuccess: (message = "Record rejected successfully.") => {
    toast.success(`✔ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-emerald-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  validationError: (message = "Please fill all mandatory fields.") => {
    toast.warning(`⚠ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-amber-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  serverError: (message = "Failed to save the record. Please try again.") => {
    toast.error(`❌ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-rose-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
  apiError: (message = "Something went wrong. Please contact the administrator.") => {
    toast.error(`❌ ${message}`, {
      duration: 4000,
      position: "top-right",
      className: "bg-rose-600 text-white font-medium text-sm border-none shadow-lg",
    });
  },
};
