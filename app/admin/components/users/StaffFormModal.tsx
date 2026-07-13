import { useState } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStaffSchema,
  type CreateStaffFormData,
} from "../../schemas/user.schema";
import {
  MODULES,
  ACTIONS,
  DEFAULT_MANAGER_PERMISSIONS,
  DEFAULT_STAFF_PERMISSIONS,
  PERMISSION_TEMPLATES,
} from "./constants";
import { useAuth } from "@/auth/hooks/useAuth";

interface StaffFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function StaffFormModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: StaffFormModalProps) {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [activeTab, setActiveTab] = useState<"general" | "work" | "bank">("general");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "staff",
      permissions: DEFAULT_STAFF_PERMISSIONS,
      citizenId: "",
      startDate: new Date().toISOString().split("T")[0],
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelationship: "",
      homeAddress: "",
      dob: "",
      gender: "male",
      status: "working",
      contractType: "fulltime",
      workingShift: "full",
      baseSalary: 0,
      allowance: 0,
      commissionRate: 0,
    },
  });

  const selectedRole = watch("role");

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset({
        name: "",
        email: "",
        phone: "",
        role: "staff",
        permissions: DEFAULT_STAFF_PERMISSIONS,
        citizenId: "",
        startDate: new Date().toISOString().split("T")[0],
        bankName: "",
        bankAccountNumber: "",
        bankAccountName: "",
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelationship: "",
        homeAddress: "",
        dob: "",
        gender: "male",
        status: "working",
        contractType: "fulltime",
        workingShift: "full",
        baseSalary: 0,
        allowance: 0,
        commissionRate: 0,
      });
      setActiveTab("general");
    }
    onOpenChange(isOpen);
  };

  const handleFormSubmit = (data: CreateStaffFormData) => {
    const formattedData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      permissions: data.permissions,
      citizenId: data.citizenId || undefined,
      startDate: data.startDate || undefined,
      dob: data.dob || undefined,
      gender: data.gender || undefined,
      homeAddress: data.homeAddress || undefined,
      status: data.status || "working",
      contractType: data.contractType || "fulltime",
      workingShift: data.workingShift || "full",
      salaryInfo: {
        baseSalary: Number(data.baseSalary) || 0,
        allowance: Number(data.allowance) || 0,
        commissionRate: Number(data.commissionRate) || 0,
      },
      bankInfo: {
        bankName: data.bankName || "",
        accountNumber: data.bankAccountNumber || "",
        accountName: data.bankAccountName || "",
      },
      emergencyContact: {
        name: data.emergencyName || "",
        phone: data.emergencyPhone || "",
        relationship: data.emergencyRelationship || "",
      },
    };
    onSubmit(formattedData);
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Staff"
      description="Enter staff details. Mapped default password is GlowUp@123456."
      size="lg"
      primaryActionText="Confirm"
      secondaryActionText="Cancel"
      onPrimaryAction={handleSubmit(handleFormSubmit as any)}
      isLoading={isLoading}
    >
      {/* Custom Tabs List */}
      <div className="flex border-b border-border mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors ${
            activeTab === "general"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("work")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors ${
            activeTab === "work"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Permissions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors ${
            activeTab === "bank"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Salary & Bank
        </button>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit as any)}
        className="space-y-4"
        id="staff-form"
      >
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sName" className="text-xs font-semibold text-ink">{"Name *"}</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} id="sName" placeholder="John Doe" />
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-danger">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sCitizenId" className="text-xs font-semibold text-ink">{"Citizen ID"}</Label>
                <Controller
                  control={control}
                  name="citizenId"
                  render={({ field }) => (
                    <Input {...field} id="sCitizenId" placeholder="037123456789" maxLength={12} />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sEmail" className="text-xs font-semibold text-ink">{"Email *"}</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sEmail"
                      type="email"
                      placeholder="staff@glowup.com"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sPhone" className="text-xs font-semibold text-ink">{"Phone *"}</Label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input {...field} id="sPhone" placeholder="0912345678" />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-danger">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sDob" className="text-xs font-semibold text-ink">{"DOB"}</Label>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field }) => (
                    <Input {...field} id="sDob" type="date" />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sGender" className="text-xs font-semibold text-ink">{"Gender"}</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="sGender" className="h-9 bg-surface border-input focus:ring-brand">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Shift & Labor details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sStatus" className="text-xs font-semibold text-ink">{"Status"}</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="sStatus" className="h-9 bg-surface border-input focus:ring-brand">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="probation">Probation</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="resigned">Resigned</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sContract" className="text-xs font-semibold text-ink">{"Contract"}</Label>
                <Controller
                  control={control}
                  name="contractType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="sContract" className="h-9 bg-surface border-input focus:ring-brand">
                        <SelectValue placeholder="Select contract" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Full-time</SelectItem>
                        <SelectItem value="parttime">Part-time</SelectItem>
                        <SelectItem value="probationary">Probationary</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sShift" className="text-xs font-semibold text-ink">{"Shift"}</Label>
                <Controller
                  control={control}
                  name="workingShift"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="sShift" className="h-9 bg-surface border-input focus:ring-brand">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                        <SelectItem value="full">Full Day</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sHomeAddress" className="text-xs font-semibold text-ink">{"Address"}</Label>
              <Controller
                control={control}
                name="homeAddress"
                render={({ field }) => (
                  <Input {...field} id="sHomeAddress" placeholder="123 ABC Street, District XYZ, HCMC" />
                )}
              />
            </div>
          </div>
        )}

        {/* WORK TAB */}
        {activeTab === "work" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-semibold text-ink block">{"Role"}</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-2">
                      <label
                        className={`flex items-start space-x-3 p-3 rounded-sm border cursor-pointer transition-colors ${field.value === "staff" ? "bg-surface-soft border-brand" : "bg-surface border-border hover:bg-surface-hover"}`}
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            value="staff"
                            className="w-4 h-4 text-brand focus:ring-brand border-input"
                            checked={field.value === "staff"}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setValue("permissions", DEFAULT_STAFF_PERMISSIONS);
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-ink">{"Staff"}</span>
                          <span className="text-xs text-ink-muted">{"Execution role. Can only perform granted actions."}</span>
                        </div>
                      </label>

                      {isOwner && (
                        <label
                          className={`flex items-start space-x-3 p-3 rounded-sm border cursor-pointer transition-colors ${field.value === "manager" ? "bg-surface-soft border-brand" : "bg-surface border-border hover:bg-surface-hover"}`}
                        >
                          <div className="flex items-center h-5">
                            <input
                              type="radio"
                              value="manager"
                              className="w-4 h-4 text-brand focus:ring-brand border-input"
                              checked={field.value === "manager"}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setValue("permissions", DEFAULT_MANAGER_PERMISSIONS);
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-ink">{"Manager"}</span>
                            <span className="text-xs text-ink-muted">{"Operations role. Can manage permissions for Staff."}</span>
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sStartDate" className="text-xs font-semibold text-ink">{"Start Date"}</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Input {...field} id="sStartDate" type="date" />
                )}
              />
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-ink">{"Template"}</Label>
                <Select
                  onValueChange={(value) => {
                    if (value !== "custom") {
                      setValue("permissions", PERMISSION_TEMPLATES[value] || []);
                    }
                  }}
                  value={
                    selectedRole === "manager"
                      ? control._formValues.permissions ===
                        DEFAULT_MANAGER_PERMISSIONS
                        ? "store_manager"
                        : "custom"
                      : control._formValues.permissions ===
                          DEFAULT_STAFF_PERMISSIONS
                        ? "sales"
                        : "custom"
                  }
                >
                  <SelectTrigger className="w-50 h-8 text-xs bg-surface border-input focus:ring-brand">
                    <SelectValue placeholder="-- Custom permissions --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">{"-- Custom permissions --"}</SelectItem>
                    {selectedRole === "manager" ? (
                      <SelectItem value="store_manager">{"Store Manager"}</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="sales">{"Sales Staff"}</SelectItem>
                        <SelectItem value="inventory">{"Inventory Staff"}</SelectItem>
                        <SelectItem value="marketing">{"Marketing Staff"}</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto border border-border rounded-sm mt-4 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-surface-soft border-b border-border sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-ink text-xs w-48">{"Feature"}</th>
                      {ACTIONS.map((action) => (
                        <th
                          key={action.id}
                          className="px-3 py-2 font-semibold text-ink text-xs text-center w-16"
                        >
                          {action.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.filter((m) =>
                      m.allowedRoles.includes(selectedRole),
                    ).map((module) => (
                      <tr
                        key={module.id}
                        className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                      >
                        <td className="px-3 py-2 font-medium text-ink text-xs border-r border-border bg-surface-soft/30">
                          {module.label}
                        </td>
                        {ACTIONS.map((action) => {
                          const permId = `${module.id}.${action.id}`;
                          const isAvailable = module.actions.includes(action.id);
                          return (
                            <td
                              key={action.id}
                              className="px-3 py-2 text-center align-middle"
                            >
                              {isAvailable ? (
                                <Controller
                                  control={control}
                                  name="permissions"
                                  render={({ field }) => (
                                    <Checkbox
                                      id={`create-perm-${permId}`}
                                      checked={field.value?.includes(permId)}
                                      onCheckedChange={(checked) => {
                                        const val = field.value || [];
                                        field.onChange(
                                          checked
                                            ? [...val, permId]
                                            : val.filter(
                                                (v: string) => v !== permId,
                                              ),
                                        );
                                      }}
                                      className="data-[state=checked]:bg-brand data-[state=checked]:border-brand mx-auto block w-3.5 h-3.5"
                                    />
                                  )}
                                />
                              ) : (
                                <span className="text-ink-muted/30 block text-center">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BANK & COMPENSATION TAB */}
        {activeTab === "bank" && (
          <div className="space-y-4 animate-fade-in">
            {/* Salary Info Section */}
            <div className="space-y-3">

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sBaseSalary" className="text-xs font-semibold text-ink">{"Base Salary"}</Label>
                  <Controller
                    control={control}
                    name="baseSalary"
                    render={({ field }) => (
                      <Input {...field} id="sBaseSalary" type="number" placeholder="8000000" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sAllowance" className="text-xs font-semibold text-ink">{"Allowance"}</Label>
                  <Controller
                    control={control}
                    name="allowance"
                    render={({ field }) => (
                      <Input {...field} id="sAllowance" type="number" placeholder="500000" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sCommission" className="text-xs font-semibold text-ink">{"Commission"}</Label>
                  <Controller
                    control={control}
                    name="commissionRate"
                    render={({ field }) => (
                      <Input {...field} id="sCommission" type="number" step="0.1" placeholder="1.5" />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Bank Info Section */}
            <div className="space-y-3 pt-3 border-t border-border">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sBankName" className="text-xs font-semibold text-ink">{"Bank"}</Label>
                  <Controller
                    control={control}
                    name="bankName"
                    render={({ field }) => (
                      <Input {...field} id="sBankName" placeholder="Vietcombank, Techcombank..." />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sBankAccountNumber" className="text-xs font-semibold text-ink">{"Account No"}</Label>
                  <Controller
                    control={control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <Input {...field} id="sBankAccountNumber" placeholder="1012345678" />
                    )}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sBankAccountName" className="text-xs font-semibold text-ink">{"Account Holder"}</Label>
                <Controller
                  control={control}
                  name="bankAccountName"
                  render={({ field }) => (
                    <Input {...field} id="sBankAccountName" placeholder="NGUYEN VAN A" />
                  )}
                />
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-3 pt-3 border-t border-border">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sEmergencyName" className="text-xs font-semibold text-ink">{"Contact Name"}</Label>
                  <Controller
                    control={control}
                    name="emergencyName"
                    render={({ field }) => (
                      <Input {...field} id="sEmergencyName" placeholder="John Doe Sr" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sEmergencyPhone" className="text-xs font-semibold text-ink">{"Phone"}</Label>
                  <Controller
                    control={control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <Input {...field} id="sEmergencyPhone" placeholder="0987654321" />
                    )}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sEmergencyRelationship" className="text-xs font-semibold text-ink">{"Relationship"}</Label>
                <Controller
                  control={control}
                  name="emergencyRelationship"
                  render={({ field }) => (
                    <Input {...field} id="sEmergencyRelationship" placeholder="Father, Mother, Spouse..." />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </BaseCrudModal>
  );
}
