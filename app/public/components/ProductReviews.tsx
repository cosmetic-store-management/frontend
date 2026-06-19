import { useState } from "react";
import { createPortal } from "react-dom";
import { Star, MessageSquare, Camera, X as XIcon, Filter, Plus, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicAuthStore } from "@/store";
import { useProductReviews, useCreateReview, useUpdateReview, useDeleteReview } from "../hooks/useReview";
import { toast } from "@/lib/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function ProductReviews({ product }: { product: any }) {
  const productId = product.id;
  const { user } = usePublicAuthStore();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("Từ mới đến cũ");
  
  const parsedFilterRating = filterOption.includes("sao") ? parseInt(filterOption.charAt(0)) : undefined;
  const parsedHasImage = filterOption === "Có hình ảnh" ? true : undefined;
  
  const { data, isLoading } = useProductReviews(productId, page, 5, parsedFilterRating, parsedHasImage);
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalHoverRating, setModalHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const updateReview = useUpdateReview(productId);
  const deleteReview = useDeleteReview(productId);
  
  const [likedReviews, setLikedReviews] = useState<Record<string, 'up' | 'down'>>({});
  const handleLike = (reviewId: string, type: 'up' | 'down') => {
    setLikedReviews(prev => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setImg: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImg(reader.result as string);
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
    
    createReview.mutate(
      { rating, comment, images: imageUrl.trim() ? [imageUrl.trim()] : [] },
      {
        onSuccess: () => {
          toast.success("Đánh giá của bạn đã được gửi");
          setComment("");
          setImageUrl("");
          setRating(0);
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Có lỗi xảy ra");
        }
      }
    );
  };

  const handleUpdateSubmit = async (reviewId: string) => {
    updateReview.mutate(
      { reviewId, payload: { rating: editRating, comment: editComment, images: editImageUrl.trim() ? [editImageUrl.trim()] : [] } },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật đánh giá");
          setEditingReviewId(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Cập nhật thất bại");
        }
      }
    );
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteReview.mutate(reviewId, {
        onSuccess: () => toast.success("Đã xóa đánh giá"),
        onError: (err: any) => toast.error(err.message || "Xóa thất bại")
      });
    }
  };

  const openReviewModal = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }
    const hasReviewed = reviews.some(r => r.userId === user.id);
    if (hasReviewed) {
      toast.error("Bạn đã đánh giá sản phẩm này rồi!");
      return;
    }
    setRating(0);
    setComment("");
    setImageUrl("");
    setIsModalOpen(true);
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
          <div className="flex flex-col items-center justify-center min-w-[150px] mb-6 md:mb-0">
            <div className="flex items-center gap-3">
              <Star className="w-12 h-12 fill-[#FACC15] text-[#FACC15]" />
              <span className="text-[42px] font-bold text-ink leading-none">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-[14px] text-ink-muted mt-2">{totalReviews} đánh giá</span>
          </div>

          {/* Middle: Rating Breakdown */}
          <div className="flex-1 max-w-[400px] mb-6 md:mb-0">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as keyof typeof ratingCounts] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div className="flex items-center gap-1 w-[80px]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= star ? 'fill-[#FACC15] text-[#FACC15]' : 'text-border stroke-[1.5px] fill-transparent'}`} 
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FACC15] rounded-full" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-ink-muted min-w-[20px]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right: Write Review Button */}
        <div className="flex flex-col items-start justify-center min-w-[250px] md:pl-8 mt-6 md:mt-0">
          <span className="text-[14px] text-ink mb-3 font-medium">Đánh giá sản phẩm</span>
          <div 
            className="flex items-center gap-2 mb-3 cursor-pointer" 
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverRating || rating);
              return (
                <div 
                  key={star} 
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => { setRating(star); setIsModalOpen(true); }}
                  className={`w-11 h-11 border rounded flex items-center justify-center transition-all duration-200 ${
                    isFilled 
                      ? 'bg-[#FACC15] border-[#FACC15] shadow-sm transform scale-105' 
                      : 'border-border bg-surface hover:border-[#FACC15]'
                  }`}
                >
                  <Star 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isFilled 
                        ? 'text-white fill-white' 
                        : 'text-ink-muted'
                    }`} 
                    strokeWidth={isFilled ? 0 : 1.5} 
                  />
                </div>
              );
            })}
          </div>
          {reviews.length === 0 && (
            <span className="text-[13px] text-blue-500 cursor-pointer hover:underline" onClick={() => setIsModalOpen(true)}>
              Hãy là người đầu tiên đánh giá sản phẩm!
            </span>
          )}
        </div>
      </div>

      {/* Review List */}
      {totalReviews > 0 && (
        <>
          {/* Toolbar / Filters */}
          <div className="flex items-center mt-6 mb-4 relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 border border-border bg-surface hover:bg-surface-muted px-4 py-2 rounded-sm text-sm font-medium transition-colors"
            >
              <Filter className="w-4 h-4" /> Lọc đánh giá
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border shadow-ui-card rounded-sm z-10 py-2">
                {['Từ mới đến cũ', 'Có hình ảnh', '5 sao', '4 sao', '3 sao', '2 sao', '1 sao'].map((opt) => (
                  <button 
                    key={opt}
                    className={`w-full text-left px-4 py-3 text-[14px] transition-colors ${filterOption === opt ? 'bg-surface-muted font-semibold text-ink' : 'text-ink hover:bg-surface-soft'}`}
                    onClick={() => { setFilterOption(opt); setIsFilterOpen(false); }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
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
            <div key={review.id} className="border-b border-border py-6 first:pt-0 last:border-b-0">
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-ink text-[15px]">{review.userName}</span>
                  <span className="text-[13px] text-ink-muted">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= review.rating ? 'text-[#FACC15] fill-[#FACC15]' : 'text-border fill-border'}`} 
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-4 text-[#0066CC] text-[13px]">
                  <button 
                    onClick={() => handleLike(review.id, 'up')}
                    className={`flex items-center gap-1.5 transition-opacity ${likedReviews[review.id] === 'up' ? 'opacity-100 font-bold' : 'hover:opacity-80'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${likedReviews[review.id] === 'up' ? 'fill-current' : ''}`} /> ({likedReviews[review.id] === 'up' ? 1 : 0})
                  </button>
                  <button 
                    onClick={() => handleLike(review.id, 'down')}
                    className={`flex items-center gap-1.5 transition-opacity ${likedReviews[review.id] === 'down' ? 'opacity-100 font-bold' : 'hover:opacity-80'}`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${likedReviews[review.id] === 'down' ? 'fill-current' : ''}`} /> ({likedReviews[review.id] === 'down' ? 1 : 0})
                  </button>
                </div>

                  {editingReviewId === review.id ? (
                    <div className="mt-3 bg-surface-soft p-4 rounded-sm border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-ink-muted">Chất lượng:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-5 h-5 transition-colors ${star <= editRating ? 'text-[#FACC15] fill-[#FACC15]' : 'text-border'}`} 
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
                          {editImageUrl ? (
                            <div className="relative inline-block">
                              <img src={editImageUrl} alt="Preview" className="h-12 w-12 object-cover rounded-sm border border-border" />
                              <button
                                type="button"
                                onClick={() => setEditImageUrl("")}
                                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-danger-dark transition-colors"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <input 
                                type="file" 
                                id={`edit-image-upload-${review.id}`}
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, setEditImageUrl)} 
                                className="hidden"
                              />
                              <label 
                                htmlFor={`edit-image-upload-${review.id}`}
                                className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-brand hover:text-brand transition-colors rounded-sm px-3 py-1.5 text-xs text-ink-muted bg-surface"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Thêm hình ảnh</span>
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
                            {updateReview.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-ink text-[14px] leading-relaxed mb-3 break-words whitespace-pre-wrap">
                        {review.comment || "Người dùng không để lại bình luận."}
                      </p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                          {review.images.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt="Review image" 
                              className="h-20 w-20 object-cover rounded-sm border border-border cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => setViewImage(img)}
                            />
                          ))}
                        </div>
                      )}

                      {review.adminReply && (
                        <div className="bg-[#F0F8FF] p-4 mt-4 rounded-sm">
                          <p className="text-[14px] text-ink leading-relaxed break-words whitespace-pre-wrap">
                            <span className="font-bold mr-2">THẾ GIỚI SKINFOOD</span>
                            {review.adminReply}
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
              onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
              disabled={page === data.pagination.totalPages}
              className="w-9 h-9 rounded-sm flex items-center justify-center bg-[#f5f5f5] hover:bg-[#e0e0e0] text-ink disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      </>
      )}

      {/* Fullscreen Image Viewer */}
      {viewImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setViewImage(null)}
        >
          <div className="relative inline-flex max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={viewImage} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl" />
            <button 
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-[10000] text-white hover:text-brand bg-black/70 hover:bg-black border border-white/20 rounded-full transition-all p-1.5 shadow-lg"
              onClick={() => setViewImage(null)}
              title="Đóng"
            >
              <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Review Write Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 bg-surface sm:rounded-md border-border shadow-ui-card flex flex-col max-h-[90vh] overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-lg font-bold text-ink">Đánh giá sản phẩm</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 py-6 overflow-y-auto flex-1">
              {/* Product Info */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-32 h-32 flex items-center justify-center shrink-0">
                  <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="font-bold text-ink text-center text-[16px] max-w-lg leading-snug">{product.name}</div>
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
                            ? 'bg-[#FACC15] border-[#FACC15] shadow-sm' 
                            : 'border-border bg-surface hover:border-[#FACC15]'
                        }`}
                      >
                        <Star 
                          className={`w-6 h-6 transition-colors duration-200 ${
                            isFilled 
                              ? 'text-white fill-white' 
                              : 'text-ink-muted'
                          }`} 
                          strokeWidth={isFilled ? 0 : 1.5} 
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-ink font-medium text-[15px]">
                  {(modalHoverRating || rating) === 5 ? "Tuyệt vời" : (modalHoverRating || rating) === 4 ? "Hài lòng" : (modalHoverRating || rating) === 3 ? "Bình thường" : (modalHoverRating || rating) === 2 ? "Không hài lòng" : (modalHoverRating || rating) === 1 ? "Rất tệ" : "Vui lòng chọn đánh giá"}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-ink font-bold">Viết đánh giá<span className="text-danger">*</span></span>
                  <span className="text-ink-muted text-sm">{comment.length}/500 ký tự</span>
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
                <span className="text-ink font-bold text-[15px] block">Hình ảnh đánh giá <span className="text-ink-muted font-normal text-[13px]">(định dạng .jpg, .jpeg, .png)</span></span>
                <div className="pt-2">
                  {imageUrl ? (
                    <div className="relative inline-block group">
                      <img src={imageUrl} alt="Preview" className="h-[84px] w-[84px] object-cover rounded-sm border border-border" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="bg-danger text-white rounded-sm p-1.5 shadow-sm"
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
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setImageUrl)} 
                        className="hidden"
                      />
                      <label 
                        htmlFor="review-image-modal-upload"
                        className="inline-flex items-center justify-center w-[84px] h-[84px] cursor-pointer border-[1.5px] border-dashed border-[#C81D25] hover:bg-[#C81D25]/5 transition-all text-[#C81D25]"
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
                disabled={createReview.isPending}
                className="px-10 py-2.5 bg-[#C81D25] text-white font-semibold rounded-sm hover:bg-[#A5151E] transition-colors shadow-sm disabled:opacity-50 text-[15px]"
              >
                {createReview.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
