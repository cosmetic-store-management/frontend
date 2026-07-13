import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Loader2,
  Plus,
  ClipboardCheck,
  MoreVertical,
  FilePlus,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  AlertCircle,
  SlidersHorizontal,
  ShieldAlert,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { PageHeader } from "../components/common/PageHeader";
import { CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { BulkRestockModal } from "../components/inventory/BulkRestockModal";
import BatchDetailsModal from "../components/inventory/BatchDetailsModal";
import ImportGoodsModal from "../components/inventory/ImportGoodsModal";
import StocktakeModal from "../components/inventory/StocktakeModal";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useInventoryStock,
  useSuppliers,
  useCreateSupplier,
  useRestock,
  useAdjustStock,
  useUpdateMinStock,
  useGoodsReceipts,
  useStocktakes,
  useCreateStocktake,
  useInventoryStats,
} from "../hooks/useInventory";
import {
  restockSchema,
  adjustStockSchema,
  type RestockFormData,
  type AdjustStockFormData,
} from "../schemas/inventory.schema";

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "receipts" | "stocktakes">("stock");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [activeBatchItem, setActiveBatchItem] = useState<any | null>(null);

  const [stockPage, setStockPage] = useState(1);
  const [receiptPage, setReceiptPage] = useState(1);
  const [stocktakePage, setStocktakePage] = useState(1);
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");

  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [selectedStocktake, setSelectedStocktake] = useState<any | null>(null);
  // Row action modals
  const [adjustingItem, setAdjustingItem] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [editingMinStockItem, setEditingMinStockItem] = useState<any | null>(null);
  const [newMinStock, setNewMinStock] = useState<string>("");

  // Reset page when search changes
  useEffect(() => {
    setStockPage(1);
    setReceiptPage(1);
    setStocktakePage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setStockPage(1);
  }, [stockStatusFilter]);

  const { data: statsData, refetch: refetchStats } = useInventoryStats();

  const { data: stockData, isLoading: isStockLoading, refetch: refetchStock } = useInventoryStock({
    search: debouncedSearch || undefined,
    page: stockPage,
    limit: 10,
    stockStatus: stockStatusFilter === "all" ? undefined : stockStatusFilter,
  });
  const stockItems = stockData?.stock || [];
  const stockPagination = stockData?.pagination;

  const { data: receiptData, isLoading: isReceiptsLoading, refetch: refetchReceipts } = useGoodsReceipts({
    page: receiptPage,
    limit: 10,
    search: debouncedSearch || undefined,
  });
  const receipts = receiptData?.receipts || [];
  const receiptPagination = receiptData?.pagination;

  const { data: stocktakeData, isLoading: isStocktakesLoading, refetch: refetchStocktakes } = useStocktakes({
    page: stocktakePage,
    limit: 10,
    search: debouncedSearch || undefined,
  });
  const stocktakes = stocktakeData?.stocktakes || [];
  const stocktakePagination = stocktakeData?.pagination;

  const updateMinStockMutation = useUpdateMinStock();
  const adjustStockMutation = useAdjustStock();


  const handleWmsSuccess = () => {
    refetchStock();
    refetchReceipts();
    refetchStocktakes();
    refetchStats();
  };

  return (
    <section className="space-y-4 animate-page-enter">
      <PageHeader
        title="Inventory Management"
        description="Control your stock levels, manage goods receipts, and track all inventory transactions."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-2 h-10 bg-brand text-white hover:bg-brand-dark transition-all shadow-none"
                size="sm"
              >
                <Plus className="w-4 h-4" /> Add inventory
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                onClick={() => setIsRestockOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2.5" /> Goods Receipt
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                onClick={() => setIsAdjustOpen(true)}
              >
                <ClipboardCheck className="w-4 h-4 mr-2.5" /> Stocktake
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                onClick={() => setIsBulkOpen(true)}
              >
                <FilePlus className="w-4 h-4 mr-2.5" /> Bulk Import
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        filters={
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="group relative w-72 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Search product name, Barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>

            <Select
              value={activeTab}
              onValueChange={(val: any) => setActiveTab(val)}
            >
              <SelectTrigger className="w-48 h-10 border border-border rounded-sm bg-surface text-sm px-3 focus-visible:ring-brand/20">
                <SelectValue placeholder="Current Stock" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border shadow-ui-card rounded-sm">
                <SelectItem value="stock">Current Stock</SelectItem>
                <SelectItem value="receipts">Goods Receipts</SelectItem>
                <SelectItem value="stocktakes">Stocktakes</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={stockStatusFilter}
              onValueChange={(val) => setStockStatusFilter(val)}
              disabled={activeTab !== "stock"}
            >
              <SelectTrigger className="w-48 h-10 border border-border rounded-sm bg-surface text-sm px-3 focus-visible:ring-brand/20 disabled:opacity-50">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border shadow-ui-card rounded-sm">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
                <SelectItem value="low">Low Stock Warnings</SelectItem>
                <SelectItem value="expiring">Expiring Warnings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {activeTab === "stock" ? (
        <div className="space-y-4">
          <div className="premium-card overflow-hidden">
            <CardContent className="p-0">
              <Table className="min-w-[1550px] table-fixed">
                <TableHeader>
                  <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                    <TableHead className="w-16 text-center">No.</TableHead>
                    <TableHead className="w-96 text-center">Product</TableHead>
                    <TableHead className="w-60 text-center">Barcode</TableHead>
                    <TableHead className="w-24 text-center">Stock</TableHead>
                    <TableHead className="w-24 text-center">Min Stock</TableHead>
                    <TableHead className="w-36 text-center">Brand</TableHead>
                    <TableHead className="w-36 text-center">Cost Price</TableHead>
                    <TableHead className="w-60 text-center">Total Value</TableHead>
                    <TableHead className="w-36 text-center">MFG - EXP</TableHead>
                    <TableHead className="w-20 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStockLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-ink-muted">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          <span>Loading stock list...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : stockItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-ink-muted">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockItems.map((item: any, i: number) => {
                      const isLow = item.stock <= item.minStock;
                      const isOut = item.stock === 0;
                      const itemNo = (stockPage - 1) * 10 + i + 1;
                      const rowClass = isOut
                        ? "bg-danger/5 hover:bg-danger/10 transition-colors"
                        : isLow
                          ? "bg-warning/5 hover:bg-warning/10 transition-colors"
                          : "hover:bg-surface-soft/30 transition-colors";

                      return (
                        <TableRow key={item.id} className={rowClass}>
                          <TableCell className="py-3.5 px-3 text-center text-ink-muted font-medium">
                            {itemNo}
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-3 text-center mx-auto">
                              <div className="w-10 h-10 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.productImage || "https://placehold.co/80x80?text=SP"}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              </div>
                              <div className="min-w-0 flex-1 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="block truncate font-semibold text-ink text-center" title={item.name}>
                                    {item.name}
                                  </span>
                                  {item.expiringBatchesCount && item.expiringBatchesCount > 0 ? (
                                    <span title={`${item.expiringBatchesCount} batches expiring soon (< 3 months)!`}>
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger/10 text-danger text-[10px] font-bold cursor-help">
                                        !
                                      </span>
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-center">
                            {(() => {
                              const barcode = item.barcode || item.sku;
                              if (!barcode) return <span className="text-ink-muted">—</span>;
                              return (
                                <div className="flex flex-col items-center gap-1">
                                  <img
                                    src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcode}&scale=2&rotate=N`}
                                    alt={`Barcode ${barcode}`}
                                    className="h-8 max-w-[160px] object-contain mx-auto"
                                    loading="lazy"
                                  />
                                  <span className="text-[10px] font-mono text-ink-muted block text-center mt-0.5">
                                    {barcode}
                                  </span>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center">
                            <span className={`inline-flex items-center gap-1 font-bold ${isOut ? "text-danger" : isLow ? "text-warning" : "text-ink"}`}>
                              {item.stock}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center text-ink font-medium">
                            {item.minStock}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center">
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
                          <TableCell className="py-3.5 px-5 text-center font-medium text-ink tabular-nums">
                            {item.mac ? `${item.mac.toLocaleString("en-US")} ₫` : "—"}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center font-bold text-ink tabular-nums">
                            {item.mac && item.stock > 0 ? `${(item.stock * item.mac).toLocaleString("en-US")} ₫` : "—"}
                          </TableCell>
                          <TableCell className="py-3.5 px-5 text-center text-ink-muted text-xs whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span>{item.manufactureDate ? new Date(item.manufactureDate).toLocaleDateString("vi-VN") : "N/A"}</span>
                              <span className={item.expiringBatchesCount && item.expiringBatchesCount > 0 ? "text-danger font-semibold" : ""}>
                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 text-center">
                            <div className="flex items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in">
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => setActiveBatchItem(item)}
                                  >
                                    <ClipboardCheck className="w-4 h-4 mr-2.5" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-amber-500/5 focus:text-amber-600"
                                    onClick={() => {
                                      setAdjustingItem(item);
                                      setAdjustQty(String(item.stock));
                                      setAdjustReason("");
                                    }}
                                  >
                                    <SlidersHorizontal className="w-4 h-4 mr-2.5" />Adjust Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                    onClick={() => {
                                      setEditingMinStockItem(item);
                                      setNewMinStock(String(item.minStock ?? 0));
                                    }}
                                  >
                                    <ShieldAlert className="w-4 h-4 mr-2.5" /> Update Min Stock
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
            </CardContent>
            {stockPagination?.totalPages > 1 && (
              <div className="flex items-center justify-center p-4 bg-surface border-t border-border">
                <Pagination
                  currentPage={stockPage}
                  totalPages={stockPagination.totalPages}
                  onPageChange={setStockPage}
                />
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "receipts" ? (
        <div className="space-y-4">
          <div className="premium-card overflow-hidden">
            <CardContent className="p-0">
              <Table className="min-w-[1000px] table-fixed">
                <TableHeader>
                  <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                    <TableHead className="w-60 text-center">Receipt Code</TableHead>
                    <TableHead className="w-60 text-center">Supplier</TableHead>
                    <TableHead className="w-28 text-center">Total Items</TableHead>
                    <TableHead className="w-36 text-center">Total Cost</TableHead>
                    <TableHead className="w-48 text-center">Performer</TableHead>
                    <TableHead className="w-36 text-center">Import Date</TableHead>
                    <TableHead className="w-20 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isReceiptsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-ink-muted">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          <span>Loading goods receipts...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : receipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-ink-muted">
                        No goods receipts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    receipts.map((receipt: any) => (
                      <TableRow key={receipt.id} className="hover:bg-surface-soft/30 transition-colors">
                        <TableCell className="py-3.5 px-4 font-mono text-xs text-ink-muted text-center">
                          {receipt.code}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-center text-ink font-semibold">
                          {receipt.supplierName || "—"}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-center text-ink font-medium">
                          {receipt.items?.length || 0}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-center text-ink font-bold tabular-nums">
                          {receipt.totalAmount.toLocaleString("en-US")} ₫
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-center text-ink-muted">
                          {receipt.creatorName || "—"}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-center text-ink-muted text-xs">
                          {receipt.createdAt ? new Date(receipt.createdAt).toLocaleString("vi-VN").replace(",", "") : "—"}
                        </TableCell>
                        <TableCell className="py-3.5 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in">
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => setSelectedReceipt(receipt)}
                              >
                                <ClipboardCheck className="w-4 h-4 mr-2.5" /> View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {receiptPagination?.totalPages > 1 && (
              <div className="flex items-center justify-center p-4 bg-surface border-t border-border">
                <Pagination
                  currentPage={receiptPage}
                  totalPages={receiptPagination.totalPages}
                  onPageChange={setReceiptPage}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="premium-card overflow-hidden">
            <CardContent className="p-0">
              <Table className="min-w-[1000px] table-fixed">
                <TableHeader>
                  <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                    <TableHead className="w-60 text-center">Stocktake Code</TableHead>
                    <TableHead className="w-28 text-center">Variance Qty</TableHead>
                    <TableHead className="w-36 text-center">Adjust Value</TableHead>
                    <TableHead className="w-48 text-center">Performer</TableHead>
                    <TableHead className="w-60 text-center">Notes</TableHead>
                    <TableHead className="w-36 text-center">Date</TableHead>
                    <TableHead className="w-20 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStocktakesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-ink-muted">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          <span>Loading stocktakes...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : stocktakes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-ink-muted">
                        No stocktake records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocktakes.map((stocktake: any) => {
                      const isPositive = stocktake.totalVarianceQty > 0;
                      const isNegative = stocktake.totalVarianceQty < 0;
                      return (
                        <TableRow key={stocktake.id} className="hover:bg-surface-soft/30 transition-colors">
                          <TableCell className="py-3.5 px-4 font-mono text-xs text-ink-muted text-center">
                            {stocktake.code}
                          </TableCell>
                          <TableCell className={`py-3.5 px-4 text-center font-bold ${isPositive ? "text-success" : isNegative ? "text-danger" : "text-ink-muted"}`}>
                            {isPositive ? "+" : ""}{stocktake.totalVarianceQty}
                          </TableCell>
                          <TableCell className={`py-3.5 px-4 text-center font-bold tabular-nums ${stocktake.totalAdjustmentValue > 0 ? "text-success" : stocktake.totalAdjustmentValue < 0 ? "text-danger" : "text-ink-muted"}`}>
                            {stocktake.totalAdjustmentValue > 0 ? "+" : ""}{stocktake.totalAdjustmentValue.toLocaleString("en-US")} ₫
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-center text-ink-muted">
                            {stocktake.creatorName || "—"}
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-center text-ink-muted truncate max-w-[200px]" title={stocktake.notes}>
                            {stocktake.notes || "—"}
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-center text-ink-muted text-xs">
                            {stocktake.createdAt ? new Date(stocktake.createdAt).toLocaleString("vi-VN").replace(",", "") : "—"}
                          </TableCell>
                          <TableCell className="py-3.5 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in">
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => setSelectedStocktake(stocktake)}
                                >
                                  <ClipboardCheck className="w-4 h-4 mr-2.5" /> View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {stocktakePagination?.totalPages > 1 && (
              <div className="flex items-center justify-center p-4 bg-surface border-t border-border">
                <Pagination
                  currentPage={stocktakePage}
                  totalPages={stocktakePagination.totalPages}
                  onPageChange={setStocktakePage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(o) => !o && setSelectedReceipt(null)}
      >
        <DialogContent className="max-w-[1360px] animate-scale-in text-left flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-ink">
              Goods Detail
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 my-3">
              {/* Premium Info Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface-soft/50 border border-border p-4 rounded-sm text-left">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Supplier</p>
                  <p className="text-sm font-semibold text-ink mt-1.5">{selectedReceipt.supplierName || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Creator</p>
                  <p className="text-sm font-semibold text-ink mt-1.5">{selectedReceipt.creatorName || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Import Date</p>
                  <p className="text-sm font-semibold text-ink mt-1.5">
                    {new Date(selectedReceipt.createdAt).toLocaleString("vi-VN").replace(",", "")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Total Cost</p>
                  <p className="text-sm font-semibold text-ink mt-1.5 tabular-nums">
                    {selectedReceipt.totalAmount.toLocaleString("en-US")} ₫
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="border border-border rounded-sm overflow-x-auto bg-surface">
                <Table className="w-full min-w-[1000px]">
                  <TableHeader>
                    <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                      <TableHead className="py-2.5 px-3 w-12 text-center">No.</TableHead>
                      <TableHead className="py-2.5 px-3 text-left max-w-[450px]">Product</TableHead>
                      <TableHead className="py-2.5 px-3 w-44 text-center">Barcode</TableHead>
                      <TableHead className="py-2.5 px-3 w-28 text-center">Import Qty</TableHead>
                      <TableHead className="py-2.5 px-3 w-36 text-center">Import Price</TableHead>
                      <TableHead className="py-2.5 px-3 w-40 text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedReceipt.items?.map((item: any, idx: number) => {
                      const isStandardVariant = !item.variantName || item.variantName === "Standard" || item.variantName === "Default";
                      return (
                        <TableRow key={idx} className="hover:bg-surface-soft/30 transition-colors">
                          <TableCell className="py-2 px-3 text-center text-xs font-semibold text-ink-muted w-12">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 max-w-[450px] text-left">
                            <div className="flex items-center gap-2.5 w-full min-w-0">
                              <div className="w-8 h-8 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                  src={item.productImage || "https://placehold.co/80x80?text=SP"}
                                  alt={item.productName}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                <span className="font-semibold text-ink text-sm truncate w-full" title={item.productName}>
                                  {item.productName}
                                </span>
                                {!isStandardVariant && (
                                  <span className="text-[10px] text-ink-muted mt-0.5 font-semibold bg-surface-muted px-1.5 py-0.5 rounded border border-border/50 leading-none">
                                    {item.variantName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3 text-center">
                            {item.barcode ? (
                              <div className="flex flex-col items-center gap-1 justify-center">
                                <img
                                  src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${item.barcode}&scale=2&rotate=N`}
                                  alt={`Barcode ${item.barcode}`}
                                  className="h-8 object-contain max-w-[120px] shrink-0"
                                />
                                <span className="font-mono text-[10px] text-ink-muted leading-none">
                                  {item.barcode}
                                </span>
                              </div>
                            ) : (
                              <span className="text-ink-muted">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-center text-sm font-medium text-ink whitespace-nowrap">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-center text-sm font-medium text-ink tabular-nums whitespace-nowrap">
                            {item.importPrice.toLocaleString("en-US")} ₫
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-center text-sm font-bold text-ink tabular-nums whitespace-nowrap">
                            {(item.quantity * item.importPrice).toLocaleString("en-US")} ₫
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0 pt-3 border-t border-border mt-1">
            <Button variant="outline" className="border-border hover:bg-surface-soft text-ink" onClick={() => setSelectedReceipt(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedStocktake}
        onOpenChange={(o) => !o && setSelectedStocktake(null)}
      >
        <DialogContent className="max-w-3xl animate-scale-in text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">
              Stocktake Detail - {selectedStocktake?.code}
            </DialogTitle>
          </DialogHeader>
          {selectedStocktake && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm border border-border bg-surface-soft/40 p-4 rounded-sm">
                <div>
                  <p className="text-xs text-ink-muted">Creator:</p>
                  <p className="font-bold text-ink mt-0.5">{selectedStocktake.creatorName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Date:</p>
                  <p className="font-bold text-ink mt-0.5">
                    {new Date(selectedStocktake.createdAt).toLocaleString("vi-VN").replace(",", "")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Variance Quantity:</p>
                  <p className={`font-bold mt-0.5 ${selectedStocktake.totalVarianceQty > 0 ? "text-success" : selectedStocktake.totalVarianceQty < 0 ? "text-danger" : "text-ink"}`}>
                    {selectedStocktake.totalVarianceQty > 0 ? "+" : ""}{selectedStocktake.totalVarianceQty} items
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Financial Adjust Value:</p>
                  <p className={`font-bold mt-0.5 ${selectedStocktake.totalAdjustmentValue > 0 ? "text-success" : selectedStocktake.totalAdjustmentValue < 0 ? "text-danger" : "text-ink"}`}>
                    {selectedStocktake.totalAdjustmentValue > 0 ? "+" : ""}{selectedStocktake.totalAdjustmentValue.toLocaleString("en-US")} ₫
                  </p>
                </div>
                {selectedStocktake.notes && (
                  <div className="col-span-2 border-t border-border pt-2">
                    <p className="text-xs text-ink-muted">Notes:</p>
                    <p className="text-ink mt-0.5 italic">{selectedStocktake.notes}</p>
                  </div>
                )}
              </div>

              <div className="border border-border rounded-sm overflow-hidden bg-surface">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                      <TableHead className="py-2.5 px-3">Product Name</TableHead>
                      <TableHead className="py-2.5 px-3 text-center w-24">System Qty</TableHead>
                      <TableHead className="py-2.5 px-3 text-center w-24">Actual Qty</TableHead>
                      <TableHead className="py-2.5 px-3 text-center w-24">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStocktake.items?.map((item: any, idx: number) => {
                      const isStandardVariant = !item.variantName || item.variantName === "Standard" || item.variantName === "Default";
                      return (
                        <TableRow key={idx} className="hover:bg-surface-soft/30 transition-colors">
                          <TableCell className="py-2.5 px-3">
                            <div className="flex flex-col items-start text-left min-w-0">
                              <span className="font-semibold text-ink text-sm">
                                {item.productName}
                              </span>
                              {!isStandardVariant && (
                                <span className="text-[10px] text-ink-muted mt-0.5 font-semibold bg-surface-muted px-1.5 py-0.5 rounded border border-border/50 leading-none">
                                  {item.variantName}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        <TableCell className="py-2.5 px-3 text-center text-ink">{item.systemQty}</TableCell>
                        <TableCell className="py-2.5 px-3 text-center text-ink">{item.actualQty}</TableCell>
                        <TableCell className="py-2.5 px-3 text-center font-bold">
                          {item.variance > 0 ? (
                            <span className="text-success">+{item.variance}</span>
                          ) : item.variance < 0 ? (
                            <span className="text-danger">{item.variance}</span>
                          ) : (
                            <span className="text-ink-muted">0</span>
                          )}
                        </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStocktake(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportGoodsModal
        open={isRestockOpen}
        onOpenChange={setIsRestockOpen}
        onSuccess={handleWmsSuccess}
      />

      {/* ── Quick Adjust Stock Modal ──────────────────────────────────── */}
      <BaseCrudModal
        open={!!adjustingItem}
        onOpenChange={(open: boolean) => !open && setAdjustingItem(null)}
        title="Adjust Stock"
        size="sm-md"
        primaryActionText="Confirm"
        secondaryActionText="Cancel"
        onPrimaryAction={async () => {
          if (!adjustingItem) return;
          await adjustStockMutation.mutateAsync({
            variantId: adjustingItem.id,
            actualStock: Number(adjustQty),
            reason: adjustReason || "Quick adjustment",
          });
          handleWmsSuccess();
          setAdjustingItem(null);
        }}
        isLoading={adjustStockMutation.isPending}
        isDisabled={!adjustQty}
      >
        {adjustingItem && (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between gap-4 bg-surface-soft/50 border border-border rounded-sm p-3.5 mb-4 text-left">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={adjustingItem.productImage || "https://placehold.co/80x80?text=SP"}
                    alt={adjustingItem.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="font-semibold text-sm text-ink truncate max-w-[200px]" title={adjustingItem.name}>
                    {adjustingItem.name}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-1.5">
                    Barcode: <span className="font-mono text-ink font-medium">{adjustingItem.barcode || adjustingItem.sku || "—"}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 text-xs">
                <span className="text-ink-muted font-medium">Stock:</span>{" "}
                <span className="font-semibold text-ink">{adjustingItem.stock}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjustQtyInput" className="text-xs font-semibold text-ink">
                Actual Quantity
              </Label>
              <Input
                id="adjustQtyInput"
                type="number"
                min={0}
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="h-9 text-sm bg-surface"
                placeholder="Enter actual quantity..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjustReasonInput" className="text-xs font-semibold text-ink">
                Reason
              </Label>
              <Textarea
                id="adjustReasonInput"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="h-20 resize-none bg-surface text-sm border-border focus-visible:border-brand focus-visible:ring-brand/20"
                placeholder="Damaged, Expired, Recount..."
              />
            </div>
          </div>
        )}
      </BaseCrudModal>

      {/* ── Update Safety Limit Modal ─────────────────────────────────── */}
      <BaseCrudModal
        open={!!editingMinStockItem}
        onOpenChange={(open: boolean) => !open && setEditingMinStockItem(null)}
        title="Update Min Stock"
        size="sm-md"
        primaryActionText="Confirm"
        secondaryActionText="Cancel"
        onPrimaryAction={async () => {
          if (!editingMinStockItem) return;
          await updateMinStockMutation.mutateAsync({
            variantId: editingMinStockItem.id,
            minStock: Number(newMinStock),
          });
          handleWmsSuccess();
          setEditingMinStockItem(null);
        }}
        isLoading={updateMinStockMutation.isPending}
        isDisabled={!newMinStock}
      >
        {editingMinStockItem && (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between gap-4 bg-surface-soft/50 border border-border rounded-sm p-3.5 mb-4 text-left">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={editingMinStockItem.productImage || "https://placehold.co/80x80?text=SP"}
                    alt={editingMinStockItem.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="font-semibold text-sm text-ink truncate max-w-[200px]" title={editingMinStockItem.name}>
                    {editingMinStockItem.name}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-1.5">
                    Barcode: <span className="font-mono text-ink font-medium">{editingMinStockItem.barcode || editingMinStockItem.sku || "—"}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 text-xs">
                <span className="text-ink-muted font-medium">Min Stock:</span>{" "}
                <span className="font-semibold text-ink">{editingMinStockItem.minStock}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newMinStockInput" className="text-xs font-semibold text-ink">
                Min Stock Threshold
              </Label>
              <Input
                id="newMinStockInput"
                type="number"
                min={0}
                value={newMinStock}
                onChange={(e) => setNewMinStock(e.target.value)}
                className="h-9 text-sm bg-surface"
                placeholder="E.g. 5, 10, 20..."
              />
              <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
                When stock falls at or below this value, the system will flag it as Low Stock.
              </p>
            </div>
          </div>
        )}
      </BaseCrudModal>


      <StocktakeModal
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        onSuccess={handleWmsSuccess}
      />

      <BulkRestockModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />

      {activeBatchItem && (
        <BatchDetailsModal
          open={!!activeBatchItem}
          onOpenChange={(open) => !open && setActiveBatchItem(null)}
          item={activeBatchItem}
        />
      )}
    </section>
  );
}
