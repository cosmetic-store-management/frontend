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
  AlertTriangle,
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
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "../components/common/PageHeader";
import { useSearchParams } from "react-router";
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
import { DateTimePicker } from "@/components/ui/date-picker";
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
import DeleteModal from "@/components/ui/delete-modal";
const toLocalDatetimeString = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EMPTY_FORM: VoucherFormData = {
  code: "",
  discountType: "percent",
  discountValue: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  startDate: toLocalDatetimeString(new Date()),
  endDate: toLocalDatetimeString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  usageLimit: 0,
  ttlMinutes: 0,
  overbookingLimit: 0,
  isActive: true,
};

export function VoucherPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";

  const setPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const [editing, setEditing] = useState<Voucher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

  const { data, isLoading, error } = useVouchers(page, 10, { search, status, type });
  const vouchers = data?.vouchers || [];
  const pagination = data?.pagination;
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== search) {
      handleFilterChange("search", debouncedSearch);
    }
  }, [debouncedSearch]);

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
          startDate: toLocalDatetimeString(editing.startDate),
          endDate: toLocalDatetimeString(editing.endDate),
          usageLimit: editing.usageLimit,
          ttlMinutes: editing.ttlMinutes || 0,
          overbookingLimit: editing.overbookingLimit || 0,
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
      error: (e: unknown) =>
        e instanceof Error ? e.message : "An error occurred",
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
        description="Create and manage discount codes, promotional campaigns, and special offers to drive sales."
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
            {/* Hàng 1: Search */}
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by voucher code..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>

            {/* Hàng 2: Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={status} onValueChange={(val) => handleFilterChange("status", val)}>
                <SelectTrigger className="w-[160px] h-9 bg-surface text-sm border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={(val) => handleFilterChange("type", val)}>
                <SelectTrigger className="w-[160px] h-9 bg-surface text-sm border-border">
                  <SelectValue placeholder="Discount Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percent">Percentage %</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="freeship">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead className="w-[15%] text-left pl-4">
                  Voucher Code
                </TableHead>
                <TableHead className="w-[12%] text-center">
                  Discount Type
                </TableHead>
                <TableHead className="w-[12%] text-center">
                  Discount Value
                </TableHead>
                <TableHead className="w-[12%] text-center">Min Order</TableHead>
                <TableHead className="w-[12%] text-center">
                  Usage Limit / Used
                </TableHead>
                <TableHead className="w-[15%] text-center">
                  Validity Period
                </TableHead>
                <TableHead className="w-[12%] text-center">Status</TableHead>
                <TableHead className="w-[10%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher, i) => (
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
                        {new Date(voucher.startDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      if (!voucher.isActive) {
                        return (
                          <span className="px-2.5 py-1 text-[11px] uppercase font-bold rounded-sm bg-ink-muted/10 text-ink-muted">
                            Inactive
                          </span>
                        );
                      }
                      const now = new Date();
                      const start = new Date(voucher.startDate);
                      const end = new Date(voucher.endDate);
                      if (now > end) {
                        return (
                          <span className="px-2.5 py-1 text-[11px] uppercase font-bold rounded-sm bg-danger/10 text-danger">
                            Expired
                          </span>
                        );
                      }
                      if (now < start) {
                        return (
                          <span className="px-2.5 py-1 text-[11px] uppercase font-bold rounded-sm bg-info/10 text-info">
                            Upcoming
                          </span>
                        );
                      }
                      return (
                        <span className="px-2.5 py-1 text-[11px] uppercase font-bold rounded-sm bg-success/10 text-success">
                          Active
                        </span>
                      );
                    })()}
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
          {vouchers.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">
              {search || status !== "all" || type !== "all"
                ? "No matching vouchers found for the applied filters."
                : "No vouchers found"}
            </p>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="py-4 border-t border-border bg-surface">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
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
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
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
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
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
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-danger">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="ttlMinutes"
                      className="text-sm font-semibold text-ink flex items-center gap-2"
                    >
                      Minutes
                    </Label>
                    <Input
                      id="ttlMinutes"
                      type="number"
                      min="0"
                      placeholder="0 = No limit"
                      {...register("ttlMinutes", { valueAsNumber: true })}
                      aria-invalid={!!errors.ttlMinutes}
                      className="h-10 bg-surface border-border focus-visible:ring-brand rounded-sm"
                    />
                    {errors.ttlMinutes && (
                      <p className="text-xs text-danger">{errors.ttlMinutes.message}</p>
                    )}
                    <p className="text-[11px] text-ink-muted">
                      0 = No limit. Used for reservation countdowns.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="overbookingLimit"
                      className="text-sm font-semibold text-ink"
                    >
                      Overbooking
                    </Label>
                    <Input
                      id="overbookingLimit"
                      type="number"
                      min="-1"
                      placeholder="0 = Disabled"
                      {...register("overbookingLimit", { valueAsNumber: true })}
                      aria-invalid={!!errors.overbookingLimit}
                      className="h-10 bg-surface border-border focus-visible:ring-brand rounded-sm"
                    />
                    {errors.overbookingLimit && (
                      <p className="text-xs text-danger">{errors.overbookingLimit.message}</p>
                    )}
                    <p className="text-[11px] text-ink-muted">
                      0 = Disabled, -1 = Infinite. Allows claiming beyond stock.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border/60 rounded-sm bg-surface">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="isActive"
                      className="text-sm font-semibold text-ink cursor-pointer"
                    >
                      Active Status
                    </Label>
                    <p className="text-[11px] text-ink-muted">
                      Activate voucher immediately for customers
                    </p>
                  </div>
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

      <DeleteModal
        open={!!deleteTarget}
        title="Delete Voucher"
        description={
          <>
            Are you sure you want to delete the voucher{" "}
            <strong className="text-ink">{deleteTarget?.code}</strong>?
            <br />
            This action cannot be undone.
          </>
        }
        loading={deleteMutation.isPending}
        submitError={null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
