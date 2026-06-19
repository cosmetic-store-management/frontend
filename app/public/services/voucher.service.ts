import { apiClient } from "@/lib/client";

export interface PublicVoucher {
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
}

export function getPublicVouchers() {
  return apiClient.get<{ vouchers: PublicVoucher[] }>("/vouchers/public")
    .then(res => res.vouchers);
}

export function validateVoucher(code: string, subtotal: number) {
  return apiClient.post<{ message: string; result: any }>("/vouchers/validate", {
    code,
    subtotal
  });
}

export function getWalletVouchers() {
  return apiClient.get<{ message: string; vouchers: any[] }>("/vouchers/wallet");
}

export function getAllWalletVouchers() {
  return apiClient.get<{ message: string; vouchers: (PublicVoucher & { status: "valid" | "used" | "expired" | "exhausted" })[] }>("/vouchers/wallet/all");
}

export function collectVoucher(code: string) {
  return apiClient.post<{ message: string; voucher: PublicVoucher }>(`/vouchers/collect/${code}`);
}

export function uncollectVoucher(code: string) {
  return apiClient.delete<{ message: string }>(`/vouchers/collect/${code}`);
}
