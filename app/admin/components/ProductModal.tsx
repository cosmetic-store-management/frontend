import { useEffect, useMemo, useState, lazy, Suspense } from "react";
const ReactQuill = lazy(() => import("react-quill").then(m => ({ default: m.default || m })));
import "react-quill/dist/quill.snow.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { PriceInput } from "@/components/ui/price-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/admin/types/category";
import { productSchema, type ProductFormData, type VariantFormData } from "@/admin/schemas/product.schema";

function buildFlatOptions(cats: Category[]): Array<{ id: string; label: string; depth: number; isActive: boolean }> {
  const childMap = new Map<string, Category[]>();
  const roots: Category[] = [];
  cats.forEach((c) => {
    if (c.parentId) { const s = childMap.get(c.parentId) || []; s.push(c); childMap.set(c.parentId, s); }
    else roots.push(c);
  });
  const result: Array<{ id: string; label: string; depth: number; isActive: boolean }> = [];
  const walk = (list: Category[], depth: number) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder).forEach((c) => {
      result.push({ id: c.id, label: c.name, depth, isActive: c.isActive });
      walk(childMap.get(c.id) || [], depth + 1);
    });
  };
  walk(roots, 0);
  return result;
}

export type VariantFormValues = VariantFormData;
export type ProductFormValues = ProductFormData;

type ProductModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  submitError?: string | null;
  categories: Category[];
  brands: any[];
  initialValues?: Partial<ProductFormValues>;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
};

const defaultVariant: VariantFormValues = {
  name: "Mặc định", sku: "", price: "0", discountPrice: "", stock: "0", minStock: "10", weight: "0", imageUrl: "", isActive: true
};

const defaultValues: ProductFormValues = {
  name: "", slug: "", brandId: "", description: "",
  imageUrl: "", imageUrls: [], categoryId: "", categoryIds: [], isActive: true,
  variants: [{ ...defaultVariant }]
};

const toSlug = (value: string) =>
  value.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

// Max 6 detail images
const MAX_DETAIL_IMAGES = 6;

export default function ProductModal({
  open,
  mode,
  loading = false,
  submitError = null,
  categories,
  brands,
  initialValues,
  onClose,
  onSubmit,
}: ProductModalProps) {
  const mergedInitialValues = useMemo<ProductFormValues>(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues]
  );

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: mergedInitialValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const imageUrlsList = watch("imageUrls") || [];
  const [showSlug, setShowSlug] = useState(false);

  useEffect(() => {
    if (!open) return;
    reset(mergedInitialValues);
    setShowSlug(false);
  }, [open, mergedInitialValues, reset]);

  const handleNameChange = (value: string) => {
    setValue("name", value, { shouldValidate: true });
    setValue("slug", toSlug(value));
  };

  const onSubmitForm = async (data: ProductFormData) => {
    await onSubmit(data as any);
  };

  // Detail image management — capped at MAX_DETAIL_IMAGES slots
  const setDetailImage = (idx: number, url: string) => {
    const updated = [...imageUrlsList];
    updated[idx] = url;
    setValue("imageUrls", updated, { shouldValidate: false });
  };
  const addDetailSlot = () => {
    if (imageUrlsList.length < MAX_DETAIL_IMAGES)
      setValue("imageUrls", [...imageUrlsList, ""], { shouldValidate: false });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[1100px] w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden sm:rounded-md bg-surface shadow-ui-card border-border flex flex-col">
        <DialogHeader className="px-7 py-4 border-b border-border bg-surface shrink-0">
          <DialogTitle className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

            {/* ─── LEFT: Form ─── */}
            <div className="flex-1 overflow-y-auto bg-surface">
              {submitError && (
                <div className="mx-6 mt-4 border border-danger/40 bg-danger/5 px-4 py-3 rounded-sm text-sm text-danger">
                  {submitError}
                </div>
              )}
              <div className="p-6 md:p-7 space-y-7">

                {/* Tên sản phẩm */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-ink">Tên sản phẩm <span className="text-danger">*</span></Label>
                  <Controller control={control} name="name"
                    render={({ field }) => (
                      <Input {...field} onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Tên sản phẩm"
                        className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                    )}
                  />
                  {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                </div>
                {/* Slug toggle — không tạo khoảng trống khi ẩn */}
                <div className="-mt-4">
                  <button type="button" onClick={() => setShowSlug(s => !s)}
                    className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-brand transition-colors py-1">
                    {showSlug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Slug URL
                  </button>
                  {showSlug && (
                    <Controller control={control} name="slug"
                      render={({ field }) => (
                        <Input {...field} readOnly className="h-8 text-xs bg-surface-soft text-ink-muted cursor-not-allowed border-dashed font-mono mt-1" />
                      )}
                    />
                  )}
                </div>

                {/* Danh mục + Thương hiệu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-ink">Danh mục <span className="text-danger">*</span></Label>
                    <Controller control={control} name="categoryId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-10 border-border focus:ring-brand">
                            <SelectValue placeholder="-- Chọn danh mục --" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {buildFlatOptions(categories).map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                <span style={{ paddingLeft: `${opt.depth * 14}px` }} className="flex items-center gap-1">
                                  {opt.depth > 0 && <span className="text-ink-muted/50 text-xs">└</span>}
                                  <span className={!opt.isActive ? "text-ink-muted line-through" : ""}>{opt.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-ink">Thương hiệu <span className="text-danger">*</span></Label>
                    <Controller control={control} name="brandId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-10 border-border focus:ring-brand">
                            <SelectValue placeholder="-- Chọn thương hiệu --" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {brands?.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                <span className="flex items-center gap-2">
                                  {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="w-5 h-5 object-contain rounded-sm shrink-0" />}
                                  <span className={!b.isActive ? "text-ink-muted" : ""}>{b.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.brandId && <p className="text-xs text-danger">{errors.brandId.message}</p>}
                  </div>
                </div>

                {/* Mô tả */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-ink">Mô tả sản phẩm</Label>
                  <div className="min-h-[200px] [&_.ql-editor]:min-h-[150px]">
                    <Controller control={control} name="description"
                      render={({ field }) => (
                        <Suspense fallback={<div className="p-4 text-sm text-ink-muted">Đang tải trình soạn thảo...</div>}>
                          <ReactQuill 
                            theme="snow" 
                            value={field.value || ""} 
                            onChange={field.onChange} 
                            placeholder="Nhập mô tả sản phẩm"
                            className="bg-surface"
                          />
                        </Suspense>
                      )}
                    />
                  </div>
                </div>

                {/* ── Phân loại hàng ── */}
                <section>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Phân loại hàng</h3>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => append({ ...defaultVariant, name: `Phân loại ${fields.length + 1}` })}
                      className="gap-1.5 h-8 text-xs border-border text-ink hover:bg-surface-soft bg-surface shadow-none">
                      <Plus className="w-3.5 h-3.5" /> Thêm phân loại
                    </Button>
                  </div>
                  {errors.variants?.message && <p className="text-xs text-danger mb-3">{errors.variants.message}</p>}

                  <div className="space-y-4">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="relative border border-border bg-surface rounded-sm p-4 pt-7 group">
                        <div className="absolute right-0 top-0 bg-bg border-b border-l border-border px-2.5 py-1 rounded-bl-sm rounded-tr-sm text-[10px] font-bold text-ink-muted tracking-wider">
                          PHÂN LOẠI {idx + 1}
                        </div>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(idx)}
                            className="absolute right-20 top-1.5 p-1 text-ink-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex gap-4 items-start">
                          {/* Ảnh variant */}
                          <div className="shrink-0 w-20 space-y-1">
                            <Label className="text-xs font-medium text-ink-muted">Ảnh</Label>
                            <Controller control={control} name={`variants.${idx}.imageUrl`}
                              render={({ field: vf }) => (
                                <ImageUpload
                                  compact
                                  value={vf.value || ""}
                                  onChange={vf.onChange}
                                  className="w-20 h-20 rounded-sm"
                                />
                              )}
                            />
                          </div>

                          {/* Fields */}
                          <div className="flex-1 grid grid-cols-2 xl:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-ink">Tên phân loại <span className="text-danger">*</span></Label>
                              <Controller control={control} name={`variants.${idx}.name`}
                                render={({ field: vf }) => (
                                  <Input {...vf} placeholder="50ml" className="h-9 text-sm bg-surface focus-visible:ring-brand focus-visible:border-brand" />
                                )}
                              />
                              {errors.variants?.[idx]?.name && <p className="text-xs text-danger">{errors.variants[idx]?.name?.message}</p>}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-ink">Mã SKU</Label>
                              <Controller control={control} name={`variants.${idx}.sku`}
                                render={({ field: vf }) => (
                                  <Input {...vf} placeholder="SKU-001" className="h-9 text-sm bg-surface focus-visible:ring-brand focus-visible:border-brand font-mono" />
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-ink">Tồn kho <span className="text-danger">*</span></Label>
                              <Controller control={control} name={`variants.${idx}.stock`}
                                render={({ field: vf }) => (
                                  <Input type="number" min={0} {...vf} className="h-9 text-sm bg-surface focus-visible:ring-brand focus-visible:border-brand font-mono" />
                                )}
                              />
                              {errors.variants?.[idx]?.stock && <p className="text-xs text-danger">{errors.variants[idx]?.stock?.message}</p>}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-ink">Giá niêm yết <span className="text-danger">*</span></Label>
                              <Controller control={control} name={`variants.${idx}.price`}
                                render={({ field: vf }) => (
                                  <PriceInput
                                    value={vf.value}
                                    onChange={vf.onChange}
                                    placeholder="0"
                                  />
                                )}
                              />
                              {errors.variants?.[idx]?.price && <p className="text-xs text-danger">{errors.variants[idx]?.price?.message}</p>}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-ink">Giá khuyến mãi</Label>
                              <Controller control={control} name={`variants.${idx}.discountPrice`}
                                render={({ field: vf }) => (
                                  <PriceInput
                                    value={vf.value || ""}
                                    onChange={vf.onChange}
                                    placeholder="Không giảm"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>

            {/* ─── RIGHT: Images + Status ─── */}
            <div className="w-full lg:w-[300px] xl:w-[340px] bg-bg border-t lg:border-t-0 lg:border-l border-border overflow-y-auto shrink-0">
              <div className="p-5 space-y-5">

                {/* Ảnh đại diện */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-ink">Ảnh đại diện <span className="text-danger">*</span></Label>
                  <Controller control={control} name="imageUrl"
                    render={({ field }) => (
                      <ImageUpload value={field.value || ""} onChange={field.onChange} className="w-full" />
                    )}
                  />
                  {errors.imageUrl && <p className="text-xs text-danger">{errors.imageUrl.message}</p>}
                </div>

                {/* Ảnh chi tiết — grid upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-ink">Ảnh chi tiết</Label>
                    {imageUrlsList.length < MAX_DETAIL_IMAGES && (
                      <button type="button" onClick={addDetailSlot}
                        className="flex items-center gap-1 text-[11px] text-brand hover:text-brand-dark font-medium transition-colors">
                        <Plus className="w-3 h-3" /> Thêm
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrlsList.map((url, idx) => (
                      <ImageUpload
                        key={idx}
                        compact
                        value={url}
                        onChange={(newUrl) => setDetailImage(idx, newUrl)}
                        className="w-full"
                      />
                    ))}
                    {/* Slot thêm nếu còn trống */}
                    {imageUrlsList.length === 0 && (
                      <div
                        onClick={addDetailSlot}
                        className="aspect-square border-2 border-dashed border-border rounded-md flex items-center justify-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-all col-span-1"
                      >
                        <Plus className="w-5 h-5 text-ink-muted" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="p-4 bg-surface border border-border rounded-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Hiển thị trên web</p>
                    <p className="text-xs text-ink-muted mt-0.5">Bật → khách hàng thấy sản phẩm</p>
                  </div>
                  <Controller control={control} name="isActive"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

              </div>
            </div>
          </div>

          <DialogFooter className="px-7 py-4 border-t border-border bg-surface shrink-0 sm:justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-5 bg-surface">Hủy</Button>
            <Button type="submit" disabled={loading}
              className="h-10 px-8 font-bold bg-brand text-white hover:bg-brand-dark shadow-sm transition-all">
              {loading ? "Đang xử lý..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
