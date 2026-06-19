import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Search, Plus, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2, FilePlus, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { BulkRestockModal } from "../components/BulkRestockModal";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/ui/pagination";
import {
  useInventoryStock,
  useInventoryTransactions,
  useSuppliers,
  useCreateSupplier,
  useRestock,
  useAdjustStock,
} from "../hooks/useInventory";
import { restockSchema, adjustStockSchema, type RestockFormData, type AdjustStockFormData } from "../schemas/inventory.schema";

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "transactions">("stock");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [stockPage, setStockPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const {
    control: restockControl,
    handleSubmit: handleRestockFormSubmit,
    reset: resetRestockForm,
    watch: watchRestock,
    setValue: setRestockValue,
    formState: { errors: restockErrors },
  } = useForm<RestockFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(restockSchema) as any,
    defaultValues: {
      supplierId: "",
      isNewSupplier: false,
      newSupplierName: "",
      newSupplierPhone: "",
      newSupplierEmail: "",
      newSupplierAddress: "",
      importPrice: 0,
      restockQty: 0,
    },
  });

  const {
    control: adjustControl,
    handleSubmit: handleAdjustFormSubmit,
    reset: resetAdjustForm,
    watch: watchAdjust,
    formState: { errors: adjustErrors },
  } = useForm<AdjustStockFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adjustStockSchema) as any,
    defaultValues: { actualStock: 0 },
  });

  const isNewSupplier = watchRestock("isNewSupplier");
  const actualStockValue = watchAdjust("actualStock");

  // Queries & Mutations
  useEffect(() => {
    setStockPage(1);
  }, [debouncedSearch]);

  const { data: stockData, isLoading: isStockLoading } = useInventoryStock({
    search: debouncedSearch || undefined,
    page: stockPage,
    limit: 10,
  });
  const stockItems = stockData?.stock || [];
  const stockPagination = stockData?.pagination;

  const { data: txData, isLoading: isTxLoading } = useInventoryTransactions({
    page: txPage,
    limit: 10,
  });
  const transactions = txData?.transactions || [];
  const txPagination = txData?.pagination;

  const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliers();

  const createSupplierMutation = useCreateSupplier();
  const restockMutation = useRestock();
  const adjustMutation = useAdjustStock();

  const handleAdjustClick = (item: any) => {
    setSelectedItem(item);
    resetAdjustForm({ actualStock: item.stock });
    setIsAdjustOpen(true);
  };

  const onSubmitAdjustForm = async (data: AdjustStockFormData) => {
    if (!selectedItem) return;

    try {
      await adjustMutation.mutateAsync({
        variantId: selectedItem.id,
        actualStock: data.actualStock,
      });

      toast.success(`Đã cập nhật tồn kho cho ${selectedItem.name}`);
      setIsAdjustOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi kiểm kho!");
    }
  };

  const handleRestockClick = (item: any) => {
    setSelectedItem(item);
    resetRestockForm({
      supplierId: "",
      isNewSupplier: false,
      newSupplierName: "",
      newSupplierPhone: "",
      newSupplierEmail: "",
      newSupplierAddress: "",
      importPrice: 0,
      restockQty: 0,
    });
    setIsRestockOpen(true);
  };

  const onSubmitRestockForm = async (data: RestockFormData) => {
    if (!selectedItem) return;

    let finalSupplierId = data.supplierId;

    // If adding a new supplier inline
    if (data.isNewSupplier) {
      try {
        const created = await createSupplierMutation.mutateAsync({
          name: data.newSupplierName!,
          phone: data.newSupplierPhone!,
          email: data.newSupplierEmail ?? "",
          address: data.newSupplierAddress ?? "",
        });
        finalSupplierId = created.id;
      } catch (err: any) {
        toast.error(err.message || "Không thể tạo nhà cung cấp!");
        return;
      }
    }

    try {
      await restockMutation.mutateAsync({
        supplierId: finalSupplierId!,
        items: [
          {
            variantId: selectedItem.id,
            quantity: data.restockQty,
            importPrice: data.importPrice,
          },
        ],
      });

      toast.success(`Đã bổ sung ${data.restockQty} chiếc cho sản phẩm ${selectedItem.name}`);
      setIsRestockOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi nhập kho!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left">
      {/* Header Box */}
      <div className="space-y-4 border border-border rounded-sm bg-surface p-4 shadow-ui-soft sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-1.5 flex-1">
            <h1 className="text-2xl font-bold text-ink tracking-tight">Quản lý kho hàng</h1>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl leading-6">Theo dõi tồn kho, nhập hàng và lịch sử giao dịch kho</p>
          </div>
          <Button className="gap-2 shrink-0 h-10 bg-brand text-white hover:bg-brand-hover shadow-none" size="sm" onClick={() => setIsBulkOpen(true)}>
            <FilePlus className="w-4 h-4" /> Tạo phiếu nhập hàng
          </Button>
        </div>

        <div className="group relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
          <Input
            placeholder="Tìm tên sản phẩm, mã SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 border-border bg-surface pl-9 pr-9 text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab("stock")}
            className={`inline-flex h-9 items-center gap-2 border px-3.5 text-xs font-semibold transition-colors rounded-sm sm:px-4 ${
              activeTab === "stock"
                ? "border-brand bg-brand/10 text-brand shadow-ui-soft"
                : "border-border bg-surface text-ink-muted hover:border-brand hover:text-ink-muted"
            }`}
          >
            Tồn kho hiện tại
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`inline-flex h-9 items-center gap-2 border px-3.5 text-xs font-semibold transition-colors rounded-sm sm:px-4 ${
              activeTab === "transactions"
                ? "border-brand bg-brand/10 text-brand shadow-ui-soft"
                : "border-border bg-surface text-ink-muted hover:border-brand hover:text-ink-muted"
            }`}
          >
            Lịch sử giao dịch kho
          </button>
        </div>
      </div>

      {activeTab === "stock" ? (
        <div className="space-y-4">
          {/* Stock Table */}
          <div className="bg-surface border border-border rounded-sm overflow-hidden shadow-ui-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[820px] table-fixed">
                <thead>
                <tr className="border-b border-border bg-surface-soft/50 text-ink-muted">
                  <th className="py-3 px-5 font-semibold w-[12%]">Mã SKU</th>
                  <th className="py-3 px-5 font-semibold w-[26%]">Tên sản phẩm</th>
                  <th className="py-3 px-5 font-semibold text-center w-[10%]">Tồn kho</th>
                  <th className="py-3 px-5 font-semibold text-center w-[12%]">Hạn mức tối thiểu</th>
                  <th className="py-3 px-5 font-semibold w-[16%]">Thương hiệu</th>
                  <th className="py-3 px-5 font-semibold w-[12%]">Cập nhật cuối</th>
                  <th className="py-3 px-5 font-semibold text-center w-[12%]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isStockLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink-muted">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                        <span>Đang tải danh sách tồn kho...</span>
                      </div>
                    </td>
                  </tr>
                ) : stockItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink-muted">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  stockItems.map((item: any) => {
                    const isLow = item.stock <= item.minStock;
                    const isOut = item.stock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-surface-soft/30 transition-colors">
                        <td className="py-3.5 px-5 overflow-hidden max-w-0">
                          <span className="block truncate font-mono text-xs text-ink-muted">{item.sku}</span>
                        </td>
                        <td className="py-3.5 px-5 overflow-hidden max-w-0">
                          <span className="block truncate font-semibold text-ink">{item.name}</span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            isOut ? "text-danger" : isLow ? "text-warning" : "text-ink"
                          }`}>
                            {item.stock}
                            {isLow && (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center text-ink-muted font-medium">{item.minStock}</td>
                        <td className="py-3.5 px-5 overflow-hidden max-w-0">
                          <div className="flex items-center gap-2">
                            {item.brandImage ? (
                              <img
                                src={item.brandImage}
                                alt={item.brandName}
                                className="h-6 w-6 rounded-sm object-contain border border-border shrink-0 bg-white p-0.5"
                              />
                            ) : null}
                            <span className="block truncate text-sm font-medium text-ink">
                              {item.brandName || item.supplier || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 overflow-hidden max-w-0">
                          <span className="block truncate text-ink-muted text-xs">{item.lastUpdated || "Chưa cập nhật"}</span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              title="Nhập thêm hàng"
                              onClick={() => handleRestockClick(item)}
                              className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-brand/10 hover:text-brand"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Kiểm kho"
                              onClick={() => handleAdjustClick(item)}
                              className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-brand/10 hover:text-brand"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
            {stockPagination && stockPagination.totalPages > 1 && (
              <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
                <Pagination
                  currentPage={stockPage}
                  totalPages={stockPagination.totalPages}
                  onPageChange={setStockPage}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Transactions List */
        <div className="bg-surface border border-border rounded-sm overflow-hidden shadow-ui-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[800px] table-fixed">
              <thead>
              <tr className="border-b border-border bg-surface-soft/50 text-ink-muted">
                <th className="py-3 px-5 font-semibold w-[18%]">Mã GD</th>
                <th className="py-3 px-5 font-semibold w-[15%]">Mã SKU</th>
                <th className="py-3 px-5 font-semibold text-center w-[18%]">Loại giao dịch</th>
                <th className="py-3 px-5 font-semibold text-right w-[12%]">Số lượng</th>
                <th className="py-3 px-5 font-semibold w-[19%]">Người thực hiện</th>
                <th className="py-3 px-5 font-semibold w-[18%]">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isTxLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span>Đang tải lịch sử giao dịch...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Chưa có giao dịch kho nào được thực hiện
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-surface-soft/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-ink-muted overflow-hidden max-w-0">
                      <span className="block truncate">{tx.id}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-ink font-medium truncate overflow-hidden max-w-0">{tx.sku}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold ${
                        tx.type === "in"
                          ? "bg-success/10 text-success border border-success"
                          : tx.type === "out" ? "bg-warning/10 text-warning border border-warning"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500"
                      }`}>
                        {tx.type === "in" ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-success" /> Nhập hàng
                          </>
                        ) : tx.type === "out" ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-warning" /> Xuất hàng
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-blue-500" /> Kiểm kho
                          </>
                        )}
                      </span>
                    </td>
                    <td className={`py-3.5 px-5 text-right font-bold tabular-nums ${
                      tx.type === "in" ? "text-success" : tx.type === "out" ? "text-warning" : "text-blue-500"
                    }`}>
                      {tx.type === "in" ? `+${tx.qty}` : tx.type === "out" ? `-${tx.qty}` : tx.qty > 0 ? `+${tx.qty}` : tx.qty}
                    </td>
                    <td className="py-3.5 px-5 text-ink-muted font-medium">{tx.user}</td>
                    <td className="py-3.5 px-5 text-ink-muted text-xs">{tx.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          {txPagination && txPagination.totalPages > 1 && (
            <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
              <Pagination
                currentPage={txPage}
                totalPages={txPagination.totalPages}
                onPageChange={setTxPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Restock Dialog */}
      <Dialog open={isRestockOpen} onOpenChange={(o) => !o && setIsRestockOpen(false)}>
        <DialogContent className="max-w-md animate-scale-in text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">Bổ sung số lượng tồn kho</DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Nhập thêm số lượng hàng hóa vào kho của GlowUp từ nhà cung cấp.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRestockFormSubmit(onSubmitRestockForm)} className="space-y-4">
            {selectedItem && (
              <div className="bg-surface-soft rounded-sm border border-border p-3.5 space-y-1.5 text-xs text-left">
                <p className="font-semibold text-ink">{selectedItem.name}</p>
                <div className="flex justify-between text-ink-muted mt-2">
                  <span>SKU: {selectedItem.sku}</span>
                  <span>Hiện tại: <strong className="text-ink">{selectedItem.stock} chiếc</strong></span>
                </div>
              </div>
            )}

            {/* Supplier Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="supplier" className="text-xs font-semibold text-ink">Nhà cung cấp *</Label>
              <Controller
                control={restockControl}
                name="supplierId"
                render={({ field }) => (
                  <select
                    {...field}
                    id="supplier"
                    className="w-full h-10 px-3 border border-border rounded-sm bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setRestockValue("isNewSupplier", true);
                        field.onChange("");
                      } else {
                        setRestockValue("isNewSupplier", false);
                        field.onChange(e.target.value);
                      }
                    }}
                    value={isNewSupplier ? "new" : field.value}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map((sup: any) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.phone})
                      </option>
                    ))}
                    <option value="new" className="text-brand font-semibold">+ Thêm nhà cung cấp mới...</option>
                  </select>
                )}
              />
              {restockErrors.supplierId && <p className="text-xs text-danger">{restockErrors.supplierId.message}</p>}
            </div>

            {/* Inline Add Supplier Form */}
            {isNewSupplier && (
              <div className="border border-border/80 bg-surface-soft/50 rounded-sm p-3 space-y-3">
                <p className="text-xs font-bold text-ink">Thông tin nhà cung cấp mới</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="sName" className="text-[11px] font-semibold text-ink-muted">Tên nhà cung cấp *</Label>
                    <Controller control={restockControl} name="newSupplierName" render={({ field }) => (
                      <Input {...field} id="sName" placeholder="Tên nhà cung cấp..." className="h-8 text-xs" />
                    )} />
                    {restockErrors.newSupplierName && <p className="text-[10px] text-danger">{restockErrors.newSupplierName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sPhone" className="text-[11px] font-semibold text-ink-muted">Số điện thoại *</Label>
                    <Controller control={restockControl} name="newSupplierPhone" render={({ field }) => (
                      <Input {...field} id="sPhone" placeholder="Số điện thoại..." className="h-8 text-xs" />
                    )} />
                    {restockErrors.newSupplierPhone && <p className="text-[10px] text-danger">{restockErrors.newSupplierPhone.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="sEmail" className="text-[11px] font-semibold text-ink-muted">Email</Label>
                    <Controller control={restockControl} name="newSupplierEmail" render={({ field }) => (
                      <Input {...field} id="sEmail" placeholder="Email..." className="h-8 text-xs" />
                    )} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sAddress" className="text-[11px] font-semibold text-ink-muted">Địa chỉ</Label>
                    <Controller control={restockControl} name="newSupplierAddress" render={({ field }) => (
                      <Input {...field} id="sAddress" placeholder="Địa chỉ..." className="h-8 text-xs" />
                    )} />
                  </div>
                </div>
              </div>
            )}

            {/* Import Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="importPrice" className="text-xs font-semibold text-ink">Đơn giá nhập (đ) *</Label>
                <Controller control={restockControl} name="importPrice" render={({ field }) => (
                  <Input {...field} id="importPrice" type="number" placeholder="Ví dụ: 150000" />
                )} />
                {restockErrors.importPrice && <p className="text-xs text-danger">{restockErrors.importPrice.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qty" className="text-xs font-semibold text-ink">Số lượng nhập *</Label>
                <Controller control={restockControl} name="restockQty" render={({ field }) => (
                  <Input {...field} id="qty" type="number" placeholder="Ví dụ: 50" />
                )} />
                {restockErrors.restockQty && <p className="text-xs text-danger">{restockErrors.restockQty.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRestockOpen(false)}>Huỷ</Button>
              <Button type="submit" disabled={restockMutation.isPending || createSupplierMutation.isPending}>
                {restockMutation.isPending || createSupplierMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Xác nhận nhập kho"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={(o) => !o && setIsAdjustOpen(false)}>
        <DialogContent className="max-w-sm animate-scale-in text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">Kiểm kho sản phẩm</DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Ghi nhận số lượng thực tế trên kệ nếu có sai lệch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdjustFormSubmit(onSubmitAdjustForm)} className="space-y-4 mt-2">
            {selectedItem && (
              <div className="bg-surface-soft rounded-sm border border-border p-3.5 space-y-1.5 text-xs text-left">
                <p className="font-semibold text-ink">{selectedItem.name}</p>
                <div className="flex justify-between text-ink-muted mt-2">
                  <span>SKU: {selectedItem.sku}</span>
                  <span>Hiện tại: <strong className="text-ink">{selectedItem.stock} chiếc</strong></span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="actualStock" className="text-xs font-semibold text-ink">Tồn kho thực tế (đếm được) *</Label>
              <Controller control={adjustControl} name="actualStock" render={({ field }) => (
                <Input {...field} id="actualStock" type="number" placeholder="Ví dụ: 45" />
              )} />
              {adjustErrors.actualStock && <p className="text-xs text-danger">{adjustErrors.actualStock.message}</p>}
              
              {actualStockValue !== undefined && !isNaN(Number(actualStockValue)) && selectedItem && (
                <p className={`text-[11px] font-medium mt-1 ${
                  Number(actualStockValue) > selectedItem.stock ? "text-success" : Number(actualStockValue) < selectedItem.stock ? "text-danger" : "text-ink-muted"
                }`}>
                  Chênh lệch: {Number(actualStockValue) - selectedItem.stock > 0 ? "+" : ""}{Number(actualStockValue) - selectedItem.stock} chiếc so với hệ thống
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>Huỷ</Button>
              <Button type="submit" disabled={adjustMutation.isPending || (Number(actualStockValue) === selectedItem?.stock)}>
                {adjustMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Cập nhật tồn kho"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BulkRestockModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />
    </div>
  );
}
