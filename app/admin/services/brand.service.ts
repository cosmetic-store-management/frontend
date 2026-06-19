import { apiClient } from "@/lib/client";

export interface Brand {
  id:            string;
  name:          string;
  slug:          string;
  description:   string;
  imageUrl:      string;
  country:       string;
  isActive:      boolean;
  productCount?: number;  // server-computed, not sent on create/update
}

export interface AdminBrandListResult {
  brands: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getPublicBrands(): Promise<Brand[]> {
  return apiClient.get<{ brands: Brand[] }>("/brands")
    .then((res) => res.brands);
}

export function getAdminBrands(query: { search?: string; status?: string; page?: number; limit?: number } = {}): Promise<AdminBrandListResult> {
  return apiClient.get<AdminBrandListResult>("/brands/admin/list", query as Record<string, any>);
}

export function getBrandDetail(id: string): Promise<Brand> {
  return apiClient.get<{ brand: Brand }>(`/brands/admin/${id}`)
    .then((res) => res.brand);
}

export function createBrand(data: Omit<Brand, "id" | "slug" | "productCount">): Promise<Brand> {
  return apiClient.post<{ brand: Brand }>("/brands/admin", data)
    .then((res) => res.brand);
}

export function updateBrand(id: string, data: Partial<Omit<Brand, "id" | "slug">>): Promise<Brand> {
  return apiClient.patch<{ brand: Brand }>(`/brands/admin/${id}`, data)
    .then((res) => res.brand);
}

export function updateBrandStatus(id: string, isActive: boolean): Promise<Brand> {
  return apiClient.patch<{ brand: Brand }>(`/brands/admin/${id}/status`, { isActive })
    .then((res) => res.brand);
}

export function deleteBrand(id: string): Promise<void> {
  return apiClient.delete(`/brands/admin/${id}`);
}
