import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import { getAdminProducts } from "@/admin/services/product.service";
import { useCategories } from "@/admin/hooks/useCategory";
import { useBrands } from "@/admin/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/utils";

interface SelectedProduct {
  productId: string;
  productName: string | undefined;
  productImage: string | undefined;
  variantId: string;
  variantName: string | undefined;
  sku: string | undefined;
  barcode?: string;
  originalPrice: number;
  stock: number;
}

interface ProductSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedVariants?: SelectedProduct[];
  onConfirm: (selected: SelectedProduct[]) => void;
}

export function ProductSelectModal({
  open,
  onOpenChange,
  initialSelectedVariants = [],
  onConfirm,
}: ProductSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [categoryId, setCategoryId] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [minStock, setMinStock] = useState("");
  const debouncedMinStock = useDebounce(minStock, 500);

  const [page, setPage] = useState(1);
  const [localSelected, setLocalSelected] = useState<SelectedProduct[]>([]);

  // Filter pinned variants locally if they match search criteria
  const filteredPinnedVariants = React.useMemo(() => {
    if (!debouncedSearch) return initialSelectedVariants;
    const lower = debouncedSearch.toLowerCase();
    return initialSelectedVariants.filter(
      (pv) =>
        pv.productName?.toLowerCase().includes(lower) ||
        pv.sku?.toLowerCase().includes(lower) ||
        pv.barcode?.toLowerCase().includes(lower),
    );
  }, [initialSelectedVariants, debouncedSearch]);

  useEffect(() => {
    if (open) {
      setLocalSelected(initialSelectedVariants);
      setSearchTerm("");
      setCategoryId("all");
      setBrandId("all");
      setMinStock("");
      setPage(1);
    }
  }, [open, initialSelectedVariants]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin", "products-select", page, debouncedSearch, categoryId, brandId, debouncedMinStock],
    queryFn: () =>
      getAdminProducts({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        category: categoryId !== "all" ? categoryId : undefined,
        brandId: brandId !== "all" ? brandId : undefined,
        minStock: debouncedMinStock ? Number(debouncedMinStock) : undefined,
      }),
    enabled: open,
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const products = productsData?.products || [];

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
          barcode: variant.barcode || variant.sku,
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
          <DialogTitle className="text-xl font-bold text-ink">{"Select Product"}</DialogTitle>
          <DialogDescription className="text-sm text-ink-muted">{"Search and select the required products or variants."}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="pl-4 pr-6 py-4 border-b bg-muted/10 shrink-0">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="group relative w-full sm:w-70">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Search product name or Barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-surface border-border text-sm text-ink-muted focus-visible:ring-brand/20">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{"All Categories"}</SelectItem>
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
                <SelectTrigger className="w-full sm:w-40 h-10 bg-surface border-border text-sm text-ink-muted focus-visible:ring-brand/20">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{"All Brands"}</SelectItem>
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
                placeholder="Stock..."
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full h-10 border-border bg-surface text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20 font-mono"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 shadow-sm">
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="w-12 text-center bg-surface-muted"></TableHead>
                  <TableHead className="bg-surface-muted text-center">{"Product"}</TableHead>
                  <TableHead className="text-center w-36 bg-surface-muted">{"Stock"}</TableHead>
                  <TableHead className="text-center w-60 bg-surface-muted">{"Original Price"}</TableHead>
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
                      className="h-32 text-center text-ink-muted"
                    >{"Product not found"}</TableCell>
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
                            <TableCell className="px-4 py-3 align-middle text-center">
                              <div className="flex items-center justify-center gap-3 text-center">
                                <img
                                  src={
                                    pinnedVariant.productImage ||
                                    "/placeholder.jpg"
                                  }
                                  alt={pinnedVariant.productName}
                                  className="w-10 h-10 rounded-sm object-cover border shrink-0 bg-white"
                                />
                                <div className="min-w-0 flex-1 text-center">
                                  <div
                                    className="font-medium text-sm text-ink line-clamp-1 text-center"
                                    title={pinnedVariant.productName}
                                  >
                                    {pinnedVariant.productName}
                                  </div>
                                  {pinnedVariant.variantName && pinnedVariant.variantName !== "Default" && (
                                    <div className="text-xs text-ink-muted mt-0.5 text-center">
                                      Type: {pinnedVariant.variantName}
                                    </div>
                                  )}
                                  {(() => {
                                    const barcodeVal = pinnedVariant.barcode || pinnedVariant.sku;
                                    if (!barcodeVal) return null;
                                    return (
                                      <div className="text-[11px] text-ink-muted font-mono mt-0.5 text-center">
                                        Barcode: {barcodeVal}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-ink">
                              {pinnedVariant.stock}
                            </TableCell>
                            <TableCell className="text-center text-ink font-medium tabular-nums whitespace-nowrap">
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
                          !initialSelectedVariants.some(
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
                            <TableCell className="px-4 py-3 align-middle text-center">
                              <div className="flex items-center justify-center gap-3 text-center">
                                <img
                                  src={
                                    product.imageUrl ||
                                    variant.imageUrl ||
                                    "/placeholder.jpg"
                                  }
                                  alt={product.name}
                                  className="w-10 h-10 rounded-sm object-cover border shrink-0 bg-white"
                                />
                                <div className="min-w-0 flex-1 text-center">
                                  <div
                                    className="font-medium text-sm text-ink line-clamp-1 text-center"
                                    title={product.name}
                                  >
                                    {product.name}
                                  </div>
                                  {variant?.name && variant?.name !== "Default" && (
                                    <div className="text-xs text-ink-muted mt-0.5 text-center">
                                      Type: {variant.name}
                                    </div>
                                  )}
                                  {(() => {
                                    const barcodeVal = variant?.barcode || variant?.sku;
                                    if (!barcodeVal) return null;
                                    return (
                                      <div className="text-[11px] text-ink-muted font-mono mt-0.5 text-center">
                                        Barcode: {barcodeVal}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-ink">
                              {variant.stock}
                            </TableCell>
                            <TableCell className="text-center text-ink font-medium tabular-nums whitespace-nowrap">
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
            Selected:{" "}
            <strong className="text-ink font-semibold">{localSelected.length}</strong>{" "}
            products
          </span>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm font-medium px-5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={localSelected.length === 0}
              className="rounded-sm font-medium px-6 bg-brand hover:bg-brand-hover text-white shadow-ui-soft"
            >{"Confirm"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
