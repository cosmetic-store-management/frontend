import { useMemo, useState } from "react";
import { useRef } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  MoreVertical,
  Upload,
  Download,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useBrands } from "../hooks/useBrand";
import { useNavigate } from "react-router";
import type { Category } from "@/admin/types/category";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CardContent } from "@/components/ui/card";
import { PageHeader } from "../components/common/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteModal from "@/components/ui/delete-modal";
import ProductDetail from "../components/products/ProductDetail";
import type { Product } from "@/admin/types/product";

// Shared tree builder (same as CategoryPage and ProductModal)
function buildFlatCatOptions(
  cats: Category[],
): Array<{ id: string; label: string; depth: number }> {
  const childMap = new Map<string, Category[]>();
  const roots: Category[] = [];
  cats.forEach((c) => {
    if (c.parentId) {
      const s = childMap.get(c.parentId) || [];
      s.push(c);
      childMap.set(c.parentId, s);
    } else roots.push(c);
  });
  const result: Array<{ id: string; label: string; depth: number }> = [];
  const walk = (list: Category[], depth: number) => {
    list
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((c) => {
        result.push({ id: c.id, label: c.name, depth });
        walk(childMap.get(c.id) || [], depth + 1);
      });
  };
  walk(roots, 0);
  return result;
}

type ModalState =
  | { type: "none" }
  | { type: "detail"; product: Product }
  | { type: "delete"; product: Product };

export function ProductPage() {
  const navigate = useNavigate();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const {
    products,
    categories,
    categoryNameById,
    pagination,
    page,
    setPage,
    loading,
    submitting,
    error,
    submitCreate,
    submitUpdate,
    submitUpdateStatus,
    submitDelete,
    exportToExcel,
    importFromExcel,
    refresh,
    clearError,
  } = useProducts({ keyword, brandId, categoryId, status });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFromExcel(file);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fetch all active brands for filter dropdown + form
  // Only show brands that have at least 1 product in filter dropdown
  const { data: brandData } = useBrands({ limit: 1000 });
  const brands = brandData?.brands ?? [];
  const brandsWithProducts = brands.filter((b) => (b.productCount ?? 0) > 0);

  // ── Derived ────────────────────────────────────────────────────────────────
  const hasActiveFilter = !!(keyword || brandId || categoryId || status);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const closeModal = () => {
    setModal({ type: "none" });
    clearError();
  };

  const handleSubmitDelete = async () => {
    if (modal.type !== "delete") return;
    const ok = await submitDelete(modal.product.id);
    if (ok) closeModal();
  };

  return (
    <section className="space-y-4 animate-page-enter">
      <PageHeader
        title="Product Management"
        description="Manage products, categories, pricing, and inventory."
        error={error}
        onClearError={clearError}
        onRetry={refresh}
        actions={
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
            <Button
              className="h-10 shrink-0 px-4 shadow-none"
              variant="outline"
              size="sm"
              onClick={() => exportToExcel()}
              disabled={submitting}
            >
              <Download className="size-4 mr-1.5" /> Export
            </Button>
            <Button
              className="h-10 shrink-0 px-4 shadow-none"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
            >
              <Upload className="size-4 mr-1.5" /> Import
            </Button>
            <Button
              className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
              size="sm"
              onClick={() => {
                navigate("/admin/products/new");
              }}
            >
              <Plus className="size-4 mr-1.5" /> Add Product
            </Button>
          </>
        }
        filters={
          <div className="flex flex-col gap-3 w-full">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by product name..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={brandId || "all"}
                onValueChange={(v) => setBrandId(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="all">All brands</SelectItem>
                  {brandsWithProducts.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryId || "all"}
                onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All categories</SelectItem>
                  {buildFlatCatOptions(categories).map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <span
                        style={{ paddingLeft: `${opt.depth * 14}px` }}
                        className="flex items-center gap-1"
                      >
                        {opt.depth > 0 && (
                          <span className="text-muted-foreground/50 text-xs">
                            └
                          </span>
                        )}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 p-1 bg-surface-muted rounded-sm">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s === "all" ? "" : s)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 ${
                      (s === "all" && !status) || status === s
                        ? "bg-surface text-brand shadow-sm"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {s === "all"
                      ? "All"
                      : s === "active"
                        ? "Active"
                        : "Inactive"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      <div className="premium-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-225 table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="px-5 w-[25%] text-left">
                    Product
                  </TableHead>
                  <TableHead className="px-5 w-[14%] text-left ml-4">
                    Brand
                  </TableHead>
                  <TableHead className="px-5 w-[14%] text-left">
                    Category
                  </TableHead>
                  <TableHead className="px-5 w-[12%] text-center">
                    Status
                  </TableHead>
                  <TableHead className="px-5 w-[15%] text-center">
                    Price Range
                  </TableHead>
                  <TableHead className="px-5 w-[10%] text-center">
                    Stock
                  </TableHead>
                  <TableHead className="px-5 w-[10%] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-ink-muted"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  products.map((item) => (
                    <TableRow key={item.id}>
                      {/* Product name */}
                      <TableCell className="px-5 py-4 align-middle overflow-hidden max-w-0">
                        <div className="flex w-full items-center gap-3 text-left">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-10 w-10 shrink-0 object-cover rounded-sm border border-border"
                          />
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() =>
                                setModal({ type: "detail", product: item })
                              }
                              className="w-full truncate font-semibold text-ink transition-colors hover:text-brand block text-left"
                            >
                              {item.name}
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* Brand */}
                      <TableCell className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.brand?.imageUrl && (
                            <img
                              src={item.brand.imageUrl}
                              alt={item.brandName}
                              className="h-6 w-6 rounded-sm object-contain border border-border shrink-0 bg-white p-0.5"
                            />
                          )}
                          <span className="block truncate text-sm font-medium text-ink">
                            {item.brandName || "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="px-5 py-4 align-middle">
                        <span className="block text-sm text-ink-muted">
                          {item.category?.name ??
                            categoryNameById[item.categoryId] ??
                            "—"}
                        </span>
                      </TableCell>

                      {/* Status toggle */}
                      <TableCell className="px-5 py-4 align-middle text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() =>
                              submitUpdateStatus(item.id, !item.isActive)
                            }
                            disabled={submitting}
                          />
                        </div>
                      </TableCell>

                      {/* Price range */}
                      <TableCell className="px-5 py-4 text-center align-middle font-medium tabular-nums text-ink">
                        {(() => {
                          if (!item.variants || item.variants.length === 0)
                            return <span className="text-ink-muted">—</span>;
                          const prices = item.variants.map((v: any) =>
                            v.discountPrice != null &&
                            v.discountPrice > 0 &&
                            v.discountPrice < v.price
                              ? v.discountPrice
                              : v.price,
                          );
                          if (prices.length === 0)
                            return <span className="text-ink-muted">—</span>;
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          return (
                            <span>
                              {minPrice === maxPrice
                                ? `${minPrice.toLocaleString("vi-VN")} đ`
                                : `${minPrice.toLocaleString("vi-VN")} — ${maxPrice.toLocaleString("vi-VN")} đ`}
                            </span>
                          );
                        })()}
                      </TableCell>

                      {/* Stock */}
                      <TableCell className="px-5 py-4 text-center align-middle tabular-nums">
                        {(() => {
                          const totalStock =
                            item.variants?.reduce(
                              (sum: number, v: any) =>
                                sum + (Number(v.stock) || 0),
                              0,
                            ) || 0;
                          const variantCount = item.variants?.length || 0;
                          return (
                            <div className="flex flex-col items-center">
                              <span
                                className={`font-semibold ${totalStock === 0 ? "text-danger" : "text-ink"}`}
                              >
                                {totalStock.toLocaleString("vi-VN")}
                              </span>
                              <span className="text-[10px] text-ink-muted mt-0.5">
                                {variantCount} variants
                              </span>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4 text-center align-middle">
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
                                onClick={() => {
                                  navigate(`/admin/products/${item.id}/edit`);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                                onClick={() => {
                                  clearError();
                                  setModal({ type: "delete", product: item });
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-ink-muted"
                    >
                      {hasActiveFilter
                        ? "No products found."
                        : "No products yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-center px-5 py-4 bg-surface border-t border-border rounded-b-sm">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </div>

      {/* Modals */}
      <DeleteModal
        open={modal.type === "delete"}
        title="Delete Product"
        description={`Product "${modal.type === "delete" ? modal.product.name : ""}" will be permanently deleted.`}
        confirmText="Delete product"
        loading={submitting}
        submitError={error}
        onClose={closeModal}
        onConfirm={handleSubmitDelete}
      />

      <ProductDetail
        open={modal.type === "detail"}
        product={modal.type === "detail" ? modal.product : null}
        categoryName={
          modal.type === "detail"
            ? (modal.product.category?.name ??
              categoryNameById[modal.product.categoryId] ??
              "Uncategorized")
            : undefined
        }
        onClose={closeModal}
      />
    </section>
  );
}
