import i18next from "i18next";
import { useTranslation } from "react-i18next";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import { Plus } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ProductFormData } from "@/admin/schemas/product.schema";

type ProductImagesProps = {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  imageUrlsList: string[];
};

const MAX_DETAIL_IMAGES = 20;

export function ProductImages({
  control,
  errors,
  setValue,
  imageUrlsList,
}: ProductImagesProps) {
  // Detail image management — capped at MAX_DETAIL_IMAGES slots
  const setDetailImage = (idx: number, url: string) => {
    const updated = [...imageUrlsList];
    updated[idx] = url;
    setValue("imageUrls", updated, { shouldValidate: false });
  };

  const addDetailSlot = () => {
    if (imageUrlsList.length < MAX_DETAIL_IMAGES) {
      setValue("imageUrls", [...imageUrlsList, ""], { shouldValidate: false });
    }
  };

  const removeDetailSlot = (idxToRemove: number) => {
    const updated = imageUrlsList.filter((_, idx) => idx !== idxToRemove);
    setValue("imageUrls", updated, { shouldValidate: false });
  };

  return (
    <div className="w-full lg:w-75 xl:w-85 bg-bg border-t lg:border-t-0 lg:border-l border-border overflow-y-auto shrink-0">
      <div className="p-5 space-y-5">
        {/* Ảnh đại diện */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-ink">{i18next.t("Ảnh đại diện")}<span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImageUpload
                value={field.value || ""}
                onChange={field.onChange}
                className="w-full"
              />
            )}
          />
          {errors.imageUrl && (
            <p className="text-xs text-danger">{errors.imageUrl.message}</p>
          )}
        </div>

        {/* Ảnh chi tiết — grid upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-ink">{i18next.t("Ảnh chi tiết")}</Label>
            {imageUrlsList.length < MAX_DETAIL_IMAGES && (
              <button
                type="button"
                onClick={addDetailSlot}
                className="flex items-center gap-1 text-[11px] text-brand hover:text-brand-dark font-medium transition-colors"
              >
                <Plus className="w-3 h-3" />{i18next.t("Thêm")}</button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {imageUrlsList.map((url, idx) => (
              <div key={idx} className="relative group">
                <ImageUpload
                  compact
                  value={url}
                  onChange={(newUrl) => setDetailImage(idx, newUrl)}
                  className="w-full"
                />
                {!url && (
                  <button
                    type="button"
                    onClick={() => removeDetailSlot(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-surface text-ink-muted border border-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:text-danger hover:border-danger hover:bg-danger/10 shadow-sm transition-all z-10"
                    title="Xóa ô tải ảnh này"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {/* Slot thêm nếu còn trống */}
            {imageUrlsList.length === 0 && (
              <div
                onClick={addDetailSlot}
                className="aspect-square border-2 border-dashed border-border rounded-sm flex items-center justify-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-all col-span-1"
              >
                <Plus className="w-5 h-5 text-ink-muted" />
              </div>
            )}
          </div>
        </div>

        {/* Trạng thái */}
        <div className="p-4 bg-surface border border-border rounded-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{i18next.t("Hiển thị trên web")}</p>
            <p className="text-xs text-ink-muted mt-0.5">{i18next.t("Bật → khách hàng thấy sản phẩm")}</p>
          </div>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
