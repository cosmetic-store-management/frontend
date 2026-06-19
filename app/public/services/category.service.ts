import { apiClient } from "@/lib/client";
import type { Category } from "@/admin/types/category";

export function getCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories");
}
