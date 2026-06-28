export type OrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled"
  | "return_pending"
  | "returned";
export type PaymentMethod =
  | "cod"
  | "bank"
  | "ewallet"
  | "qr"
  | "cash"
  | "card"
  | "stripe"
  | "pos_card"
  | "transfer";

export interface OrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  receiverName: string;
  phone: string;
  /** Legacy combined address — có thể undefined khi dùng province/district/ward/street */
  address?: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  createdAt: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  voucherCode?: string;
  totalAmount: number;
  note?: string;
  userId: string | null;
  channel: "pos" | "online";
  creatorId: string | null;
  paymentStatus: "pending" | "paid" | "failed" | "refund_pending";
  idempotencyKey?: string;
  transactionId?: string;
  earnedPoints?: number;
  usedPoints?: number;
  completedAt?: string;
  returnReason?: string;
  trackingCode?: string;
}
