import { useState, useCallback, useEffect } from "react";
import { getAdminReviews, deleteReview, replyReview, type ReviewAdmin } from "../services/review.service";

export function useAdminReviews() {
  const [reviews, setReviews] = useState<ReviewAdmin[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterReplied, setFilterReplied] = useState<string>("all");
  const [filterProductName, setFilterProductName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (page: number, rating: string, isReplied: string, productName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReviews(page, 10, rating, isReplied, productName);
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "Lỗi khi lấy danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch automatically if not typing in search box, or we could debounce it in the component.
    // For simplicity, we'll fetch on change, but maybe debounce it in ReviewPage.tsx or handle via a search button.
    fetchReviews(currentPage, filterRating, filterReplied, filterProductName);
  }, [fetchReviews, currentPage, filterRating, filterReplied, filterProductName]);

  const submitDelete = async (id: string) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await deleteReview(id);
      await fetchReviews(currentPage, filterRating, filterReplied, filterProductName);
      return true;
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi khi xóa đánh giá");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (id: string, text: string) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await replyReview(id, text);
      await fetchReviews(currentPage, filterRating, filterReplied, filterProductName);
      return true;
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi khi phản hồi đánh giá");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviews,
    pagination,
    currentPage,
    setCurrentPage,
    filterRating,
    setFilterRating,
    filterReplied,
    setFilterReplied,
    filterProductName,
    setFilterProductName,
    loading,
    error,
    submitting,
    submitError,
    submitDelete,
    submitReply,
    clearError: () => setSubmitError(null),
    refresh: () => fetchReviews(currentPage, filterRating, filterReplied, filterProductName),
  };
}
