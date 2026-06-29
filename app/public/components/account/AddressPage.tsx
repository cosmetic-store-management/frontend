import { useState, useEffect } from "react";
import { Plus, MapPin, PencilLine, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/auth/hooks/usePublicAuth";
import {
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/public/hooks/useUser";
import { useVietnamAddress } from "@/public/hooks/useVietnamAddress";
import {
  addressSchema,
  type AddressFormData,
} from "@/public/schemas/profile.schema";
import { toast } from "@/lib/toast";

export function AddressPage() {
  const { user } = useAuth();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const vn = useVietnamAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInitNames, setEditInitNames] = useState<{
    province: string;
    district: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: "",
      district: "",
      ward: "",
      street: "",
      isDefault: false,
    },
  });

  // Khi edit address: init province/district từ tên đã lưu
  useEffect(() => {
    if (!editInitNames || vn.provinces.length === 0) return;
    const prov = vn.provinces.find((p) => p.name === editInitNames.province);
    if (prov) vn.setProvinceCode(prov.code);
    {
      /* eslint-disable-next-line  */
    }
  }, [editInitNames, vn.provinces]);

  useEffect(() => {
    if (!editInitNames || vn.districts.length === 0) return;
    const dist = vn.districts.find((d) => d.name === editInitNames.district);
    if (dist) vn.setDistrictCode(dist.code);
    {
      /* eslint-disable-next-line  */
    }
  }, [editInitNames, vn.districts]);

  const onSave = async (data: AddressFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: data });
        toast.success("Address updated successfully");
      } else {
        await addMutation.mutateAsync(data);
        toast.success("Address added successfully");
      }
      setShowForm(false);
      setEditingId(null);
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Address deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  // Reusable form JSX
  const renderForm = (isInline = false) => (
    <form
      onSubmit={handleSubmit(onSave)}
      className={`border border-border bg-surface-soft p-5 rounded-sm ${isInline ? "mt-3" : "mb-6"} animate-scale-up`}
    >
      <h3 className="font-bold text-ink mb-4 text-sm">
        {editingId ? "Update Address" : "New Address"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-ink uppercase tracking-wide">
            Province / City <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(v) => {
                  const opt = vn.provinces.find((p) => p.name === v);
                  field.onChange(v);
                  vn.setProvinceCode(opt?.code ?? null);
                  setValue("district", "");
                  setValue("ward", "");
                }}
              >
                <SelectTrigger className="w-full h-9 text-sm bg-white">
                  <SelectValue placeholder="-- Select province/city --" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {vn.provinces.map((p) => (
                    <SelectItem key={p.code} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.province && (
            <p className="text-xs text-danger">{errors.province.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-ink uppercase tracking-wide">
            District <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                disabled={vn.districtLoading || vn.districts.length === 0}
                onValueChange={(v) => {
                  const opt = vn.districts.find((d) => d.name === v);
                  field.onChange(v);
                  vn.setDistrictCode(opt?.code ?? null);
                  setValue("ward", "");
                }}
              >
                <SelectTrigger className="w-full h-9 text-sm bg-white">
                  <SelectValue
                    placeholder={
                      vn.districtLoading
                        ? "Loading..."
                        : "-- Select district --"
                    }
                  />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {vn.districts.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.district && (
            <p className="text-xs text-danger">{errors.district.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-ink uppercase tracking-wide">
            Ward <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="ward"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                disabled={vn.wardLoading || vn.wards.length === 0}
                onValueChange={(v) => field.onChange(v)}
              >
                <SelectTrigger className="w-full h-9 text-sm bg-white">
                  <SelectValue
                    placeholder={
                      vn.wardLoading ? "Loading..." : "-- Select ward --"
                    }
                  />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {vn.wards.map((w) => (
                    <SelectItem key={w.code} value={w.name}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.ward && (
            <p className="text-xs text-danger">{errors.ward.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <Label className="text-xs font-semibold text-ink uppercase tracking-wide">
          Street Address <span className="text-danger">*</span>
        </Label>
        <Controller
          control={control}
          name="street"
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Ex: 123 Nguyen Hue"
              className="h-9 text-sm bg-white"
            />
          )}
        />
        {errors.street && (
          <p className="text-xs text-danger">{errors.street.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5 mb-5">
        <Controller
          control={control}
          name="isDefault"
          render={({ field: { value, onChange } }) => (
            <Checkbox
              id="addr-isDefault"
              checked={value}
              onCheckedChange={onChange}
            />
          )}
        />
        <Label
          htmlFor="addr-isDefault"
          className="text-sm text-ink-muted cursor-pointer font-normal select-none"
        >
          Set as default address
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={addMutation.isPending || updateMutation.isPending}
          className="btn-hover bg-brand text-white text-sm font-bold py-2 px-6 rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {addMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : "Save Address"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setEditingId(null);
            vn.resetVN();
            setEditInitNames(null);
          }}
          className="text-sm text-ink-muted hover:text-ink font-medium px-4 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  if (!user) return null;

  return (
    <div className="animate-slide-up bg-surface rounded-sm px-6 py-6 flex-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-ink mb-1">Address Book</h2>
          <p className="text-xs text-ink-muted">
            Your saved shipping addresses
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              reset({
                province: "",
                district: "",
                ward: "",
                street: "",
                isDefault: false,
              });
              vn.resetVN();
              setEditInitNames(null);
              setEditingId(null);
              setShowForm(true);
            }}
            className="btn-hover flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        )}
      </div>

      {/* Form thêm địa chỉ mới (chỉ hiện ở trên khi không phải edit) */}
      {showForm && !editingId && renderForm(false)}

      {/* Address list */}
      {(!user.addresses || user.addresses.length === 0) && !showForm ? (
        <div className="text-center py-16">
          <MapPin className="w-10 h-10 text-border mx-auto mb-3" />
          <p className="text-sm text-ink-muted">
            You don't have any addresses yet.
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Add an address for faster checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {user.addresses?.map((address: any) => (
            <div key={address._id}>
              {/* Address card */}
              <div
                className={`relative p-4 border rounded-sm transition-colors ${address.isDefault ? "border-brand/40 bg-brand/[0.03]" : "border-border bg-surface hover:border-border-dark"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                      <span className="text-sm font-semibold text-ink">
                        {user.name}
                      </span>
                      <span className="text-ink-muted text-xs">·</span>
                      <span className="text-xs text-ink-muted">
                        {user.phone}
                      </span>
                      {address.isDefault && (
                        <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-brand border border-brand/60 bg-brand/5 px-2 py-0.5 rounded-sm">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed pl-5">
                      {address.street}, {address.ward}, {address.district},{" "}
                      {address.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        reset({
                          province: address.province,
                          district: address.district,
                          ward: address.ward,
                          street: address.street,
                          isDefault: address.isDefault,
                        });
                        vn.resetVN();
                        setEditInitNames({
                          province: address.province,
                          district: address.district,
                        });
                        setEditingId(address._id);
                        setShowForm(true);
                      }}
                      className="p-1.5 rounded-sm text-ink-muted hover:text-brand hover:bg-brand/5 transition-colors"
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-1.5 rounded-sm text-ink-muted hover:text-danger hover:bg-danger/5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit form inline — xuất hiện ngay dưới địa chỉ đang chỉnh */}
              {showForm && editingId === address._id && renderForm(true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
