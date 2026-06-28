import { apiClient } from "@/lib/client";

export interface GeneralSettings {
  storeName: string;
  email: string;
  phone: string;
  currency: string;
  // Extended fields
  storeAddress?: string;
  taxId?: string;
  workingHours?: string;
  description?: string;
  // Điểm thưởng
  pointsEarnRate?: number; // N đồng = 1 điểm
  maxPointsPct?: number; // Tối đa X% giá trị đơn
  // Lợi nhuận
  profitMargin?: number; // % lợi nhuận ước tính
  // Branding & SEO
  logoUrl?: string;
  favicon?: string;
  seoTitle?: string;
  seoDescription?: string;
  // Social Links
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  zaloUrl?: string;
  youtubeUrl?: string;

  // Payments
  isCodActive?: boolean;
  isBankActive?: boolean;
  isQrActive?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankQrCodeUrl?: string;
}

export function getGeneralSettings(): Promise<GeneralSettings> {
  return apiClient
    .get<{ settings: GeneralSettings }>("/settings")
    .then((res) => res.settings);
}

export function saveGeneralSettings(
  settings: GeneralSettings,
): Promise<GeneralSettings> {
  return apiClient
    .put<{ settings: GeneralSettings }>("/settings", settings)
    .then((res) => res.settings);
}
