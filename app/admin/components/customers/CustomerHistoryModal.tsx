import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../../services/order.service";
import type { Order } from "@/admin/types/order";
import type { Customer } from "@/admin/services/user.service";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "secondary",
  shipping: "default",
  completed: "outline",
  cancelled: "destructive",
};

type CustomerHistoryModalProps = {
  customer: Customer | null;
  onClose: () => void;
  onViewOrder?: (order: Order) => void;
};

export function CustomerHistoryModal({
  customer,
  onClose,
  onViewOrder,
}: CustomerHistoryModalProps) {
  const open = !!customer;

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["orders", customer?.id],
    queryFn: () => fetchOrders({ userId: customer?.id }),
    enabled: !!customer?.id,
  });

  const orders = orderData?.orders ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="pr-6">
          <DialogTitle>
            Lịch sử mua hàng:{" "}
            <span className="text-brand">{customer?.name}</span>
          </DialogTitle>
          <DialogDescription>
            SĐT: <span className="font-medium text-ink">{customer?.phone}</span>{" "}
            | Email:{" "}
            <span className="font-medium text-ink">
              {customer?.email || "N/A"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <span className="text-sm text-ink-muted">
                Đang tải lịch sử đơn hàng...
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <History className="w-12 h-12 text-ink-muted/30" />
              <p className="text-center text-sm text-ink-muted">
                Khách hàng chưa có giao dịch nào.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-sm bg-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg/50 border-b border-border">
                    <TableHead className="py-3 px-4 w-[25%]">Mã đơn</TableHead>
                    <TableHead className="py-3 px-4 w-[15%]">Kênh</TableHead>
                    <TableHead className="py-3 px-4 text-center w-[20%]">
                      Tổng tiền
                    </TableHead>
                    <TableHead className="py-3 px-4 text-center w-[20%]">
                      Trạng thái
                    </TableHead>
                    <TableHead className="py-3 px-4 w-[20%]">
                      Thời gian
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o: Order) => (
                    <TableRow key={o.id} className="hover:bg-bg/40">
                      <TableCell className="py-3 px-4 font-mono font-semibold">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onViewOrder?.(o);
                          }}
                          className="text-ink hover:underline transition-colors"
                        >
                          {o.code}
                        </button>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {o.channel === "pos" ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-brand/10 text-brand px-2 py-0 hover:bg-brand/20"
                          >
                            POS
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-warning border-warning/50 px-2 py-0 bg-warning/5"
                          >
                            Online
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center font-bold text-ink">
                        {o.totalAmount.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Badge
                          variant={STATUS_VARIANTS[o.orderStatus] ?? "outline"}
                          className="text-[10px] px-2 py-0"
                        >
                          {STATUS_LABELS[o.orderStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-ink-muted text-xs">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
