import React, { useState, useEffect } from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BatchItem } from "../../../admin/services/inventory.service";
import { useUpdateBatch } from "@/admin/hooks/useInventory";
import { toast } from "@/lib/toast";

interface EditBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: BatchItem | null;
  onSuccess: () => void;
}

export default function EditBatchModal({
  open,
  onOpenChange,
  batch,
  onSuccess,
}: EditBatchModalProps) {
  const updateBatchMutation = useUpdateBatch();
  const [formData, setFormData] = useState({
    batchCode: "",
    manufactureDate: "",
    expiryDate: "",
    importPrice: 0,
  });

  useEffect(() => {
    if (batch && open) {
      {
        /* eslint-disable-next-line  */
      }
      setFormData({
        batchCode: batch.batchCode || "",
        manufactureDate: batch.manufactureDate
          ? new Date(batch.manufactureDate).toISOString().split("T")[0]
          : "",
        expiryDate: batch.expiryDate
          ? new Date(batch.expiryDate).toISOString().split("T")[0]
          : "",
        importPrice: batch.importPrice || 0,
      });
    }
  }, [batch, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    try {
      await updateBatchMutation.mutateAsync({
        id: batch._id,
        data: {
          batchCode: formData.batchCode,
          manufactureDate: formData.manufactureDate || undefined,
          expiryDate: formData.expiryDate || undefined,
          importPrice: Number(formData.importPrice) || 0,
        },
      });
      toast.success("Cập nhật lô hàng thành công!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật lô hàng");
    }
  };

  if (!batch) return null;

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa lô hàng"
      size="sm"
      primaryActionText="Lưu thay đổi"
      secondaryActionText="Huỷ"
      onPrimaryAction={handleSubmit as any}
      isLoading={updateBatchMutation.isPending}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 py-4"
        id="edit-batch-form"
      >
        <div className="space-y-2">
          <Label htmlFor="batchCode">{"Mã lô"}</Label>
          <Input
            id="batchCode"
            value={formData.batchCode}
            onChange={(e) =>
              setFormData({ ...formData, batchCode: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="importPrice">{"Giá nhập (đ)"}</Label>
          <Input
            id="importPrice"
            type="number"
            value={formData.importPrice || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                importPrice: Number(e.target.value),
              })
            }
            placeholder="0"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="manufactureDate">{"Ngày sản xuất"}</Label>
            <Input
              id="manufactureDate"
              type="date"
              value={formData.manufactureDate}
              onChange={(e) =>
                setFormData({ ...formData, manufactureDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryDate">{"Hạn sử dụng"}</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
            />
          </div>
        </div>
      </form>
    </BaseCrudModal>
  );
}
