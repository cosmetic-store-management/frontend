import { apiClient } from "@/lib/client";

export interface ShopSettings {
  storeName:             string;
  email:                 string;
  phone:                 string;
  storeAddress:          string;
  currency:              string;
  standardShippingFee:   number;
  freeShippingThreshold: number;
  pointsEarnRate?:       number;
  maxPointsPct?:         number;
  isCodActive:           boolean;
  isBankActive:          boolean;
  bankName:              string;
  bankAccountNumber:     string;
  bankAccountName:       string;
  isQrActive:            boolean;
  // Social links (optional — có thể được thêm vào sau)
  facebookUrl?:          string;
  instagramUrl?:         string;
  youtubeUrl?:           string;
  logoUrl?:              string;
  description?:          string;
}

export const getPublicSettings = () =>
  apiClient.get<ShopSettings>("/settings/public");
