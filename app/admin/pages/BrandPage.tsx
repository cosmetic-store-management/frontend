import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Search, CheckCircle2, XCircle, Store, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/lib/toast";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useToggleBrandStatus,
  useDeleteBrand,
} from "../hooks/useBrand";
import type { Brand } from "@/admin/services/brand.service";
import { brandSchema, type BrandFormData } from "../schemas/brand.schema";

const EMPTY_FORM: BrandFormData = {
  name: "",
  description: "",
  imageUrl: "",
  country: "",
  isActive: true,
};

export function BrandPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(brandSchema) as any,
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter]);

  // Paginated list (current filter)
  const { data, isLoading } = useBrands({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page: currentPage,
    limit: 10,
  });
  const brands = data?.brands ?? [];

  // Stat counts — single separate query for all brands (standard in WooCommerce / Magento)
  const { data: allData } = useBrands({ limit: 1000 });
  const allBrands = allData?.brands ?? [];
  const totalCount   = allData?.pagination?.total ?? allBrands.length;
  const activeCount  = allBrands.filter(b => b.isActive).length;
  const inactiveCount = allBrands.filter(b => !b.isActive).length;

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const toggleMutation = useToggleBrandStatus();
  const deleteMutation = useDeleteBrand();

  const openCreate = () => { setEditing(null); reset(EMPTY_FORM); setIsFormOpen(true); };
  const openEdit = (brand: Brand) => {
    setEditing(brand);
    reset({ name: brand.name, description: brand.description || "", imageUrl: brand.imageUrl || "", country: brand.country || "", isActive: brand.isActive });
    setIsFormOpen(true);
  };

  // Toggle: inform admin exactly what changes (WooCommerce pattern)
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const next = !currentStatus;
    toast.promise(
      toggleMutation.mutateAsync({ id, isActive: next }),
      {
        loading: "Đang xử lý...",
        success: next
          ? "Thương hiệu đã hiển thị lại trên bộ lọc công khai."
          : "Đã ẩn thương hiệu. Sản phẩm thuộc thương hiệu này vẫn hiển thị bình thường.",
        error: "Cập nhật thất bại!",
      }
    );
  };

  const onSubmitForm = (formData: BrandFormData) => {
    if (editing) {
      toast.promise(
        updateMutation.mutateAsync({ id: editing.id, data: formData as any }).then(() => setIsFormOpen(false)),
        { loading: "Đang lưu...", success: "Cập nhật thương hiệu thành công!", error: (e: any) => e.message || "Lỗi cập nhật" }
      );
    } else {
      toast.promise(
        createMutation.mutateAsync(formData as any).then(() => setIsFormOpen(false)),
        { loading: "Đang tạo...", success: "Thêm thương hiệu mới thành công!", error: (e: any) => e.message || "Lỗi tạo mới" }
      );
    }
  };

  // Delete: backend blocks if products exist — show that count in dialog
  const confirmDelete = () => {
    if (!deleteTarget) return;
    toast.promise(
      deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null)),
      { loading: "Đang xoá...", success: "Đã xoá thương hiệu!", error: (e: any) => e.message || "Lỗi xoá thương hiệu" }
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="space-y-4 border border-border bg-surface p-4 shadow-ui-soft sm:p-5 rounded-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý thương hiệu</h1>
            <p className="max-w-2xl text-sm leading-6 text-ink-muted">
              Quản lý danh sách thương hiệu sản phẩm. Ẩn thương hiệu chỉ xoá khỏi bộ lọc công khai — sản phẩm không bị ảnh hưởng.
            </p>
          </div>
          <Button className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none" size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-2" /> Thêm thương hiệu
          </Button>
        </div>

        {/* Search */}
        <div className="group relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên thương hiệu..."
            className="h-11 border-border bg-surface pl-9 pr-9 text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
          />
        </div>

        {/* Status filter — matches backend status query param */}
        <div className="flex items-center gap-2 flex-wrap">
          {([["", "Tất cả"], ["active", "Đang hoạt động"], ["inactive", "Tạm dừng"]] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStatusFilter(val)}
              className={`inline-flex h-9 items-center gap-1.5 border px-3.5 text-xs font-semibold transition-colors rounded-sm ${
                statusFilter === val
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-surface text-ink-muted hover:border-brand hover:text-brand"
              }`}
            >
              {val === "active"   && <CheckCircle2 className="w-3.5 h-3.5" />}
              {val === "inactive" && <XCircle className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards (WooCommerce / Magento standard) ─ */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Store className="w-5 h-5 text-brand" />, bg: "bg-brand/10",   label: "Tổng thương hiệu",  val: totalCount,    cls: "text-ink" },
          { icon: <CheckCircle2 className="w-5 h-5 text-success" />, bg: "bg-success/10", label: "Đang hoạt động", val: activeCount,   cls: "text-success" },
          { icon: <XCircle className="w-5 h-5 text-danger" />, bg: "bg-danger/10",  label: "Tạm dừng",         val: inactiveCount, cls: "text-danger" },
        ].map(({ icon, bg, label, val, cls }) => (
          <div key={label} className="border border-border rounded-sm bg-surface shadow-ui-soft p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-sm ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
              <p className="text-xs text-ink-muted font-medium">{label}</p>
              <p className={`text-2xl font-bold tabular-nums ${cls}`}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Brand Table ─────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden shadow-ui-soft">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-fixed min-w-[820px]">
              <TableHeader>
                <TableRow className="bg-bg/50 border-b border-border hover:bg-bg/50">
                  {/* Columns follow WooCommerce Brands + Magento admin standard */}
                  <TableHead className="py-4 px-5 w-[32%]">Thương hiệu</TableHead>
                  <TableHead className="py-4 px-5 w-[13%]">Xuất xứ</TableHead>
                  <TableHead className="py-4 px-5 w-[28%]">Mô tả</TableHead>
                  <TableHead className="py-4 px-5 text-center w-[13%]">Sản phẩm</TableHead>
                  <TableHead className="py-4 px-5 text-center w-[7%]">Hiển thị</TableHead>
                  <TableHead className="py-4 px-5 text-center w-[7%]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand, i) => (
                  <TableRow
                    key={brand.id}
                    className="animate-stagger group"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    {/* Logo + Name + Slug */}
                    <TableCell className="py-3.5 px-5 overflow-hidden max-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                          <img
                            src={brand.imageUrl || "https://placehold.co/80x80?text=Logo"}
                            alt={brand.name}
                            className="w-full h-full object-contain p-0.5"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate font-semibold text-ink text-sm">{brand.name}</span>
                          <span className="block truncate text-[11px] font-mono text-ink-muted/70">{brand.slug}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Country (badge — single column, per user request) */}
                    <TableCell className="py-3.5 px-5 overflow-hidden max-w-0">
                      {brand.country
                        ? <span className="inline-flex px-2 py-0.5 rounded-sm bg-bg text-xs font-medium text-ink-muted border border-border truncate max-w-full">{brand.country}</span>
                        : <span className="text-ink-muted/40 text-sm">—</span>
                      }
                    </TableCell>

                    {/* Description */}
                    <TableCell className="py-3.5 px-5 text-ink-muted overflow-hidden max-w-0">
                      <span className="block truncate text-sm" title={brand.description || undefined}>
                        {brand.description || <span className="italic text-ink-muted/40">Chưa có mô tả</span>}
                      </span>
                    </TableCell>

                    {/* Product count — industry standard (dynamic, per-brand) */}
                    <TableCell className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${
                        (brand.productCount ?? 0) > 0 ? "text-ink" : "text-ink-muted/40"
                      }`}>
                        <Package className="w-3.5 h-3.5 opacity-60" />
                        {brand.productCount ?? 0}
                      </span>
                    </TableCell>

                    {/* Status toggle (Switch only — per user request) */}
                    <TableCell className="py-3.5 px-5 text-center">
                      <Switch
                        checked={brand.isActive}
                        onCheckedChange={() => handleToggleStatus(brand.id, brand.isActive)}
                        title={brand.isActive ? "Đang hiển thị — nhấn để ẩn" : "Đang ẩn — nhấn để hiển thị"}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" title="Chỉnh sửa" onClick={() => openEdit(brand)}
                          className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-brand/10 hover:text-brand">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button type="button" title="Xóa thương hiệu" onClick={() => setDeleteTarget(brand)}
                          className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && brands.length === 0 && (
          <div className="py-16 text-center">
            <Store className="w-10 h-10 text-ink-muted/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-ink-muted">
              {debouncedSearch
                ? `Không tìm thấy thương hiệu khớp với "${debouncedSearch}"`
                : statusFilter === "active" ? "Không có thương hiệu nào đang hoạt động"
                : statusFilter === "inactive" ? "Không có thương hiệu nào đang tạm dừng"
                : "Chưa có thương hiệu nào"}
            </p>
            {!debouncedSearch && !statusFilter && (
              <button type="button" onClick={openCreate} className="mt-3 text-xs text-brand hover:underline font-medium">
                + Thêm thương hiệu đầu tiên
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
            <Pagination currentPage={currentPage} totalPages={data.pagination.totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={o => !o && setIsFormOpen(false)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink">
              {editing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
            </DialogTitle>
            {editing && (
              <p className="text-xs text-ink-muted mt-0.5">
                Slug: <code className="font-mono bg-bg px-1 rounded-sm">{editing.slug}</code>
                {" · "}
                <span className="text-ink">{editing.productCount}</span> sản phẩm đang liên kết
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: main info */}
                <div className="md:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="bName" className="text-sm font-semibold text-ink">Tên thương hiệu <span className="text-brand">*</span></Label>
                      <Controller control={control} name="name" render={({ field }) => (
                        <Input {...field} id="bName" placeholder="Ví dụ: La Roche-Posay"
                          className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                      )} />
                      {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bCountry" className="text-sm font-semibold text-ink">Quốc gia / Xuất xứ</Label>
                      <Controller control={control} name="country" render={({ field }) => (
                        <Input {...field} id="bCountry" placeholder="Ví dụ: Pháp"
                          className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                      )} />
                      {errors.country && <p className="text-xs text-danger">{errors.country.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bDesc" className="text-sm font-semibold text-ink">Mô tả thương hiệu</Label>
                    <Controller control={control} name="description" render={({ field }) => (
                      <Textarea {...field} id="bDesc" rows={5}
                        placeholder="Mô tả tóm tắt thương hiệu sản phẩm..."
                        className="bg-surface border-border focus-visible:ring-brand focus-visible:border-brand resize-none" />
                    )} />
                    {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
                  </div>
                </div>

                {/* Right: logo + status */}
                <div className="md:col-span-1 space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-ink">Logo thương hiệu</Label>
                    <Controller control={control} name="imageUrl" render={({ field }) => (
                      <ImageUpload value={field.value} onChange={url => field.onChange(url)} className="w-full aspect-square" />
                    )} />
                  </div>

                  <div className="p-4 rounded-sm border border-border bg-bg/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bActive" className="text-sm font-semibold text-ink cursor-pointer">Hiển thị công khai</Label>
                      <Controller control={control} name="isActive" render={({ field }) => (
                        <Switch id="bActive" checked={field.value} onCheckedChange={field.onChange} />
                      )} />
                    </div>
                    <p className="text-xs text-ink-muted">
                      Ẩn thương hiệu chỉ xoá khỏi bộ lọc sidebar — sản phẩm không bị ẩn theo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0">
              <Button type="button" variant="outline" className="h-10 bg-surface" onClick={() => setIsFormOpen(false)}>Huỷ</Button>
              <Button type="submit" className="h-10 bg-brand text-white hover:bg-brand-hover shadow-ui-soft px-8"
                disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? "Lưu thay đổi" : "Tạo thương hiệu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="animate-scale-in max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ink">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              Xoá thương hiệu
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-ink-muted mt-2 space-y-2">
              <span>Bạn có chắc muốn xoá thương hiệu <strong className="text-ink">{deleteTarget?.name}</strong>?</span>
              {deleteTarget && (deleteTarget.productCount ?? 0) > 0 && (
                <span className="flex items-start gap-1.5 mt-2 p-2.5 rounded-sm bg-danger/5 border border-danger/20 text-danger text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Thương hiệu này đang có <strong>{deleteTarget.productCount} sản phẩm</strong>. Hệ thống sẽ từ chối — bạn phải chuyển hoặc xoá sản phẩm trước.
                </span>
              )}
              {deleteTarget && (deleteTarget.productCount ?? 0) === 0 && (
                <span className="block mt-1 text-xs text-ink-muted/70">Thương hiệu không có sản phẩm nào. Hành động này không thể hoàn tác.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Huỷ</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending || (deleteTarget?.productCount ?? 0) > 0}
            >
              {deleteMutation.isPending ? "Đang xoá..." : "Xoá thương hiệu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
