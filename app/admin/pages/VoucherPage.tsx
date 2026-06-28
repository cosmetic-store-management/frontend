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
      loading: editing ? "Đang cập nhật..." : "Đang tạo...",
      success: editing ? "Cập nhật thành công!" : "Tạo mã giảm giá thành công!",
      error: (e: unknown) => (e instanceof Error ? e.message : "Có lỗi xảy ra"),
    });

    await action.then(() => setIsFormOpen(false)).catch(() => {});
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    toast.promise(
      deleteMutation
        .mutateAsync(deleteTarget.id)
        .then(() => setDeleteTarget(null)),
      {
        loading: "Đang xoá...",
        success: `Đã xoá mã "${deleteTarget.code}"`,
        error: (e: unknown) =>
          e instanceof Error ? e.message : "Có lỗi xảy ra",
      },
    );
  };

  if (error) toast.error(error.message);

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <PageHeader
        title="Quản lý Mã giảm giá"
        description="Quản lý các chương trình khuyến mãi, mã giảm giá cho khách hàng."
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" /> Thêm Voucher
          </Button>
        }
        filters={
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full flex-wrap">
            <div className="group relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã Voucher..."
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
        <div className="premium-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead>Mã Voucher</TableHead>
                <TableHead>Loại giảm</TableHead>
                <TableHead className="text-right">Mức giảm</TableHead>
                <TableHead className="text-right">Đơn tối thiểu</TableHead>
                <TableHead className="text-center">
                  Số lượng / Đã dùng
                </TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center w-24">Thao tác</TableHead>
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
                  <TableCell>
                    {voucher.discountType === "percent" && "Theo %"}
                    {voucher.discountType === "fixed" && "Tiền mặt"}
                    {voucher.discountType === "freeship" && "Freeship"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {voucher.discountType === "percent"
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString("vi-VN")}₫`}
                  </TableCell>
                  <TableCell className="text-right text-ink-muted">
                    {voucher.minOrderValue.toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {voucher.usedCount} /{" "}
                    {voucher.usageLimit === 0 ? "∞" : voucher.usageLimit}
                  </TableCell>
                  <TableCell className="text-xs text-ink-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{" "}
                      {new Date(voucher.startDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />{" "}
                      {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2.5 py-1 text-[11px] uppercase font-bold rounded-sm ${voucher.isActive ? "bg-success/10 text-success" : "bg-ink-muted/10 text-ink-muted"}`}
                    >
                      {voucher.isActive ? "Hoạt động" : "Tạm ngừng"}
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
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                            onClick={() => setDeleteTarget(voucher)}
                          >
                            <Trash2 className="w-4 h-4 mr-2.5" />
                            Xóa
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
              Chưa có mã giảm giá nào
            </p>
          )}
          {vouchers && vouchers.length > 0 && filteredVouchers.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">
              Không tìm thấy mã nào phù hợp
            </p>
          )}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-md bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink">
              {editing ? "Sửa mã giảm giá" : "Thêm mã giảm giá mới"}
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
                    Mã Voucher <span className="text-danger">*</span>
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
                    Loại giảm giá <span className="text-brand">*</span>
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
                          <SelectValue placeholder="Chọn loại giảm giá" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border">
                          <SelectItem value="percent">Giảm theo %</SelectItem>
                          <SelectItem value="fixed">
                            Giảm số tiền cố định
                          </SelectItem>
                          <SelectItem value="freeship">
                            Miễn phí vận chuyển (Freeship)
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
                    Mức giảm <span className="text-brand">*</span>
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
                      Giảm tối đa (₫)
                    </Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      min="0"
                      placeholder="0 = Không giới hạn"
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
                    Đơn tối thiểu (₫) <span className="text-brand">*</span>
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
                    Giới hạn lượt dùng
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    placeholder="0 = Vô hạn"
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
                    Từ ngày <span className="text-brand">*</span>
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
                    Đến ngày <span className="text-brand">*</span>
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
                    Trạng thái hoạt động
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
                  Kích hoạt mã giảm giá ngay lập tức cho người dùng
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
                Huỷ
              </Button>
              <Button
                type="submit"
                className="h-11 bg-brand text-white hover:bg-brand-hover shadow-ui-soft px-8"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Xoá Mã giảm giá</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Xoá vĩnh viễn mã <strong>{deleteTarget?.code}</strong>?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
