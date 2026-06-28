import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "../services/setting.service";
import { QK } from "@/lib/queryKeys";

const DEFAULT_SETTINGS = {
  storeName: "GlowUp Cosmetics",
  email: "contact@glowup.vn",
  phone: "1900 6868",
  storeAddress:
    "Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  currency: "VND",
  isCodActive: true,
  isBankActive: false,
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
  isQrActive: false,
  maxPointsPct: 50, // % tối đa hoá đơn được dùng điểm
  pointsEarnRate: 100, // bao nhiêu VND = 1 điểm
  // Optional social / branding fields
  taxId: undefined as string | undefined,
  workingHours: undefined as string | undefined,
  logoUrl: undefined as string | undefined,
  favicon: undefined as string | undefined,
  seoTitle: "GlowUp Cosmetics",
  seoDescription: undefined as string | undefined,
  facebookUrl: undefined as string | undefined,
  instagramUrl: undefined as string | undefined,
  tiktokUrl: undefined as string | undefined,
  zaloUrl: undefined as string | undefined,
  youtubeUrl: undefined as string | undefined,
};

export function useShopSettings() {
  const { data, isLoading } = useQuery({
    queryKey: QK.settings(),
    queryFn: getPublicSettings,
    staleTime: 10 * 60 * 1000, // 10 phút
    retry: 1,
    placeholderData: DEFAULT_SETTINGS as any,
  });

  return {
    settings: data ?? DEFAULT_SETTINGS,
    isLoading,
  };
}
