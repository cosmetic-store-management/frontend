import {
  Controller,
  type Control,
  type FieldErrors,
  useFieldArray,
} from "react-hook-form";
import { Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { PriceInput } from "@/components/ui/price-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  ProductFormData,
  VariantFormData,
} from "@/admin/schemas/product.schema";

type ProductVariantsProps = {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
};

const defaultVariant: VariantFormData = {
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

export function ProductVariants({ control, errors }: ProductVariantsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <section>
      <div className={`flex items-center justify-between mb-3 pb-2 ${fields.length > 0 ? "border-b border-border" : ""}`}>
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Variants</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              ...defaultVariant,
              name: `Variant ${fields.length + 1}`,
            })
          }
          className="gap-1.5 h-8 text-xs border-border text-ink hover:bg-surface-soft bg-surface shadow-none"
        >
          <Plus className="w-3.5 h-3.5" />Add Variant</Button>
      </div>
      {errors.variants?.message && (
        <p className="text-xs text-danger mb-3">{errors.variants.message}</p>
      )}

      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="relative border border-border bg-surface rounded-sm p-4 pt-7 group"
          >
            <div className="absolute right-0 top-0 bg-bg border-b border-l border-border px-2.5 py-1 rounded-bl-sm rounded-tr-sm text-[10px] font-bold text-ink-muted tracking-wider">
              VARIANT {idx + 1}
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center text-danger hover:bg-muted opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
              title="Delete Variant"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-4 items-start">
              {/* Ảnh variant */}
              <div className="shrink-0 w-20 space-y-1">
                <Label className="text-xs font-medium text-ink-muted">Image</Label>
                <Controller
                  control={control}
                  name={`variants.${idx}.imageUrl`}
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
                  <Label className="text-xs font-semibold text-ink">Variant Name<span className="text-danger">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.name`}
                    render={({ field: vf }) => (
                      <Input
                        {...vf}
                        placeholder="50ml"
                        className="h-9 text-sm bg-surface focus-visible:ring-brand focus-visible:border-brand"
                      />
                    )}
                  />
                  {errors.variants?.[idx]?.name && (
                    <p className="text-xs text-danger">
                      {errors.variants[idx]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-ink">SKU<span className="text-danger">*</span></Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.sku`}
                    render={({ field: vf }) => (
                      <Input
                        {...vf}
                        placeholder="SKU-001"
                        className="h-9 text-sm bg-surface focus-visible:ring-brand focus-visible:border-brand font-mono"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-ink">Stock<span className="text-danger">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.stock`}
                    render={({ field: vf }) => (
                      <Input
                        type="number"
                        min={0}
                        {...vf}
                        className="h-9 text-sm bg-surface focus-visible:ring-brand focus-visible:border-brand font-mono"
                      />
                    )}
                  />
                  {errors.variants?.[idx]?.stock && (
                    <p className="text-xs text-danger">
                      {errors.variants[idx]?.stock?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-ink">Regular Price<span className="text-danger">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.price`}
                    render={({ field: vf }) => (
                      <PriceInput
                        value={vf.value}
                        onChange={vf.onChange}
                        placeholder="0"
                      />
                    )}
                  />
                  {errors.variants?.[idx]?.price && (
                    <p className="text-xs text-danger">
                      {errors.variants[idx]?.price?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-ink">Sale Price</Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.discountPrice`}
                    render={({ field: vf }) => (
                      <PriceInput
                        value={vf.value || ""}
                        onChange={vf.onChange}
                        placeholder="No discount"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-ink">Status</Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.isActive`}
                    render={({ field: vf }) => (
                      <div className="flex h-9 items-center px-1">
                        <Switch
                          checked={vf.value}
                          onCheckedChange={vf.onChange}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
