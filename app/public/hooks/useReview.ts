import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  uploadMedia,
  CreateReviewPayload,
  checkReviewEligibility,
  likeReview,
  dislikeReview,
} from "../services/review.service";
import { handleMutationError } from "@/lib/api-helper";
import { QK } from "@/lib/queryKeys";

export const useProductReviews = (
  productId: string,
  page = 1,
  limit = 5,
  rating?: number,
  hasImage?: boolean,
) => {
  return useQuery({
    queryKey: QK.reviews(productId, { page, limit, rating, hasImage }),
    queryFn: () => getProductReviews(productId, page, limit, rating, hasImage),
    enabled: !!productId,
  });
};

export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateReviewPayload, "productId">) =>
      createReview({ ...payload, productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useUpdateReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: { rating: number; comment?: string; images?: string[] };
    }) => updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};

export const useDeleteReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (err) => handleMutationError(err, "Failed to delete review"),
  });
};

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: (file: File) => uploadMedia(file),
    onError: (err) => handleMutationError(err, "Failed to upload media"),
  });
};

export const useReviewEligibility = (productId: string, isLoggedIn: boolean) => {
  return useQuery({
    queryKey: ["review-eligibility", productId],
    queryFn: () => checkReviewEligibility(productId),
    enabled: !!productId && isLoggedIn,
  });
};

export const useLikeReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => likeReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (err) => handleMutationError(err, "Không thể thích đánh giá"),
  });
};

export const useDislikeReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => dislikeReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (err) => handleMutationError(err, "Không thể đánh giá không thích"),
  });
};
