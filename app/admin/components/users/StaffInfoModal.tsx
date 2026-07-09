import { useState, useEffect } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  updateStaffInfoSchema as updateInfoSchema,
  type UpdateStaffInfoFormData as UpdateInfoFormData,
} from "@/admin/schemas/user.schema";
import type { User } from "@/admin/types/user";

interface StaffInfoModalProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function StaffInfoModal({
  user,
  onOpenChange,
  onSubmit,
  isLoading,
}: StaffInfoModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "work" | "bank">("general");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateInfoFormData>({
    resolver: zodResolver(updateInfoSchema) as any,
    defaultValues: {
      name: "",
      citizenId: "",
      email: "",
      phone: "",
      dob: "",
      gender: "male",
      status: "working",
      contractType: "fulltime",
      workingShift: "full",
      homeAddress: "",
      startDate: "",
      baseSalary: 0,
      allowance: 0,
      commissionRate: 0,
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelationship: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        citizenId: user.citizenId || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        gender: user.gender || "male",
        status: user.status || "working",
        contractType: user.contractType || "fulltime",
        workingShift: user.workingShift || "full",
        homeAddress: user.homeAddress || "",
        startDate: user.startDate ? new Date(user.startDate).toISOString().split("T")[0] : "",
        baseSalary: user.salaryInfo?.baseSalary || 0,
        allowance: user.salaryInfo?.allowance || 0,
        commissionRate: user.salaryInfo?.commissionRate || 0,
        bankName: user.bankInfo?.bankName || "",
        bankAccountNumber: user.bankInfo?.accountNumber || "",
        bankAccountName: user.bankInfo?.accountName || "",
        emergencyName: user.emergencyContact?.name || "",
        emergencyPhone: user.emergencyContact?.phone || "",
        emergencyRelationship: user.emergencyContact?.relationship || "",
      });
    }
  }, [user, reset]);

  const handleFormSubmit = (data: UpdateInfoFormData) => {
    const formattedData = {
      name: data.name,
      citizenId: data.citizenId || "",
      email: data.email || "",
      phone: data.phone,
      dob: data.dob ? new Date(data.dob).toISOString() : undefined,
      gender: data.gender,
      status: data.status,
      contractType: data.contractType,
      workingShift: data.workingShift,
      homeAddress: data.homeAddress || "",
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      baseSalary: Number(data.baseSalary) || 0,
      allowance: Number(data.allowance) || 0,
      commissionRate: Number(data.commissionRate) || 0,
      bankName: data.bankName || "",
      bankAccountNumber: data.bankAccountNumber || "",
      bankAccountName: data.bankAccountName || "",
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
      open={!!user}
      onOpenChange={onOpenChange}
      title="Update Info"
      description={`Edit profile for ${user?.name}`}
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
          Work
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
        id="staff-info-form"
      >
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iName" className="text-xs font-semibold text-ink">{"Name *"}</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} id="iName" placeholder="John Doe" />
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-danger">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iCitizenId" className="text-xs font-semibold text-ink">{"Citizen ID"}</Label>
                <Controller
                  control={control}
                  name="citizenId"
                  render={({ field }) => (
                    <Input {...field} id="iCitizenId" placeholder="037123456789" maxLength={12} />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iEmail" className="text-xs font-semibold text-ink">{"Email"}</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="iEmail"
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
                <Label htmlFor="iPhone" className="text-xs font-semibold text-ink">{"Phone *"}</Label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input {...field} id="iPhone" placeholder="0912345678" />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-danger">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iDob" className="text-xs font-semibold text-ink">{"DOB"}</Label>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field }) => (
                    <Input {...field} id="iDob" type="date" />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iGender" className="text-xs font-semibold text-ink">{"Gender"}</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="iGender" className="h-9 bg-surface border-input focus:ring-brand">
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
                <Label htmlFor="iStatus" className="text-xs font-semibold text-ink">{"Status"}</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="iStatus" className="h-9 bg-surface border-input focus:ring-brand">
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
                <Label htmlFor="iContract" className="text-xs font-semibold text-ink">{"Contract"}</Label>
                <Controller
                  control={control}
                  name="contractType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="iContract" className="h-9 bg-surface border-input focus:ring-brand">
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
                <Label htmlFor="iShift" className="text-xs font-semibold text-ink">{"Shift"}</Label>
                <Controller
                  control={control}
                  name="workingShift"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="iShift" className="h-9 bg-surface border-input focus:ring-brand">
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
              <Label htmlFor="iHomeAddress" className="text-xs font-semibold text-ink">{"Address"}</Label>
              <Controller
                control={control}
                name="homeAddress"
                render={({ field }) => (
                  <Input {...field} id="iHomeAddress" placeholder="123 ABC Street, District XYZ, HCMC" />
                )}
              />
            </div>
          </div>
        )}

        {/* WORK TAB */}
        {activeTab === "work" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="iStartDate" className="text-xs font-semibold text-ink">{"Start Date"}</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Input {...field} id="iStartDate" type="date" />
                )}
              />
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
                  <Label htmlFor="iBaseSalary" className="text-xs font-semibold text-ink">{"Base Salary"}</Label>
                  <Controller
                    control={control}
                    name="baseSalary"
                    render={({ field }) => (
                      <Input {...field} id="iBaseSalary" type="number" placeholder="8000000" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iAllowance" className="text-xs font-semibold text-ink">{"Allowance"}</Label>
                  <Controller
                    control={control}
                    name="allowance"
                    render={({ field }) => (
                      <Input {...field} id="iAllowance" type="number" placeholder="500000" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iCommission" className="text-xs font-semibold text-ink">{"Commission"}</Label>
                  <Controller
                    control={control}
                    name="commissionRate"
                    render={({ field }) => (
                      <Input {...field} id="iCommission" type="number" step="0.1" placeholder="1.5" />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Bank Info Section */}
            <div className="space-y-3 pt-3 border-t border-border">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="iBankName" className="text-xs font-semibold text-ink">{"Bank"}</Label>
                  <Controller
                    control={control}
                    name="bankName"
                    render={({ field }) => (
                      <Input {...field} id="iBankName" placeholder="Vietcombank, Techcombank..." />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iBankAccountNumber" className="text-xs font-semibold text-ink">{"Account No"}</Label>
                  <Controller
                    control={control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <Input {...field} id="iBankAccountNumber" placeholder="1012345678" />
                    )}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iBankAccountName" className="text-xs font-semibold text-ink">{"Account Holder"}</Label>
                <Controller
                  control={control}
                  name="bankAccountName"
                  render={({ field }) => (
                    <Input {...field} id="iBankAccountName" placeholder="NGUYEN VAN A" />
                  )}
                />
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-3 pt-3 border-t border-border">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="iEmergencyName" className="text-xs font-semibold text-ink">{"Contact Name"}</Label>
                  <Controller
                    control={control}
                    name="emergencyName"
                    render={({ field }) => (
                      <Input {...field} id="iEmergencyName" placeholder="John Doe Sr" />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iEmergencyPhone" className="text-xs font-semibold text-ink">{"Phone"}</Label>
                  <Controller
                    control={control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <Input {...field} id="iEmergencyPhone" placeholder="0987654321" />
                    )}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iEmergencyRelationship" className="text-xs font-semibold text-ink">{"Relationship"}</Label>
                <Controller
                  control={control}
                  name="emergencyRelationship"
                  render={({ field }) => (
                    <Input {...field} id="iEmergencyRelationship" placeholder="Father, Mother, Spouse..." />
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
