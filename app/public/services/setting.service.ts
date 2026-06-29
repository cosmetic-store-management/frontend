import { apiClient } from "@/lib/client";

export interface ShopSettings {
  storeName: string;
  email: string;
  phone: string;
  storeAddress: string;
  currency: string;
  pointsEarnRate?: number;
  maxPointsPct?: number;
  isCodActive: boolean;
  isBankActive: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  isQrActive: boolean;
  // Ext Fields
  taxId?: string;
  workingHours?: string;
  logoUrl?: string;
  favicon?: string;
  seoTitle?: string;
  seoDescription?: string;
  // Social links
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  zaloUrl?: string;
  youtubeUrl?: string;
}

export const getSettings = () =>
  apiClient.get<ShopSettings>("/settings/public");

export interface Stats {
  products: number;
  customers: number;
  rating: number;
}

export const getStats = () => apiClient.get<Stats>("/settings/public/stats");
