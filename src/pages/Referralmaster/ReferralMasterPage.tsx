import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { UserCheck, Plus, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardModuleTable } from "@/common/StandardModuleTable";
import { ActionMenu } from "@/common/ActionMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ReferralRow {
  referralName: string;
  designation: string;
  hospitalName: string;
  contactNo: string;
}

const MOCK_REFERRALS: ReferralRow[] = [
  { referralName: "Dr. Meena Kumar", designation: "Consultant", hospitalName: "Apollo Speciality", contactNo: "9840012345" },
  { referralName: "Dr. Arjun Nair", designation: "General Practitioner", hospitalName: "SRM Global Hospitals", contactNo: "9884023456" },
  { referralName: "Dr. Sathish Babu", designation: "Surgeon", hospitalName: "Fortis Malar", contactNo: "9445034567" },
];

export default function ReferralMasterPage() {
  const navigate = useNavigate();
  const [selectedReferral, setSelectedReferral] = useState<ReferralRow | null>(null);

  const columns: ColumnDef<ReferralRow>[] = [
    { accessorKey: "referralName", header: "Referral Name" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "hospitalName", header: "Hospital Name" },
    { accessorKey: "contactNo", header: "Contact No" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          item={row.original}
          onView={(item) => setSelectedReferral(item)}
          onEdit={(item) => navigate("/referral-master", { state: { record: item } })}
          onPrint={() => window.print()}
          onBarcode={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: "var(--side-menu)", color: "var(--blue-text-color)" }}
          >
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Referral Master Records</h1>
            <p className="text-[12.5px] text-muted-foreground">
              View and manage referring doctor details
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/referral-master")}
          className="gap-2 text-[13px] text-white hover:opacity-90 cursor-pointer"
          style={{ background: "var(--blue-btn)" }}
        >
          <Plus className="h-4 w-4" />
          New Referral
        </Button>
      </div>

      {/* Standardized Card & Table */}
      <StandardModuleTable
        title="Referral Master Records"
        searchPlaceholder="Search referral name, designation..."
        columns={columns}
        data={MOCK_REFERRALS}
        searchField={(r) => `${r.referralName} ${r.designation} ${r.hospitalName}`}
      />

      {/* View Details Dialog */}
      <Dialog open={Boolean(selectedReferral)} onOpenChange={() => setSelectedReferral(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-slate-200 shadow-xl">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-base font-bold text-slate-900">
                Referral Doctor Details
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Detailed information for referring consultant doctor
            </DialogDescription>
          </DialogHeader>

          {selectedReferral && (
            <div className="p-6 space-y-4 text-xs text-slate-700 bg-white">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block">Referral Name</span>
                  <span className="font-bold text-slate-900 text-base">{selectedReferral.referralName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Designation</span>
                  <span className="font-semibold text-slate-800">{selectedReferral.designation}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Hospital Name</span>
                  <span className="font-semibold text-slate-800">{selectedReferral.hospitalName}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/80 pt-2">
                  <span className="text-[11px] text-slate-500 block">Contact No</span>
                  <span className="font-medium text-slate-700 font-mono">{selectedReferral.contactNo}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedReferral(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const rec = selectedReferral;
                    setSelectedReferral(null);
                    navigate("/referral-master", { state: { record: rec } });
                  }}
                  className="text-white text-xs gap-1.5"
                  style={{ background: "var(--blue-btn)" }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Referral
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
