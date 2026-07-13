import React, { useState, useEffect } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Trash2, Loader2 } from "lucide-react";
import {
  getStockList,
  getSuppliers,
  createSupplier,
  createGoodsReceipt,
  InventoryItem,
  Supplier,
} from "../../../admin/services/inventory.service";
import { toast } from "@/lib/toast";

interface ImportGoodsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ReceiptItem {
  variantId: string;
  name: string;
  sku: string;
  barcode?: string;
  productImage?: string;
  quantity: number;
  importPrice: number;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
}

export default function ImportGoodsModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportGoodsModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [isNewSupplier, setIsNewSupplier] = useState<boolean>(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [isPending, setIsPending] = useState(false);

  // Fetch suppliers
  useEffect(() => {
    if (open) {
      getSuppliers()
        .then(setSuppliers)
        .catch(console.error);
    } else {
      setItems([]);
      setSelectedSupplierId("");
      setIsNewSupplier(false);
      setNewSupplier({ name: "", phone: "", email: "", address: "" });
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
        quantity: 1,
        importPrice: 0,
        batchCode: `B${Math.floor(10000 + Math.random() * 90000)}`,
        manufactureDate: "",
        expiryDate: "",
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveProduct = (variantId: string) => {
    setItems(items.filter((item) => item.variantId !== variantId));
  };

  const handleItemChange = (
    variantId: string,
    field: keyof ReceiptItem,
    value: any,
  ) => {
    setItems(
      items.map((item) =>
        item.variantId === variantId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.importPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Please add at least one product to receipt");
      return;
    }

    let finalSupplierId = selectedSupplierId;

    setIsPending(true);

    try {
      if (isNewSupplier) {
        if (!newSupplier.name.trim() || !newSupplier.phone.trim()) {
          toast.error("Supplier name and phone are required");
          setIsPending(false);
          return;
        }
        const created = await createSupplier(newSupplier);
        finalSupplierId = created.id;
      }

      if (!finalSupplierId) {
        toast.error("Please select a supplier");
        setIsPending(false);
        return;
      }

      // Validate items dates
      for (const item of items) {
        if (item.manufactureDate && item.expiryDate) {
          if (new Date(item.expiryDate) <= new Date(item.manufactureDate)) {
            toast.error(`Expiry date must be after manufacture date for ${item.name}`);
            setIsPending(false);
            return;
          }
        }
      }

      await createGoodsReceipt({
        supplierId: finalSupplierId,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: Number(item.quantity) || 0,
          importPrice: Number(item.importPrice) || 0,
          batchCode: item.batchCode || undefined,
          manufactureDate: item.manufactureDate || undefined,
          expiryDate: item.expiryDate || undefined,
        })),
      });

      toast.success("Goods Receipt created successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create goods receipt");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={onOpenChange}
      title="Import Goods"
      size="xl"
      primaryActionText="Confirm"
      secondaryActionText="Cancel"
      onPrimaryAction={handleSubmit as any}
      isLoading={isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left py-1.5">
        {/* Supplier Section */}
        <div className="space-y-1.5">
          <Label htmlFor="supplier" className="text-xs font-semibold text-ink-muted">
            Supplier
          </Label>
          <Select
            value={isNewSupplier ? "new" : selectedSupplierId || ""}
            onValueChange={(val) => {
              if (val === "new") {
                setIsNewSupplier(true);
                setSelectedSupplierId("");
              } else {
                setIsNewSupplier(false);
                setSelectedSupplierId(val);
              }
            }}
          >
            <SelectTrigger className="w-full h-9 rounded-sm border-border bg-surface text-sm text-ink focus-visible:ring-brand/20">
              <SelectValue placeholder="Select supplier..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-surface border-border">
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — {s.phone}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Add new supplier...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* New Supplier Form */}
        {isNewSupplier && (
          <div className="border border-border/80 bg-surface-soft/50 rounded-sm p-4 space-y-3.5 mt-2">
            <h5 className="text-xs font-bold text-ink">New Supplier Info</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sName" className="text-[11px] font-semibold text-ink-muted">
                  Supplier Name
                </Label>
                <Input
                  id="sName"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="Enter supplier name..."
                  className="h-9 text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sPhone" className="text-[11px] font-semibold text-ink-muted">
                  Phone Number
                </Label>
                <Input
                  id="sPhone"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="Enter phone number..."
                  className="h-9 text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sEmail" className="text-[11px] font-semibold text-ink-muted">
                  Email Address
                </Label>
                <Input
                  id="sEmail"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="Enter email address..."
                  className="h-9 text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sAddr" className="text-[11px] font-semibold text-ink-muted">
                  Address
                </Label>
                <Input
                  id="sAddr"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="Enter address..."
                  className="h-9 text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Search Bar */}
        <div className="relative space-y-1.5">
          <Label htmlFor="productSearch" className="text-xs font-semibold text-ink-muted">
            Add Products
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <Input
              id="productSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product by name or barcode..."
              className="pl-9 h-9 text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20"
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
                      <p className="text-[10px] text-ink-muted mt-0.5 font-mono">Barcode: {product.barcode || product.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-muted shrink-0">
                    Stock: {product.stock}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Products Table */}
        <div className="border border-border rounded-sm overflow-hidden bg-surface">
          <Table className="min-w-[1000px] table-fixed">
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead className="py-2.5 px-3 w-72 text-left">Product</TableHead>
                <TableHead className="py-2.5 px-3 w-24 text-center">Quantity</TableHead>
                <TableHead className="py-2.5 px-3 w-36 text-center">Import Price</TableHead>
                <TableHead className="py-2.5 px-3 w-36 text-center">Batch Code</TableHead>
                <TableHead className="py-2.5 px-3 w-36 text-center">MFG Date</TableHead>
                <TableHead className="py-2.5 px-3 w-36 text-center">EXP Date</TableHead>
                <TableHead className="py-2.5 px-3 w-20 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-ink-muted font-medium">
                    No products added. Use the search bar above to select products.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.variantId} className="hover:bg-surface-soft/20 transition-colors">
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={item.productImage || "https://placehold.co/80x80?text=SP"}
                            alt={item.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink truncate text-sm" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-ink-muted font-mono mt-0.5">
                            Barcode: <span className="font-medium text-ink">{item.barcode || item.sku || "—"}</span>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.variantId, "quantity", Number(e.target.value) || 1)
                        }
                        className="h-9 text-center text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20 px-1"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <Input
                        type="text"
                        value={
                          item.importPrice
                            ? item.importPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, "");
                          if (/^\d*$/.test(raw)) {
                            handleItemChange(
                              item.variantId,
                              "importPrice",
                              raw ? Number(raw) : 0,
                            );
                          }
                        }}
                        placeholder="0"
                        className="h-9 text-center text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20 px-2"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <Input
                        type="text"
                        value={item.batchCode}
                        onChange={(e) =>
                          handleItemChange(item.variantId, "batchCode", e.target.value)
                        }
                        placeholder="LOT..."
                        className="h-9 text-center text-sm bg-surface border-border focus-visible:border-brand focus-visible:ring-brand/20 px-2"
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <DatePicker
                        value={item.manufactureDate ? new Date(item.manufactureDate) : undefined}
                        onChange={(date) =>
                          handleItemChange(
                            item.variantId,
                            "manufactureDate",
                            date ? date.toISOString().split("T")[0] : "",
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <DatePicker
                        value={item.expiryDate ? new Date(item.expiryDate) : undefined}
                        onChange={(date) =>
                          handleItemChange(
                            item.variantId,
                            "expiryDate",
                            date ? date.toISOString().split("T")[0] : "",
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="py-2 px-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-danger hover:bg-danger/10 hover:text-danger"
                        onClick={() => handleRemoveProduct(item.variantId)}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total Cost Display Card */}
        <div className="bg-surface-soft/50 border border-border rounded-sm p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-ink-muted">Total Cost:</span>
          <span className="text-base font-bold text-brand tabular-nums">
            {calculateTotal().toLocaleString("en-US")} ₫
          </span>
        </div>
      </form>
    </BaseCrudModal>
  );
}
