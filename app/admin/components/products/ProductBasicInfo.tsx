import { lazy, Suspense } from "react";
const ReactQuill = lazy(() =>
  import("react-quill-new").then((m) => ({ default: m.default || m })),
);
import "react-quill-new/dist/quill.snow.css";
import {
  Controller,
  type Control,
  type UseFormSetValue,
  type FieldErrors,
} from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormData } from "@/admin/schemas/product.schema";
import type { Category } from "@/admin/types/category";

type ProductBasicInfoProps = {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  categories: Category[];
  brands: any[];
  showSlug: boolean;
  setShowSlug: React.Dispatch<React.SetStateAction<boolean>>;
};

const toSlug = (value: string) =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function buildFlatOptions(
  cats: Category[],
): Array<{ id: string; label: string; depth: number; isActive: boolean }> {
  const childMap = new Map<string, Category[]>();
  const roots: Category[] = [];
  cats.forEach((c) => {
    if (c.parentId) {
      const s = childMap.get(c.parentId) || [];
      s.push(c);
      childMap.set(c.parentId, s);
    } else roots.push(c);
  });
  const result: Array<{
    id: string;
    label: string;
    depth: number;
    isActive: boolean;
  }> = [];
  const walk = (list: Category[], depth: number) => {
    list
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((c) => {
        result.push({ id: c.id, label: c.name, depth, isActive: c.isActive });
        walk(childMap.get(c.id) || [], depth + 1);
      });
  };
  walk(roots, 0);
  return result;
}

export function ProductBasicInfo({
  control,
  errors,
  setValue,
  categories,
  brands,
  showSlug,
  setShowSlug,
}: ProductBasicInfoProps) {
  const handleNameChange = (value: string) => {
    setValue("name", value, { shouldValidate: true });
    setValue("slug", toSlug(value));
  };

  return (
    <>
      {/* Tên sản phẩm */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-ink">Product Name<span className="text-danger">*</span>
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              {...field}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Product Name"
              className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
            />
          )}
        />
        {errors.name && (
          <p className="text-xs text-danger">{errors.name.message}</p>
        )}
      </div>
      {/* Slug toggle — không tạo khoảng trống khi ẩn */}
      <div className="-mt-2.5">
        <button
          type="button"
          onClick={() => setShowSlug((s) => !s)}
          className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-brand transition-colors py-1"
        >
          {showSlug ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          Slug URL
        </button>
        {showSlug && (
          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <Input
                {...field}
                readOnly
                className="h-8 text-xs bg-surface-soft text-ink-muted cursor-not-allowed border-dashed font-mono mt-1"
              />
            )}
          />
        )}
      </div>

      {/* Danh mục + Thương hiệu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-ink">Category<span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full h-10 border-border focus:ring-brand">
                  <SelectValue placeholder="-- Select Category --" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {buildFlatOptions(categories).map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <span
                        style={{ paddingLeft: `${opt.depth * 14}px` }}
                        className="flex items-center gap-1"
                      >
                        {opt.depth > 0 && (
                          <span className="text-ink-muted/50 text-xs">└</span>
                        )}
                        <span
                          className={
                            !opt.isActive ? "text-ink-muted line-through" : ""
                          }
                        >
                          {opt.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-xs text-danger">{errors.categoryId.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-ink">Brand<span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="brandId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full h-10 border-border focus:ring-brand">
                  <SelectValue placeholder="-- Select Brand --" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {brands?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="flex items-center gap-2">
                        {b.logoUrl && (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            className="w-5 h-5 object-contain rounded-sm shrink-0"
                          />
                        )}
                        <span className={!b.isActive ? "text-ink-muted" : ""}>
                          {b.name}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.brandId && (
            <p className="text-xs text-danger">{errors.brandId.message}</p>
          )}
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-ink">Product Description</Label>
        <div className="min-h-50 [&_.ql-editor]:min-h-37.5">
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Suspense
                fallback={
                  <div className="p-4 text-sm text-ink-muted">
                    Loading editor...
                  </div>
                }
              >
                <ReactQuill
                  theme="snow"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Enter product description"
                  className="bg-surface"
                />
              </Suspense>
            )}
          />
        </div>
      </div>
    </>
  );
}
