import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  updateCustomerSchema,
  type UpdateCustomerFormData,
} from "../../schemas/customer.schema";

type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateCustomerFormData) => Promise<void>;
  loading: boolean;
  initialValues?: Partial<UpdateCustomerFormData>;
  title?: string;
};

export function CustomerFormModal({
  open,
  onClose,
  onSubmit,
  loading,
  initialValues,
  title = "Cập nhật thông tin",
}: CustomerFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCustomerFormData>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
    },
  });

  useEffect(() => {
    if (open && initialValues) {
      reset({
        name: initialValues.name || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        province: initialValues.province || "",
        district: initialValues.district || "",
        ward: initialValues.ward || "",
        street: initialValues.street || "",
      });
    } else if (!open) {
      reset();
    }
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader className="pr-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Nhập đầy đủ các thông tin cá nhân và liên hệ của khách hàng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cName">
                Họ tên khách hàng <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cName"
                    placeholder="Ví dụ: Trần Thị Mai"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cEmail">
                Email liên hệ <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    id="cEmail"
                    placeholder="Ví dụ: mail.tt@gmail.com"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cPhone">
                Số điện thoại <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cPhone"
                    placeholder="VD: 0901234567"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
              {errors.phone && (
                <p className="text-xs text-danger">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cProvince">Tỉnh/Thành</Label>
                <Controller
                  control={control}
                  name="province"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cProvince"
                      placeholder="VD: Hà Nội"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cDistrict">Quận/Huyện</Label>
                <Controller
                  control={control}
                  name="district"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cDistrict"
                      placeholder="VD: Cầu Giấy"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cWard">Phường/Xã</Label>
                <Controller
                  control={control}
                  name="ward"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cWard"
                      placeholder="VD: Dịch Vọng"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cStreet">Số nhà, đường</Label>
                <Controller
                  control={control}
                  name="street"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cStreet"
                      placeholder="VD: 123 Xuân Thủy"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
