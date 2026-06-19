import { useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useBrands } from "../hooks/useBrand";
import type { Category } from "@/admin/types/category";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/ui/delete-modal";
import { Pagination } from "@/components/ui/pagination";
import ProductDetail from "../components/ProductDetail";
import ProductModal from "../components/ProductModal";
import type { Product } from "@/admin/types/product";
import type { ProductFormValues } from "../components/ProductModal";

// Shared tree builder (same as CategoryPage and ProductModal)
function buildFlatCatOptions(cats: Category[]): Array<{ id: string; label: string; depth: number }> {
  const childMap = new Map<string, Category[]>();
  const roots: Category[] = [];
  cats.forEach((c) => {
    if (c.parentId) { const s = childMap.get(c.parentId) || []; s.push(c); childMap.set(c.parentId, s); }
    else roots.push(c);
  });
  const result: Array<{ id: string; label: string; depth: number }> = [];
  const walk = (list: Category[], depth: number) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder).forEach((c) => {
      result.push({ id: c.id, label: c.name, depth });
      walk(childMap.get(c.id) || [], depth + 1);
    });
  };
  walk(roots, 0);
  return result;
}

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; product: Product }
  | { type: "detail"; product: Product }
  | { type: "delete"; product: Product };

export function ProductPage() {
  // ── Filter state ───────────────────────────────────────────────────────────
  const [keyword,    setKeyword]    = useState("");
  const [brandId,    setBrandId]    = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status,     setStatus]     = useState<"active" | "inactive" | "">("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const {
    products,
    categories,
    categoryNameById,
    pagination,
    currentPage,
    setCurrentPage,
    loading,
    submitting,
    error,
    submitCreate,
    submitUpdate,
    submitUpdateStatus,
    submitDelete,
    refresh,
    clearError,
  } = useProducts({ keyword, brandId, categoryId, status });

  // Fetch all active brands for filter dropdown + form
  // Only show brands that have at least 1 product in filter dropdown
  const { data: brandData } = useBrands({ limit: 1000 });
  const brands = brandData?.brands ?? [];
  const brandsWithProducts = brands.filter((b) => (b.productCount ?? 0) > 0);

  // ── Derived ────────────────────────────────────────────────────────────────
  const hasActiveFilter = !!(keyword || brandId || categoryId || status);

  const clearFilters = () => {
    setKeyword("");
    setBrandId("");
    setCategoryId("");
    setStatus("");
  };

  const initialValues = useMemo<ProductFormValues | undefined>(() => {
    if (modal.type !== "edit") return undefined;
    const p = modal.product;
    return {
      name:        p.name,
      slug:        p.slug,
      brandId:     p.brandId || "",
      description: p.description ?? "",
      imageUrl:    p.imageUrl,
      imageUrls:   p.imageUrls || [],
      categoryId:  p.categoryId,
      categoryIds: p.categoryIds || [],
      isActive:    p.isActive,
      variants: p.variants?.length ? p.variants.map(v => ({
        id:            v.id,
        name:          v.name,
        sku:           v.sku || "",
        price:         String(v.price || 0),
        discountPrice: v.discountPrice != null ? String(v.discountPrice) : "",
        stock:         String(v.stock || 0),
        minStock:      String(v.minStock || 10),
        weight:        String(v.weight || 200),
        imageUrl:      v.imageUrl || "",
        isActive:      v.isActive ?? true,
      })) : [{ name: "Mặc định", sku: "", price: "0", discountPrice: "", stock: "0", minStock: "10", weight: "200", imageUrl: "", isActive: true }],
    };
  }, [modal]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const closeModal = () => { setModal({ type: "none" }); clearError(); };

  const handleSubmitForm = async (values: ProductFormValues) => {
    if (modal.type === "edit") {
      const ok = await submitUpdate(modal.product.id, values);
      if (ok) closeModal();
    } else if (modal.type === "create") {
      const ok = await submitCreate(values);
      if (ok) closeModal();
    }
  };

  const handleSubmitDelete = async () => {
    if (modal.type !== "delete") return;
    const ok = await submitDelete(modal.product.id);
    if (ok) closeModal();
  };

  return (
    <section className="space-y-4 animate-page-enter">
      <div className="space-y-4 border border-border rounded-sm bg-surface p-4 shadow-ui-soft sm:p-5">
        <CardHeader className="space-y-4 p-0">
          {/* Header row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-1.5 flex-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-ink">Quản lý sản phẩm</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-ink-muted">
                Quản lý thông tin sản phẩm, danh mục, giá bán và tồn kho.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="h-10 shrink-0 bg-danger px-4 text-white shadow-none hover:bg-danger"
                size="sm"
                onClick={() => { clearError(); setModal({ type: "create" }); }}
              >
                <Plus className="size-4" /> Thêm sản phẩm
              </Button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex flex-col gap-2 border border-danger bg-danger/10 px-3 py-2.5 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
              <p className="truncate">{error}</p>
              <div className="flex items-center gap-3 text-xs font-medium">
                <button type="button" onClick={() => clearError()} className="text-danger hover:underline">Đóng</button>
                <button type="button" onClick={() => { void refresh(); }} className="text-danger hover:underline">Thử lại</button>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="group relative flex-1 min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên sản phẩm..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {keyword && (
                <button type="button" onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted">
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Brand filter — only brands with products */}
            <Select value={brandId || "all"} onValueChange={(v) => setBrandId(v === "all" ? "" : v)}>
              <SelectTrigger className="h-10 w-[180px] border-border bg-surface text-sm text-ink-muted">
                <SelectValue placeholder="Thương hiệu" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                {brandsWithProducts.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category filter — tree indent */}
            <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
              <SelectTrigger className="h-10 w-[180px] border-border bg-surface text-sm text-ink-muted">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {buildFlatCatOptions(categories).map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span style={{ paddingLeft: `${opt.depth * 14}px` }} className="flex items-center gap-1">
                      {opt.depth > 0 && <span className="text-ink-muted/50 text-xs">└</span>}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v as "active" | "inactive")}>
              <SelectTrigger className="h-10 w-[150px] border-border bg-surface text-sm text-ink-muted">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang bán</SelectItem>
                <SelectItem value="inactive">Ngừng bán</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </CardHeader>
      </div>

      <div className="border border-border rounded-sm bg-surface shadow-ui-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px] table-fixed">
              <TableHeader>
                <TableRow className="bg-bg/50 border-b border-border">
                  <TableHead className="px-5 py-4 w-[28%]">Sản phẩm</TableHead>
                  <TableHead className="px-5 py-4 w-[16%]">Thương hiệu</TableHead>
                  <TableHead className="px-5 py-4 w-[16%]">Danh mục</TableHead>
                  <TableHead className="px-5 py-4 text-center w-[12%]">Trạng thái</TableHead>
                  <TableHead className="px-5 py-4 text-center w-[14%]">Khoảng giá</TableHead>
                  <TableHead className="px-5 py-4 text-center w-[8%]">Tồn kho</TableHead>
                  <TableHead className="px-5 py-4 text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow><TableCell colSpan={7} className="px-4 py-12 text-center text-sm text-ink-muted">Đang tải dữ liệu sản phẩm...</TableCell></TableRow>
                )}

                {!loading && products.map((item) => (
                  <TableRow key={item.id} className="transition-colors hover:bg-bg/40">
                    {/* Product name + SKU */}
                    <TableCell className="px-5 py-4 align-middle overflow-hidden max-w-0">
                      <div className="flex w-full items-center gap-3 text-left">
                        <img src={item.imageUrl} alt={item.name}
                          className="h-10 w-10 shrink-0 object-cover rounded-sm border border-border" />
                        <div className="min-w-0 flex-1">
                          <button type="button"
                            onClick={() => setModal({ type: "detail", product: item })}
                            className="w-full truncate font-semibold text-ink transition-colors hover:text-brand block text-left">
                            {item.name}
                          </button>
                          <span className="text-[11px] font-mono text-ink-muted mt-0.5 block truncate">
                            SKU: {item.variants?.[0]?.sku || "N/A"} {item.variants && item.variants.length > 1 && `(+${item.variants.length - 1})`}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Brand — conflict resolved: was item.brand (legacy string) → now item.brandName or item.brand?.name */}
                    <TableCell className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.brand?.imageUrl && (
                          <img src={item.brand.imageUrl} alt={item.brandName}
                            className="h-6 w-6 rounded-sm object-contain border border-border shrink-0 bg-white p-0.5" />
                        )}
                        <span className="block truncate text-sm font-medium text-ink">
                          {item.brandName || "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="px-5 py-4 align-middle">
                      <span className="block truncate text-sm text-ink-muted">
                        {item.category?.name ?? categoryNameById[item.categoryId] ?? "—"}
                      </span>
                    </TableCell>

                    {/* Status toggle */}
                    <TableCell className="px-5 py-4 align-middle text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => submitUpdateStatus(item.id, !item.isActive)}
                          disabled={submitting}
                        />
                      </div>
                    </TableCell>

                    {/* Price range */}
                    <TableCell className="px-5 py-4 text-center align-middle font-medium tabular-nums text-ink">
                      {(() => {
                        if (!item.variants || item.variants.length === 0) return <span className="text-ink-muted">—</span>;
                        const prices = item.variants.map((v: any) => v.discountPrice != null && v.discountPrice > 0 && v.discountPrice < v.price ? v.discountPrice : v.price);
                        if (prices.length === 0) return <span className="text-ink-muted">—</span>;
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
                        const totalStock = item.variants?.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) || 0;
                        const variantCount = item.variants?.length || 0;
                        return (
                          <div className="flex flex-col items-center">
                            <span className={`font-semibold ${totalStock === 0 ? "text-danger" : "text-ink"}`}>
                              {totalStock.toLocaleString("vi-VN")}
                            </span>
                            <span className="text-[10px] text-ink-muted mt-0.5">{variantCount} loại</span>
                          </div>
                        );
                      })()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-2 transition-opacity">
                        <button type="button" title="Chỉnh sửa"
                          onClick={() => { clearError(); setModal({ type: "edit", product: item }); }}
                          className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-brand/10 hover:text-brand">
                          <Edit className="size-4" />
                        </button>
                        <button type="button" title="Xóa"
                          onClick={() => { clearError(); setModal({ type: "delete", product: item }); }}
                          className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-4 py-12 text-center text-sm text-ink-muted">
                      {hasActiveFilter ? "Không tìm thấy sản phẩm nào." : "Chưa có sản phẩm nào."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </div>

      {/* Modals */}
      <DeleteModal
        open={modal.type === "delete"}
        title="Xóa sản phẩm"
        description={`Sản phẩm "${modal.type === "delete" ? modal.product.name : ""}" sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa sản phẩm"
        loading={submitting}
        submitError={error}
        onClose={closeModal}
        onConfirm={handleSubmitDelete}
      />

      <ProductDetail
        open={modal.type === "detail"}
        product={modal.type === "detail" ? modal.product : null}
        categoryName={modal.type === "detail" ? (modal.product.category?.name ?? categoryNameById[modal.product.categoryId] ?? "Chưa phân loại") : undefined}
        onClose={closeModal}
      />

      <ProductModal
        open={modal.type === "create"}
        mode="create"
        loading={submitting}
        submitError={error}
        categories={categories}
        brands={brands}
        onClose={closeModal}
        onSubmit={handleSubmitForm}
      />

      <ProductModal
        open={modal.type === "edit"}
        mode="edit"
        loading={submitting}
        submitError={error}
        categories={categories}
        brands={brands}
        initialValues={initialValues}
        onClose={closeModal}
        onSubmit={handleSubmitForm}
      />
    </section>
  );
}
