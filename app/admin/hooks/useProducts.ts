import { useMemo, useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "@/admin/services/product.service";
import { getAdminCategories } from "@/admin/services/category.service";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductFormValues } from "../components/products/ProductEditor";
import * as xlsx from "xlsx";
import { apiClient } from "@/lib/client";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { handleMutationError } from "@/lib/api-helper";

// ── Hook ───────────────────────────────────────────────────────────────────────
export interface ProductFilters {
  keyword: string;
  brandId?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "";
}

export function useProducts(filters: ProductFilters) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const debouncedKeyword = useDebounce(filters.keyword, 500);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedKeyword,
    filters.brandId,
    filters.categoryId,
    filters.status,
  ]);

  // 1. Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => getAdminCategories({ limit: 9999 }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const categories = categoriesData?.categories || [];

  const categoryNameById = useMemo(
    () =>
      categories.reduce<Record<string, string>>((acc, c) => {
        acc[c.id] = c.name;
        return acc;
      }, {}),
    [categories],
  );

  // 2. Fetch Products
  const queryParams = useMemo(
    () => ({
      search: debouncedKeyword || undefined,
      brandId: filters.brandId || undefined,
      category: filters.categoryId || undefined,
      status: filters.status || undefined,
      page: page,
      limit: 12,
    }),
    [
      debouncedKeyword,
      filters.brandId,
      filters.categoryId,
      filters.status,
      page,
    ],
  );

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: productsError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "products", queryParams],
    queryFn: () => getAdminProducts(queryParams),
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {
    limit: 12,
    total: 0,
    page: 1,
    totalPages: 1,
  };

  const error = productsError
    ? productsError instanceof Error
      ? productsError.message
      : "Unable to load data"
    : null;
  const loading = loadingProducts;

  // 3. Mutations
  const createMut = useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created successfully!");
    },
    onError: (err: any) => handleMutationError(err, "Failed to create product"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      updateProduct(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update product");
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateProductStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product status updated!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted from the system!");
    },
    onError: (err: any) => handleMutationError(err, "Failed to delete product"),
  });

  const submitting =
    createMut.isPending ||
    updateMut.isPending ||
    statusMut.isPending ||
    deleteMut.isPending;

  const submitCreate = async (values: ProductFormValues): Promise<boolean> => {
    try {
      await createMut.mutateAsync(values);
      return true;
    } catch {
      return false;
    }
  };

  const submitUpdate = async (
    id: string,
    values: ProductFormValues,
  ): Promise<boolean> => {
    try {
      await updateMut.mutateAsync({ id, values });
      return true;
    } catch {
      return false;
    }
  };

  const submitUpdateStatus = async (
    id: string,
    isActive: boolean,
  ): Promise<boolean> => {
    try {
      await statusMut.mutateAsync({ id, isActive });
      return true;
    } catch {
      return false;
    }
  };

  const submitDelete = async (id: string): Promise<boolean> => {
    try {
      await deleteMut.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const exportToExcel = async () => {
    try {
      // Fetch all products with current filters
      const allData = await getAdminProducts({
        ...queryParams,
        limit: 9999, // Fetch virtually all
      });

      const flatData: any[] = [];
      allData.products.forEach((p: any) => {
        if (!p.variants || p.variants.length === 0) {
          flatData.push({
            "Product ID": p.id,
            "Product Name": p.name,
            Slug: p.slug,
            "Brand": p.brandName || "",
            "Category":
              p.category?.name || categoryNameById[p.categoryId] || "",
            "Description": p.description || "",
            "Product Status": p.isActive ? "Active" : "Inactive",
            "Variant ID": "",
            "Variant Name": "Default",
            Barcode: "",
            "Price": 0,
            "Sale Price": 0,
            "Stock": 0,
            "Variant Status": "",
          });
        } else {
          p.variants.forEach((v: any) => {
            flatData.push({
              "Product ID": p.id,
              "Product Name": p.name,
              Slug: p.slug,
              "Brand": p.brandName || "",
              "Category":
                p.category?.name || categoryNameById[p.categoryId] || "",
              "Description": p.description || "",
              "Product Status": p.isActive ? "Active" : "Inactive",
              "Variant ID": v.id,
              "Variant Name": v.name,
              Barcode: v.barcode || v.sku || "",
              "Price": v.price,
              "Sale Price": v.discountPrice || "",
              "Stock": v.stock,
              "Variant Status": v.isActive ? "Active" : "Inactive",
            });
          });
        }
      });

      const worksheet = xlsx.utils.json_to_sheet(flatData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

      const fileName = `Export_Products_${new Date().toISOString().slice(0, 10)}.xlsx`;
      xlsx.writeFile(workbook, fileName);
      toast.success("Excel export successful!");
    } catch (err: any) {
      toast.error("Error exporting Excel file: " + err.message);
    }
  };

  const importFromExcel = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = xlsx.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);

          await apiClient.post("/products/admin/batch-import", {
            products: jsonData,
          });

          toast.success("Excel file imported successfully!");
          queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
          resolve();
        } catch (err: any) {
          toast.error("Error importing Excel file: " + err.message);
          reject(err);
        }
      };
      reader.onerror = (err) => {
        toast.error("Unable to read Excel file");
        reject(err);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return {
    products,
    categories,
    categoryNameById,
    pagination,
    page,
    setPage,
    loading,
    submitting,
    error,
    submitCreate,
    submitUpdate,
    submitUpdateStatus,
    submitDelete,
    exportToExcel,
    importFromExcel,
    refresh: refetch,
    clearError: () => {}, // No-op, managed by react-query
  };
}

export function useAdminProductsSelector(params: any, options: any) {
  return useQuery({
    queryKey: ["admin_products_selector", params],
    queryFn: () => getAdminProducts(params),
    enabled: options.enabled,
  });
}
