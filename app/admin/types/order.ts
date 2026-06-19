export type OrderStatus = "pending" | "processing" | "shipping" | "completed" | "cancelled" | "returned";
export type PaymentMethod = "cod" | "bank" | "ewallet" | "qr" | "cash" | "card" | "vnpay";

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
  trackingCode?: string;
  earnedPoints?: number;
  usedPoints?: number;
}
