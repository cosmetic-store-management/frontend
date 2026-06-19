import { apiClient } from "@/lib/client";

export interface GeneralSettings {
  storeName:             string;
  email:                 string;
  phone:                 string;
  currency:              string;
  // extended fields
  storeAddress?:         string;
  standardShippingFee?:  number;
  freeShippingThreshold?: number;
  // Điểm thưởng
  pointsEarnRate?:       number;  // N đồng = 1 điểm
  maxPointsPct?:         number;  // Tối đa X% giá trị đơn
  isCodActive:           boolean;
  isBankActive:          boolean;
  isQrActive:            boolean;
  bankName?:             string;
  bankAccountNumber?:    string;
  bankAccountName?:      string;
}

export function getGeneralSettings(): Promise<GeneralSettings> {
  return apiClient.get<{ settings: GeneralSettings }>("/settings")
    .then((res) => res.settings);
}

export function saveGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
  return apiClient.put<{ settings: GeneralSettings }>("/settings", settings)
    .then((res) => res.settings);
}

export function triggerBackup(): Promise<Blob> {
  const base = (import.meta.env.VITE_API_URL || "/api").trim();
  return import("@/store").then(({ useAdminAuthStore }) => {
    const token = useAdminAuthStore.getState().token;
    return fetch(`${base}/settings/backup`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Không thể tải bản sao lưu");
      return res.blob();
    });
  });
}
