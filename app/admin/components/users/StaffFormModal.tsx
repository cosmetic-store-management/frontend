import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
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
import { useAuth } from "@/auth/hooks/useAdminAuth";

interface StaffFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStaffFormData) => void;
  isLoading: boolean;
}

export function StaffFormModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: StaffFormModalProps) {
  const { isOwner } = useAuth();

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
    },
  });

  const selectedRole = watch("role");

  // Reset form when modal opens
  if (
    open &&
    !isLoading &&
    Object.keys(errors).length === 0 &&
    !control._defaultValues.name
  ) {
    // Small trick to avoid resetting on every render
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset({
        name: "",
        email: "",
        phone: "",
        role: "staff",
        permissions: DEFAULT_STAFF_PERMISSIONS,
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl animate-scale-in text-left max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">
            Thêm tài khoản nhân viên mới
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted mt-1">
            Lưu thông tin cá nhân nhân viên. Sau khi lưu, hệ thống sẽ cấp một
            tài khoản với mật khẩu mặc định là{" "}
            <code className="bg-surface-muted px-1 py-0.5 rounded-sm text-brand font-bold text-[10px]">
              GlowUp@123456
            </code>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sName" className="text-xs font-semibold text-ink">
              Họ tên nhân viên *
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="sName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sEmail" className="text-xs font-semibold text-ink">
              Email tài khoản *
            </Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  id="sEmail"
                  type="email"
                  placeholder="Ví dụ: staff.a@glowup.vn"
                />
              )}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sPhone" className="text-xs font-semibold text-ink">
              Số điện thoại *
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input {...field} id="sPhone" placeholder="Ví dụ: 0912345678" />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-ink block">
              Cấp bậc
            </Label>
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
                      <span className="text-sm font-semibold text-ink">
                        Cấp Nhân viên
                      </span>
                      <span className="text-xs text-ink-muted">
                        Khối thực thi. Chỉ có thể thực hiện thao tác được cấp
                        quyền. Không thể quản lý nhân sự.
                      </span>
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
                            setValue(
                              "permissions",
                              DEFAULT_MANAGER_PERMISSIONS,
                            );
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-ink">
                          Cấp Quản lý
                        </span>
                        <span className="text-xs text-ink-muted">
                          Khối điều hành. Có thể tạo và phân quyền cho Cấp Nhân
                          viên.
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              )}
            />
            {errors.role && (
              <p className="text-xs text-danger">{errors.role.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-ink">
                Mẫu phân quyền
              </Label>
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
                  <SelectValue placeholder="-- Tùy chỉnh quyền --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">-- Tùy chỉnh quyền --</SelectItem>
                  {selectedRole === "manager" ? (
                    <SelectItem value="store_manager">
                      Quản lý Cửa hàng
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="sales">Nhân viên Bán hàng</SelectItem>
                      <SelectItem value="inventory">Nhân viên Kho</SelectItem>
                      <SelectItem value="marketing">
                        Nhân viên Marketing
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto border border-border rounded-sm mt-4">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-soft border-b border-border">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-ink text-xs w-48">
                      Chức năng
                    </th>
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
                                    className="data-[state=checked]:bg-brand data-[state=checked]:border-brand mx-auto block"
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

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
