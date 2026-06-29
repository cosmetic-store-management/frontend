import { apiClient } from "@/lib/client";
import type { Product } from "@/admin/types/product";
import type { ProductFormData } from "@/admin/schemas/product.schema";

export interface ProductQuery {
  category?: string;
  search?: string;
  onSale?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminProductQuery {
  search?: string;
  category?: string;
  brandId?: string; // filter by brandId - source of truth
  status?: "active" | "inactive";
  minStock?: number;
  maxStock?: number;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: Product[];
  pagination: {
    limit: number;
    total: number;
    page: number;
    totalPages: number;
  };
}

// ── DTO Mapping ───────────────────────────────────────────────────────────────

export type ProductMutationPayload = {
  brandId: string;
  name: string;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  categoryId: string;
  categoryIds: string[];
  isActive: boolean;
  variants: any[];
};

export const toProductPayload = (
  values: ProductFormData,
): ProductMutationPayload => ({
  name: (values.name || "").trim(),
  brandId: values.brandId,
  description: (values.description || "").trim(),
  imageUrl: (values.imageUrl || "").trim(),
  imageUrls: values.imageUrls || [],
  categoryId: values.categoryId,
  categoryIds: values.categoryIds || [],
  isActive: values.isActive,
  variants: values.variants.map((v) => ({
    id: v.id || "",
    name: (v.name || "").trim(),
    sku: (v.sku || "").trim(),
    price: Number(v.price),
    stock: Number(v.stock),
    minStock: Number(v.minStock || 10),
    weight: Number(v.weight || 200),
    discountPrice:
      v.discountPrice?.toString().trim() !== ""
        ? Number(v.discountPrice)
        : null,
    imageUrl: v.imageUrl?.trim() || "",
    isActive: v.isActive,
  })),
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export function getAdminProducts(
  query: AdminProductQuery = {},
): Promise<ProductListResult> {
  return apiClient.get<ProductListResult>(
    "/products/admin/list",
    query as Record<string, string | number | boolean>,
  );
}

export function getAdminProductById(id: string): Promise<Product> {
  return apiClient
    .get<{ product: Product }>(`/products/admin/${id}`)
    .then((data) => data.product);
}

export function createProduct(data: ProductFormData): Promise<Product> {
  return apiClient
    .post<{ product: Product }>("/products/admin", toProductPayload(data))
    .then((res) => res.product);
}

export function updateProduct(
  id: string,
  data: ProductFormData,
): Promise<Product> {
  return apiClient
    .patch<{
      product: Product;
    }>(`/products/admin/${id}`, toProductPayload(data))
    .then((res) => res.product);
}

export function updateProductStatus(
  id: string,
  isActive: boolean,
): Promise<Product> {
  return apiClient
    .patch<{ product: Product }>(`/products/admin/${id}/status`, { isActive })
    .then((res) => res.product);
}

export function deleteProduct(id: string): Promise<void> {
  return apiClient.delete(`/products/admin/${id}`);
}

export function batchImportProducts(
  products: any[],
): Promise<{ totalProcessed: number }> {
  return apiClient.post("/products/admin/batch-import", products);
}
