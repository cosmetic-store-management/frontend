import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BatchItem, updateBatch } from "../services/inventory.service";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      await updateBatch(batch._id, {
        batchCode: formData.batchCode,
        manufactureDate: formData.manufactureDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        importPrice: Number(formData.importPrice) || 0,
      });
      toast.success("Cập nhật lô hàng thành công!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật lô hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.3">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lô hàng</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="batchCode">Mã lô</Label>
            <Input
              id="batchCode"
              value={formData.batchCode}
              onChange={(e) =>
                setFormData({ ...formData, batchCode: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="importPrice">Giá nhập (đ)</Label>
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
              <Label htmlFor="manufactureDate">Ngày sản xuất</Label>
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
              <Label htmlFor="expiryDate">Hạn sử dụng</Label>
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
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
