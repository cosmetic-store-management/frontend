import {
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  Package,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type { Order } from "../types/order";

export const orderStatusMeta: Record<
  Order["orderStatus"],
  {
    label: string;
    icon: LucideIcon;
    badgeClass: string;
    dotClass: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock3,
    badgeClass: "bg-warning/10 text-warning",
    dotClass: "bg-warning",
  },
  processing: {
    label: "Processing",
    icon: Package,
    badgeClass: "bg-blue-500/10 text-blue-500",
    dotClass: "bg-blue-500",
  },
  shipping: {
    label: "Shipping",
    icon: Truck,
    badgeClass: "bg-surface-muted text-ink-muted",
    dotClass: "bg-ink-muted text-white",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass: "bg-success/10 text-success",
    dotClass: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badgeClass: "bg-ink/5 text-ink-muted",
    dotClass: "bg-ink-muted",
  },
  return_pending: {
    label: "Return Pending",
    icon: RotateCcw,
    badgeClass: "bg-warning/10 text-warning",
    dotClass: "bg-warning",
  },
  returned: {
    label: "Returned",
    icon: RotateCcw,
    badgeClass: "bg-danger/10 text-danger",
    dotClass: "bg-danger",
  },
};

export const paymentMethodLabel: Record<
  Order["paymentMethod"] | "cash" | "card",
  string
> = {
  cod: "Cash on Delivery",
  bank: "Bank Transfer",
  ewallet: "E-Wallet",
  qr: "QR Code",
  cash: "Cash",
  card: "Card",
  stripe: "Stripe",
  pos_card: "POS Card",
  transfer: "Transfer",
};

export const paymentStatusMeta: Record<
  Order["paymentStatus"],
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-warning/10 text-warning",
  },
  paid: { label: "Paid", badgeClass: "bg-success/10 text-success" },
  failed: {
    label: "Unpaid",
    badgeClass: "bg-warning/10 text-warning",
  },
  refund_pending: {
    label: "Refund Pending",
    badgeClass: "bg-blue-500/10 text-blue-500",
  },
};

export const allowedStatusTransitions: Record<
  Order["orderStatus"],
  Order["orderStatus"][]
> = {
  pending: ["processing", "cancelled"],
  processing: ["shipping", "cancelled"],
  shipping: ["completed", "returned"],
  completed: ["return_pending", "returned"],
  cancelled: [],
  returned: [],
  return_pending: ["returned", "completed"],
};
