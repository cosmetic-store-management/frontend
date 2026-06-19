import { apiClient } from "@/lib/client";
import type { Category } from "@/admin/types/category";

// ── Public ────────────────────────────────────────────────────────────────────

export function getCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories");
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminCategoryQuery {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface CategoryListResult {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getAdminCategories(query: AdminCategoryQuery = {}): Promise<CategoryListResult> {
  return apiClient.get<CategoryListResult>("/categories/admin/list", query as Record<string, string | number | boolean>);
}

export function createCategory(data: Omit<Category, "id" | "slug">): Promise<Category> {
  return apiClient.post<{ category: Category }>("/categories/admin", data)
    .then((res) => res.category);
}

export function updateCategory(id: string, data: Partial<Omit<Category, "id" | "slug">>): Promise<Category> {
  return apiClient.patch<{ category: Category }>(`/categories/admin/${id}`, data)
    .then((res) => res.category);
}

export function updateCategoryStatus(id: string, isActive: boolean): Promise<Category> {
  return apiClient.patch<{ category: Category }>(`/categories/admin/${id}/status`, { isActive })
    .then((res) => res.category);
}

export function deleteCategory(id: string): Promise<void> {
  return apiClient.delete(`/categories/admin/${id}`);
}
