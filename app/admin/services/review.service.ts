import { apiClient } from "@/lib/client";

export interface ReviewAdmin {
  id:           string;
  userId:       string | null;
  userName:     string;
  userAvatar?:  string;
  productId:    string | null;
  productName:  string;
  productSlug?: string;
  rating:       number;
  comment:      string;
  images?:      string[];   // review images uploaded by customer
  adminReply?:  string;
  createdAt:    string;
}

export interface ReviewListResult {
  reviews: ReviewAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getAdminReviews(page = 1, limit = 10, rating?: string, isReplied?: string, productName?: string): Promise<ReviewListResult> {
  const params: any = { page, limit };
  if (rating && rating !== "all") params.rating = rating;
  if (isReplied && isReplied !== "all") params.isReplied = isReplied;
  if (productName && productName.trim() !== "") params.productName = productName.trim();
  return apiClient.get<ReviewListResult>("/reviews/admin/list", params);
}

export function deleteReview(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/reviews/admin/${id}`);
}

export function replyReview(id: string, replyText: string): Promise<{ message: string, review: ReviewAdmin }> {
  return apiClient.patch<{ message: string, review: ReviewAdmin }>(`/reviews/admin/${id}/reply`, { replyText });
}
