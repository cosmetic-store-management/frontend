import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  Search,
  MoreVertical,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "../components/PageHeader";
import {
  useVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from "../hooks/useVoucher";
import { voucherSchema, type VoucherFormData } from "../schemas/voucher.schema";
import type { Voucher } from "@/admin/types/voucher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

const EMPTY_FORM: VoucherFormData = {
  code: "",
  discountType: "percent",
  discountValue: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16),
  usageLimit: 0,
  isActive: true,
};

export function VoucherPage() {
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

  const { data: vouchers, isLoading, error } = useVouchers();
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const filteredVouchers =
    vouchers?.filter((v) =>
      v.code.toLowerCase().includes(debouncedSearch.toLowerCase()),
    ) || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: EMPTY_FORM,
  });

  const discountType = watch("discountType");

  useEffect(() => {
    if (isFormOpen) {
      if (editing) {
        reset({
          code: editing.code,
          discountType: editing.discountType,
          discountValue: editing.discountValue,
          minOrderValue: editing.minOrderValue,
          maxDiscount: editing.maxDiscount || 0,
          startDate: editing.startDate.slice(0, 16),
          endDate: editing.endDate.slice(0, 16),
          usageLimit: editing.usageLimit,
          isActive: editing.isActive,
        });
      } else {
        reset(EMPTY_FORM);
      }
    }
  }, [isFormOpen, editing, reset]);

  const onSubmitForm = async (data: VoucherFormData) => {
    const payload = {
      ...data,
      maxDiscount:
        data.discountType === "percent" &&
          data.maxDiscount &&
          data.maxDiscount > 0
          ? data.maxDiscount
          : undefined,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    const action = editing
      ? updateMutation.mutateAsync({ id: editing.id, data: payload })
      : createMutation.mutateAsync(payload);

    toast.promise(action, {
      loading: editing ? "Updating..." : "Creating...",
      success: editing ? "Update successful!" : "Voucher created successfully!",
      error: (e: unknown) => (e instanceof Error ? e.message : "An error occurred"),
    });

    await action.then(() => setIsFormOpen(false)).catch(() => { });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    toast.promise(
      deleteMutation
        .mutateAsync(deleteTarget.id)
        .then(() => setDeleteTarget(null)),
      {
        loading: "Deleting...",
        success: `Deleted voucher "${deleteTarget.code}"`,
        error: (e: unknown) =>
          e instanceof Error ? e.message : "An error occurred",
      },
    );
  };

  if (error) toast.error(error.message);

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <PageHeader
        title="Voucher Management"
        description="Manage promotional campaigns and discount codes for customers."
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" /> New Voucher
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by voucher code..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="premium-card rounded-sm overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead className="w-[15%] text-left pl-4">Voucher Code</TableHead>
                <TableHead className="w-[12%] text-center">Discount Type</TableHead>
                <TableHead className="w-[12%] text-center">Discount Value</TableHead>
                <TableHead className="w-[12%] text-center">Min Order</TableHead>
                <TableHead className="w-[12%] text-center">
                  Usage Limit / Used
                </TableHead>
                <TableHead className="w-[15%] text-center">Validity Period</TableHead>
                <TableHead className="w-[12%] text-center">Status</TableHead>
                <TableHead className="w-[10%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher, i) => (
                <TableRow
                  key={voucher.id}
                  className="animate-stagger"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <TableCell className="font-bold text-ink uppercase">
                    {voucher.code}
                  </TableCell>
                  <TableCell className="text-center">
                    {voucher.discountType === "percent" && "Percent"}
                    {voucher.discountType === "fixed" && "Fixed Amount"}
                    {voucher.discountType === "freeship" && "Freeship"}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {voucher.discountType === "percent"
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString("vi-VN")}₫`}
                  </TableCell>
                  <TableCell className="text-center text-ink-muted">
                    {voucher.minOrderValue.toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {voucher.usedCount} /{" "}
                    {voucher.usageLimit === 0 ? "∞" : voucher.usageLimit}
                  </TableCell>
                  <TableCell className="text-xs text-ink-muted text-center">
                    <div className="flex flex-col w-fit mx-auto">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(voucher.startDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2.5 py-1 text-[11px] uppercase font-bold rounded-sm ${voucher.isActive ? "bg-success/10 text-success" : "bg-ink-muted/10 text-ink-muted"}`}
                    >
                      {voucher.isActive ? "Active" : "Paused"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-36 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                            onClick={() => {
                              setEditing(voucher);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                            onClick={() => setDeleteTarget(voucher)}
                          >
                            <Trash2 className="w-4 h-4 mr-2.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!vouchers || vouchers.length === 0) && (
            <p className="py-8 text-center text-sm text-ink-muted">
              No vouchers found
            </p>
          )}
          {vouchers && vouchers.length > 0 && filteredVouchers.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">
              No matching vouchers found
            </p>
          )}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-md bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink">
              {editing ? "Edit Voucher" : "Add New Voucher"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="code"
                    className="text-sm font-semibold text-ink"
                  >
                    Voucher Code <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="code"
                    placeholder="VD: SUMMER2026"
                    {...register("code")}
                    aria-invalid={!!errors.code}
                    className="uppercase font-bold h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                  />
                  {errors.code && (
                    <p className="text-xs text-danger">{errors.code.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="discountType"
                    className="text-sm font-semibold text-ink"
                  >
                    Discount Type <span className="text-brand">*</span>
                  </Label>
                  <Controller
                    name="discountType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="h-10 bg-surface border-border focus:ring-brand focus:border-brand">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border">
                          <SelectItem value="percent">Percentage %</SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount
                          </SelectItem>
                          <SelectItem value="freeship">
                            Free Shipping
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.discountType && (
                    <p className="text-xs text-danger">
                      {errors.discountType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="discountValue"
                    className="text-sm font-semibold text-ink"
                  >
                    Discount Value <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    {...register("discountValue", { valueAsNumber: true })}
                    aria-invalid={!!errors.discountValue}
                    className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                  />
                  {errors.discountValue && (
                    <p className="text-xs text-danger">
                      {errors.discountValue.message}
                    </p>
                  )}
                </div>
                {discountType === "percent" ? (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <Label
                      htmlFor="maxDiscount"
                      className="text-sm font-semibold text-ink"
                    >
                      Max Discount ($)
                    </Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      min="0"
                      placeholder="0 = Unlimited"
                      {...register("maxDiscount", { valueAsNumber: true })}
                      aria-invalid={!!errors.maxDiscount}
                      className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                    />
                    {errors.maxDiscount && (
                      <p className="text-xs text-danger">
                        {errors.maxDiscount.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="hidden sm:block"></div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="minOrderValue"
                    className="text-sm font-semibold text-ink"
                  >
                    Min Order Value ($) <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    min="0"
                    {...register("minOrderValue", { valueAsNumber: true })}
                    aria-invalid={!!errors.minOrderValue}
                    className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                  />
                  {errors.minOrderValue && (
                    <p className="text-xs text-danger">
                      {errors.minOrderValue.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="usageLimit"
                    className="text-sm font-semibold text-ink"
                  >
                    Usage Limit
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    placeholder="0 = Unlimited"
                    {...register("usageLimit", { valueAsNumber: true })}
                    aria-invalid={!!errors.usageLimit}
                    className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                  />
                  {errors.usageLimit && (
                    <p className="text-xs text-danger">
                      {errors.usageLimit.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-semibold text-ink"
                  >
                    Start Date <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register("startDate")}
                    aria-invalid={!!errors.startDate}
                    className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand cursor-pointer"
                  />
                  {errors.startDate && (
                    <p className="text-xs text-danger">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="endDate"
                    className="text-sm font-semibold text-ink"
                  >
                    End Date <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                    aria-invalid={!!errors.endDate}
                    className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand cursor-pointer"
                  />
                  {errors.endDate && (
                    <p className="text-xs text-danger">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-md border border-border bg-bg/50">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-semibold text-ink cursor-pointer"
                  >
                    Active Status
                  </Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <p className="text-xs text-ink-muted mt-2">
                  Activate voucher immediately for customers
                </p>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-surface"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 bg-brand text-white hover:bg-brand-hover shadow-ui-soft px-8"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Delete Voucher</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Permanently delete voucher <strong>{deleteTarget?.code}</strong>?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
