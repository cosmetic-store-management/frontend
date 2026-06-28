import type { CategoryPreview } from "./category";

export interface BrandRef {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  country: string;
}

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  minStock?: number;
  weight?: number;
  barcode?: string;
  imageUrl?: string;
  attributes?: { name: string; value: string }[];
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  // Brand — source of truth is brand object; brandName is quick-access string
  brandId: string;
  brand: BrandRef | null; // populated object (from BE brandId populate)
  brandName: string; // quick-access: brand.name || legacy string
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  // Category — primary (breadcrumb) + secondary (N:M filter assignments)
  categoryId: string;
  category?: CategoryPreview | null;
  categoryIds?: string[];
  categories?: CategoryPreview[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  variants: Variant[];
  averageRating?: number;
  numReviews?: number;
  soldCount?: number;
}
