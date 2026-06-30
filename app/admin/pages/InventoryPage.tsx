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
import { PageHeader } from "../components/common/PageHeader";
import { toast } from "@/lib/toast";
import { BulkRestockModal } from "../components/inventory/BulkRestockModal";
import BatchDetailsModal from "../components/inventory/BatchDetailsModal";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/ui/pagination";
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
  const [stockPage, setStockPage] = useState(1);
  const [txPage, setTxPage] = useState(1);


  // Reset page when search changes
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

      toast.success(`Inventory updated for ${selectedItem.name}`);
      setIsAdjustOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || "Error adjusting stock!");
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
        toast.error(err.message || "Failed to create supplier!");
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

      toast.success(`Added ${data.restockQty} items for ${selectedItem.name}`);
      setIsRestockOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || "Error importing stock!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left">
      <PageHeader
        title="Inventory Management"
        description="Control your stock levels, manage goods receipts, and track all inventory transactions."
        actions={
          <Button
            className="gap-2 shrink-0 h-10 bg-brand text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={() => setIsBulkOpen(true)}
          >
            <FilePlus className="w-4 h-4" /> Import Stock
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Search product name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveTab("stock")}
                className={`inline-flex h-9 items-center gap-2 border px-3.5 text-sm font-semibold transition-all rounded-sm sm:px-4 ${
                  activeTab === "stock"
                    ? "border-brand/30 text-brand shadow-sm"
                    : "border-border bg-surface text-ink-muted hover:border-brand/20 hover:text-ink"
                }`}
                style={
                  activeTab === "stock"
                    ? { background: "hsl(352, 72%, 52%, 0.08)" }
                    : {}
                }
              >
                Current stock
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`inline-flex h-9 items-center gap-2 border px-3.5 text-sm font-semibold transition-all rounded-sm sm:px-4 ${
                  activeTab === "transactions"
                    ? "border-brand/30 text-brand shadow-sm"
                    : "border-border bg-surface text-ink-muted hover:border-brand/20 hover:text-ink"
                }`}
                style={
                  activeTab === "transactions"
                    ? { background: "hsl(352, 72%, 52%, 0.08)" }
                    : {}
                }
              >
                Transaction history
              </button>
            </div>
          </div>
        }
      />

      {activeTab === "stock" ? (
        <div className="space-y-4">
          {/* Stock Table */}
          <div className="premium-card rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-205 table-fixed">
                <TableHeader>
                  <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                    <TableHead className="w-[30%] text-center">Product</TableHead>
                    <TableHead className="text-center w-[11%]">Stock</TableHead>
                    <TableHead className="text-center w-[13%]">
                      Min Stock
                    </TableHead>
                    <TableHead className="w-[16%] text-center">Brand</TableHead>
                    <TableHead className="w-[14%] text-center">
                      Import Price
                    </TableHead>
                    <TableHead className="w-[16%] text-center">
                      MFG - EXP
                    </TableHead>
                    <TableHead className="text-center w-24">Actions</TableHead>
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
                          <span>Loading stock list...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : stockItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-ink-muted"
                      >
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockItems.map((item: any) => {
                      const isLow = item.stock <= item.minStock;
                      const isOut = item.stock === 0;

                      return (
                        <TableRow key={item.id}>
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
                                    <span
                                      title={`${item.expiringBatchesCount} batches expiring soon (< 3 months)!`}
                                    >
                                      <AlertCircle className="w-4 h-4 text-danger shrink-0 cursor-help" />
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
                              className={`inline-flex items-center gap-1 font-bold ${
                                isOut
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
                            <div className="flex items-center justify-center gap-2">
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
                          <TableCell className="py-3.5 px-5 text-center font-medium text-ink">
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
                                    Restock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => handleAdjustClick(item)}
                                  >
                                    <ClipboardCheck className="w-4 h-4 mr-2.5" />
                                    Adjust Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => handleViewBatches(item)}
                                  >
                                    <History className="w-4 h-4 mr-2.5" />
                                    Batch Details
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
            {stockPagination?.totalPages > 1 && (
              <div className="flex items-center justify-center p-5 bg-surface border-t border-border">
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
        <div className="premium-card rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-200 table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="w-[20%]">TX ID</TableHead>
                  <TableHead className="w-[15%]">SKU</TableHead>
                  <TableHead className="text-center w-[18%]">Type</TableHead>
                  <TableHead className="text-right w-[12%]">Quantity</TableHead>
                  <TableHead className="w-[20%]">Performer</TableHead>
                  <TableHead className="w-[15%] text-center">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTxLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-ink-muted"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                        <span>Loading transaction history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-ink-muted"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="py-3.5 px-5 font-mono text-xs text-ink-muted overflow-hidden max-w-0">
                        <span className="block truncate">{tx.id}</span>
                      </TableCell>
                      <TableCell className="py-3.5 px-5 font-mono text-xs text-ink font-medium truncate overflow-hidden max-w-0">
                        {tx.sku}
                      </TableCell>
                      <TableCell className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold ${
                            tx.type === "in"
                              ? "bg-success/10 text-success border border-success"
                              : tx.type === "out"
                                ? "bg-warning/10 text-warning border border-warning"
                                : "bg-blue-500/10 text-blue-500 border border-blue-500"
                          }`}
                        >
                          {tx.type === "in" ? (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5 text-success" />{" "}
                              Stock In
                            </>
                          ) : tx.type === "out" ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-warning" />{" "}
                              Stock Out
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-blue-500" />{" "}
                              Adjustment
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`py-3.5 px-5 text-right font-bold tabular-nums ${
                          tx.type === "in"
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
          {txPagination?.totalPages > 1 && (
            <div className="flex items-center justify-center p-5 bg-surface border-t border-border">
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
      <Dialog
        open={isRestockOpen}
        onOpenChange={(o) => !o && setIsRestockOpen(false)}
      >
        <DialogContent className="max-w-lg animate-scale-in text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">
              Restock Items
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Add new stock to GlowUp inventory from a supplier.
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
                    Current:{" "}
                    <strong className="text-ink">
                      {selectedItem.stock} items
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
                Supplier <span className="text-danger">*</span>
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
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((sup: any) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.phone})
                      </option>
                    ))}
                    <option value="new" className="text-brand font-semibold">
                      + Add New Supplier...
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
                <p className="text-xs font-bold text-ink">New Supplier Info</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="sName"
                      className="text-[11px] font-semibold text-ink-muted"
                    >
                      Supplier Name <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierName"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sName"
                          placeholder="Supplier Name..."
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
                      Phone Number <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierPhone"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sPhone"
                          placeholder="Phone Number..."
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
                      Address
                    </Label>
                    <Controller
                      control={restockControl}
                      name="newSupplierAddress"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="sAddress"
                          placeholder="Address..."
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
                  Batch Code <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="batchCode"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="batchCode"
                      placeholder="E.g. LOT-01"
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
                  Manufacture Date <span className="text-danger">*</span>
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
                  Expiry Date <span className="text-danger">*</span>
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
                  Import Price ($) <span className="text-danger">*</span>
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
                        placeholder="E.g. 150000"
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
                  Restock Quantity <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={restockControl}
                  name="restockQty"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="qty"
                      type="number"
                      placeholder="E.g. 50"
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
                Cancel
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
                  "Confirm"
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
              Adjust Stock
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Record actual physical stock if there's a discrepancy.
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
                    Current:{" "}
                    <strong className="text-ink">
                      {selectedItem.stock} items
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
                Actual Stock <span className="text-danger">*</span>
              </Label>
              <Controller
                control={adjustControl}
                name="actualStock"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="actualStock"
                    type="number"
                    placeholder="E.g. 45"
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
                Reason for Adjustment
              </Label>
              <Controller
                control={adjustControl}
                name="reason"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="reason"
                    placeholder="E.g. Damaged, miscounted, lost..."
                    className="min-h-25 resize-none"
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
                Cancel
              </Button>
              <Button type="submit" disabled={adjustMutation.isPending}>
                {adjustMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm"
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
