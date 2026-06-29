import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import type { Category } from "@/admin/types/category";
import {
  productSchema,
  type ProductFormData,
  type VariantFormData,
} from "@/admin/schemas/product.schema";
import { ProductBasicInfo } from "./ProductBasicInfo";
import { ProductVariants } from "./ProductVariants";
import { ProductImages } from "./ProductImages";

export type VariantFormValues = VariantFormData;
export type ProductFormValues = ProductFormData;

export type ProductEditorProps = {
  mode: "create" | "edit";
  loading?: boolean;
  submitError?: string | null;
  categories: Category[];
  brands: any[];
  initialValues?: Partial<ProductFormValues>;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
};

export const defaultVariant: VariantFormValues = {
  name: "Default",
  sku: "",
  price: "0",
  discountPrice: "",
  stock: "0",
  minStock: "10",
  weight: "0",
  imageUrl: "",
  isActive: true,
};

export const defaultValues: ProductFormValues = {
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

export default function ProductEditor({
  mode,
  loading = false,
  submitError = null,
  categories,
  brands,
  initialValues,
  onCancel,
  onSubmit,
}: ProductEditorProps) {
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
    reset(mergedInitialValues);
    setShowSlug(false);
  }, [mergedInitialValues, reset]);

  const onSubmitForm = async (data: ProductFormData) => {
    await onSubmit(data as any);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="flex flex-col flex-1"
    >
      <div className="flex-1 flex flex-col lg:flex-row gap-6 mb-6">
        {/* ─── LEFT: Form ─── */}
        <div className="flex-1 space-y-6">
          {submitError && (
            <div className="border border-danger/40 bg-danger/5 px-4 py-3 rounded-sm text-sm text-danger">
              {submitError}
            </div>
          )}

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

        {/* ─── RIGHT: Images + Status ─── */}
        <div className="lg:w-[320px] shrink-0 space-y-6">
          <ProductImages
            control={control}
            errors={errors}
            setValue={setValue}
            imageUrlsList={imageUrlsList}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 px-5"
        >{i18next.t("Huỷ")}</Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-8 font-bold bg-brand text-white hover:bg-brand-dark transition-all"
        >
          {loading
            ? "Đang lưu..."
            : mode === "create"
              ? "Tạo sản phẩm"
              : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}
