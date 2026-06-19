import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Trash2, MessageCircleReply, Loader2 } from "lucide-react";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/ui/delete-modal";
import { Pagination } from "@/components/ui/pagination";
import { useAdminReviews } from "../hooks/useReview";
import type { ReviewAdmin } from "../services/review.service";
import { replyReviewSchema, type ReplyReviewFormData } from "../schemas/review.schema";

export function ReviewPage() {
  const {
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
    submitting,
    submitError,
    submitDelete,
    submitReply,
    clearError,
  } = useAdminReviews();

  const [deleteModal, setDeleteModal] = useState<ReviewAdmin | null>(null);
  const [replyModal, setReplyModal] = useState<ReviewAdmin | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyReviewFormData>({
    resolver: zodResolver(replyReviewSchema),
    defaultValues: { replyText: "" },
  });

  const onSubmitReply = async (data: ReplyReviewFormData) => {
    if (!replyModal) return;
    const success = await submitReply(replyModal.id, data.replyText);
    if (success) {
      setReplyModal(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const success = await submitDelete(deleteModal.id);
    if (success) {
      setDeleteModal(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating ? "text-warning fill-warning" : "text-border fill-surface-soft"
        }`}
      />
    ));
  };

  return (
    <section className="space-y-4 animate-page-enter">
      <div className="space-y-4 border border-border bg-surface p-4 shadow-ui-soft sm:p-5 rounded-sm">
        <CardHeader className="space-y-4 p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
                Quản lý đánh giá
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-ink-muted">
                Xem và kiểm duyệt các đánh giá từ khách hàng về sản phẩm. Bạn có thể xóa các đánh giá spam hoặc vi phạm tiêu chuẩn cộng đồng.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="space-y-1.5 flex-1 sm:max-w-xs">
              <label className="text-xs font-semibold text-ink">Tìm theo sản phẩm</label>
              <input 
                type="text"
                placeholder="Nhập tên sản phẩm..."
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                value={filterProductName}
                onChange={(e) => { setFilterProductName(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="space-y-1.5 flex-1 sm:max-w-xs">
              <label className="text-xs font-semibold text-ink">Lọc theo số sao</label>
              <select 
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                value={filterRating}
                onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả sao</option>
                <option value="5">5 Sao</option>
                <option value="4">4 Sao</option>
                <option value="3">3 Sao</option>
                <option value="2">2 Sao</option>
                <option value="1">1 Sao</option>
              </select>
            </div>
            <div className="space-y-1.5 flex-1 sm:max-w-xs">
              <label className="text-xs font-semibold text-ink">Trạng thái phản hồi</label>
              <select 
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                value={filterReplied}
                onChange={(e) => { setFilterReplied(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="false">Chưa phản hồi</option>
                <option value="true">Đã phản hồi</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </div>

      <div className="border border-border bg-surface rounded-sm shadow-ui-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-fixed text-[13px] sm:text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-ink-muted border-b border-border">
                  <th style={{ width: "20%" }} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide">Người đánh giá</th>
                  <th style={{ width: "25%" }} className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide">Sản phẩm</th>
                  <th style={{ width: "12%" }} className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide">Điểm số</th>
                  <th style={{ width: "35%" }} className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide">Nội dung</th>
                  <th style={{ width: "8%" }} className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-surface">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-muted">Đang tải dữ liệu đánh giá...</td>
                  </tr>
                )}
                {!loading && reviews.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-surface-soft">
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center overflow-hidden shrink-0">
                          {item.userAvatar ? (
                            <img src={item.userAvatar} alt={item.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-ink-muted">{item.userName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate" title={item.userName}>{item.userName}</p>
                          <p className="text-[10px] text-ink-muted">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle">
                      <a 
                        href={`/product/${item.productSlug || item.productId}`} // Fallback to id if slug is missing
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-brand font-medium hover:underline" 
                        title={`Xem sản phẩm: ${item.productName}`}
                      >
                        {item.productName}
                      </a>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle">
                      <div className="flex gap-0.5">
                        {renderStars(item.rating)}
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle">
                      <p className="text-ink line-clamp-2 text-xs mb-1" title={item.comment}>
                        {item.comment || "Không có bình luận."}
                      </p>
                      
                      {item.images && item.images.length > 0 && (
                        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                          {item.images.map((img, idx) => (
                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="block shrink-0">
                              <img src={img} alt="Review attachment" className="h-12 w-12 object-cover rounded border border-border" />
                            </a>
                          ))}
                        </div>
                      )}

                      {item.adminReply && (
                        <div className="bg-surface-soft border-l-2 border-brand pl-2 py-1 mt-2">
                          <p className="text-[10px] text-ink-muted font-semibold">Phản hồi của Shop:</p>
                          <p className="text-xs text-ink-muted line-clamp-2" title={item.adminReply}>{item.adminReply}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right align-middle">
                      <button
                        type="button"
                        title="Phản hồi đánh giá"
                        onClick={() => { clearError(); reset({ replyText: item.adminReply || "" }); setReplyModal(item); }}
                        className="rounded p-1.5 text-brand transition-colors hover:bg-surface-soft inline-flex mr-1"
                      >
                        <MessageCircleReply className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Xóa đánh giá"
                        onClick={() => { clearError(); setDeleteModal(item); }}
                        className="rounded p-1.5 text-ink-muted transition-colors hover:bg-surface-soft hover:text-danger inline-flex"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && reviews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-muted">Chưa có đánh giá nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </div>

      <DeleteModal
        open={deleteModal !== null}
        title="Xóa đánh giá"
        description="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        confirmText="Xác nhận xóa"
        loading={submitting}
        submitError={submitError}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
      />

      {/* Reply Modal */}
      <Dialog open={replyModal !== null} onOpenChange={(o) => !o && setReplyModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pr-6">
            <DialogTitle>Phản hồi Đánh giá</DialogTitle>
            <DialogDescription>
              Soạn nội dung phản hồi của cửa hàng. Phản hồi này sẽ hiển thị công khai trên trang sản phẩm.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitReply)} className="space-y-4 mt-2">
            {submitError && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-md">
                {submitError}
              </div>
            )}
            
            <div className="bg-surface-soft p-3 rounded-md border border-border/50 text-sm">
              <p className="font-semibold text-ink">{replyModal?.userName}</p>
              <div className="flex gap-0.5 my-1">
                {replyModal && renderStars(replyModal.rating)}
              </div>
              <p className="text-ink-muted text-xs italic">"{replyModal?.comment || 'Không có bình luận'}"</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="replyText" className="text-sm font-semibold text-ink">Nội dung phản hồi <span className="text-danger">*</span></label>
              <Controller control={control} name="replyText" render={({ field }) => (
                <textarea
                  {...field}
                  id="replyText"
                  rows={4}
                  placeholder="Nhập nội dung phản hồi (VD: Cảm ơn bạn đã ủng hộ...)"
                  className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              )} />
              {errors.replyText && <p className="text-xs text-danger">{errors.replyText.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReplyModal(null)}>Huỷ</Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
                ) : (
                  "Gửi phản hồi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
