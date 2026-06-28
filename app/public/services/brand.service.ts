import { apiClient } from "@/lib/client";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  logoUrl?: string;
  country: string;
  isActive: boolean;
  productCount: number;
}

export function getPublicBrands(): Promise<Brand[]> {
  return apiClient.get<{ brands: Brand[] }>("/brands").then((res: any) => {
    // Handle both flat and nested response structures
    const list = res?.brands ?? res?.data?.brands ?? res ?? [];
    return Array.isArray(list) ? list : [];
  });
}
