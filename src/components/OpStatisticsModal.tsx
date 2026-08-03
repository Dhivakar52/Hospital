import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  UsersRound,
  CalendarClock,
  Building,
  TrendingUp,
  Activity,
  X,
  UserCheck,
} from "lucide-react";

interface OpStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPatients?: number;
  newToday?: number;
  revisitsToday?: number;
}

export const OpStatisticsModal: React.FC<OpStatisticsModalProps> = ({
  isOpen,
  onClose,
  totalPatients = 2480,
  newToday = 142,
  revisitsToday = 385,
}) => {
  const departments = [
    { name: "General Medicine", count: 124, percentage: 32 },
    { name: "Orthopedics", count: 86, percentage: 22 },
    { name: "Cardiology", count: 65, percentage: 17 },
    { name: "Obstetrics & Gynaecology", count: 58, percentage: 15 },
    { name: "Dermatology", count: 32, percentage: 8 },
    { name: "Urology", count: 24, percentage: 6 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[720px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
        <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Outpatient (OP) Statistics Overview
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time registration, revisit, and departmental metrics
                </DialogDescription>
              </div>
            </div>

            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold px-2.5 py-1">
              Live EMR Data
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
                <UsersRound className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{totalPatients}</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12.4%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Cumulative patient records in EMR</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">New Registrations Today</span>
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{newToday}</span>
                <span className="text-xs text-slate-500 font-medium">Patients</span>
              </div>
              <p className="text-[11px] text-slate-500">First-time OP visits recorded today</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Revisits Today</span>
                <CalendarClock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{revisitsToday}</span>
                <span className="text-xs text-slate-500 font-medium">Consultations</span>
              </div>
              <p className="text-[11px] text-slate-500">Follow-up revisit tokens issued</p>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-slate-600" /> Department-wise Today OPD Volume
            </h4>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
              {departments.map((dept) => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>{dept.name}</span>
                    <span className="font-bold text-slate-900">{dept.count} patients ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-blue-600" /> Auto-synced with active registration queue
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            <X className="h-3.5 w-3.5 mr-1" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
