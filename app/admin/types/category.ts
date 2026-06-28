export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconUrl: string;
  bannerUrl: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  children?: Category[];
}

// Dùng cho Product (chỉ cần lấy các thông tin cơ bản của Category)
export type CategoryPreview = Pick<
  Category,
  "id" | "name" | "slug" | "imageUrl"
>;
