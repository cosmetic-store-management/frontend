import { useState, useEffect } from "react";
import {
  Check,
  X,
  AlertCircle,
  Package,
  RotateCcw,
  Truck,
  User,
  CreditCard,
  Edit2,
  Clock,
  Loader2,
} from "lucide-react";
import type { Order } from "@/admin/types/order";
import { getOrderActivities, type OrderActivity } from "@/admin/services/order.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const formatDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
};

interface DisplayedActivity {
  id: string;
  title: string;
  description: string;
  receiptNumber?: string;
  performedBy: string;
  time: string;
  status: "success" | "pending" | "info" | "danger" | "warning";
}

const getDisplayedActivities = (order: Order, rawActivities: OrderActivity[]): DisplayedActivity[] => {
  return rawActivities.map((act) => {
    let title = "Activity";
    let description = act.note || "";
    let receiptNumber = undefined;
    let status: DisplayedActivity["status"] = "info";

    const action = act.action;
    const statusTo = act.statusTo;

    // 1. Map Title & Status
    if (action === "placed") {
      status = "success";
      title = "Order Placed";
    } else if (action === "payment_received") {
      status = "success";
      title = "Payment Received";
    } else if (action === "returned") {
      status = "danger";
      title = "Order Returned";
    } else if (action === "detail_updated") {
      status = "info";
      title = "Information Updated";
    } else if (action === "status_changed") {
      if (statusTo === "processing") {
        status = "info";
        title = "Order Processing";
      } else if (statusTo === "shipping") {
        status = "warning";
        title = "Order Shipping";
      } else if (statusTo === "completed") {
        status = "success";
        title = "Order Completed";
      } else if (statusTo === "cancelled") {
        status = "danger";
        title = "Order Cancelled";
      } else if (statusTo === "return_pending") {
        status = "warning";
        title = "Return Requested";
      } else if (statusTo === "returned") {
        status = "danger";
        title = "Returned and Restocked";
      }
    }

    // 2. Translate older Vietnamese log messages & extract Receipt/Invoice number
    if (description.includes("tạo thành công tại quầy") || description.includes("POS order created")) {
      description = "POS order created successfully at Counter";
      receiptNumber = order.receiptNumber || order.code;
    } else if (description.includes("Đơn hàng trực tuyến được tạo")) {
      description = "Online order placed successfully";
    } else if (description.includes("Đã thu số tiền")) {
      const amountMatch = description.match(/[\d\.]+/);
      const amountStr = amountMatch ? amountMatch[0] : "";
      const methodStr = description.includes("QR Code") ? "QR Code" : (description.includes("Tiền mặt") || description.includes("cash") ? "Cash" : "Card");
      description = `Payment of ${amountStr || "order total"} VND successfully received via ${methodStr}`;
    } else if (description.includes("Trạng thái đơn hàng chuyển từ")) {
      const fromMatch = description.match(/từ "([^"]+)"|từ ([^\s]+)/);
      const toMatch = description.match(/sang "([^"]+)"|sang ([^\s]+)/);
      const from = fromMatch ? (fromMatch[1] || fromMatch[2]) : "";
      const to = toMatch ? (toMatch[1] || toMatch[2]) : "";
      description = `Order status updated from ${from || "previous"} to ${act.statusTo || to || "next"}`;
    } else if (description.includes("Cập nhật người nhận")) {
      description = "Recipient details updated";
    } else if (description.includes("Đã hoàn hàng & hoàn tiền")) {
      const reasonMatch = description.match(/Lý do:\s*"([^"]+)"|Reason:\s*(.+)$/i);
      const reason = reasonMatch ? (reasonMatch[1] || reasonMatch[2]) : "";
      description = `POS order items returned and refunded successfully. Reason: ${reason || "No reason specified"}`;
    }

    // Strip out parentheses entirely from description
    description = description.replace(/\([^)]+\)/g, "").trim();

    return {
      id: act._id,
      title,
      description,
      receiptNumber,
      performedBy: act.operatorName === "Nhân viên bán hàng" ? "Sales Staff" : (act.operatorName === "Khách hàng" ? "Customer" : act.operatorName),
      time: formatDate(act.createdAt),
      status,
    };
  });
};

type OrderHistoryDialogProps = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
};

export default function OrderHistoryDialog({
  open,
  order,
  onClose,
}: OrderHistoryDialogProps) {
  const [activities, setActivities] = useState<OrderActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && order) {
      setLoading(true);
      getOrderActivities(order.id)
        .then((res) => {
          if (res && res.length > 0) {
            setActivities(res);
          } else {
            // Fallback for orders without activity history yet
            setActivities([
              {
                _id: "init",
                orderId: order.id,
                action: "placed",
                note: order.channel === "pos"
                  ? "POS order created successfully at Counter"
                  : "Online order placed successfully",
                operatorName: order.channel === "pos" ? "Sales Staff" : "Customer",
                createdAt: order.createdAt,
              },
            ]);
          }
        })
        .catch((err) => {
          console.error("Error fetching activities:", err);
          toast.error("Failed to load order history logs");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, order]);

  if (!order) return null;

  const displayedEvents = getDisplayedActivities(order, activities);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl w-[95vw] rounded-sm bg-surface shadow-ui-card border-border p-6 text-left flex flex-col max-h-[85vh]">
        <DialogHeader className="border-b border-border pb-3 shrink-0">
          <DialogTitle className="text-lg font-bold text-ink">
            Order History
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-2 min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <p className="text-xs text-ink-muted">Loading history...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 my-4 pr-1 relative custom-scrollbar min-h-[300px] max-h-[50vh]">
            {displayedEvents.length > 1 && (
              /* Continuous Timeline Line */
              <span className="absolute left-[13.5px] top-[15px] bottom-[15px] w-px bg-border/60" />
            )}

            {displayedEvents.map((event) => {
              let Icon = Clock;
              let iconColor = "bg-ink-muted/10 text-ink-muted border-border";

              if (event.status === "success") {
                Icon = Check;
                iconColor = "bg-success/10 text-success border-success/20";
              } else if (event.status === "danger") {
                Icon = X;
                iconColor = "bg-danger/10 text-danger border-danger/20";
              } else if (event.status === "warning") {
                Icon = AlertCircle;
                iconColor = "bg-warning/10 text-warning border-warning/20";
              } else if (event.status === "info") {
                Icon = Package;
                iconColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
              }

              // Use specific icons for placed/payment received/returned/shipped
              if (event.title === "Order Placed") {
                Icon = User;
                iconColor = "bg-brand/10 text-brand border-brand/20";
              } else if (event.title === "Payment Received") {
                Icon = CreditCard;
                iconColor = "bg-success/10 text-success border-success/20";
              } else if (event.title === "Order Returned") {
                Icon = RotateCcw;
                iconColor = "bg-danger/10 text-danger border-danger/20";
              } else if (event.title === "Information Updated") {
                Icon = Edit2;
                iconColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
              } else if (event.title === "Order Shipping") {
                Icon = Truck;
                iconColor = "bg-warning/10 text-warning border-warning/20";
              }

              return (
                <div key={event.id} className="relative flex gap-4 z-10 text-left items-start">
                  {/* Circle Node */}
                  <div className={`relative flex h-7 w-7 items-center justify-center shrink-0 rounded-full border bg-white ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-sm font-bold text-ink">
                        {event.title}
                      </span>
                      <span className="text-[10px] text-ink-muted shrink-0 font-medium font-mono">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed font-medium">
                      {event.description}
                    </p>
                    {event.receiptNumber && (
                      <p className="text-[10px] text-ink-muted/70 mt-1 font-medium">
                        Receipt number: <span className="font-mono font-semibold text-ink-muted">{event.receiptNumber}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-ink-muted/70 mt-0.5 font-medium">
                      Performed by: <span className="font-semibold text-ink-muted">{event.performedBy}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4 shrink-0 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-sm font-medium px-6 h-10 text-xs border-border"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
