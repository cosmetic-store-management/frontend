/**
 * admin/services/voucher.service.ts
 * Data-access layer cho admin Voucher CRUD.
 * Hook layer (useVoucher.ts) gọi các function này thay vì gọi apiClient trực tiếp.
 */
import { apiClient } from "@/lib/client";
import type { Voucher } from "@/admin/types/voucher";

// ── Request Types ─────────────────────────────────────────────────────────────

export interface VoucherPayload {
  code: string;
  discountType: "percent" | "fixed" | "freeship";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  usageLimit: number;
  isActive: boolean;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/** Lấy toàn bộ vouchers (bao gồm inactive) cho admin */
export const getAdminVouchers = (): Promise<Voucher[]> =>
  apiClient
    .get<{ vouchers: Voucher[] }>("/vouchers/admin")
    .then((r) => r.vouchers);

/** Tạo voucher mới */
export const createAdminVoucher = (data: VoucherPayload): Promise<Voucher> =>
  apiClient
    .post<{ voucher: Voucher }>("/vouchers/admin", data)
    .then((r) => r.voucher);

/** Cập nhật voucher theo id */
export const updateAdminVoucher = (
  id: string,
  data: Partial<VoucherPayload>,
): Promise<Voucher> =>
  apiClient
    .put<{ voucher: Voucher }>(`/vouchers/admin/${id}`, data)
    .then((r) => r.voucher);

/** Xoá voucher theo id */
export const deleteAdminVoucher = (id: string): Promise<void> =>
  apiClient.delete(`/vouchers/admin/${id}`);
