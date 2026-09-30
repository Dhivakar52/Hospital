export type ApprovalStatus = "pending" | "approved" | "denied";

export interface PatientApproval {
  id: string;
  patientName: string;
  patientId: string;
  hospitalName: string;
  doctorName: string;
  reason: string;
  requestedRecords: string[];
  recordFrom: string;
  recordTo: string;
  accessEnds: string;
  requestedDate: string;
  status: ApprovalStatus;
  denialReason: string | null;
  approvedDate: string | null;
  deniedDate?: string | null;
}
