import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Loader2,
  Plus,
  ClipboardCheck,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  MoreVertical,
  FilePlus,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "../components/PageHeader";
import { toast } from "@/lib/toast";
import { BulkRestockModal } from "../components/BulkRestockModal";
import BatchDetailsModal from "../components/BatchDetailsModal";
import { useDebounce } from "@/hooks/useDebounce";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useInventoryStock,
  useInventoryTransactions,
  useSuppliers,
  useCreateSupplier,
  useRestock,
  useAdjustStock,
  useUpdateMinStock,
} from "../hooks/useInventory";
import {
  restockSchema,
  adjustStockSchema,
  type RestockFormData,
  type AdjustStockFormData,
} from "../schemas/inventory.schema";

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "transactions">("stock");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [stockCursors, setStockCursors] = useState<string[]>([]);
  const currentStockCursor = stockCursors[stockCursors.length - 1] || undefined;
  
  const [txCursors, setTxCursors] = useState<string[]>([]);
  const currentTxCursor = txCursors[txCursors.length - 1] || undefined;
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeBatchItem, setActiveBatchItem] = useState<any | null>(null);

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
    formState: { errors: adjustErrors },
  } = useForm<AdjustStockFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adjustStockSchema) as any,
    defaultValues: { actualStock: 0 },
  });

  const isNewSupplier = watchRestock("isNewSupplier");

  // Queries & Mutations
  useEffect(() => {
    setStockCursors([]);
  }, [debouncedSearch]);

  const {
    data: stockData,
    isLoading: isStockLoading,
  } = useInventoryStock({
    search: debouncedSearch || undefined,
    cursor: currentStockCursor,
    limit: 10,
  });
  const stockItems = stockData?.stock || [];
  const stockPagination = stockData?.pagination;

  const {
    data: txData,
    isLoading: isTxLoading,
  } = useInventoryTransactions({
    cursor: currentTxCursor,
    limit: 10,
  });
  const transactions = txData?.transactions || [];
  const txPagination = txData?.pagination;

  const handleStockNext = () => {
    if (stockPagination?.nextCursor) setStockCursors((prev) => [...prev, stockPagination.nextCursor!]);
  };
  const handleStockPrev = () => setStockCursors((prev) => prev.slice(0, -1));

  const handleTxNext = () => {
    if (txPagination?.nextCursor) setTxCursors((prev) => [...prev, txPagination.nextCursor!]);
  };
  const handleTxPrev = () => setTxCursors((prev) => prev.slice(0, -1));

  const { data: suppliers = [] } = useSuppliers();

  const createSupplierMutation = useCreateSupplier();
  const restockMutation = useRestock();
  const adjustMutation = useAdjustStock();
  const updateMinStockMutation = useUpdateMinStock();

  const handleAdjustClick = (item: any) => {
    setSelectedItem(item);
    resetAdjustForm({
      actualStock: item.stock,
      minStock: item.minStock,
      reason: "",
    });
    setIsAdjustOpen(true);
  };

  const handleViewBatches = (item: any) => {
    setActiveBatchItem(item);
  };

  const onSubmitAdjustForm = async (data: AdjustStockFormData) => {
    if (!selectedItem) return;

    try {
      await adjustMutation.mutateAsync({
        variantId: selectedItem.id,
        actualStock: data.actualStock,
        reason: data.reason,
      });

      // Also update minStock using the dedicated hook if it changed
      if (data.minStock !== selectedItem.minStock) {
        await updateMinStockMutation.mutateAsync({
          variantId: selectedItem.id,
          minStock: data.minStock,
        });
      }

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
            batchCode: data.batchCode,
            manufactureDate: data.manufactureDate
              ? new Date(data.manufactureDate).toISOString()
              : undefined,
            expiryDate: data.expiryDate
              ? new Date(data.expiryDate).toISOString()
              : undefined,
          },
        ],
      });

      toast.success(
        `Đã bổ sung ${data.restockQty} chiếc cho sản phẩm ${selectedItem.name}`,
      );
      setIsRestockOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi nhập kho!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left">
      <PageHeader
        title="Quản lý kho hàng"
        description="Theo dõi tồn kho, nhập hàng và lịch sử giao dịch kho"
        actions={
          <Button
            className="gap-2 shrink-0 h-10 bg-brand text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={() => setIsBulkOpen(true)}
          >
            <FilePlus className="w-4 h-4" /> Tạo phiếu nhập hàng
          </Button>
        }
        filters={
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full flex-wrap">
            <div className="group relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Tìm tên sản phẩm, mã SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveTab("stock")}
                className={`inline-flex h-10 items-center gap-2 border px-3.5 text-sm font-semibold transition-colors rounded-sm sm:px-4 ${activeTab === "stock"
                  ? "border-brand bg-brand/10 text-brand shadow-ui-soft"
                  : "border-border bg-surface text-ink-muted hover:border-brand hover:text-ink-muted"
                  }`}
              >
                Tồn kho hiện tại
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`inline-flex h-10 items-center gap-2 border px-3.5 text-sm font-semibold transition-colors rounded-sm sm:px-4 ${activeTab === "transactions"
                  ? "border-brand bg-brand/10 text-brand shadow-ui-soft"
                  : "border-border bg-surface text-ink-muted hover:border-brand hover:text-ink-muted"
                  }`}
              >
                Lịch sử giao dịch kho
              </button>
            </div>
          </div>
        }
      />

      {activeTab === "stock" ? (
        <div className="space-y-4">
          {/* Stock Table */}
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[820px] table-fixed">
                <TableHeader>
                  <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                    <TableHead className="w-[28%]">
                      Sản phẩm
                    </TableHead>
                    <TableHead className="text-center w-[10%]">
                      Tồn kho
                    </TableHead>
                    <TableHead className="text-center w-[12%]">
                      Hạn mức tối thiểu
                    </TableHead>
                    <TableHead className="w-[14%] text-left">
                      Thương hiệu
                    </TableHead>
                    <TableHead className="w-[12%] text-right">
                      Giá nhập
                    </TableHead>
                    <TableHead className="w-[14%] text-center">
                      NSX - HSD
                    </TableHead>
                    <TableHead className="text-center w-[10%]">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStockLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-ink-muted"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          <span>Đang tải danh sách tồn kho...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : stockItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-ink-muted"
                      >
                        Không tìm thấy sản phẩm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockItems.map((item: any) => {
                      const isLow = item.stock <= item.minStock;
                      const isOut = item.stock === 0;

                      return (
                        <TableRow
                          key={item.id}
                        >
                          <TableCell className="py-3.5 px-5 overflow-hidden max-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                                <img
                                  src={
                                    item.productImage ||
                                    "https://placehold.co/80x80?text=SP"
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="block truncate font-semibold text-ink">
                                    {item.name}
                                  </span>
                                  {item.expiringBatchesCount &&
                                    item.expiringBatchesCount > 0 ? (
                                    <span title={`Có ${item.expiringBatchesCount} lô hàng sắp hết hạn (< 3 tháng)!`}>
                                      <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 cursor-help" />
                                    </span>
                                  ) : null}
                                </div>
                                <span className="truncate font-mono text-xs text-ink-muted">
                                  {item.sku}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${isOut
                                ? "text-danger"
                                : isLow
                                  ? "text-warning"
                                  : "text-ink"
                                }`}
                            >
                              {item.stock}
                              {isLow && <AlertCircle className="w-3.5 h-3.5" />}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center text-ink font-medium">
                            {item.minStock}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 overflow-hidden max-w-0">
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
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-right font-medium text-ink">
                            {item.mac
                              ? `${item.mac.toLocaleString("vi-VN")}đ`
                              : "-"}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center text-ink-muted text-xs whitespace-nowrap">
                            {item.manufactureDate
                              ? new Date(
                                item.manufactureDate,
                              ).toLocaleDateString("vi-VN")
                              : "N/A"}
                            <br />
                            <span className="text-ink-muted mx-1">-</span>
                            <br />
                            {item.expiryDate
                              ? new Date(item.expiryDate).toLocaleDateString(
                                "vi-VN",
                              )
                              : "N/A"}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center">
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
                                  className="w-44 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                                >
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => handleRestockClick(item)}
                                  >
                                    <Plus className="w-4 h-4 mr-2.5" />
                                    Nhập thêm hàng
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => handleAdjustClick(item)}
                                  >
                                    <ClipboardCheck className="w-4 h-4 mr-2.5" />
                                    Kiểm kho
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => handleViewBatches(item)}
                                  >
                                    <History className="w-4 h-4 mr-2.5" />
                                    Chi tiết lô hàng
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {(stockCursors.length > 0 || stockPagination?.hasNextPage) && (
              <div className="flex items-center justify-between p-5 bg-surface border-t border-border">
                <div className="text-sm text-ink-muted font-medium">
                  Trang {stockCursors.length + 1}
                  {stockPagination?.totalItems ? (
                    <>
                      <span className="mx-2 text-border">|</span>
                      Tổng: {stockPagination.totalItems} sản phẩm
                    </>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm h-9 px-4 font-medium"
                    onClick={handleStockPrev}
                    disabled={stockCursors.length === 0}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm h-9 px-4 font-medium"
                    onClick={handleStockNext}
                    disabled={!stockPagination?.hasNextPage}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Transactions List */
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px] table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="w-[18%]">
                    Mã GD
                  </TableHead>
                  <TableHead className="w-[15%]">
                    Mã SKU
                  </TableHead>
                  <TableHead className="text-center w-[18%]">
                    Loại giao dịch
                  </TableHead>
                  <TableHead className="text-right w-[12%]">
                    Số lượng
                  </TableHead>
                  <TableHead className="w-[19%]">
                    Người thực hiện
                  </TableHead>
                  <TableHead className="w-[18%]">
                    Thời gian
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTxLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-ink-muted">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                        <span>Đang tải lịch sử giao dịch...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-ink-muted">
                      Chưa có giao dịch kho nào được thực hiện
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx: any) => (
                    <TableRow
                      key={tx.id}
                    >
                      <TableCell className="py-3.5 px-5 font-mono text-xs text-ink-muted overflow-hidden max-w-0">
                        <span className="block truncate">{tx.id}</span>
                      </TableCell>
                      <TableCell className="py-3.5 px-5 font-mono text-xs text-ink font-medium truncate overflow-hidden max-w-0">
                        {tx.sku}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold ${tx.type === "in"
                            ? "bg-success/10 text-success border border-success"
                            : tx.type === "out"
                              ? "bg-warning/10 text-warning border border-warning"
                              : "bg-blue-500/10 text-blue-500 border border-blue-500"
                            }`}
                        >
                          {tx.type === "in" ? (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5 text-success" />{" "}
                              Nhập hàng
                            </>
                          ) : tx.type === "out" ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-warning" />{" "}
                              Xuất hàng
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-blue-500" />{" "}
                              Kiểm kho
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`py-3.5 px-5 text-right font-bold tabular-nums ${tx.type === "in"
                          ? "text-success"
                          : tx.type === "out"
                            ? "text-warning"
                            : "text-blue-500"
                          }`}
                      >
                        {tx.type === "in"
                          ? `+${tx.qty}`
                          : tx.type === "out"
                            ? `-${tx.qty}`
                            : tx.qty > 0
                              ? `+${tx.qty}`
                              : tx.qty}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-ink-muted font-medium">
                        {tx.user}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-ink-muted text-xs">
                        {tx.date}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {(txCursors.length > 0 || txPagination?.hasNextPage) && (
            <div className="flex items-center justify-between p-5 bg-surface border-t border-border">
              <div className="text-sm text-ink-muted font-medium">
                Trang {txCursors.length + 1}
                {txPagination?.totalItems ? (
                  <>
                    <span className="mx-2 text-border">|</span>
                    Tổng: {txPagination.totalItems} giao dịch
                  </>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium"
                  onClick={handleTxPrev}
                  disabled={txCursors.length === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium"
                  onClick={handleTxNext}
                  disabled={!txPagination?.hasNextPage}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restock Dialog */}
      <Dialog
        open={isRestockOpen}
        onOpenChange={(o) => !o && setIsRestockOpen(false)}
      >
        <DialogContent className="max-w-lg animate-scale-in text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">
              Bổ sung số lượng tồn kho
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Nhập thêm số lượng hàng hóa vào kho của GlowUp từ nhà cung cấp.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleRestockFormSubmit(onSubmitRestockForm)}
            className="space-y-4"
          >
            {selectedItem && (
              <div className="bg-surface-soft rounded-sm border border-border p-3.5 space-y-1.5 text-xs text-left">
                <p className="font-semibold text-ink">{selectedItem.name}</p>
                <div className="flex justify-between text-ink-muted mt-2">
                  <span>{selectedItem.sku}</span>
                  <span>
                    Hiện tại:{" "}
                    <strong className="text-ink">
                      {selectedItem.stock} chiếc
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Supplier Selection */}
            <div className="space-y-1.5">
              <Label
                htmlFor="supplier"
                className="text-xs font-semibold text-ink"
              >
                Nhà cung cấp <span className="text-danger">*</span>
              </Label>
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
                    <option value="new" className="text-brand font-semibold">
                      + Thêm nhà cung cấp mới...
                    </option>
                  </select>
                )}
              />
              {restockErrors.supplierId && (
                <p className="text-xs text-danger">
                  {restockErrors.supplierId.message}
                </p>
              )}
            </div>

            {/* Inline Add Supplier Form */}
            {isNewSupplier && (
              <div className="border border-border/80 bg-surface-soft/50 rounded-sm p-3 space-y-3">
                <p className="text-xs font-bold text-ink">
                  Thông tin nhà cung cấp mới
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="sName"
                      className="text-[11px] font-semibold text-ink-muted"
                    >
                      Tên nhà cung cấp <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierName"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sName"
                          placeholder="Tên nhà cung cấp..."
                          className="h-8 text-xs"
                        />
                      )}
                    />
                    {restockErrors.newSupplierName && (
                      <p className="text-[10px] text-danger">
                        {restockErrors.newSupplierName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="sPhone"
                      className="text-[11px] font-semibold text-ink-muted"
                    >
                      Số điện thoại <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierPhone"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sPhone"
                          placeholder="Số điện thoại..."
                          className="h-8 text-xs"
                        />
                      )}
                    />
                    {restockErrors.newSupplierPhone && (
                      <p className="text-[10px] text-danger">
                        {restockErrors.newSupplierPhone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="sEmail"
                      className="text-[11px] font-semibold text-ink-muted"
                    >
                      Email
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierEmail"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sEmail"
                          placeholder="Email..."
                          className="h-8 text-xs"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="sAddress"
                      className="text-[11px] font-semibold text-ink-muted"
                    >
                      Địa chỉ
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierAddress"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sAddress"
                          placeholder="Địa chỉ..."
                          className="h-8 text-xs"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Batch Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="batchCode"
                  className="text-xs font-semibold text-ink"
                >
                  Mã lô <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="batchCode"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="batchCode"
                      placeholder="VD: LOT-01"
                      className="h-9 text-sm bg-surface"
                    />
                  )}
                />
                {restockErrors.batchCode && (
                  <p className="text-[10px] text-danger">
                    {restockErrors.batchCode.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="manufactureDate"
                  className="text-xs font-semibold text-ink"
                >
                  Ngày sản xuất <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="manufactureDate"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      value={value ? new Date(value) : undefined}
                      onChange={(date) => onChange(date)}
                    />
                  )}
                />
                {restockErrors.manufactureDate && (
                  <p className="text-[10px] text-danger">
                    {restockErrors.manufactureDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="expiryDate"
                  className="text-xs font-semibold text-ink"
                >
                  Hạn sử dụng <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="expiryDate"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      value={value ? new Date(value) : undefined}
                      onChange={(date) => onChange(date)}
                    />
                  )}
                />
                {restockErrors.expiryDate && (
                  <p className="text-[10px] text-danger">
                    {restockErrors.expiryDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Import Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="importPrice"
                  className="text-xs font-semibold text-ink"
                >
                  Đơn giá nhập (đ) <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="importPrice"
                  render={({
                    field: { value, onChange, onBlur, name, ref },
                  }) => {
                    const displayValue = value
                      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      : "";
                    return (
                      <Input
                        name={name}
                        ref={ref}
                        onBlur={onBlur}
                        id="importPrice"
                        type="text"
                        placeholder="Ví dụ: 150.000"
                        value={displayValue}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\./g, "");
                          if (/^\d*$/.test(rawValue)) {
                            onChange(rawValue ? Number(rawValue) : undefined);
                          }
                        }}
                      />
                    );
                  }}
                />
                {restockErrors.importPrice && (
                  <p className="text-xs text-danger">
                    {restockErrors.importPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qty" className="text-xs font-semibold text-ink">
                  Số lượng nhập <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="restockQty"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="qty"
                      type="number"
                      placeholder="Ví dụ: 50"
                    />
                  )}
                />
                {restockErrors.restockQty && (
                  <p className="text-xs text-danger">
                    {restockErrors.restockQty.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRestockOpen(false)}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={
                  restockMutation.isPending || createSupplierMutation.isPending
                }
              >
                {restockMutation.isPending ||
                  createSupplierMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog
        open={isAdjustOpen}
        onOpenChange={(o) => !o && setIsAdjustOpen(false)}
      >
        <DialogContent className="max-w-md w-full animate-scale-in text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">
              Kiểm kho sản phẩm
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Ghi nhận số lượng thực tế trên kệ nếu có sai lệch.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleAdjustFormSubmit(onSubmitAdjustForm)}
            className="space-y-4 mt-2"
          >
            {selectedItem && (
              <div className="bg-surface-soft rounded-sm border border-border p-3.5 space-y-1.5 text-xs text-left">
                <p className="font-semibold text-ink">{selectedItem.name}</p>
                <div className="flex justify-between text-ink-muted mt-2">
                  <span>{selectedItem.sku}</span>
                  <span>
                    Hiện tại:{" "}
                    <strong className="text-ink">
                      {selectedItem.stock} chiếc
                    </strong>
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="actualStock"
                className="text-xs font-semibold text-ink"
              >
                Tồn kho thực tế <span className="text-danger">*</span>
              </Label>
              <Controller
                control={adjustControl}
                name="actualStock"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="actualStock"
                    type="number"
                    placeholder="Ví dụ: 45"
                  />
                )}
              />
              {adjustErrors.actualStock && (
                <p className="text-xs text-danger">
                  {adjustErrors.actualStock.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <Label
                htmlFor="reason"
                className="text-xs font-semibold text-ink"
              >
                Lý do điều chỉnh
              </Label>
              <Controller
                control={adjustControl}
                name="reason"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="reason"
                    placeholder="Ví dụ: Hư hỏng, đếm sai, thất lạc..."
                    className="min-h-[100px] resize-none"
                  />
                )}
              />
              {adjustErrors.reason && (
                <p className="text-xs text-danger">
                  {adjustErrors.reason.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustOpen(false)}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={adjustMutation.isPending}>
                {adjustMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BulkRestockModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />

      {activeBatchItem && (
        <BatchDetailsModal
          open={!!activeBatchItem}
          onOpenChange={(open) => !open && setActiveBatchItem(null)}
          item={activeBatchItem}
        />
      )}
    </div>
  );
}
