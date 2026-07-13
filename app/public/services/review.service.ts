import { apiClient } from "@/lib/client";

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string;
  images?: string[];
  videos?: string[];
  variantName?: string;
  likesCount: number;
  dislikesCount: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  adminReply?: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts?: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface GetReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
  videos?: string[];
}

export const getProductReviews = async (
  productId: string,
  page = 1,
  limit = 5,
  rating?: number,
  hasImage?: boolean,
) => {
  let url = `/reviews/product/${productId}?page=${page}&limit=${limit}`;
  if (rating) url += `&rating=${rating}`;
  if (hasImage) url += `&hasImage=true`;
  return apiClient.get<GetReviewsResponse>(url);
};

export const createReview = async (payload: CreateReviewPayload) => {
  return apiClient.post<{ message: string; review: Review }>(
    "/reviews",
    payload,
  );
};

export const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<{ message: string; url: string }>(
    "/upload/media",
    formData,
  );
};

export const updateReview = async (
  reviewId: string,
  payload: { rating: number; comment?: string; images?: string[] },
) => {
  return apiClient.patch<{ message: string; review: Review }>(
    `/reviews/${reviewId}`,
    payload,
  );
};

export const deleteReview = async (reviewId: string) => {
  return apiClient.delete<{ message: string }>(`/reviews/${reviewId}`);
};

export interface ReviewEligibilityResponse {
  canReview: boolean;
  reason?: "not_purchased" | "already_reviewed";
  variantName?: string;
}

export const checkReviewEligibility = async (productId: string) => {
  return apiClient.get<ReviewEligibilityResponse>(`/reviews/eligibility/${productId}`);
};

export interface VoteResponse {
  message: string;
  likesCount: number;
  dislikesCount: number;
}

export const likeReview = async (reviewId: string) => {
  return apiClient.post<VoteResponse>(`/reviews/${reviewId}/like`);
};

export const dislikeReview = async (reviewId: string) => {
  return apiClient.post<VoteResponse>(`/reviews/${reviewId}/dislike`);
};
