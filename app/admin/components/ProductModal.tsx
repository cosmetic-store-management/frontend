import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Category } from "@/admin/types/category";
import {
  productSchema,
  type ProductFormData,
  type VariantFormData,
} from "@/admin/schemas/product.schema";
import { ProductBasicInfo } from "./products/ProductBasicInfo";
import { ProductVariants } from "./products/ProductVariants";
import { ProductImages } from "./products/ProductImages";

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
  name: "Mặc định",
  sku: "",
  price: "0",
  discountPrice: "",
  stock: "0",
  minStock: "10",
  weight: "0",
  imageUrl: "",
  isActive: true,
};

const defaultValues: ProductFormValues = {
  name: "",
  slug: "",
  brandId: "",
  description: "",
  imageUrl: "",
  imageUrls: [],
  categoryId: "",
  categoryIds: [],
  isActive: true,
  variants: [{ ...defaultVariant }],
};

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
    [initialValues],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: mergedInitialValues,
  });

  const imageUrlsList = watch("imageUrls") || [];
  const [showSlug, setShowSlug] = useState(false);

  useEffect(() => {
    if (!open) return;
    reset(mergedInitialValues);
    setShowSlug(false);
  }, [open, mergedInitialValues, reset]);

  const onSubmitForm = async (data: ProductFormData) => {
    await onSubmit(data as any);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[1100px] w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border flex flex-col">
        <DialogHeader className="px-7 py-4 border-b border-border bg-surface shrink-0">
          <DialogTitle className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
            {/* ─── LEFT: Form ─── */}
            <div className="flex-1 overflow-y-auto bg-surface">
              {submitError && (
                <div className="mx-6 mt-4 border border-danger/40 bg-danger/5 px-4 py-3 rounded-sm text-sm text-danger">
                  {submitError}
                </div>
              )}
              <div className="p-6 md:p-7 space-y-5">
                <ProductBasicInfo
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  categories={categories}
                  brands={brands}
                  showSlug={showSlug}
                  setShowSlug={setShowSlug}
                />

                <ProductVariants control={control} errors={errors} />
              </div>
            </div>

            {/* ─── RIGHT: Images + Status ─── */}
            <ProductImages
              control={control}
              errors={errors}
              setValue={setValue}
              imageUrlsList={imageUrlsList}
            />
          </div>

          <DialogFooter className="px-7 py-4 border-t border-border bg-surface shrink-0 sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 bg-surface"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-8 font-bold bg-brand text-white hover:bg-brand-dark transition-all"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
