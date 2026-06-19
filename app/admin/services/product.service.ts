import { apiClient } from "@/lib/client";
import type { Product } from "@/admin/types/product";

export interface ProductQuery {
  category?: string;
  search?: string;
  onSale?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminProductQuery {
  search?:   string;
  category?: string;
  brandId?:  string;  // filter by brandId — source of truth
  status?:   "active" | "inactive";
  page?:     number;
  limit?:    number;
}

export interface ProductListResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function getAdminProducts(query: AdminProductQuery = {}): Promise<ProductListResult> {
  return apiClient.get<ProductListResult>("/products/admin/list", query as Record<string, string | number | boolean>);
}

export function getAdminProductById(id: string): Promise<Product> {
  return apiClient.get<{ product: Product }>(`/products/admin/${id}`)
    .then((data) => data.product);
}

export function createProduct(data: Omit<Product, "id" | "slug" | "category">): Promise<Product> {
  return apiClient.post<{ product: Product }>("/products/admin", data)
    .then((res) => res.product);
}

export function updateProduct(id: string, data: Partial<Omit<Product, "id" | "slug" | "category">>): Promise<Product> {
  return apiClient.patch<{ product: Product }>(`/products/admin/${id}`, data)
    .then((res) => res.product);
}

export function updateProductStatus(id: string, isActive: boolean): Promise<Product> {
  return apiClient.patch<{ product: Product }>(`/products/admin/${id}/status`, { isActive })
    .then((res) => res.product);
}

export function deleteProduct(id: string): Promise<void> {
  return apiClient.delete(`/products/admin/${id}`);
}
