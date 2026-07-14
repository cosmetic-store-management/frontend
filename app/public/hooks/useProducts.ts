import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getProducts,
  getProductBySlug,
  getRecommendedProducts,
  getPopularSearches,
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

export function usePopularSearches(limit: number = 10) {
  return useQuery({
    queryKey: ["popular-searches", limit],
    queryFn: () => getPopularSearches(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

import { getBrands } from "../services/brand.service";
export function useBrands() {
  return useQuery({
    queryKey: QK.brands(),
    queryFn: getBrands,
    staleTime: Infinity,
    refetchOnMount: false,
  });
}

import { getCategories } from "../services/category.service";
export function useCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: async () => {
      const data = await getCategories();
      // Sort main categories by the number of subcategories (descending)
      return data.sort((a: any, b: any) => {
        const aCount = a.subCategories ? a.subCategories.length : 0;
        const bCount = b.subCategories ? b.subCategories.length : 0;
        return bCount - aCount;
      });
    },
    staleTime: Infinity,
    refetchOnMount: false,
  });
}
