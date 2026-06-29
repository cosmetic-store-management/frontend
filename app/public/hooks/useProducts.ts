import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getProducts,
  getProductBySlug,
  getRecommendedProducts,
  type ProductQuery,
} from "../services/product.service";
import { QK } from "@/lib/queryKeys";

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: QK.products(query),
    queryFn: () => getProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: QK.product(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductRecommendations(id: string, limit: number = 10) {
  return useQuery({
    queryKey: QK.recommendations(id, limit),
    queryFn: () => getRecommendedProducts(id, limit),
    enabled: !!id,
  });
}

import { getBrands } from "../services/brand.service";
export function useBrands() {
  return useQuery({
    queryKey: QK.brands(),
    queryFn: getBrands,
  });
}

import { getCategories } from "../services/category.service";
export function useCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: () => getCategories(),
  });
}
