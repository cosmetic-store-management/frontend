import i18next from "i18next";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminProductsSelector } from "@/admin/hooks/useProducts";
import { useBrands } from "@/admin/hooks/useBrand";
import { useCategories } from "@/admin/hooks/useCategory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";

interface ProductSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedVariants: any[];
  onConfirm: (variants: any[]) => void;
}

export function ProductSelectModal({
  open,
  onOpenChange,
  initialSelectedVariants,
  onConfirm,
}: ProductSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [brandId, setBrandId] = useState<string>("all");
  const [minStock, setMinStock] = useState<string>("");
  const debouncedMinStock = useDebounce(minStock, 500);
  const [localSelected, setLocalSelected] = useState<any[]>([]);
  const [pinnedVariants, setPinnedVariants] = useState<any[]>([]);

  const filteredPinnedVariants = React.useMemo(() => {
    if (!debouncedSearch) return pinnedVariants;
    const lower = debouncedSearch.toLowerCase();
    return pinnedVariants.filter(
      (v) =>
        v.productName?.toLowerCase().includes(lower) ||
        v.sku?.toLowerCase().includes(lower),
    );
  }, [pinnedVariants, debouncedSearch]);

  // When modal opens, we initialize localSelected with the already selected variants.
  React.useEffect(() => {
    if (open) {
      {
        /* eslint-disable-next-line  */
      }
      setLocalSelected([...initialSelectedVariants]);
      setPinnedVariants([...initialSelectedVariants]);
      setSearchTerm("");
      setCategoryId("all");
      setBrandId("all");
      setMinStock("");
      setPage(1);
    }
  }, [open, initialSelectedVariants]);

  React.useEffect(() => {
    {
      /* eslint-disable-next-line  */
    }
    setPage(1);
  }, [debouncedSearch, categoryId, brandId, debouncedMinStock]);

  const { data: productsData, isLoading } = useAdminProductsSelector(
    {
      search: debouncedSearch,
      limit: 10,
      page: page,
      category: categoryId === "all" ? undefined : categoryId,
      brandId: brandId === "all" ? undefined : brandId,
      minStock: debouncedMinStock ? Number(debouncedMinStock) : undefined,
    },
    { enabled: open },
  );

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const data = productsData;

  const products = data?.products || [];

  const handleToggle = (variant: any, product: any, checked: boolean) => {
    if (checked) {
      setLocalSelected((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productImage: variant.imageUrl || product.imageUrl,
          variantId: variant.id,
          variantName: variant.name,
          sku: variant.sku,
          originalPrice: variant.price || product.price,
          stock: variant.stock,
        },
      ]);
    } else {
      setLocalSelected((prev) =>
        prev.filter((v) => v.variantId !== variant.id),
      );
    }
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
        <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
          <DialogTitle className="text-xl font-bold text-ink">{i18next.t("Chọn sản phẩm")}</DialogTitle>
          <DialogDescription className="text-sm text-ink-muted">{i18next.t("Tìm kiếm và chọn sản phẩm/biến thể cần thiết.")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="pl-4 pr-6 py-4 border-b bg-muted/10 shrink-0">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="group relative w-full sm:w-70">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Tìm tên sản phẩm hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 border-border bg-background pl-9 pr-9 text-sm focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-background border-border">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{i18next.t("Tất cả danh mục")}</SelectItem>
                  {categories?.categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.slug || cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-background border-border">
                  <SelectValue placeholder="Thương hiệu" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{i18next.t("Tất cả thương hiệu")}</SelectItem>
                  {brands?.brands?.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-25">
              <Input
                type="number"
                placeholder="Tồn kho..."
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full h-10 border-border bg-background focus-visible:border-brand focus-visible:ring-brand/20"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="w-full">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-12 text-center bg-muted/30"></TableHead>
                  <TableHead className="bg-muted/30">{i18next.t("Sản phẩm")}</TableHead>
                  <TableHead className="text-center w-25 bg-muted/30">{i18next.t("Tồn Kho")}</TableHead>
                  <TableHead className="text-center w-37.5 bg-muted/30">{i18next.t("Giá gốc")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 &&
                  filteredPinnedVariants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >{i18next.t("Không tìm thấy sản phẩm")}</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {/* Pinned Variants (Already selected when modal opened) */}
                    {page === 1 &&
                      filteredPinnedVariants.map((pinnedVariant) => {
                        const isChecked = localSelected.some(
                          (v) => v.variantId === pinnedVariant.variantId,
                        );
                        return (
                          <TableRow
                            key={`pinned-${pinnedVariant.variantId}`}
                            className={
                              isChecked ? "bg-muted/20" : "hover:bg-muted/5"
                            }
                          >
                            <TableCell className="text-center pl-2">
                              <Checkbox
                                className="rounded-sm"
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setLocalSelected((prev) => [
                                      ...prev,
                                      pinnedVariant,
                                    ]);
                                  } else {
                                    setLocalSelected((prev) =>
                                      prev.filter(
                                        (v) =>
                                          v.variantId !==
                                          pinnedVariant.variantId,
                                      ),
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    pinnedVariant.productImage ||
                                    "/placeholder.jpg"
                                  }
                                  alt={pinnedVariant.productName}
                                  className="w-10 h-10 rounded-sm object-cover border shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div
                                    className="font-medium text-sm line-clamp-1"
                                    title={pinnedVariant.productName}
                                  >
                                    {pinnedVariant.productName}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {pinnedVariant.stock}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {formatCurrency(pinnedVariant.originalPrice)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {/* API Products (Paginated) */}
                    {products
                      .filter((product) => {
                        const variant = product.variants[0];
                        return (
                          variant &&
                          !pinnedVariants.some(
                            (pv) => pv.variantId === variant.id,
                          )
                        );
                      })
                      .map((product: any) => {
                        const variant = product.variants[0];
                        const isChecked = localSelected.some(
                          (v) => v.variantId === variant.id,
                        );

                        return (
                          <TableRow
                            key={product.id}
                            className={
                              isChecked ? "bg-muted/20" : "hover:bg-muted/5"
                            }
                          >
                            <TableCell className="text-center pl-2">
                              <Checkbox
                                className="rounded-sm"
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  handleToggle(variant, product, !!checked)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    product.imageUrl ||
                                    variant.imageUrl ||
                                    "/placeholder.jpg"
                                  }
                                  alt={product.name}
                                  className="w-10 h-10 rounded-sm object-cover border shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div
                                    className="font-medium text-sm line-clamp-1"
                                    title={product.name}
                                  >
                                    {product.name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {variant.stock}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {formatCurrency(
                                variant.price || (product as any).price,
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {productsData?.pagination && productsData.pagination.totalPages > 1 && (
            <div className="py-4 flex justify-center bg-surface border-t border-border shrink-0">
              <Pagination
                currentPage={page}
                totalPages={productsData.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
        </div>

        {/* Custom Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 flex flex-col sm:flex-row items-center sm:justify-between justify-between gap-4">
          <span className="text-sm text-ink-muted">
            Đã chọn:{" "}
            <strong className="text-ink font-semibold">{localSelected.length}</strong>{" "}
            sản phẩm
          </span>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm font-medium px-5"
            >
              Huỷ
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={localSelected.length === 0}
              className="rounded-sm font-medium px-6 bg-brand hover:bg-brand-hover text-white shadow-ui-soft"
            >{i18next.t("Xác nhận")}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
