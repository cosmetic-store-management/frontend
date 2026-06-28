import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Star,
  Camera,
  X as XIcon,
  Filter,
  Plus,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePublicAuthStore } from "@/store";
import {
  useProductReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "../hooks/useReview";
import { uploadMedia } from "../services/review.service";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ── Constants ─────────────────────────────────────────────────────────────────
/** Nhãn mô tả từng mức sao để hiện trong UI */
const STAR_LABELS: Record<number, string> = {
  5: "Tuyệt vời",
  4: "Hài lòng",
  3: "Bình thường",
  2: "Không hài lòng",
  1: "Rất tệ",
};
/** Định dạng file ảnh được chấp nhận cho review */
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ACCEPTED_MEDIA_ACCEPT = ".jpg,.jpeg,.png,.webp,.mp4,.mov";
/** Lựa chọn filter đánh giá */
const FILTER_OPTIONS = [
  "Từ mới đến cũ",
  "Có hình ảnh",
  "5 sao",
  "4 sao",
  "3 sao",
  "2 sao",
  "1 sao",
] as const;

interface ProductReviewsProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const productId = product.id;
  const { user } = usePublicAuthStore();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("Từ mới đến cũ");

  const parsedFilterRating = filterOption.includes("sao")
    ? parseInt(filterOption.charAt(0))
    : undefined;
  const parsedHasImage = filterOption === "Có hình ảnh" ? true : undefined;

  const { data, isLoading } = useProductReviews(
    productId,
    page,
    5,
    parsedFilterRating,
    parsedHasImage,
  );
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalHoverRating, setModalHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const updateReview = useUpdateReview(productId);
  const deleteReview = useDeleteReview(productId);

  const [likedReviews, setLikedReviews] = useState<
    Record<string, "up" | "down">
  >({});
  const handleLike = (reviewId: string, type: "up" | "down") => {
    setLikedReviews((prev) => {
      const current = prev[reviewId];
      if (current === type) {
        const newState = { ...prev };
        delete newState[reviewId];
        return newState;
      }
      return { ...prev, [reviewId]: type };
    });
  };

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [viewImage, setViewImage] = useState<string | null>(null);

  const handleMediaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (val: File | null) => void,
    setPreview: (val: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh tối đa là 5MB");
        return;
      }
    } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Kích thước video tối đa là 20MB");
        return;
      }
    } else {
      toast.error("Vui lòng chọn file JPEG, PNG, WebP, MP4 hoặc MOV");
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao để đánh giá sản phẩm");
      return;
    }

    setIsUploading(true);
    let uploadedUrl = "";
    try {
      if (mediaFile) {
        const uploadRes = await uploadMedia(mediaFile);
        uploadedUrl = uploadRes.url;
      }
    } catch (err: any) {
      toast.error("Upload media thất bại: " + (err.message || "Unknown error"));
      setIsUploading(false);
      return;
    }

    const isVideo = mediaFile
      ? ACCEPTED_VIDEO_TYPES.includes(mediaFile.type)
      : false;

    createReview.mutate(
      {
        rating,
        comment,
        images: !isVideo && uploadedUrl ? [uploadedUrl] : [],
        videos: isVideo && uploadedUrl ? [uploadedUrl] : [],
      },
      {
        onSuccess: () => {
          toast.success("Đánh giá của bạn đã được gửi");
          setComment("");
          setMediaFile(null);
          setMediaPreviewUrl("");
          setRating(0);
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Có lỗi xảy ra");
        },
        onSettled: () => {
          setIsUploading(false);
        },
      },
    );
  };

  const handleUpdateSubmit = async (reviewId: string) => {
    updateReview.mutate(
      {
        reviewId,
        payload: {
          rating: editRating,
          comment: editComment,
          images: editImageUrl.trim() ? [editImageUrl.trim()] : [],
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật đánh giá");
          setEditingReviewId(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Cập nhật thất bại");
        },
      },
    );
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteReview.mutate(reviewId, {
        onSuccess: () => toast.success("Đã xóa đánh giá"),
        onError: (err: any) => toast.error(err.message || "Xóa thất bại"),
      });
    }
  };

  const stats = data?.stats;
  const reviews = data?.reviews || [];
  const averageRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;

  // Use actual rating counts from API, fallback to empty
  const ratingCounts = stats?.ratingCounts || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  return (
    <div className="bg-surface rounded-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between py-6 md:py-10 mt-4 md:px-12">
        {/* Left & Middle Group */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 w-full">
          {/* Left: Average Score */}
          <div className="flex flex-col items-center justify-center min-w-37.5 mb-6 md:mb-0">
            <div className="flex items-center gap-3">
              <Star className="w-12 h-12 fill-[#FACC15] text-[#FACC15]" />
              <span className="text-[42px] font-bold text-ink leading-none">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-[14px] text-ink-muted mt-2">
              {totalReviews} đánh giá
            </span>
          </div>

          {/* Middle: Rating Breakdown */}
          <div className="flex-1 max-w-100 mb-6 md:mb-0">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                ratingCounts[star as keyof typeof ratingCounts] || 0;
              const percent =
                totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-3 mb-2 last:mb-0"
                >
                  <div className="flex items-center gap-1 w-20">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= star ? "fill-[#FACC15] text-[#FACC15]" : "text-border stroke-[1.5px] fill-transparent"}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FACC15] rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-ink-muted min-w-5">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right: Write Review Button */}
        <div className="flex flex-col items-start justify-center min-w-62.5 md:pl-8 mt-6 md:mt-0">
          <span className="text-[14px] text-ink mb-3 font-medium">
            Đánh giá sản phẩm
          </span>
          <div
            className="flex items-center gap-2 mb-3 cursor-pointer"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverRating || rating);
              return (
                <div
                  key={star}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      e.currentTarget.click();
                  }}
                  aria-label={`Chọn ${star} sao`}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => {
                    setRating(star);
                    setIsModalOpen(true);
                  }}
                  className={`w-11 h-11 border rounded flex items-center justify-center transition-all duration-200 ${
                    isFilled
                      ? "bg-[#FACC15] border-[#FACC15]  transform scale-105"
                      : "border-border bg-surface hover:border-[#FACC15]"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isFilled ? "text-white fill-white" : "text-ink-muted"
                    }`}
                    strokeWidth={isFilled ? 0 : 1.5}
                  />
                </div>
              );
            })}
          </div>
          {reviews.length === 0 && (
            <span
              className="text-[13px] text-blue-500 cursor-pointer hover:underline"
              onClick={() => setIsModalOpen(true)}
            >
              Hãy là người đầu tiên đánh giá sản phẩm!
            </span>
          )}
        </div>
      </div>

      {/* Review List */}
      {totalReviews > 0 && (
        <>
          {/* Toolbar / Filters */}
          <div className="flex items-center mt-6 mb-4">
            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border border-border bg-surface hover:bg-surface-muted px-4 py-2 rounded-sm text-sm font-medium transition-colors">
                  <Filter className="w-4 h-4" /> Lọc đánh giá
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                avoidCollisions={false}
                className="w-64"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    className={`px-4 py-3 text-[14px] cursor-pointer ${filterOption === opt ? "bg-surface-muted font-semibold text-brand" : ""}`}
                    onClick={() => setFilterOption(opt)}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center text-ink-muted py-12 bg-surface-soft rounded-sm border border-border">
                Không có đánh giá nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-border py-6 first:pt-0 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-ink text-[15px]">
                        {review.userName}
                      </span>
                      <span className="text-[13px] text-ink-muted">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? "text-[#FACC15] fill-[#FACC15]" : "text-border fill-border"}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-[#0066CC] text-[13px]">
                      <button
                        onClick={() => handleLike(review.id, "up")}
                        className={`flex items-center gap-1.5 transition-opacity ${likedReviews[review.id] === "up" ? "opacity-100 font-bold" : "hover:opacity-80"}`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${likedReviews[review.id] === "up" ? "fill-current" : ""}`}
                        />{" "}
                        ({likedReviews[review.id] === "up" ? 1 : 0})
                      </button>
                      <button
                        onClick={() => handleLike(review.id, "down")}
                        className={`flex items-center gap-1.5 transition-opacity ${likedReviews[review.id] === "down" ? "opacity-100 font-bold" : "hover:opacity-80"}`}
                      >
                        <ThumbsDown
                          className={`w-4 h-4 ${likedReviews[review.id] === "down" ? "fill-current" : ""}`}
                        />{" "}
                        ({likedReviews[review.id] === "down" ? 1 : 0})
                      </button>
                    </div>

                    {editingReviewId === review.id ? (
                      <div className="mt-3 bg-surface-soft p-4 rounded-sm border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium text-ink-muted">
                            Chất lượng:
                          </span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${star <= editRating ? "text-[#FACC15] fill-[#FACC15]" : "text-border"}`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand mb-3 resize-none h-20"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            {mediaPreviewUrl ? (
                              <div className="relative inline-block mt-3">
                                {mediaFile &&
                                ACCEPTED_VIDEO_TYPES.includes(
                                  mediaFile.type,
                                ) ? (
                                  <video
                                    src={mediaPreviewUrl}
                                    className="h-20 object-cover rounded-sm border border-border"
                                  />
                                ) : (
                                  <img
                                    src={mediaPreviewUrl}
                                    alt="Preview"
                                    className="h-20 w-20 object-cover rounded-sm border border-border"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMediaPreviewUrl("");
                                    setMediaFile(null);
                                  }}
                                  className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-danger-dark transition-colors"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <input
                                  type="file"
                                  id="image-upload"
                                  accept={ACCEPTED_MEDIA_ACCEPT}
                                  onChange={(e) =>
                                    handleMediaChange(
                                      e,
                                      setMediaFile,
                                      setMediaPreviewUrl,
                                    )
                                  }
                                  className="hidden"
                                />
                                <label
                                  htmlFor="image-upload"
                                  className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-brand hover:text-brand transition-colors rounded-sm px-4 py-2 text-sm text-ink-muted bg-surface"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>Thêm hình ảnh / video</span>
                                </label>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="text-sm px-4 py-1.5 rounded-sm hover:bg-surface-muted transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleUpdateSubmit(review.id)}
                              disabled={updateReview.isPending}
                              className="btn-hover bg-brand text-white text-sm font-bold px-4 py-1.5 rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
                            >
                              {updateReview.isPending
                                ? "Đang lưu..."
                                : "Lưu thay đổi"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-ink text-[14px] leading-relaxed mb-3 break-words whitespace-pre-wrap">
                          {review.comment ||
                            "Người dùng không để lại bình luận."}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {review.images.map((img, idx) => (
                              <button
                                key={`img-${idx}`}
                                type="button"
                                onClick={() => setViewImage(img)}
                                className="h-20 w-20 overflow-hidden rounded-sm border border-border cursor-pointer hover:opacity-90 transition-opacity p-0"
                              >
                                <img
                                  src={img}
                                  alt={`Hình đính kèm ${idx + 1} của đánh giá`}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                        {review.videos && review.videos.length > 0 && (
                          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {review.videos.map((vid, idx) => (
                              <video
                                key={`vid-${idx}`}
                                src={vid}
                                controls
                                className="h-32 object-cover rounded-sm border border-border cursor-pointer"
                              >
                                <track kind="captions" />
                              </video>
                            ))}
                          </div>
                        )}

                        {review.adminReply && (
                          <div className="bg-brand/5 border-l-2 border-brand p-3 mt-4 rounded-sm">
                            <p className="text-[13px] text-ink leading-relaxed break-words whitespace-pre-wrap">
                              <span className="font-semibold text-brand mr-2">
                                Phản hồi từ Shop:
                              </span>
                              <span className="text-ink-muted">
                                {review.adminReply}
                              </span>
                            </p>
                          </div>
                        )}

                        {user && user.id === review.userId && (
                          <div className="flex gap-4 mt-3">
                            <button
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setEditRating(review.rating);
                                setEditComment(review.comment || "");
                                setEditImageUrl(review.images?.[0] || "");
                              }}
                              className="text-xs font-bold text-danger hover:underline"
                            >
                              Sửa đánh giá
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              disabled={deleteReview.isPending}
                              className="text-xs font-bold text-danger hover:underline disabled:opacity-50"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-6 border-t border-border pt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-sm flex items-center justify-center bg-[#f5f5f5] hover:bg-[#e0e0e0] text-ink disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(data.pagination.totalPages, page + 1))
                }
                disabled={page === data.pagination.totalPages}
                className="w-9 h-9 rounded-sm flex items-center justify-center bg-[#f5f5f5] hover:bg-[#e0e0e0] text-ink disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
      {/* Fullscreen Image Viewer */}
      {viewImage &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
            onClick={() => setViewImage(null)}
          >
            <div
              className="relative inline-flex max-w-[95vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewImage}
                alt="Full view"
                className="max-w-full max-h-[85vh] object-contain rounded-sm "
              />
              <button
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10000 text-white hover:text-brand bg-black/70 hover:bg-black border border-white/20 rounded-full transition-all p-1.5 "
                onClick={() => setViewImage(null)}
                title="Đóng"
              >
                <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* Review Write Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 bg-surface sm:rounded-sm border-border shadow-ui-card flex flex-col max-h-[90vh] overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-lg font-bold text-ink">
              Đánh giá sản phẩm
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="px-6 py-6 overflow-y-auto flex-1">
              {/* Product Info */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-32 h-32 flex items-center justify-center shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="font-bold text-ink text-center text-[16px] max-w-lg leading-snug">
                  {product.name}
                </div>
              </div>

              {/* Star Selection */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div
                  className="flex items-center gap-3 mb-4"
                  onMouseLeave={() => setModalHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (modalHoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setModalHoverRating(star)}
                        onClick={() => setRating(star)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 border rounded flex items-center justify-center transition-all duration-200 focus:outline-none hover:scale-105 ${
                          isFilled
                            ? "bg-[#FACC15] border-[#FACC15] "
                            : "border-border bg-surface hover:border-[#FACC15]"
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors duration-200 ${
                            isFilled
                              ? "text-white fill-white"
                              : "text-ink-muted"
                          }`}
                          strokeWidth={isFilled ? 0 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-ink font-medium text-[15px]">
                  {STAR_LABELS[modalHoverRating || rating] ??
                    "Vui lòng chọn đánh giá"}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-ink font-bold">
                    Viết đánh giá<span className="text-danger">*</span>
                  </span>
                  <span className="text-ink-muted text-sm">
                    {comment.length}/500 ký tự
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Hãy chia sẻ đánh giá của bạn về sản phẩm"
                  className="w-full bg-surface border border-border rounded-sm p-4 text-[15px] focus:outline-none focus:border-brand resize-none h-32 placeholder:text-ink-muted/60"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <span className="text-ink font-bold text-[15px] block">
                  Hình ảnh / Video đánh giá{" "}
                  <span className="text-ink-muted font-normal text-[13px]">
                    (định dạng .jpg, .jpeg, .png, .mp4, .mov)
                  </span>
                </span>
                <div className="pt-2">
                  {mediaPreviewUrl ? (
                    <div className="relative inline-block group mt-3">
                      {mediaFile &&
                      ACCEPTED_VIDEO_TYPES.includes(mediaFile.type) ? (
                        <video
                          src={mediaPreviewUrl}
                          className="h-21 w-21 object-cover rounded-sm border border-border"
                        />
                      ) : (
                        <img
                          src={mediaPreviewUrl}
                          alt="Preview"
                          className="h-21 w-21 object-cover rounded-sm border border-border"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPreviewUrl("");
                            setMediaFile(null);
                          }}
                          className="bg-danger text-white rounded-sm p-1.5 "
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="review-image-modal-upload"
                        accept={ACCEPTED_MEDIA_ACCEPT}
                        onChange={(e) =>
                          handleMediaChange(e, setMediaFile, setMediaPreviewUrl)
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor="review-image-modal-upload"
                        className="inline-flex items-center justify-center w-21 h-21 cursor-pointer border-[1.5px] border-dashed border-[#C81D25] hover:bg-[#C81D25]/5 transition-all text-[#C81D25]"
                      >
                        <Plus className="w-6 h-6 stroke-[2.5px]" />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-5 border-t border-border bg-surface flex gap-4 sm:justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-2.5 border border-border bg-surface text-ink font-semibold rounded-sm hover:bg-surface-muted transition-colors text-[15px]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createReview.isPending || isUploading}
                className="px-10 py-2.5 bg-[#C81D25] text-white font-semibold rounded-sm hover:bg-[#A5151E] transition-colors  disabled:opacity-50 text-[15px]"
              >
                {createReview.isPending || isUploading
                  ? "Đang gửi..."
                  : "Gửi đánh giá"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
