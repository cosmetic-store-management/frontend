import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerOrders } from "../../hooks/useCustomer";
import type { Customer } from "@/admin/services/user.service";
import type { Order } from "@/admin/types/order";

interface CustomerOrderHistoryModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  shipping: "Shipping",
  completed: "Completed",
  cancelled: "Cancelled",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "secondary",
  shipping: "default",
  completed: "outline",
  cancelled: "destructive",
};

export function CustomerOrderHistoryModal({
  open,
  onClose,
  customer,
}: CustomerOrderHistoryModalProps) {
  const { data: customerOrdersData, isLoading: loadingOrders } =
    useCustomerOrders(customer?.id || "");

  const customerOrders = customerOrdersData?.orders || [];

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Order History"
      description="View past orders for this customer."
      size="lg"
      hideFooter={true}
    >
      <div className="mt-2 pb-4">
        {loadingOrders ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-sm text-ink-muted">
              Loading order history...
            </span>
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <History className="w-12 h-12 text-ink-muted/30" />
            <p className="text-center text-sm text-ink-muted">
              No order history.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-sm bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-bg/50 border-b border-border">
                  <TableHead className="px-4 w-[25%]">Order ID</TableHead>
                  <TableHead className="px-4 w-[15%]">Channel</TableHead>
                  <TableHead className="px-4 text-center w-[20%]">
                    Total Amount
                  </TableHead>
                  <TableHead className="px-4 text-center w-[20%]">
                    Status
                  </TableHead>
                  <TableHead className="px-4 w-[20%]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOrders.map((o: Order) => (
                  <TableRow key={o.id} className="hover:bg-bg/40">
                    <TableCell className="py-3 px-4 font-mono text-ink font-semibold">
                      {o.code}
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
                    <TableCell className="py-3 px-4 text-center font-bold text-brand">
                      {o.totalAmount.toLocaleString("en-US")} VND
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
                        ? new Date(o.createdAt).toLocaleDateString("en-US")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </BaseCrudModal>
  );
}
