import React, { useState, useEffect } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Trash2, Loader2, ClipboardCheck } from "lucide-react";
import {
  getStockList,
  createStocktake,
  InventoryItem,
} from "../../../admin/services/inventory.service";
import { toast } from "@/lib/toast";

interface StocktakeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface StocktakeItemRow {
  variantId: string;
  name: string;
  sku: string;
  barcode?: string;
  productImage?: string;
  systemQty: number;
  actualQty: number;
  costPrice: number;
}

export default function StocktakeModal({
  open,
  onOpenChange,
  onSuccess,
}: StocktakeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [items, setItems] = useState<StocktakeItemRow[]>([]);
  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setItems([]);
      setNotes("");
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  // Search products when query changes
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const delay = setTimeout(() => {
      getStockList({ search: searchQuery, limit: 8 })
        .then((res: any) => setSearchResults(res.stock))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleAddProduct = (product: InventoryItem) => {
    if (items.some((item) => item.variantId === product.id)) {
      toast.error("Product variant already added to list");
      return;
    }
    setItems([
      ...items,
      {
        variantId: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        productImage: product.productImage,
        systemQty: product.stock,
        actualQty: product.stock, // Default to system quantity
        costPrice: product.mac || Math.round(product.minStock * 0.6), // approximation or fallback
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveProduct = (variantId: string) => {
    setItems(items.filter((item) => item.variantId !== variantId));
  };

  const handleActualQtyChange = (variantId: string, qty: number) => {
    setItems(
      items.map((item) =>
        item.variantId === variantId ? { ...item, actualQty: qty } : item,
      ),
    );
  };

  const calculateTotalAdjustments = () => {
    let totalQty = 0;
    let totalValue = 0;
    items.forEach((item) => {
      const variance = item.actualQty - item.systemQty;
      totalQty += variance;
      totalValue += variance * item.costPrice;
    });
    return { totalQty, totalValue };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Please add at least one product to verify");
      return;
    }

    setIsPending(true);

    try {
      await createStocktake({
        items: items.map((item) => ({
          variantId: item.variantId,
          actualQty: Number(item.actualQty) || 0,
        })),
        notes: notes.trim() || undefined,
      });

      toast.success("Stocktake completed and stock balanced successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit stocktake");
    } finally {
      setIsPending(false);
    }
  };

  const adjustments = calculateTotalAdjustments();

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Stocktake Sheet"
      size="xl"
      primaryActionText="Balance stock"
      secondaryActionText="Cancel"
      onPrimaryAction={handleSubmit as any}
      isLoading={isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left py-2">
        {/* Product Search Bar */}
        <div className="relative space-y-1.5">
          <Label htmlFor="productSearchStocktake" className="text-xs font-semibold text-ink">
            Add Products to Stocktake
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <Input
              id="productSearchStocktake"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product variant by name or barcode to verify..."
              className="pl-9 h-9 text-sm bg-surface"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-brand" />
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-surface border border-border rounded-sm shadow-lg divide-y divide-border/60">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleAddProduct(product)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-soft/40 transition-colors flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={product.productImage || "https://placehold.co/80x80?text=SP"}
                        alt={product.name}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{product.name}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-muted shrink-0">
                    System Stock: {product.stock}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Products Table */}
        <div className="border border-border rounded-sm overflow-hidden bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead className="py-2.5 px-3">Product Name</TableHead>
                <TableHead className="py-2.5 px-3 w-36 text-center">System Qty</TableHead>
                <TableHead className="py-2.5 px-3 w-36 text-center">Actual Qty</TableHead>
                <TableHead className="py-2.5 px-3 w-28 text-center">Variance</TableHead>
                <TableHead className="py-2.5 px-3 w-12 text-center">Del</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-ink-muted font-medium">
                    No products added. Use the search bar above to select products for verifying.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const variance = item.actualQty - item.systemQty;
                  return (
                    <TableRow key={item.variantId} className="hover:bg-surface-soft/20 transition-colors">
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <div className="w-8 h-8 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={item.productImage || "https://placehold.co/80x80?text=SP"}
                              alt={item.name}
                              className="w-full h-full object-contain p-0.5"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink truncate" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-ink-muted font-mono">{item.barcode || item.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center text-ink font-semibold">
                        {item.systemQty}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="number"
                          min={0}
                          value={item.actualQty}
                          onChange={(e) =>
                            handleActualQtyChange(item.variantId, Math.max(0, Number(e.target.value) || 0))
                          }
                          className="h-8 text-center text-xs bg-surface max-w-[100px] mx-auto"
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center font-bold">
                        {variance > 0 ? (
                          <span className="text-success font-semibold">+{variance}</span>
                        ) : variance < 0 ? (
                          <span className="text-danger font-semibold">{variance}</span>
                        ) : (
                          <span className="text-ink-muted">0</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-danger hover:bg-danger/10"
                          onClick={() => handleRemoveProduct(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Adjustments Overview Cards */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-soft/60 border border-border rounded-sm p-3 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-ink-muted">Adjusted Quantity:</span>
              <span className={`text-sm font-bold mt-1 ${adjustments.totalQty > 0 ? "text-success" : adjustments.totalQty < 0 ? "text-danger" : "text-ink"}`}>
                {adjustments.totalQty > 0 ? `+${adjustments.totalQty}` : adjustments.totalQty} items
              </span>
            </div>
            <div className="bg-surface-soft/60 border border-border rounded-sm p-3 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-ink-muted">Financial Adjustment:</span>
              <span className={`text-sm font-bold mt-1 ${adjustments.totalValue > 0 ? "text-success" : adjustments.totalValue < 0 ? "text-danger" : "text-ink"}`}>
                {adjustments.totalValue > 0 ? "+" : ""}{adjustments.totalValue.toLocaleString("en-US")} ₫
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="stocktakeNotes" className="text-xs font-semibold text-ink">
            Stocktake Notes
          </Label>
          <Textarea
            id="stocktakeNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain reason for discrepancy (optional)..."
            className="h-16 text-xs resize-none"
          />
        </div>
      </form>
    </BaseCrudModal>
  );
}
