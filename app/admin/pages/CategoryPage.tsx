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
import DeleteModal from "@/components/ui/delete-modal";
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
import { PageHeader } from "../components/common/PageHeader";

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
  { url: CDN + "2" + V, label: "Face", hint: "Face care" },
  { url: CDN + "1" + V, label: "Makeup", hint: "Makeup, lipstick, powder" },
  { url: CDN + "7" + V, label: "Sunscreen", hint: "Sunscreen" },
  { url: CDN + "8" + V, label: "Lips", hint: "Lip care" },
  { url: CDN + "6" + V, label: "Perfume", hint: "Perfume" },
  { url: CDN + "3" + V, label: "Body", hint: "Body care" },
  { url: CDN + "4" + V, label: "Hair", hint: "Hair care" },
  { url: CDN + "5" + V, label: "Personal", hint: "Personal hygiene" },
  { url: CDN + "11" + V, label: "Devices", hint: "Beauty tools" },
  // Nhóm 2: Icon bổ sung cho danh mục con
  { url: CDN + "9" + V, label: "Moisturizer", hint: "Serum, toner" },
  { url: CDN + "10" + V, label: "Cleanser", hint: "Makeup remover, cleanser" },
  { url: CDN + "12" + V, label: "Eyes", hint: "Mascara, eyeliner" },
  { url: CDN + "13" + V, label: "Nails", hint: "Nail polish, nail art" },
  { url: CDN + "15" + V, label: "Gift Sets", hint: "Gift set, combo" },
];

// Auto-suggest: gõ tên → tự động gợi ý icon phù hợp
const NAME_TO_ICON: Record<string, string> = {
  "facial care": CDN + "2" + V,
  "face care": CDN + "2" + V,
  face: CDN + "2" + V,
  "make up": CDN + "1" + V,
  makeup: CDN + "1" + V,
  "Sun protection": CDN + "7" + V,
  sunscreen: CDN + "7" + V,
  "lip care": CDN + "8" + V,
  lips: CDN + "8" + V,
  "perfume": CDN + "6" + V,
  "body care": CDN + "3" + V,
  body: CDN + "3" + V,
  "hair & scalp care": CDN + "4" + V,
  "hair care": CDN + "4" + V,
  hair: CDN + "4" + V,
  "personal care": CDN + "5" + V,
  "beauty equipment": CDN + "11" + V,
  "beauty tools": CDN + "11" + V,
  devices: CDN + "11" + V,
  "moisturizing": CDN + "9" + V,
  moisturizer: CDN + "9" + V,
  "clean": CDN + "10" + V,
  cleanser: CDN + "10" + V,
  "eye care": CDN + "12" + V,
  eyes: CDN + "12" + V,
  nail: CDN + "13" + V,
  nails: CDN + "13" + V,
  "gift set": CDN + "15" + V,
  "gift sets": CDN + "15" + V,
};

function buildTreeRows(
  cats: Category[],
): Array<{ cat: Category; depth: number }> {
  const map = new Map<string, Category[]>();
  const roots: Category[] = [];
  cats.forEach((c) => {
    if (c.parentId) {
      const parentExists = cats.some((p) => p.id === c.parentId);
      if (parentExists) {
        const s = map.get(c.parentId) || [];
        s.push(c);
        map.set(c.parentId, s);
      } else {
        roots.push(c);
      }
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
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useCategories({
    search: debouncedSearch || undefined,
    page: page,
    limit: 200,
  });
  const { data: allCatsData } = useAllCategories();
  const allCategories: Category[] = allCatsData?.categories ?? [];
  const categories = data?.categories || [];

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
      loading: editing ? "Updating..." : "Creating...",
      success: editing
        ? "Update successful!"
        : "Category created successfully!",
      error: (e: unknown) =>
        e instanceof Error ? e.message : "An error occurred",
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
        loading: "Deleting...",
        success: `Deleted "${deleteTarget.name}"`,
        error: (e: any) =>
          e?.response?.data?.message ||
          (e instanceof Error ? e.message : "An error occurred"),
      },
    );
  };

  const handleToggleStatus = (cat: Category) => {
    toast.promise(
      statusMutation.mutateAsync({ id: cat.id, isActive: !cat.isActive }),
      {
        loading: "Updating...",
        success: "Status changed successfully!",
        error: (e: unknown) =>
          e instanceof Error ? e.message : "Update error",
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <PageHeader
        title="Category Management"
        description="Organize your products into categories and subcategories to help customers navigate your store."
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-dark transition-all shadow-none"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="size-4 mr-2" /> Add Category
          </Button>
        }
        filters={
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by category name..."
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
        <div className="premium-card rounded-sm overflow-hidden">
          <Table className="min-w-[1000px] table-fixed">
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead className="w-60 text-center">
                  Category
                </TableHead>
                <TableHead className="w-60 text-center">
                  Description
                </TableHead>
                <TableHead className="w-36 text-center">
                  Parent Category
                </TableHead>
                <TableHead className="w-24 text-center">Order</TableHead>
                <TableHead className="w-24 text-center">
                  Products
                </TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
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
                      <TableCell className="pl-4">
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
                                {childrenCount[cat.id]} sub-categories
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-center text-ink-muted">
                        <span className="truncate block w-full mx-auto" title={cat.description || ""}>
                          {cat.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {cat.parentId ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-surface-muted rounded text-xs text-ink-muted truncate max-w-full">
                            {categoryNameById[cat.parentId] || "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted/40 italic">
                            Root
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
                      <TableCell className="py-3.5 text-center">
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
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                                onClick={() => setDeleteTarget(cat)}
                              >
                                <Trash2 className="w-4 h-4 mr-2.5" />
                                Delete
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
          {categories.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">
              No categories found
            </p>
          )}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="border-t border-border p-4 bg-surface">
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(o) => !o && setIsFormOpen(false)}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink">
              {editing ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmitForm as any)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8 gap-6">
                <div className="md:col-span-2 space-y-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="catName"
                      className="text-sm font-semibold text-ink"
                    >
                      Category Name <span className="text-brand">*</span>
                    </Label>
                    <Input
                      id="catName"
                      {...register("name")}
                      aria-invalid={!!errors.name}
                      placeholder="E.g. Skincare"
                      className="h-10 rounded-sm bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
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
                      Description
                    </Label>
                    <Textarea
                      id="catDesc"
                      rows={4}
                      {...register("description")}
                      placeholder="Enter short description..."
                      className="rounded-sm bg-surface border-border focus-visible:ring-brand focus-visible:border-brand resize-none"
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
                      Parent Category
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
                          <SelectTrigger className="w-full rounded-sm bg-surface border-border focus:ring-brand">
                            <SelectValue placeholder="Select parent category (Optional)" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <SelectItem value="none">
                              <span className="text-ink-muted">
                                None (Root Category)
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
                      Category Banner
                    </Label>
                    <Input
                      id="catBanner"
                      {...register("bannerUrl")}
                      placeholder="Banner Image URL"
                      className="h-10 rounded-sm bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                    />
                    {bannerUrl && (
                      <div className="relative mt-2 rounded-md overflow-hidden border border-border bg-surface-muted">
                        <div className="aspect-3/1 w-full">
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
                        <a
                          href={bannerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-1.5 right-1.5 text-[10px] bg-black/50 hover:bg-black/80 text-white px-2 py-1 rounded cursor-pointer transition-colors"
                          title="Click to view full size"
                        >
                          ⤢ Preview
                        </a>
                      </div>
                    )}
                  </div>
                  {/* Icon chỉ dùng cho danh mục gốc → nằm trong right column */}
                </div>
                <div className="md:col-span-1 space-y-6 md:border-l md:border-border md:pl-8">
                  {/* Icon picker — chỉ cho danh mục gốc */}
                  {!parentIdValue && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-ink">
                        Category Icon
                      </Label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {COSMETICS_ICONS.map(
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
                              className={`flex flex-col items-center justify-center p-2 rounded-sm border transition-all hover:border-brand hover:bg-brand/5 ${iconUrl === url
                                ? "border-brand bg-brand/10 shadow-sm ring-1 ring-brand/30"
                                : "border-border bg-surface"
                                }`}
                            >
                              <img
                                src={url}
                                alt={label}
                                className="w-7 h-7 object-contain"
                              />
                            </button>
                          ),
                        )}
                      </div>
                      {/* Custom URL input */}
                      <div className="space-y-1.5 mt-3">
                        <Label htmlFor="catIcon" className="text-sm font-semibold text-ink">
                          Custom Icon URL
                        </Label>
                        <Input
                          id="catIcon"
                          value={iconUrl || ""}
                          onChange={(e) => setValue("iconUrl", e.target.value, { shouldValidate: true })}
                          placeholder="Icon URL..."
                          className="h-10 rounded-sm bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                        />
                      </div>
                      {errors.iconUrl && (
                        <p className="text-xs text-danger">
                          {errors.iconUrl.message}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-4 rounded-sm border border-border">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="catActive"
                        className="text-sm font-semibold text-ink cursor-pointer"
                      >
                        Status
                      </Label>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="catActive"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-brand"
                          />
                        )}
                      />
                    </div>
                    <p className="text-xs text-ink-muted">
                      Show in application
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="catSort"
                      className="text-sm font-semibold text-ink"
                    >
                      Sort Order <span className="text-brand">*</span>
                    </Label>
                    <Input
                      id="catSort"
                      type="number"
                      min={1}
                      {...register("sortOrder")}
                      className="h-10 rounded-sm bg-surface border-border focus-visible:ring-brand focus-visible:border-brand font-mono"
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
            <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-sm bg-surface"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-sm bg-brand text-white hover:bg-brand-dark transition-all shadow-ui-soft px-8"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteModal
        open={!!deleteTarget}
        title="Delete Category"
        description={
          <span>
            Are you sure you want to delete category{" "}
            <strong className="text-ink">"{deleteTarget?.name}"</strong>? This
            action cannot be undone.
          </span>
        }
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
