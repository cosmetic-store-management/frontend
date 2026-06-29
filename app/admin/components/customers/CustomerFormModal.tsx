import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { toast } from "@/lib/toast";
import { useUpdateCustomer } from "../../hooks/useCustomer";
import type { Customer } from "@/admin/services/user.service";
import {
  updateCustomerSchema,
  type UpdateCustomerFormData,
} from "../../schemas/customer.schema";

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const updateCustomerMutation = useUpdateCustomer();

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
    if (customer && open) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        province: customer.province || "",
        district: customer.district || "",
        ward: customer.ward || "",
        street: customer.street || "",
      });
    }
  }, [customer, open, reset]);

  const onSubmit = async (data: UpdateCustomerFormData) => {
    if (!customer) return;
    
    try {
      await updateCustomerMutation.mutateAsync({
        id: customer.id,
        data,
      });
      toast.success("Customer information updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error saving customer information!");
    }
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={customer ? "Update Information" : "Add New Customer"}
      description="Enter the customer's personal and contact information."
      size="md"
      hideFooter={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cName">
              Customer Name <span className="text-danger">*</span>
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="cName"
                  placeholder="E.g., Jane Doe"
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
              Contact Email <span className="text-danger">*</span>
            </Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  id="cEmail"
                  placeholder="E.g., jane@example.com"
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
              Phone Number <span className="text-danger">*</span>
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  {...field}
                  id="cPhone"
                  placeholder="E.g., 0901234567"
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
              <Label htmlFor="cProvince">Province/City</Label>
              <Controller
                control={control}
                name="province"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cProvince"
                    placeholder="E.g., Hanoi"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cDistrict">District</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cDistrict"
                    placeholder="E.g., Cau Giay"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cWard">Ward</Label>
              <Controller
                control={control}
                name="ward"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cWard"
                    placeholder="E.g., Dich Vong"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cStreet">Street Address</Label>
              <Controller
                control={control}
                name="street"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cStreet"
                    placeholder="E.g., 123 Xuan Thuy"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateCustomerMutation.isPending}>
            {updateCustomerMutation.isPending ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </form>
    </BaseCrudModal>
  );
}
