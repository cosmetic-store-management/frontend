import { apiClient } from "@/lib/client";
import type { Product } from "@/public/types/product";

export interface BrandRef {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  country?: string;
}

export interface ProductQuery {
  category?: string;
  search?: string;
  onSale?: boolean;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  brandId?: string; // preferred: comma-separated brand ObjectIds
  brands?: string; // legacy compat: comma-separated brand names
  sort?: string; // 'newest' | 'top_sales' | 'popular' | 'price_asc' | 'price_desc'
}

export interface ProductListResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  availableBrands: BrandRef[];
}

export function getProducts(
  query: ProductQuery = {},
): Promise<ProductListResult> {
  return apiClient.get<ProductListResult>(
    "/products",
    query as Record<string, string | number | boolean>,
  );
}

export function getProductBySlug(slug: string): Promise<Product> {
  return apiClient
    .get<{ product: Product }>(`/products/${slug}`)
    .then((data) => data.product);
}

export function getRecommendedProducts(
  id: string,
  limit: number = 10,
): Promise<Product[]> {
  return apiClient
    .get<{
      products: Product[];
    }>(`/products/${id}/recommendations?limit=${limit}`)
    .then((data) => data.products);
}
