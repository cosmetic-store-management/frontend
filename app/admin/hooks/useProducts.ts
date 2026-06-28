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
import type { ProductFormValues } from "../components/ProductModal";
import * as xlsx from "xlsx";
import { apiClient } from "@/lib/client";

// ── Hook ───────────────────────────────────────────────────────────────────────
export interface ProductFilters {
  keyword: string;
  brandId?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "";
}

export function useProducts(filters: ProductFilters) {
  const queryClient = useQueryClient();
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;
  const debouncedKeyword = useDebounce(filters.keyword, 500);

  // Reset to first page when filters change
  useEffect(() => {
    {
      /* eslint-disable-next-line  */
    }
    setCursors([]);
  }, [debouncedKeyword, filters.brandId, filters.categoryId, filters.status]);

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
      cursor: currentCursor,
      limit: 20,
      search: debouncedKeyword || undefined,
      brandId: filters.brandId || undefined,
      category: filters.categoryId || undefined,
      status: (filters.status as "active" | "inactive") || undefined,
    }),
    [
      currentCursor,
      debouncedKeyword,
      filters.brandId,
      filters.categoryId,
      filters.status,
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
    limit: 20,
    total: 0,
    nextCursor: null,
    hasNextPage: false,
  };

  const handleNext = () => {
    if (pagination.nextCursor) {
      setCursors((prev) => [...prev, pagination.nextCursor!]);
    }
  };

  const handlePrev = () => {
    setCursors((prev) => prev.slice(0, -1));
  };

  const error = productsError
    ? productsError instanceof Error
      ? productsError.message
      : "Không thể tải dữ liệu"
    : null;
  const loading = loadingProducts;

  // 3. Mutations
  const createMut = useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Sản phẩm đã được tạo thành công!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Tạo sản phẩm thất bại");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      updateProduct(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Sản phẩm đã được cập nhật thành công!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật sản phẩm thất bại");
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateProductStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Trạng thái sản phẩm đã được thay đổi!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật trạng thái thất bại");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Sản phẩm đã được xóa khỏi hệ thống!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Xóa sản phẩm thất bại");
    },
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
            "ID Sản phẩm": p.id,
            "Tên sản phẩm": p.name,
            Slug: p.slug,
            "Thương hiệu": p.brandName || "",
            "Danh mục":
              p.category?.name || categoryNameById[p.categoryId] || "",
            "Mô tả": p.description || "",
            "Trạng thái (Sản phẩm)": p.isActive ? "Đang bán" : "Ngừng bán",
            "Biến thể ID": "",
            "Tên biến thể": "Mặc định",
            SKU: "",
            "Giá bán": 0,
            "Giá khuyến mãi": 0,
            "Tồn kho": 0,
            "Trạng thái (Biến thể)": "",
          });
        } else {
          p.variants.forEach((v: any) => {
            flatData.push({
              "ID Sản phẩm": p.id,
              "Tên sản phẩm": p.name,
              Slug: p.slug,
              "Thương hiệu": p.brandName || "",
              "Danh mục":
                p.category?.name || categoryNameById[p.categoryId] || "",
              "Mô tả": p.description || "",
              "Trạng thái (Sản phẩm)": p.isActive ? "Đang bán" : "Ngừng bán",
              "Biến thể ID": v.id,
              "Tên biến thể": v.name,
              SKU: v.sku,
              "Giá bán": v.price,
              "Giá khuyến mãi": v.discountPrice || "",
              "Tồn kho": v.stock,
              "Trạng thái (Biến thể)": v.isActive ? "Đang bán" : "Ngừng bán",
            });
          });
        }
      });

      const worksheet = xlsx.utils.json_to_sheet(flatData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

      const fileName = `Export_Products_${new Date().toISOString().slice(0, 10)}.xlsx`;
      xlsx.writeFile(workbook, fileName);
      toast.success("Xuất file Excel thành công!");
    } catch (err: any) {
      toast.error("Lỗi khi xuất file Excel: " + err.message);
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

          toast.success("Nhập file Excel thành công!");
          queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
          resolve();
        } catch (err: any) {
          toast.error("Lỗi khi nhập file Excel: " + err.message);
          reject(err);
        }
      };
      reader.onerror = (err) => {
        toast.error("Không thể đọc file Excel");
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
    cursors,
    handleNext,
    handlePrev,
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
