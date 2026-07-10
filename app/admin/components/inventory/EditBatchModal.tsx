import React, { useState, useEffect } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { BatchItem } from "../../../admin/services/inventory.service";
import { useUpdateBatch } from "@/admin/hooks/useInventory";
import { toast } from "@/lib/toast";

interface EditBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: BatchItem | null;
  onSuccess: () => void;
  product?: any;
}

export default function EditBatchModal({
  open,
  onOpenChange,
  batch,
  onSuccess,
  product,
}: EditBatchModalProps) {
  const updateBatchMutation = useUpdateBatch();
  const [formData, setFormData] = useState({
    batchCode: "",
    manufactureDate: "",
    expiryDate: "",
    importPrice: 0,
    originalQty: 0,
  });

  useEffect(() => {
    if (batch && open) {
      setFormData({
        batchCode: batch.batchCode || "",
        manufactureDate: batch.manufactureDate
          ? new Date(batch.manufactureDate).toISOString().split("T")[0]
          : "",
        expiryDate: batch.expiryDate
          ? new Date(batch.expiryDate).toISOString().split("T")[0]
          : "",
        importPrice: batch.importPrice || 0,
        originalQty: batch.originalQty || 0,
      });
    }
  }, [batch, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    if (formData.manufactureDate && formData.expiryDate) {
      const mfg = new Date(formData.manufactureDate);
      const exp = new Date(formData.expiryDate);
      if (exp <= mfg) {
        toast.error("Expiry date must be after manufacture date");
        return;
      }
    }

    try {
      await updateBatchMutation.mutateAsync({
        id: batch._id,
        data: {
          batchCode: formData.batchCode,
          manufactureDate: formData.manufactureDate || undefined,
          expiryDate: formData.expiryDate || undefined,
          importPrice: Number(formData.importPrice) || 0,
          originalQty: Number(formData.originalQty) || 0,
        },
      });
      toast.success("Batch updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating the batch");
    }
  };

  if (!batch) return null;

  const displayPrice = formData.importPrice
    ? formData.importPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    : "";

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Batch"
      size="md"
      primaryActionText="Save changes"
      secondaryActionText="Cancel"
      onPrimaryAction={handleSubmit as any}
      isLoading={updateBatchMutation.isPending}
    >
      {product && (
        <div className="flex items-center justify-between gap-4 bg-surface-soft/50 border border-border rounded-sm p-3.5 mb-4 text-left">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
              <img
                src={product.productImage || "https://placehold.co/80x80?text=SP"}
                alt={product.name}
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-semibold text-sm text-ink truncate max-w-[200px]" title={product.name}>
                {product.name}
              </h4>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Barcode: <span className="font-mono text-ink font-medium">{product.barcode || product.sku || "—"}</span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 text-xs">
            <span className="text-ink-muted font-medium">Stock:</span>{" "}
            <span className="font-semibold text-ink">{product.stock}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 py-2"
        id="edit-batch-form"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="batchCode" className="text-xs font-semibold text-ink">
              Batch Code
            </Label>
            <Input
              id="batchCode"
              value={formData.batchCode}
              placeholder="LOT01"
              onChange={(e) =>
                setFormData({ ...formData, batchCode: e.target.value })
              }
              className="h-9 text-sm bg-surface"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="originalQty" className="text-xs font-semibold text-ink">
              Quantity
            </Label>
            <Input
              id="originalQty"
              type="number"
              min={1}
              value={formData.originalQty || ""}
              onChange={(e) =>
                setFormData({ ...formData, originalQty: Number(e.target.value) || 0 })
              }
              className="h-9 text-sm bg-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="importPrice" className="text-xs font-semibold text-ink">
              Import Price
            </Label>
            <Input
              id="importPrice"
              type="text"
              value={displayPrice}
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, "");
                if (/^\d*$/.test(raw)) {
                  setFormData({ ...formData, importPrice: raw ? Number(raw) : 0 });
                }
              }}
              placeholder="150000"
              className="h-9 text-sm bg-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="manufactureDate" className="text-xs font-semibold text-ink">
              Manufacture Date
            </Label>
            <DatePicker
              value={formData.manufactureDate ? new Date(formData.manufactureDate) : undefined}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  manufactureDate: date ? date.toISOString().split("T")[0] : "",
                })
              }
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label htmlFor="expiryDate" className="text-xs font-semibold text-ink">
              Expiry Date
            </Label>
            <DatePicker
              value={formData.expiryDate ? new Date(formData.expiryDate) : undefined}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  expiryDate: date ? date.toISOString().split("T")[0] : "",
                })
              }
            />
          </div>
        </div>
      </form>
    </BaseCrudModal>
  );
}
