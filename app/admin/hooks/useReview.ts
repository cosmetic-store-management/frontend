import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReviews,
  deleteReview,
  replyReview,
} from "../services/review.service";

export function useAdminReviews() {
  const queryClient = useQueryClient();
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterReplied, setFilterReplied] = useState<string>("all");
  const [filterProductName, setFilterProductName] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Fetch Reviews
  const queryParams = useMemo(
    () => ({
      cursor: currentCursor,
      limit: 10,
      rating: filterRating,
      isReplied: filterReplied,
      productName: filterProductName,
    }),
    [currentCursor, filterRating, filterReplied, filterProductName],
  );

  // Reset cursors when filter changes
  useMemo(() => {
    setCursors([]);
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
        queryParams.cursor,
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
    cursors,
    handleNext,
    handlePrev,
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
