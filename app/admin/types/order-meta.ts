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
    label: "Chờ xác nhận",
    icon: Clock3,
    badgeClass: "bg-warning/10 text-warning",
    dotClass: "bg-warning",
  },
  processing: {
    label: "Đang xử lý",
    icon: Package,
    badgeClass: "bg-blue-500/10 text-blue-500",
    dotClass: "bg-blue-500",
  },
  shipping: {
    label: "Đang giao",
    icon: Truck,
    badgeClass: "bg-surface-muted text-ink-muted",
    dotClass: "bg-ink-muted text-white",
  },
  completed: {
    label: "Hoàn tất",
    icon: CheckCircle2,
    badgeClass: "bg-success/10 text-success",
    dotClass: "bg-success",
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    badgeClass: "bg-ink/5 text-ink-muted",
    dotClass: "bg-ink-muted",
  },
  return_pending: {
    label: "Yêu cầu trả hàng",
    icon: RotateCcw,
    badgeClass: "bg-warning/10 text-warning",
    dotClass: "bg-warning",
  },
  returned: {
    label: "Đã trả hàng",
    icon: RotateCcw,
    badgeClass: "bg-danger/10 text-danger",
    dotClass: "bg-danger",
  },
};

export const paymentMethodLabel: Record<
  Order["paymentMethod"] | "cash" | "card",
  string
> = {
  cod: "Thanh toán khi nhận hàng",
  bank: "Chuyển khoản",
  ewallet: "Ví điện tử",
  qr: "Mã QR",
  cash: "Tiền mặt",
  card: "Quẹt thẻ",
  stripe: "Thẻ quốc tế",
  pos_card: "Quẹt thẻ",
  transfer: "Chuyển khoản",
};

export const paymentStatusMeta: Record<
  Order["paymentStatus"],
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "Chờ thanh toán",
    badgeClass: "bg-warning/10 text-warning",
  },
  paid: { label: "Đã thanh toán", badgeClass: "bg-success/10 text-success" },
  failed: {
    label: "Chưa thanh toán",
    badgeClass: "bg-warning/10 text-warning",
  },
  refund_pending: {
    label: "Cần hoàn tiền",
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
