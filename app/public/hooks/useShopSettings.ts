import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "../services/setting.service";
import { QK } from "@/lib/queryKeys";

const DEFAULT_SETTINGS = {
  storeName:             "GlowUp Cosmetics",
  email:                 "contact@glowup.vn",
  phone:                 "1900 6868",
  storeAddress:          "Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  currency:              "VND",
  standardShippingFee:   30000,
  freeShippingThreshold: 500000,
  isCodActive:           true,
  isBankActive:          false,
  bankName:              "",
  bankAccountNumber:     "",
  bankAccountName:       "",
  isQrActive:            false,
  maxPointsPct:          50,   // % tối đa hoá đơn được dùng điểm
  pointsEarnRate:        100,  // bao nhiêu VND = 1 điểm
  // Optional social / branding fields
  facebookUrl:           undefined as string | undefined,
  instagramUrl:          undefined as string | undefined,
  youtubeUrl:            undefined as string | undefined,
  logoUrl:               undefined as string | undefined,
  description:           undefined as string | undefined,
};

/**
 * Hook lấy thông tin cửa hàng từ DB.
 * Trả về DEFAULT_SETTINGS nếu API chưa có dữ liệu (graceful fallback).
 * staleTime 10 phút — settings ít thay đổi, không cần refetch thường xuyên.
 */
export function useShopSettings() {
  const { data, isLoading } = useQuery({
    queryKey:  QK.settings(),
    queryFn:   getPublicSettings,
    staleTime: 10 * 60 * 1000, // 10 phút
    retry:     1,
    // Nếu lỗi (VD: chưa có settings trong DB) → dùng default
    placeholderData: DEFAULT_SETTINGS as any,
  });

  return {
    settings: data ?? DEFAULT_SETTINGS,
    isLoading,
  };
}
