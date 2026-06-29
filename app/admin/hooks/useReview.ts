import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReviews,
  deleteReview,
  replyReview,
} from "../services/review.service";
import { handleMutationError } from "@/lib/api-helper";

export function useAdminReviews() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterReplied, setFilterReplied] = useState<string>("all");
  const [filterProductName, setFilterProductName] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Fetch Reviews
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      rating: filterRating,
      isReplied: filterReplied,
      productName: filterProductName,
    }),
    [page, filterRating, filterReplied, filterProductName],
  );

  // Reset page when filter changes
  useMemo(() => {
    setPage(1);
  }, [filterRating, filterReplied, filterProductName]);

  const {
    data: reviewsData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "reviews", queryParams],
    queryFn: () =>
      getAdminReviews(
        queryParams.page,
        queryParams.limit,
        queryParams.rating,
        queryParams.isReplied,
        queryParams.productName,
      ),
  });

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination || {
    limit: 10,
    total: 0,
    page: 1,
    totalPages: 1,
  };

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Lỗi khi lấy danh sách đánh giá"
    : null;

  // 2. Mutations
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (err: any) => {
      setSubmitError(err.message || "Lỗi khi xóa đánh giá");
      handleMutationError(err, "Failed to delete review");
    },
  });

  const replyMut = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      replyReview(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (err: any) => {
      setSubmitError(err.message || "Lỗi khi phản hồi đánh giá");
      handleMutationError(err, "Failed to reply to review");
    },
  });

  const isDeleting = deleteMut.isPending;
  const isReplying = replyMut.isPending;

  const submitDelete = async (id: string) => {
    setSubmitError(null);
    try {
      await deleteMut.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const submitReply = async (id: string, text?: string) => {
    setSubmitError(null);
    try {
      await replyMut.mutateAsync({ id, text: text || "" });
      return true;
    } catch {
      return false;
    }
  };

  return {
    reviews,
    pagination,
    page,
    setPage,
    filterRating,
    setFilterRating,
    filterReplied,
    setFilterReplied,
    filterProductName,
    setFilterProductName,
    loading,
    error,
    isDeleting,
    isReplying,
    submitError,
    submitDelete,
    submitReply,
    clearError: () => setSubmitError(null),
    refresh: refetch,
  };
}
