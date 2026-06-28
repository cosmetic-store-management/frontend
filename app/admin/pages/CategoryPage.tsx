import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  MoreVertical,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCategories,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useUpdateCategoryStatus,
  useDeleteCategory,
} from "../hooks/useCategory";
import {
  categorySchema,
  type CategoryFormData,
} from "@/admin/schemas/category.schema";
import type { Category } from "@/admin/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Pagination } from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/lib/toast";
import { PageHeader } from "../components/PageHeader";

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

// Icons từ cùng CDN với 9 danh mục chính — đảm bảo đồng nhất UI
// Nguồn: theme.hstatic.net (Haravan VN) — verified HTTP 200
const CDN =
  "https://theme.hstatic.net/1000006063/1001370907/14/vertical_menu_icon_";
const V = ".png?v=3512";

const COSMETICS_ICONS = [
  // Nhóm 1: 9 icon khớp với 9 danh mục chính
  { url: CDN + "2" + V, label: "Da mặt", hint: "Chăm sóc da mặt" },
  { url: CDN + "1" + V, label: "Trang điểm", hint: "Makeup, son, phấn" },
  { url: CDN + "7" + V, label: "Chống nắng", hint: "Kem chống nắng" },
  { url: CDN + "8" + V, label: "Môi", hint: "Chăm sóc môi" },
  { url: CDN + "6" + V, label: "Nước hoa", hint: "Perfume" },
  { url: CDN + "3" + V, label: "Cơ thể", hint: "Chăm sóc cơ thể" },
  { url: CDN + "4" + V, label: "Tóc & đầu", hint: "Chăm sóc tóc" },
  { url: CDN + "5" + V, label: "Cá nhân", hint: "Vệ sinh cá nhân" },
  { url: CDN + "11" + V, label: "Thiết bị", hint: "Dụng cụ làm đẹp" },
  // Nhóm 2: Icon bổ sung cho danh mục con
  { url: CDN + "9" + V, label: "Dưỡng ẩm", hint: "Serum, toner" },
  { url: CDN + "10" + V, label: "Làm sạch", hint: "Tẩy trang, sữa rửa" },
  { url: CDN + "12" + V, label: "Mắt", hint: "Mascara, kẻ mắt" },
  { url: CDN + "13" + V, label: "Nail", hint: "Sơn móng, nail art" },
  { url: CDN + "15" + V, label: "Set quà", hint: "Gift set, combo" },
];

// Auto-suggest: gõ tên → tự động gợi ý icon phù hợp
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

function buildTreeRows(
  cats: Category[],
): Array<{ cat: Category; depth: number }> {
  const map = new Map<string, Category[]>();
  const roots: Category[] = [];
  cats.forEach((c) => {
    if (c.parentId) {
      const s = map.get(c.parentId) || [];
      s.push(c);
      map.set(c.parentId, s);
    } else roots.push(c);
  });
  const rows: Array<{ cat: Category; depth: number }> = [];
  const walk = (list: Category[], depth: number) => {
    list
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((c) => {
        rows.push({ cat: c, depth });
        walk(map.get(c.id) || [], depth + 1);
      });
  };
  walk(roots, 0);
  return rows;
}

function buildFlatOptions(
  cats: Category[],
): Array<{ id: string; label: string; depth: number }> {
  return buildTreeRows(cats).map(({ cat, depth }) => ({
    id: cat.id,
    label: cat.name,
    depth,
  }));
}

export function CategoryPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;
  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCursors([]);
  }, [debouncedSearch]);

  const { data, isLoading } = useCategories({
    search: debouncedSearch || undefined,
    cursor: currentCursor,
    limit: 200,
  });
  const { data: allCatsData } = useAllCategories();
  const allCategories: Category[] = allCatsData?.categories ?? [];
  const categories = data?.categories || [];

  const handleNext = () => {
    if (data?.pagination?.nextCursor) {
      setCursors((prev) => [...prev, data.pagination!.nextCursor!]);
    }
  };

  const handlePrev = () => {
    setCursors((prev) => prev.slice(0, -1));
  };

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const statusMutation = useUpdateCategoryStatus();
  const deleteMutation = useDeleteCategory();

  const treeRows = useMemo(() => buildTreeRows(categories), [categories]);
  const flatOptions = useMemo(
    () => buildFlatOptions(allCategories),
    [allCategories],
  );

  const categoryNameById = useMemo(() => {
    const m: Record<string, string> = {};
    allCategories.forEach((c) => {
      m[c.id] = c.name;
    });
    return m;
  }, [allCategories]);

  const childrenCount = useMemo(() => {
    const m: Record<string, number> = {};
    categories.forEach((c) => {
      if (c.parentId) m[c.parentId] = (m[c.parentId] || 0) + 1;
    });
    return m;
  }, [categories]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: EMPTY_FORM,
  });

  const iconUrl = watch("iconUrl");
  const bannerUrl = watch("bannerUrl");
  const parentIdValue = watch("parentId");
  const nameValue = watch("name");

  useEffect(() => {
    if (isFormOpen) {
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
    }
  }, [isFormOpen, editing, reset]);

  // Auto-suggest icon khi admin gõ tên category khớp với danh sách chuẩn
  useEffect(() => {
    if (!nameValue || iconUrl) return; // Chỉ gợi ý khi chưa có icon
    const key = nameValue.trim().toLowerCase();
    const suggested = NAME_TO_ICON[key];
    if (suggested) setValue("iconUrl", suggested, { shouldValidate: false });
  }, [nameValue, iconUrl, setValue]);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setIsFormOpen(true);
  };
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const onSubmitForm = async (formData: CategoryFormData) => {
    const action = editing
      ? updateMutation.mutateAsync({ id: editing.id, data: formData as any })
      : createMutation.mutateAsync(formData as any);
    toast.promise(action, {
      loading: editing ? "Đang cập nhật..." : "Đang tạo...",
      success: editing ? "Cập nhật thành công!" : "Tạo danh mục thành công!",
      error: (e: unknown) => (e instanceof Error ? e.message : "Có lỗi xảy ra"),
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
        loading: "Đang xoá...",
        success: `Đã xoá "${deleteTarget.name}"`,
        error: (e: any) =>
          e?.response?.data?.message ||
          (e instanceof Error ? e.message : "Có lỗi xảy ra"),
      },
    );
  };

  const handleToggleStatus = (cat: Category) => {
    toast.promise(
      statusMutation.mutateAsync({ id: cat.id, isActive: !cat.isActive }),
      {
        loading: "Đang cập nhật...",
        success: "Đã thay đổi trạng thái!",
        error: (e: unknown) =>
          e instanceof Error ? e.message : "Lỗi cập nhật",
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <PageHeader
        title="Quản lý danh mục"
        description="Quản lý ngành hàng và danh mục phụ theo cấu trúc cây."
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="size-4 mr-2" /> Thêm danh mục
          </Button>
        }
        filters={
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full flex-wrap">
            <div className="group relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên danh mục..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>
          </div>
        }
      />

      {/* Tree Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="premium-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[750px] table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="w-[38%] pl-4 text-left">
                    Danh mục
                  </TableHead>
                  <TableHead className="w-[18%] text-left">
                    Danh mục cha
                  </TableHead>
                  <TableHead className="text-center w-20">Vị trí</TableHead>
                  <TableHead className="text-center w-28">Sản phẩm</TableHead>
                  <TableHead className="text-center w-28">Trạng thái</TableHead>
                  <TableHead className="text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treeRows.map(({ cat, depth }) => {
                  const hasChildren = (childrenCount[cat.id] || 0) > 0;
                  const isExpanded = expanded.has(cat.id);
                  const parentExpanded =
                    !cat.parentId || expanded.has(cat.parentId);
                  if (depth > 0 && !parentExpanded) return null;
                  return (
                    <TableRow
                      key={cat.id}
                      className={`transition-colors hover:bg-bg/40 ${depth > 0 ? "bg-surface-soft/30" : ""}`}
                    >
                      <TableCell className="overflow-hidden max-w-0 pl-4">
                        <div
                          className="flex items-center gap-2"
                          style={{ paddingLeft: `${depth * 20}px` }}
                        >
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(cat.id)}
                              className="shrink-0 w-5 h-5 flex items-center justify-center text-ink-muted hover:text-brand transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                              {depth > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-border block" />
                              )}
                            </span>
                          )}
                          <span className="shrink-0 w-8 h-8 rounded-sm bg-surface-muted flex items-center justify-center">
                            {depth === 0 ? (
                              <FolderOpen className="w-4 h-4 text-brand/60" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-ink-muted/50" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <span
                              className={`block truncate text-sm text-ink ${depth === 0 ? "font-semibold" : "font-medium"}`}
                            >
                              {cat.name}
                            </span>
                            {hasChildren && (
                              <span className="text-[10px] text-ink-muted/70">
                                {childrenCount[cat.id]} danh mục con
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm overflow-hidden max-w-0">
                        {cat.parentId ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-surface-muted rounded text-xs text-ink-muted truncate max-w-full">
                            {categoryNameById[cat.parentId] || "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted/40 italic">
                            Gốc
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm text-ink-muted">
                        {cat.sortOrder}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {cat.productCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={cat.isActive}
                            onCheckedChange={() => handleToggleStatus(cat)}
                          />
                        </div>
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
                                onClick={() => openEdit(cat)}
                              >
                                <Edit className="w-4 h-4 mr-2.5" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                                onClick={() => setDeleteTarget(cat)}
                              >
                                <Trash2 className="w-4 h-4 mr-2.5" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {categories.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">
              Không có danh mục nào
            </p>
          )}
          {(cursors.length > 0 || data?.pagination?.hasNextPage) && (
            <div className="flex items-center justify-between p-5 bg-surface border-t border-border">
              <div className="text-sm text-ink-muted font-medium">
                Trang {cursors.length + 1}
                {data?.pagination?.total ? (
                  <>
                    <span className="mx-2 text-border">|</span>
                    Tổng: {data.pagination.total} danh mục
                  </>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium"
                  onClick={handlePrev}
                  disabled={cursors.length === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium"
                  onClick={handleNext}
                  disabled={!data?.pagination?.hasNextPage}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(o) => !o && setIsFormOpen(false)}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink">
              {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmitForm as any)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-5">
                  <div className="space-y-1.5">
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
                      className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                    />
                    {errors.name && (
                      <p className="text-xs text-danger">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
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
                      className="bg-surface border-border focus-visible:ring-brand focus-visible:border-brand resize-none"
                    />
                    {errors.description && (
                      <p className="text-xs text-danger">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                  {/* Danh mục cha - tree indent */}
                  <div className="space-y-1.5">
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
                          <SelectTrigger className="w-full bg-surface border-border focus:ring-brand">
                            <SelectValue placeholder="Chọn danh mục cha (Không bắt buộc)" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <SelectItem value="none">
                              <span className="text-ink-muted">
                                Không có (Danh mục gốc)
                              </span>
                            </SelectItem>
                            {flatOptions
                              .filter((opt) => opt.id !== editing?.id)
                              .map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  <span
                                    style={{
                                      paddingLeft: `${opt.depth * 16}px`,
                                    }}
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
                    <p className="text-xs text-ink-muted">
                      Để trống nếu đây là danh mục gốc (level 1)
                    </p>
                    {errors.parentId && (
                      <p className="text-xs text-danger">
                        {errors.parentId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="catBanner"
                      className="text-sm font-semibold text-ink"
                    >
                      Banner Mega Menu
                    </Label>
                    <Input
                      id="catBanner"
                      {...register("bannerUrl")}
                      placeholder="Dán URL ảnh banner (tỉ lệ 3:1, VD: 900×300px)"
                      className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                    />
                    {bannerUrl && (
                      <div className="relative mt-2 rounded-md overflow-hidden border border-border bg-surface-muted">
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
                        <span className="absolute top-1.5 right-1.5 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                          Preview
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-ink-muted">
                      Chỉ dùng cho danh mục gốc. Tỉ lệ 3:1 khuyến nghị.
                    </p>
                  </div>
                  {/* Icon chỉ dùng cho danh mục gốc → nằm trong right column */}
                </div>
                <div className="md:col-span-1 space-y-6">
                  {/* Icon picker — chỉ cho danh mục gốc */}
                  {!parentIdValue && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-ink">
                        Icon danh mục chính
                      </Label>
                      {/* Preview icon hiện tại */}
                      {iconUrl && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-brand/5 border border-brand/20">
                          <img
                            src={iconUrl}
                            alt="icon"
                            className="w-8 h-8 object-contain shrink-0"
                          />
                          <span className="text-xs text-ink-muted flex-1 truncate">
                            {iconUrl.split("/").pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue("iconUrl", "")}
                            className="text-ink-muted hover:text-danger text-xs shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      {/* Group 1: 9 icon danh mục chính */}
                      <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">
                        Danh mục chính
                      </p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {COSMETICS_ICONS.slice(0, 9).map(
                          ({ url, label, hint }) => (
                            <button
                              type="button"
                              key={url}
                              onClick={() =>
                                setValue("iconUrl", url, {
                                  shouldValidate: true,
                                })
                              }
                              title={`${label} — ${hint}`}
                              className={`flex flex-col items-center gap-1 p-2 rounded-md border text-center transition-all hover:border-brand hover:bg-brand/5 ${iconUrl === url
                                  ? "border-brand bg-brand/10 shadow-sm ring-1 ring-brand/30"
                                  : "border-border bg-surface"
                                }`}
                            >
                              <img
                                src={url}
                                alt={label}
                                className="w-6 h-6 object-contain"
                              />
                              <span className="text-[9px] text-ink-muted leading-tight truncate w-full text-center">
                                {label}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                      {/* Group 2: icon bổ sung cho danh mục con */}
                      <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide pt-1">
                        Danh mục con
                      </p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {COSMETICS_ICONS.slice(9).map(
                          ({ url, label, hint }) => (
                            <button
                              type="button"
                              key={url}
                              onClick={() =>
                                setValue("iconUrl", url, {
                                  shouldValidate: true,
                                })
                              }
                              title={`${label} — ${hint}`}
                              className={`flex flex-col items-center gap-1 p-2 rounded-md border text-center transition-all hover:border-brand hover:bg-brand/5 ${iconUrl === url
                                  ? "border-brand bg-brand/10 shadow-sm ring-1 ring-brand/30"
                                  : "border-border bg-surface"
                                }`}
                            >
                              <img
                                src={url}
                                alt={label}
                                className="w-6 h-6 object-contain"
                              />
                              <span className="text-[9px] text-ink-muted leading-tight truncate w-full text-center">
                                {label}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                      {/* Custom URL input */}
                      <div className="space-y-1">
                        <p className="text-[11px] text-ink-muted font-medium">
                          Hoặc dán URL icon tùy chỉnh (PNG/SVG nền trong suốt):
                        </p>
                        <Input
                          id="catIcon"
                          {...register("iconUrl")}
                          placeholder="https://... (URL ảnh icon)"
                          className="h-9 text-xs bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                        />
                      </div>
                      {errors.iconUrl && (
                        <p className="text-xs text-danger">
                          {errors.iconUrl.message}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-4 rounded-md border border-border bg-bg/50">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="catActive"
                        className="text-sm font-semibold text-ink cursor-pointer"
                      >
                        Trạng thái
                      </Label>
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
                    <p className="text-xs text-ink-muted mt-2">
                      Cho phép hiển thị trên ứng dụng
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="catSort"
                      className="text-sm font-semibold text-ink"
                    >
                      Thứ tự ưu tiên
                    </Label>
                    <Input
                      id="catSort"
                      type="number"
                      min={1}
                      {...register("sortOrder")}
                      className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand font-mono"
                    />
                    <p className="text-xs text-ink-muted">
                      Số càng nhỏ ưu tiên càng cao
                    </p>
                    {errors.sortOrder && (
                      <p className="text-xs text-danger">
                        {errors.sortOrder.message}
                      </p>
                    )}
                  </div>
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

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Xoá danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xoá <strong>{deleteTarget?.name}</strong>? Hành
              động này không thể hoàn tác.
              <span className="block mt-1 text-xs text-danger">
                Danh mục có sản phẩm sẽ bị từ chối xóa.
              </span>
            </DialogDescription>
          </DialogHeader>
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
