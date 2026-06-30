export interface Voucher {
  id: string;
  code: string;
  discountType: "percent" | "fixed" | "freeship";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  ttlMinutes?: number;
  overbookingLimit?: number;
}
