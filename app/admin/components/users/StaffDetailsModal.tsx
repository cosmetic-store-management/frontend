import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import type { User } from "@/admin/types/user";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  owner: { label: "Owner", className: "bg-purple-100 text-purple-800 border border-purple-200" },
  manager: { label: "Manager", className: "bg-indigo-100 text-indigo-800 border border-indigo-200" },
  staff: { label: "Staff", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
};

interface StaffDetailsModalProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  working: { label: "Working", className: "bg-success/10 text-success border-success/20" },
  probation: { label: "Probation", className: "bg-warning/10 text-warning border-warning/20" },
  suspended: { label: "Suspended", className: "bg-danger/10 text-danger border-danger/20" },
  resigned: { label: "Resigned", className: "bg-muted text-ink-muted border-border" },
};

const CONTRACT_LABELS: Record<string, string> = {
  fulltime: "Full Time",
  parttime: "Part Time",
  probationary: "Probationary",
  internship: "Internship",
};

const SHIFT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
  full: "Full Day",
};

export function StaffDetailsModal({ user, onOpenChange }: StaffDetailsModalProps) {
  if (!user) return null;

  const formatVND = (num?: number) => {
    if (num === undefined || num === null) return "0 VND";
    return new Intl.NumberFormat("en-US").format(num) + " VND";
  };

  const statusInfo = STATUS_LABELS[user.status || "working"] || {
    label: user.status || "Working",
    className: "bg-success/10 text-success border-success/20",
  };

  return (
    <BaseCrudModal
      open={!!user}
      onOpenChange={onOpenChange}
      title="Staff Profile"
      description={`Detailed profile and status of employee ${user.name}`}
      size="lg"
      primaryActionText="Close"
      onPrimaryAction={() => onOpenChange(false)}
    >
      <div className="space-y-6 text-sm text-ink-muted">
        {/* Section 1: General Info */}
        <div className="bg-muted/30 p-4 rounded-sm border border-border/40">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
            <h4 className="text-xs font-bold text-brand uppercase tracking-wider">{"General"}</h4>
            {user.employeeId && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[4px] font-mono font-bold">
                {user.employeeId}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Name"}</span>
              <span className="font-semibold text-ink text-base">{user.name}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Citizen ID"}</span>
              <span className="font-medium text-ink">{user.citizenId || "Not Updated"}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Email"}</span>
              <span className="font-medium text-ink">{user.email || "Not Updated"}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Phone"}</span>
              <span className="font-medium text-ink">{user.phone || "Not Updated"}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"DOB"}</span>
              <span className="font-medium text-ink">
                {user.dob ? new Date(user.dob).toLocaleDateString("en-US") : "Not Updated"}
              </span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Gender"}</span>
              <span className="font-medium text-ink">
                {user.gender === "male" ? "Male" : user.gender === "female" ? "Female" : user.gender === "other" ? "Other" : "Not Updated"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-ink-muted/80 block font-normal">{"Address"}</span>
              <span className="font-medium text-ink">{user.homeAddress || "Not Updated"}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Work & Role Info */}
        <div className="bg-muted/30 p-4 rounded-sm border border-border/40">
          <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">{"Work & Role"}</h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Role"}</span>
              <span
                className={`inline-flex items-center justify-center rounded-[4px] px-2.5 py-0.5 text-[10px] mt-1 ${ROLE_BADGE[user.role]?.className || "bg-surface-soft text-ink-muted font-bold uppercase"}`}
              >
                {ROLE_BADGE[user.role]?.label ?? user.role}
              </span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Status"}</span>
              <span
                className={`inline-flex items-center justify-center border rounded-[4px] px-2 py-0.5 text-[10px] mt-1 font-semibold ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Contract"}</span>
              <span className="font-semibold text-ink">{CONTRACT_LABELS[user.contractType || "fulltime"]}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Shift"}</span>
              <span className="font-semibold text-ink">{SHIFT_LABELS[user.workingShift || "full"]}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Start Date"}</span>
              <span className="font-medium text-ink">
                {user.startDate ? new Date(user.startDate).toLocaleDateString("en-US") : "Not Updated"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-ink-muted/80 block mb-1">{"Permissions"}</span>
              {user.permissions && user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="text-[10px] bg-surface border border-border/60 text-ink px-2 py-0.5 rounded-[3px] font-mono font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-ink-muted italic">{"None"}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Compensation & Payroll */}
        <div className="bg-muted/30 p-4 rounded-sm border border-border/40">
          <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">{"Salary & Allowance"}</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Base Salary"}</span>
              <span className="font-bold text-ink text-base">{formatVND(user.salaryInfo?.baseSalary)}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Allowance"}</span>
              <span className="font-semibold text-ink text-base">{formatVND(user.salaryInfo?.allowance)}</span>
            </div>
            <div>
              <span className="text-xs text-ink-muted/80 block">{"Commission"}</span>
              <span className="font-bold text-success text-base">{user.salaryInfo?.commissionRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Section 4: Bank & Emergency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-sm border border-border/40">
            <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">{"Bank Account"}</h4>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-ink-muted/70 block">{"Bank"}</span>
                <span className="font-semibold text-ink">{user.bankInfo?.bankName || "Not Updated"}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted/70 block">{"Account No"}</span>
                <span className="font-mono font-bold text-ink">{user.bankInfo?.accountNumber || "Not Updated"}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted/70 block">{"Account Holder"}</span>
                <span className="font-medium text-ink uppercase">{user.bankInfo?.accountName || "Not Updated"}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-sm border border-border/40">
            <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-3">{"Emergency Contact"}</h4>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-ink-muted/70 block">{"Contact Name"}</span>
                <span className="font-semibold text-ink">{user.emergencyContact?.name || "Not Updated"}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted/70 block">{"Phone"}</span>
                <span className="font-mono font-bold text-ink">{user.emergencyContact?.phone || "Not Updated"}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted/70 block">{"Relationship"}</span>
                <span className="font-medium text-ink">{user.emergencyContact?.relationship || "Not Updated"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCrudModal>
  );
}
