import React, { useEffect, useState } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { PackageSearch, MoreVertical, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EditBatchModal from "./EditBatchModal";
import {
  getVariantBatches,
  BatchItem,
  InventoryItem,
} from "../../../admin/services/inventory.service";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";

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

  useEffect(() => {
    if (open && item) {
      fetchBatches();
    } else {
      setBatches([]);
    }
  }, [open, item]);

  if (!item) return null;

  return (
    <>
      <BaseCrudModal
        open={open}
        onOpenChange={onOpenChange}
        title="Batch Details"
        size="xl"
        hideFooter={true}
      >
        <div className="mt-2 overflow-x-auto">
          <div className="border border-border rounded-sm overflow-hidden bg-surface min-w-225">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-soft/50 border-b border-border text-ink-muted">
                  <th className="py-2.5 px-4 font-semibold text-center">{"Batch Code"}</th>
                  <th className="py-2.5 px-4 font-semibold text-center">
                    MFG - EXP
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center">{"Import Date"}</th>
                  <th className="py-2.5 px-4 font-semibold text-center">{"Import Price"}</th>
                  <th className="py-2.5 px-4 font-semibold text-center">{"Initial Qty"}</th>
                  <th className="py-2.5 px-4 font-semibold text-center">{"Remaining Qty"}</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-20">{"Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink-muted">
                      Loading data...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState
                        icon={PackageSearch}
                        title="No Batches Found"
                        description="No active batches found for this product."
                      />
                    </td>
                  </tr>
                ) : (
                  batches.map((batch, index) => (
                    <tr
                      key={batch._id}
                      className="hover:bg-surface-soft/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-center">
                        <div className="text-ink">{batch.batchCode || "-"}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-ink">
                          {batch.manufactureDate
                            ? format(
                                new Date(batch.manufactureDate),
                                "dd/MM/yyyy",
                              )
                            : "-"}
                          {" - "}
                          <span>
                            {batch.expiryDate
                              ? format(new Date(batch.expiryDate), "dd/MM/yyyy")
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-ink">
                          {format(new Date(batch.createdAt), "dd/MM/yyyy")}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-ink">
                        {batch.importPrice.toLocaleString("en-US")} VND
                      </td>
                      <td className="py-3 px-4 text-center text-ink">
                        {batch.originalQty}
                      </td>
                      <td className="py-3 px-4 text-center text-ink">
                        {batch.remainingQty}
                      </td>
                      <td className="py-3 px-4 text-center">
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingBatch(batch);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />{"Edit"}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </BaseCrudModal>
      <EditBatchModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        batch={editingBatch}
        onSuccess={fetchBatches}
      />
    </>
  );
}
