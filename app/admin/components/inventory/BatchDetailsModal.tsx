import React, { useEffect, useState } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { PackageSearch, MoreVertical, Edit, ArrowDownRight, ArrowUpRight, AlertCircle, History, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import EditBatchModal from "./EditBatchModal";
import {
  getVariantBatches,
  getTransactions,
  BatchItem,
  InventoryItem,
  InventoryTransaction,
} from "../../../admin/services/inventory.service";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";

interface BatchDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export default function BatchDetailsModal({
  open,
  onOpenChange,
  item,
}: BatchDetailsModalProps) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"batches" | "history">("batches");
  const [txs, setTxs] = useState<InventoryTransaction[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txPagination, setTxPagination] = useState({ totalPages: 1, totalItems: 0 });

  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchBatches = () => {
    if (item) {
      setIsLoading(true);
      getVariantBatches(item.id)
        .then(setBatches)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  };

  const fetchTransactions = () => {
    if (item) {
      setIsTxLoading(true);
      getTransactions({ page: txPage, limit: 5, variantId: item.id })
        .then((res) => {
          setTxs(res.transactions);
          setTxPagination({
            totalPages: res.pagination.totalPages,
            totalItems: res.pagination.totalItems,
          });
        })
        .catch(console.error)
        .finally(() => setIsTxLoading(false));
    }
  };

  useEffect(() => {
    if (open && item) {
      if (activeTab === "batches") {
        fetchBatches();
      } else {
        fetchTransactions();
      }
    } else {
      setBatches([]);
      setTxs([]);
      setActiveTab("batches");
      setTxPage(1);
    }
  }, [open, item, activeTab, txPage]);

  if (!item) return null;

  return (
    <>
      <BaseCrudModal
        open={open}
        onOpenChange={onOpenChange}
        title="Inventory details"
        size="xl"
        hideFooter={true}
      >
        <div className="flex flex-col gap-4 mt-2">
          {/* Product Info Summary Card */}
          <div className="flex items-center justify-between gap-4 bg-surface-soft/50 border border-border rounded-sm p-3.5 mb-4 text-left">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={item.productImage || "https://placehold.co/80x80?text=SP"}
                  alt={item.name}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="text-left min-w-0">
                <h4 className="font-semibold text-sm text-ink truncate max-w-[400px]" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-[11px] text-ink-muted mt-1.5">
                  Barcode: <span className="font-mono text-ink font-medium">{item.barcode || item.sku || "—"}</span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 text-xs space-y-1.5 pr-2">
              <div>
                <span className="text-ink-muted font-medium">Stock:</span>{" "}
                <span className="font-semibold text-ink">{item.stock}</span>
              </div>
              <div>
                <span className="text-ink-muted font-medium">Min Stock:</span>{" "}
                <span className="font-semibold text-ink">{item.minStock}</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-border gap-4 mt-2">
            <button
              onClick={() => setActiveTab("batches")}
              className={`pb-2.5 text-sm font-bold border-b-2 px-1 flex items-center gap-2 transition-all ${
                activeTab === "batches"
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Layers className="w-4 h-4" />
              Active Batches ({batches.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                setTxPage(1);
              }}
              className={`pb-2.5 text-sm font-bold border-b-2 px-1 flex items-center gap-2 transition-all ${
                activeTab === "history"
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <History className="w-4 h-4" />
              Stock Movement History
            </button>
          </div>

          {activeTab === "batches" ? (
            /* Batches Tab Content */
            <div className="overflow-x-auto">
              <div className="border border-border rounded-sm overflow-hidden bg-surface min-w-225">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                      <TableHead className="py-2.5 px-4 w-48 text-center">Batch Code</TableHead>
                      <TableHead className="py-2.5 px-4 w-48 text-center">MFG — EXP</TableHead>
                      <TableHead className="py-2.5 px-4 w-36 text-center">Import Date</TableHead>
                      <TableHead className="py-2.5 px-4 w-36 text-center">Import Price</TableHead>
                      <TableHead className="py-2.5 px-4 w-24 text-center">Quantity</TableHead>
                      <TableHead className="py-2.5 px-4 w-24 text-center">Stock</TableHead>
                      <TableHead className="py-2.5 px-4 w-20 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-ink-muted">
                          Loading data...
                        </TableCell>
                      </TableRow>
                    ) : batches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <EmptyState
                            icon={PackageSearch}
                            title="No Batches Found"
                            description="No active batches found for this variant."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      batches.map((batch) => (
                        <TableRow key={batch._id} className="hover:bg-surface-soft/30 transition-colors">
                          <TableCell className="py-3 px-4 text-center">
                            <div className="text-ink font-mono text-xs">{batch.batchCode || "-"}</div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-xs text-ink-muted">
                            {batch.manufactureDate
                              ? format(new Date(batch.manufactureDate), "dd/MM/yyyy")
                              : "-"}
                            {" — "}
                            {batch.expiryDate
                              ? format(new Date(batch.expiryDate), "dd/MM/yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-xs text-ink-muted">
                            {format(new Date(batch.createdAt), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-ink tabular-nums">
                            {batch.importPrice.toLocaleString("en-US")} ₫
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-ink">
                            {batch.originalQty}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-ink font-semibold">
                            {batch.remainingQty}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-ink-muted hover:text-ink"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 p-1.5 shadow-ui-card rounded-sm border-border">
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => {
                                    setEditingBatch(batch);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* History Tab Content */
            <div className="space-y-4">
              <div className="border border-border rounded-sm overflow-hidden bg-surface min-w-225">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                      <TableHead className="py-2.5 px-4 w-36 text-center">TX Code</TableHead>
                      <TableHead className="py-2.5 px-4 w-48 text-center">Type</TableHead>
                      <TableHead className="py-2.5 px-4 w-24 text-center">Quantity</TableHead>
                      <TableHead className="py-2.5 px-4 w-36 text-center">Unit Price</TableHead>
                      <TableHead className="py-2.5 px-4 w-36 text-center">Total Value</TableHead>
                      <TableHead className="py-2.5 px-4 w-48 text-center">Performer</TableHead>
                      <TableHead className="py-2.5 px-4 w-48 text-center">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTxLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-ink-muted">
                          Loading transaction history...
                        </TableCell>
                      </TableRow>
                    ) : txs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <EmptyState
                            icon={History}
                            title="No Movements Found"
                            description="No inventory movement records found for this variant."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      txs.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-surface-soft/30 transition-colors">
                          <TableCell className="py-3 px-4 text-center font-mono text-xs text-ink-muted">
                            {tx.id.slice(-8).toUpperCase()}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-semibold ${
                                tx.businessType === "Customer Return"
                                  ? "bg-info/10 text-info"
                                  : tx.type === "in"
                                    ? "bg-success/10 text-success"
                                    : tx.type === "out"
                                      ? "bg-danger/10 text-danger"
                                      : "bg-purple-500/10 text-purple-600"
                              }`}
                            >
                              {tx.businessType === "Customer Return" ? (
                                <><ArrowDownRight className="w-3.5 h-3.5 text-info" /> {tx.businessType}</>
                              ) : tx.type === "in" ? (
                                <><ArrowDownRight className="w-3.5 h-3.5 text-success" /> {tx.businessType}</>
                              ) : tx.type === "out" ? (
                                <><ArrowUpRight className="w-3.5 h-3.5 text-danger" /> {tx.businessType}</>
                              ) : (
                                <><AlertCircle className="w-3.5 h-3.5 text-purple-600" /> {tx.businessType}</>
                              )}
                            </span>
                          </TableCell>
                          <TableCell
                            className={`py-3 px-4 text-center font-bold tabular-nums ${
                              tx.type === "in"
                                ? "text-success"
                                : tx.type === "out"
                                  ? "text-danger"
                                  : tx.qty > 0
                                    ? "text-success"
                                    : tx.qty < 0
                                      ? "text-danger"
                                      : "text-ink-muted"
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
                          <TableCell className="py-3 px-4 text-center text-ink tabular-nums">
                            {tx.price ? `${tx.price.toLocaleString("en-US")} ₫` : "—"}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center font-bold text-ink tabular-nums">
                            {tx.price ? `${(Math.abs(tx.qty) * tx.price).toLocaleString("en-US")} ₫` : "—"}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-ink-muted text-xs">
                            {tx.user}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-ink-muted text-xs">
                            {tx.date}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {txPagination.totalPages > 1 && (
                <div className="flex items-center justify-center p-3 bg-surface border border-border rounded-sm">
                  <Pagination
                    currentPage={txPage}
                    totalPages={txPagination.totalPages}
                    onPageChange={setTxPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </BaseCrudModal>
      <EditBatchModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        batch={editingBatch}
        onSuccess={fetchBatches}
        product={item}
      />
    </>
  );
}
