import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categorySchema,
  type CategoryFormData,
} from "@/admin/schemas/category.schema";
import type { Category } from "@/admin/types/category";

const EMPTY_FORM: CategoryFormData = {
  name: "",
  description: "",
  imageUrl: "",
  iconUrl: "",
  bannerUrl: "",
  parentId: null,
  isActive: true,
  sortOrder: 1,
};

const CDN =
  "https://theme.hstatic.net/1000006063/1001370907/14/vertical_menu_icon_";
const V = ".png?v=3512";

const COSMETICS_ICONS = [
  { url: CDN + "2" + V, label: "Da mặt", hint: "Chăm sóc da mặt" },
  { url: CDN + "1" + V, label: "Trang điểm", hint: "Makeup, son, phấn" },
  { url: CDN + "7" + V, label: "Chống nắng", hint: "Kem chống nắng" },
  { url: CDN + "8" + V, label: "Môi", hint: "Chăm sóc môi" },
  { url: CDN + "6" + V, label: "Nước hoa", hint: "Perfume" },
  { url: CDN + "3" + V, label: "Cơ thể", hint: "Chăm sóc cơ thể" },
  { url: CDN + "4" + V, label: "Tóc & đầu", hint: "Chăm sóc tóc" },
  { url: CDN + "5" + V, label: "Cá nhân", hint: "Vệ sinh cá nhân" },
  { url: CDN + "11" + V, label: "Thiết bị", hint: "Dụng cụ làm đẹp" },
  { url: CDN + "9" + V, label: "Dưỡng ẩm", hint: "Serum, toner" },
  { url: CDN + "10" + V, label: "Làm sạch", hint: "Tẩy trang, sữa rửa" },
  { url: CDN + "12" + V, label: "Mắt", hint: "Mascara, kẻ mắt" },
  { url: CDN + "13" + V, label: "Nail", hint: "Sơn móng, nail art" },
  { url: CDN + "15" + V, label: "Set quà", hint: "Gift set, combo" },
];

const NAME_TO_ICON: Record<string, string> = {
  "chăm sóc da mặt": CDN + "2" + V,
  "trang điểm": CDN + "1" + V,
  "chống nắng": CDN + "7" + V,
  "chăm sóc môi": CDN + "8" + V,
  "nước hoa": CDN + "6" + V,
  "chăm sóc cơ thể": CDN + "3" + V,
  "chăm sóc tóc & da đầu": CDN + "4" + V,
  "chăm sóc tóc": CDN + "4" + V,
  "chăm sóc cá nhân": CDN + "5" + V,
  "thiết bị làm đẹp": CDN + "11" + V,
  "dụng cụ làm đẹp": CDN + "11" + V,
  "dưỡng ẩm": CDN + "9" + V,
  "làm sạch": CDN + "10" + V,
  "chăm sóc mắt": CDN + "12" + V,
  nail: CDN + "13" + V,
  "set quà": CDN + "15" + V,
};

type CategoryFormModalProps = {
  open: boolean;
  editing: Category | null;
  flatOptions: Array<{ id: string; label: string; depth: number }>;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  loading: boolean;
};

export function CategoryFormModal({
  open,
  editing,
  flatOptions,
  onClose,
  onSubmit,
  loading,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: EMPTY_FORM,
  });

  const iconUrl = watch("iconUrl");
  const bannerUrl = watch("bannerUrl");
  const parentIdValue = watch("parentId");
  const nameValue = watch("name");

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              name: editing.name,
              description: editing.description || "",
              imageUrl: "",
              iconUrl: editing.iconUrl || "",
              bannerUrl: editing.bannerUrl || "",
              parentId: editing.parentId || null,
              isActive: editing.isActive,
              sortOrder: editing.sortOrder ?? 1,
            }
          : EMPTY_FORM,
      );
    } else {
      reset(EMPTY_FORM);
    }
  }, [open, editing, reset]);

  // Auto-suggest icon
  useEffect(() => {
    if (!nameValue || iconUrl) return;
    const key = nameValue.trim().toLowerCase();
    const suggested = NAME_TO_ICON[key];
    if (suggested) setValue("iconUrl", suggested, { shouldValidate: false });
  }, [nameValue, iconUrl, setValue]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-xl bg-surface shadow-ui-card border-border gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
          <DialogTitle className="text-xl font-bold text-ink">
            {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Cột trái */}
              <div className="md:col-span-8 flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="catName"
                    className="text-sm font-semibold text-ink"
                  >
                    Tên danh mục <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="catName"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    placeholder="VD: Chăm sóc da"
                    className="h-10 bg-surface focus-visible:ring-brand"
                  />
                  {errors.name && (
                    <p className="text-xs text-danger">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="catDesc"
                    className="text-sm font-semibold text-ink"
                  >
                    Mô tả danh mục
                  </Label>
                  <Textarea
                    id="catDesc"
                    rows={4}
                    {...register("description")}
                    placeholder="Nhập mô tả ngắn gọn..."
                    className="bg-surface focus-visible:ring-brand resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-danger">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-semibold text-ink">
                    Danh mục cha
                  </Label>
                  <Controller
                    name="parentId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "none"}
                        onValueChange={(val) =>
                          field.onChange(val === "none" ? null : val)
                        }
                      >
                        <SelectTrigger className="w-full h-10 bg-surface focus:ring-brand">
                          <SelectValue placeholder="Danh mục gốc" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="none">
                            <span className="text-ink-muted font-medium">
                              Danh mục gốc
                            </span>
                          </SelectItem>
                          {flatOptions
                            .filter((opt) => opt.id !== editing?.id)
                            .map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                <span
                                  style={{ paddingLeft: `${opt.depth * 16}px` }}
                                  className="flex items-center gap-1"
                                >
                                  {opt.depth > 0 && (
                                    <span className="text-ink-muted/50 text-xs">
                                      └
                                    </span>
                                  )}
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.parentId && (
                    <p className="text-xs text-danger">
                      {errors.parentId.message}
                    </p>
                  )}
                </div>

                {/* Banner Mega Menu */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="catBanner"
                    className="text-sm font-semibold text-ink"
                  >
                    Banner Mega Menu
                  </Label>
                  <Input
                    id="catBanner"
                    {...register("bannerUrl")}
                    placeholder="https://... (URL ảnh banner)"
                    className="h-10 bg-surface focus-visible:ring-brand"
                  />
                  {bannerUrl && (
                    <div className="relative mt-1.5 rounded-md overflow-hidden border border-border bg-surface-muted w-full">
                      <div className="aspect-[3/1] w-full">
                        <img
                          src={bannerUrl}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement!.style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải */}
              <div className="md:col-span-4 flex flex-col gap-6">
                {!parentIdValue && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-semibold text-ink">
                        Icon danh mục
                      </Label>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {COSMETICS_ICONS.map(({ url, label, hint }) => (
                          <button
                            type="button"
                            key={url}
                            onClick={() =>
                              setValue("iconUrl", iconUrl === url ? "" : url, {
                                shouldValidate: true,
                              })
                            }
                            title={`${label} — ${hint}`}
                            className={`flex items-center justify-center aspect-square rounded-md border transition-all hover:border-brand hover:bg-brand/5 ${
                              iconUrl === url
                                ? "border-brand bg-brand/10 ring-1 ring-brand/30"
                                : "border-border bg-surface"
                            }`}
                          >
                            <img
                              src={url}
                              alt={label}
                              className="w-8 h-8 object-contain drop-shadow-sm"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-semibold text-ink">
                        URL Icon tuỳ chỉnh
                      </Label>
                      <Input
                        {...register("iconUrl")}
                        placeholder="https://..."
                        className="h-10 bg-surface focus-visible:ring-brand"
                      />
                      {errors.iconUrl && (
                        <p className="text-xs text-danger">
                          {errors.iconUrl.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="catActive"
                    className="text-sm font-semibold text-ink"
                  >
                    Trạng thái hiển thị
                  </Label>
                  <div className="flex items-center justify-between h-11 px-4 rounded-md border border-border bg-surface">
                    {/* eslint-disable-next-line  */}
                    {/* eslint-disable-next-line  */}
                    <span
                      className="text-sm font-medium text-ink select-none cursor-pointer"
                      onClick={() => setValue("isActive", !watch("isActive"))}
                    >
                      Kích hoạt hiển thị
                    </span>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="catActive"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="catSort"
                    className="text-sm font-semibold text-ink"
                  >
                    Thứ tự ưu tiên
                  </Label>
                  <Input
                    id="catSort"
                    type="number"
                    min={0}
                    {...register("sortOrder")}
                    className="h-10 bg-surface focus-visible:ring-brand font-mono"
                  />
                  {errors.sortOrder && (
                    <p className="text-xs text-danger">
                      {errors.sortOrder.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-6 bg-surface hover:bg-surface-muted"
              onClick={onClose}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              className="h-10 px-8 font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-sm"
              disabled={loading}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
