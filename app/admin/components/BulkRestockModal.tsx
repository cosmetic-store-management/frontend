import { useState, useMemo } from "react";
import { Plus, Trash2, Loader2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import {
  useInventoryStock,
  useSuppliers,
  useCreateSupplier,
  useRestock,
} from "../hooks/useInventory";

interface BulkRestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkRestockModal({ open, onOpenChange }: BulkRestockModalProps) {
  const [supplierId, setSupplierId] = useState("");
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierAddress, setNewSupplierAddress] = useState("");

  const [items, setItems] = useState<{ variantId: string; quantity: number; importPrice: number }[]>([]);
  
  const { data: stockData } = useInventoryStock({ limit: 1000 });
  const stockItems = stockData?.stock ?? [];
  const { data: suppliers = [] } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const restockMutation = useRestock();

  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return stockItems.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.sku.toLowerCase().includes(q) ||
      (s.barcode && s.barcode.toLowerCase() === q)
    ).slice(0, 5); // Limit results
  }, [searchQuery, stockItems]);

  const handleSelectItem = (variantId: string) => {
    const existingIndex = items.findIndex(i => i.variantId === variantId);
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
      // Quét mã vạch thường tự động có phím Enter.
      // Tìm xem có sản phẩm nào khớp đúng barcode (hoặc khớp duy nhất 1 kết quả)
      if (searchResults.length > 0) {
        const exactMatch = searchResults.find(s => s.barcode && s.barcode.toLowerCase() === searchQuery.toLowerCase().trim());
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

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.importPrice || 0), 0);
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm!");
      return;
    }

    const invalidItems = items.some(item => !item.variantId || item.quantity <= 0 || item.importPrice <= 0);
    if (invalidItems) {
      toast.error("Vui lòng điền đầy đủ và hợp lệ thông tin tất cả sản phẩm!");
      return;
    }

    let finalSupplierId = supplierId;

    if (isNewSupplier) {
      if (!newSupplierName.trim() || !newSupplierPhone.trim()) {
        toast.error("Vui lòng điền tên và số điện thoại nhà cung cấp!");
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
        toast.error(err.message || "Không thể tạo nhà cung cấp!");
        return;
      }
    }

    if (!finalSupplierId) {
      toast.error("Vui lòng chọn hoặc tạo nhà cung cấp!");
      return;
    }

    try {
      await restockMutation.mutateAsync({
        supplierId: finalSupplierId,
        items: items,
      });

      toast.success("Tạo phiếu nhập kho thành công!");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo phiếu nhập kho!");
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
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) resetForm();
      onOpenChange(o);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-ink">Tạo phiếu nhập hàng</DialogTitle>
          <DialogDescription className="text-xs text-ink-muted">
            Nhập nhiều sản phẩm từ cùng một nhà cung cấp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Top Section: Supplier */}
          <div className="bg-surface-soft border border-border rounded-sm p-4 space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-brand" /> Thông tin nhà cung cấp
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="supplier" className="text-xs font-semibold text-ink">Nhà cung cấp *</Label>
                <select
                  id="supplier"
                  className="w-full h-9 px-3 border border-border rounded-sm bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  value={isNewSupplier ? "new" : supplierId}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setIsNewSupplier(true);
                      setSupplierId("");
                    } else {
                      setIsNewSupplier(false);
                      setSupplierId(e.target.value);
                    }
                  }}
                  required
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((sup: any) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                  <option value="new" className="text-brand font-semibold">+ Thêm nhà cung cấp mới...</option>
                </select>
              </div>

              {isNewSupplier && (
                <div className="space-y-3 animate-scale-in border-l-2 border-brand pl-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-ink-muted uppercase">Tên nhà cung cấp *</Label>
                      <Input
                        placeholder="Tên nhà cung cấp..."
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        className="h-8 text-sm"
                        required={isNewSupplier}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-ink-muted uppercase">Số điện thoại *</Label>
                      <Input
                        placeholder="Số điện thoại..."
                        value={newSupplierPhone}
                        onChange={(e) => setNewSupplierPhone(e.target.value)}
                        className="h-8 text-sm"
                        required={isNewSupplier}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-ink-muted uppercase">Email</Label>
                      <Input
                        placeholder="Email..."
                        value={newSupplierEmail}
                        onChange={(e) => setNewSupplierEmail(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-ink-muted uppercase">Địa chỉ</Label>
                      <Input
                        placeholder="Địa chỉ..."
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
              <h3 className="text-sm font-bold text-ink">Danh sách sản phẩm nhập</h3>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <Input
                  type="text"
                  placeholder="Quét mã vạch hoặc nhập tên, SKU..."
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
                        <p className="text-sm font-semibold text-ink line-clamp-1">{s.name}</p>
                        <p className="text-[11px] text-ink-muted">SKU: {s.sku} • Tồn: <strong className="text-ink">{s.stock}</strong></p>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() !== "" && searchResults.length === 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-ui-soft p-3 text-center text-xs text-ink-muted">
                    Không tìm thấy sản phẩm.
                  </div>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-8 border border-dashed border-border rounded-sm flex flex-col items-center justify-center text-ink-muted bg-surface-soft/30">
                <p className="text-xs font-medium">Chưa có sản phẩm nào được chọn</p>
                <p className="text-[11px] mt-1">Sử dụng thanh tìm kiếm để thêm sản phẩm vào phiếu nhập</p>
              </div>
            ) : (
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface-soft text-ink-muted font-semibold text-xs border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Sản phẩm / Biến thể</th>
                      <th className="py-2.5 px-3 w-32 text-center">Số lượng</th>
                      <th className="py-2.5 px-3 w-40 text-right">Đơn giá nhập (đ)</th>
                      <th className="py-2.5 px-3 w-40 text-right">Thành tiền (đ)</th>
                      <th className="py-2.5 px-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, index) => {
                      const stockInfo = stockItems.find(s => s.id === item.variantId);
                      return (
                        <tr key={index} className="bg-surface hover:bg-surface-soft/50 transition-colors">
                          <td className="p-2 whitespace-normal min-w-[200px]">
                            <p className="text-sm font-semibold text-ink line-clamp-2 leading-tight">
                              {stockInfo?.name || "Sản phẩm không rõ"}
                            </p>
                            <p className="text-[11px] text-ink-muted mt-0.5">SKU: {stockInfo?.sku || "N/A"}</p>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity || ""}
                              onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                              className="h-8 text-center text-xs font-medium"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.importPrice || ""}
                              onChange={(e) => handleItemChange(index, "importPrice", Number(e.target.value))}
                              className="h-8 text-right text-xs tabular-nums font-medium"
                              required
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-ink text-sm tabular-nums">
                            {((item.quantity || 0) * (item.importPrice || 0)).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-2 text-center">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveItem(index)}
                              className="text-ink-muted hover:text-danger p-1 rounded-sm transition-colors"
                              title="Xóa"
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
          <DialogFooter className="border-t border-border pt-4 flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left flex-1">
              <p className="text-xs text-ink-muted uppercase font-semibold">Tổng cộng</p>
              <p className="text-xl font-bold text-brand tabular-nums">{totalAmount.toLocaleString("vi-VN")} đ</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button type="submit" disabled={restockMutation.isPending || createSupplierMutation.isPending}>
                {restockMutation.isPending || createSupplierMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Hoàn tất nhập kho"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
