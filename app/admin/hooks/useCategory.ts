import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "@/admin/services/category.service";
import type { AdminCategoryQuery } from "@/admin/services/category.service";
import type { Category } from "@/admin/types/category";

const KEYS = {
  list: (query: AdminCategoryQuery) => ["admin", "categories", query] as const,
};

export function useCategories(query: AdminCategoryQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () => getAdminCategories(query),
  });
}

// Dùng riêng cho parent dropdown — load toàn bộ, không phân trang
export function useAllCategories() {
  return useQuery({
    queryKey: ["admin", "categories", "all"] as const,
    queryFn: () => getAdminCategories({ limit: 999 }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, "id" | "slug">) => createCategory(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Category, "id" | "slug">>;
    }) => updateCategory(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useUpdateCategoryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCategoryStatus(id, isActive),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}
