import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import { getAdminProducts, createProduct, updateProduct, deleteProduct, updateProductStatus } from "@/admin/services/product.service";
import { getAdminCategories } from "@/admin/services/category.service";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/admin/types/product";
import type { Category } from "@/admin/types/category";
import type { ProductFormValues } from "../components/ProductModal";

// ── Payload mapper ─────────────────────────────────────────────────────────────
// Conflict resolved: was using `brand: values.brandId` (wrong) → now `brandId` is the correct key
type ProductMutationPayload = {
  brandId:     string;
  name:        string;
  description: string;
  imageUrl:    string;
  imageUrls:   string[];
  categoryId:  string;
  categoryIds: string[];
  isActive:    boolean;
  variants:    any[];
};

const toProductPayload = (values: ProductFormValues): ProductMutationPayload => ({
  name:        (values.name || "").trim(),
  brandId:     values.brandId,           // ✅ was: brand: values.brandId (wrong field name)
  description: (values.description || "").trim(),
  imageUrl:    (values.imageUrl || "").trim(),
  imageUrls:   values.imageUrls || [],
  categoryId:  values.categoryId,
  categoryIds: values.categoryIds || [], // secondary N:M categories
  isActive:    values.isActive,
  variants: values.variants.map(v => ({
    id:            v.id || "",
    name:          (v.name || "").trim(),
    sku:           (v.sku || "").trim(),
    price:         Number(v.price),
    stock:         Number(v.stock),
    minStock:      Number(v.minStock || 10),
    weight:        Number(v.weight || 200),
    discountPrice: v.discountPrice?.toString().trim() !== "" ? Number(v.discountPrice) : null,
    imageUrl:      v.imageUrl?.trim() || "",
    isActive:      v.isActive,
  })),
});

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface ProductFilters {
  keyword:    string;
  brandId?:   string;
  categoryId?: string;
  status?:    "active" | "inactive" | "";
}

export function useProducts(filters: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedKeyword = useDebounce(filters.keyword, 500);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ products: productList, pagination: newPagination }, { categories: categoryList }] = await Promise.all([
        getAdminProducts({
          page:      currentPage,
          limit:     20,
          search:    debouncedKeyword || undefined,
          brandId:   filters.brandId   || undefined,
          category:  filters.categoryId || undefined,
          status:    (filters.status as "active" | "inactive") || undefined,
        }),
        getAdminCategories({ limit: 9999 }),
      ]);
      setProducts(productList);
      setPagination(newPagination);
      setCategories(categoryList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedKeyword, filters.brandId, filters.categoryId, filters.status]);

  useEffect(() => { void load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedKeyword, filters.brandId, filters.categoryId, filters.status]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const categoryNameById = useMemo(
    () => categories.reduce<Record<string, string>>((acc, c) => { acc[c.id] = c.name; return acc; }, {}),
    [categories]
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const runMutation = useCallback(async <T,>(
    action: () => Promise<T>,
    onSuccess: (result: T) => void,
    fallbackError: string,
    successMessage?: string
  ): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await action();
      onSuccess(result);
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : fallbackError;
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitCreate = useCallback(async (values: ProductFormValues): Promise<boolean> => {
    return runMutation(
      () => createProduct(toProductPayload(values) as any),
      () => load(),
      "Tạo sản phẩm thất bại",
      "Sản phẩm đã được tạo thành công!"
    );
  }, [runMutation, load]);

  const submitUpdate = useCallback(async (id: string, values: ProductFormValues): Promise<boolean> => {
    return runMutation(
      () => updateProduct(id, toProductPayload(values) as any),
      (updated) => setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
      "Cập nhật sản phẩm thất bại",
      "Sản phẩm đã được cập nhật thành công!"
    );
  }, [runMutation]);

  const submitUpdateStatus = useCallback(async (id: string, isActive: boolean): Promise<boolean> => {
    return runMutation(
      () => updateProductStatus(id, isActive),
      (updated) => setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
      "Cập nhật trạng thái thất bại",
      "Trạng thái sản phẩm đã được thay đổi!"
    );
  }, [runMutation]);

  const submitDelete = useCallback(async (id: string): Promise<boolean> => {
    return runMutation(
      () => deleteProduct(id),
      () => load(),
      "Xóa sản phẩm thất bại",
      "Sản phẩm đã được xóa khỏi hệ thống!"
    );
  }, [runMutation, load]);

  return {
    products,
    categories,
    categoryNameById,
    pagination,
    currentPage,
    setCurrentPage,
    loading,
    submitting,
    error,
    submitCreate,
    submitUpdate,
    submitUpdateStatus,
    submitDelete,
    refresh: load,
    clearError: () => setError(null),
  };
}
