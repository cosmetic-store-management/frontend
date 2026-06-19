import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductReviews, createReview, updateReview, deleteReview, CreateReviewPayload } from "../services/review.service";
import { QK } from "@/lib/queryKeys";

export const useProductReviews = (productId: string, page = 1, limit = 5, rating?: number, hasImage?: boolean) => {
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
    },
  });
};

export const useUpdateReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: { rating: number; comment?: string; images?: string[] } }) => 
      updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });
};

export const useDeleteReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => 
      deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });
};
