import { useState, useMemo, useRef } from "react";
import { Trash2, Loader2, Package, Search, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import {
  useInventoryStock,
  useSuppliers,
  useCreateSupplier,
  useRestock,
} from "../../hooks/useInventory";

interface BulkRestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkRestockModal({
  open,
  onOpenChange,
}: BulkRestockModalProps) {
  const [supplierId, setSupplierId] = useState("");
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierAddress, setNewSupplierAddress] = useState("");

  const [items, setItems] = useState<
    {
      variantId: string;
      quantity: number;
      importPrice: number;
      batchCode?: string;
      manufactureDate?: string;
      expiryDate?: string;
    }[]
  >([]);

  const { data: stockData } = useInventoryStock({ limit: 1000 });
  const stockItems = stockData?.stock ?? [];
  const { data: suppliers = [] } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const restockMutation = useRestock();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const newItems = [...items];
        let addedCount = 0;
        let notFoundCount = 0;

        data.forEach((row) => {
          const codeVal = row["Barcode"] || row["Barcode"] || row["barcode"] || row["SKU"] || row["SKU"] || row["sku"];
          const rawQty = row["Quantity"] || row["Quantity"] || row["qty"];
          const rawPrice = row["Import price"] || row["Price"] || row["price"];

          if (!codeVal) return;

          const quantity = Number(rawQty) || 1;
          const importPrice = Number(rawPrice) || 0;
          const batchCode =
            row["Batch code"] || row["Batch Code"] || row["batchCode"] || "";
          const manufactureDate =
            row["Manufacture date"] ||
            row["NSX"] ||
            row["Mfg Date"] ||
            row["manufactureDate"] ||
            "";
          const expiryDate =
            row["Expiration date"] ||
            row["HSD"] ||
            row["Exp Date"] ||
            row["expiryDate"] ||
            "";

          const matchedItem = stockItems.find(
            (s) =>
              (s.barcode && s.barcode.toLowerCase() === String(codeVal).toLowerCase().trim()) ||
              (s.sku && s.sku.toLowerCase() === String(codeVal).toLowerCase().trim())
          );

          if (matchedItem) {
            const existingIndex = newItems.findIndex(
              (i) => i.variantId === matchedItem.id,
            );
            if (existingIndex >= 0) {
              newItems[existingIndex].quantity += quantity;
            } else {
              newItems.push({
                variantId: matchedItem.id,
                quantity,
                importPrice,
                batchCode,
                manufactureDate,
                expiryDate,
              });
            }
            addedCount++;
          } else {
            notFoundCount++;
          }
        });

        setItems(newItems);
        toast.success(`Added ${addedCount} products from Excel.`);
        if (notFoundCount > 0) {
          toast.warning(
            `SKU not found for ${notFoundCount} products.`,
          );
        }
      } catch (error) {
        toast.error("Error reading Excel file. Please check format.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return stockItems
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.sku.toLowerCase().includes(q) ||
          (s.barcode && s.barcode.toLowerCase() === q),
      )
      .slice(0, 5);
  }, [searchQuery, stockItems]);

  const handleSelectItem = (variantId: string) => {
    const existingIndex = items.findIndex((i) => i.variantId === variantId);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, { variantId, quantity: 1, importPrice: 0 }]);
    }
    setSearchQuery("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        const exactMatch = searchResults.find(
          (s) =>
            s.barcode &&
            s.barcode.toLowerCase() === searchQuery.toLowerCase().trim(),
        );
        if (exactMatch) {
          handleSelectItem(exactMatch.id);
        } else if (searchResults.length === 1) {
          handleSelectItem(searchResults[0].id);
        }
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handlePriceChange = (index: number, val: string) => {
    const rawVal = val.replace(/\D/g, "");
    const newVal = Number(rawVal);
    const newItems = [...items];
    newItems[index].importPrice = isNaN(newVal) ? 0 : newVal;
    setItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (item.quantity * item.importPrice || 0),
      0,
    );
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one product!");
      return;
    }

    const invalidItems = items.some(
      (item) =>
        !item.variantId ||
        item.quantity <= 0 ||
        item.importPrice <= 0 ||
        !item.batchCode ||
        !item.manufactureDate ||
        !item.expiryDate,
    );
    if (invalidItems) {
      toast.error("Please fill in complete and valid details for all products!");
      return;
    }

    let finalSupplierId = supplierId;

    if (isNewSupplier) {
      if (!newSupplierName.trim() || !newSupplierPhone.trim()) {
        toast.error("Please fill in supplier name and phone number!");
        return;
      }
      try {
        const created = await createSupplierMutation.mutateAsync({
          name: newSupplierName.trim(),
          phone: newSupplierPhone.trim(),
          email: newSupplierEmail.trim(),
          address: newSupplierAddress.trim(),
        });
        finalSupplierId = created.id;
      } catch (err: any) {
        toast.error(err.message || "Failed to create supplier!");
        return;
      }
    }

    if (!finalSupplierId) {
      toast.error("Please select or create a supplier!");
      return;
    }

    try {
      await restockMutation.mutateAsync({
        supplierId: finalSupplierId,
        items: items,
      });

      toast.success("Created restock ticket successfully!");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create restock ticket!");
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setIsNewSupplier(false);
    setNewSupplierName("");
    setNewSupplierPhone("");
    setNewSupplierEmail("");
    setNewSupplierEmail("");
    setNewSupplierAddress("");
    setItems([]);
    setSearchQuery("");
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
      title="Bulk Restock"
      size="xl"
      hideFooter={true}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 pb-4"
        id="bulk-restock-form"
      >
        {/* Top Section: Supplier */}
        <div className="bg-surface-soft border border-border rounded-sm p-4 space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />{"Supplier Information"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="supplier"
                className="text-xs font-semibold text-ink"
              >{"Supplier *"}</Label>
              <Select
                value={isNewSupplier ? "new" : supplierId}
                onValueChange={(val) => {
                  if (val === "new") {
                    setIsNewSupplier(true);
                    setSupplierId("");
                  } else {
                    setIsNewSupplier(false);
                    setSupplierId(val);
                  }
                }}
                required
              >
                <SelectTrigger id="supplier" className="w-full h-9 bg-surface">
                  <SelectValue placeholder="-- Select Supplier --" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup: any) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new" className="text-brand font-semibold">{"+ Add New Supplier..."}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isNewSupplier && (
              <div className="space-y-3 animate-scale-in border-l-2 border-brand pl-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-ink-muted uppercase">{"Supplier Name *"}</Label>
                    <Input
                      placeholder="Supplier name..."
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      className="h-8 text-sm"
                      required={isNewSupplier}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-ink-muted uppercase">{"Phone Number *"}</Label>
                    <Input
                      placeholder="Phone number..."
                      value={newSupplierPhone}
                      onChange={(e) => setNewSupplierPhone(e.target.value)}
                      className="h-8 text-sm"
                      required={isNewSupplier}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-ink-muted uppercase">
                      Email
                    </Label>
                    <Input
                      placeholder="Email..."
                      value={newSupplierEmail}
                      onChange={(e) => setNewSupplierEmail(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-ink-muted uppercase">{"Address"}</Label>
                    <Input
                      placeholder="Address..."
                      value={newSupplierAddress}
                      onChange={(e) => setNewSupplierAddress(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Items Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">{"Restock Product List"}</h3>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 whitespace-nowrap"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />{"Import from Excel"}</Button>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <Input
                  type="text"
                  placeholder="Scan barcode or enter name, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-8 h-9 text-xs"
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-ui-soft max-h-60 overflow-y-auto">
                    {searchResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-surface-soft border-b border-border last:border-0 transition-colors"
                        onClick={() => handleSelectItem(s.id)}
                      >
                        <p className="text-sm font-semibold text-ink line-clamp-1">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {s.sku} • Stock:{" "}
                          <strong className="text-ink">{s.stock}</strong>
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() !== "" && searchResults.length === 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-ui-soft p-3 text-center text-xs text-ink-muted">{"Product not found."}</div>
                )}
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-8 border border-dashed border-border rounded-sm flex flex-col items-center justify-center text-ink-muted bg-surface-soft/30">
              <p className="text-xs font-medium">{"No products selected"}</p>
              <p className="text-[11px] mt-1">{"Use the search bar to add products to the restock ticket"}</p>
            </div>
          ) : (
            <div className="border border-border rounded-sm overflow-x-auto bg-surface">
              <table className="w-full text-left border-collapse text-sm min-w-225">
                <thead className="bg-surface-soft text-ink-muted font-semibold text-xs border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">{"Product / Variant"}</th>
                    <th className="py-2.5 px-3 w-24 text-center">{"Quantity"}</th>
                    <th className="py-2.5 px-3 w-36 text-right">{"Unit Price in VND"}</th>
                    <th className="py-2.5 px-3 w-36 text-center">{"Batch Code"}</th>
                    <th className="py-2.5 px-3 w-36 text-center">MFG and EXP</th>
                    <th className="py-2.5 px-3 w-36 text-right">{"Total Price in VND"}</th>
                    <th className="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, index) => {
                    const stockInfo = stockItems.find(
                      (s) => s.id === item.variantId,
                    );
                    return (
                      <tr
                        key={index}
                        className="bg-surface hover:bg-surface-soft/50 transition-colors"
                      >
                        <td className="p-2 whitespace-normal min-w-50">
                          <p className="text-sm font-semibold text-ink line-clamp-2 leading-tight">
                            {stockInfo?.name || "Unknown Product"}
                          </p>
                          <p className="text-[11px] text-ink-muted mt-0.5">
                            {stockInfo?.sku || "N/A"}
                          </p>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className="h-8 text-center text-xs font-medium"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="text"
                            value={
                              item.importPrice !== undefined &&
                              item.importPrice !== null
                                ? item.importPrice.toLocaleString("en-US")
                                : "0"
                            }
                            onChange={(e) =>
                              handlePriceChange(index, e.target.value)
                            }
                            className="h-8 text-right text-xs tabular-nums font-medium"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="text"
                            placeholder="Batch code..."
                            value={item.batchCode || ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "batchCode",
                                e.target.value,
                              )
                            }
                            className="h-8 text-xs font-medium px-2 text-center"
                            required
                          />
                        </td>
                        <td className="p-2 flex flex-col gap-1 min-w-32.5">
                          <Input
                            type="date"
                            value={
                              item.manufactureDate
                                ? item.manufactureDate.substring(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "manufactureDate",
                                e.target.value,
                              )
                            }
                            className="h-8 text-xs px-2"
                            required
                            title="Manufacture Date"
                          />
                          <Input
                            type="date"
                            value={
                              item.expiryDate
                                ? item.expiryDate.substring(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "expiryDate",
                                e.target.value,
                              )
                            }
                            className="h-8 text-xs px-2"
                            required
                            title="Expiry Date"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-ink text-sm tabular-nums">
                          {(
                            (item.quantity || 0) * (item.importPrice || 0)
                          ).toLocaleString("en-US")}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-ink-muted hover:text-danger p-1 rounded-sm transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer inside form to capture submit */}
        {/* Custom Footer */}
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 px-6 py-4 border-t border-surface-muted bg-surface/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left flex-1">
            <p className="text-xs text-ink-muted uppercase font-semibold">{"Total Amount"}</p>
            <p className="text-xl font-bold text-brand tabular-nums">
              {totalAmount.toLocaleString("en-US")} VND
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm font-medium px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                restockMutation.isPending || createSupplierMutation.isPending
              }
              className="rounded-sm font-medium px-6 bg-brand hover:bg-brand-dark text-white"
            >
              {restockMutation.isPending || createSupplierMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </Button>
          </div>
        </div>
      </form>
    </BaseCrudModal>
  );
}
