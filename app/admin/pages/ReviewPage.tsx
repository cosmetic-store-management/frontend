import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Star,
  Trash2,
  MessageCircleReply,
  Loader2,
  Search,
  X,
  MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PageHeader } from "../components/common/PageHeader";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/ui/delete-modal";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminReviews } from "../hooks/useReview";
import type { ReviewAdmin } from "../services/review.service";
import {
  replyReviewSchema,
  type ReplyReviewFormData,
} from "../schemas/review.schema";

export function ReviewPage() {
  const {
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
    isDeleting,
    isReplying,
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
          i < rating
            ? "text-warning fill-warning"
            : "text-border fill-surface-soft"
        }`}
      />
    ));
  };

  return (
    <section className="space-y-4 animate-page-enter">
      <PageHeader
        title="Review Management"
        description="View and moderate customer reviews. You can reply or delete spam/inappropriate reviews."
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={filterProductName}
                onChange={(e) => {
                  setFilterProductName(e.target.value);
                }}
                placeholder="Search by product..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {filterProductName && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterProductName("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Select
                value={filterRating}
                onValueChange={(val) => {
                  setFilterRating(val);
                }}
              >
                <SelectTrigger className="w-fit px-3 h-9 rounded-sm border-border bg-surface text-sm text-ink-muted focus:ring-brand">
                  <SelectValue placeholder="Filter by stars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 stars</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 stars</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 stars</SelectItem>
                  <SelectItem value="1">⭐ 1 star</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterReplied}
                onValueChange={(val) => {
                  setFilterReplied(val);
                }}
              >
                <SelectTrigger className="w-fit px-3 h-9 rounded-sm border-border bg-surface text-sm text-ink-muted focus:ring-brand">
                  <SelectValue placeholder="Reply status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="false">Not replied</SelectItem>
                  <SelectItem value="true">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <div className="premium-card rounded-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-200 table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="w-[20%] pl-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-left">
                    Reviewer
                  </TableHead>
                  <TableHead className="w-[25%] px-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-center">
                    Product
                  </TableHead>
                  <TableHead className="w-[15%] px-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-center">
                    Rating
                  </TableHead>
                  <TableHead className="w-[30%] px-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-center">
                    Content
                  </TableHead>
                  <TableHead className="w-[10%] px-4 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-ink-muted"
                    >
                      Loading reviews...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  reviews.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center overflow-hidden shrink-0">
                            {item.userAvatar ? (
                              <img
                                src={item.userAvatar}
                                alt={item.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-ink-muted">
                                {item.userName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-medium text-ink truncate"
                              title={item.userName}
                            >
                              {item.userName}
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              {new Date(item.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        <a
                          href={`/product/${item.productSlug || item.productId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-ink font-medium hover:text-brand hover:underline"
                          title={`View product: ${item.productName}`}
                        >
                          {item.productName}
                        </a>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        <div className="flex justify-center gap-0.5">
                          {renderStars(item.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        <p
                          className="text-ink line-clamp-2 text-xs mb-1"
                          title={item.comment}
                        >
                          {item.comment || "No comment provided."}
                        </p>

                        {item.images && item.images.length > 0 && (
                          <div className="flex justify-center gap-1.5 mt-2 overflow-x-auto pb-1">
                            {item.images.map((img, idx) => (
                              <a
                                key={idx}
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                                className="block shrink-0"
                              >
                                <img
                                  src={img}
                                  alt="Review attachment"
                                  className="h-12 w-12 object-cover rounded border border-border"
                                />
                              </a>
                            ))}
                          </div>
                        )}

                        {item.adminReply && (
                          <div className="mt-2 text-left w-fit mx-auto text-[11px] bg-surface-muted/50 p-2 rounded-sm border-l-2 border-brand text-ink-muted">
                            <p className="text-[10px] text-ink font-semibold uppercase tracking-wide">
                              Store Reply:
                            </p>
                            <p
                              className="text-xs text-ink-muted mt-0.5 line-clamp-2"
                              title={item.adminReply}
                            >
                              {item.adminReply}
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center align-middle">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-44 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => {
                                  clearError();
                                  reset({ replyText: item.adminReply || "" });
                                  setReplyModal(item);
                                }}
                              >
                                <MessageCircleReply className="w-4 h-4 mr-2.5" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm text-danger focus:bg-danger/10 focus:text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger"
                                onClick={() => {
                                  clearError();
                                  setDeleteModal(item);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && reviews.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-ink-muted"
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {(cursors.length > 0 || pagination?.hasNextPage) && (
            <div className="flex items-center justify-between p-5 bg-surface border-t border-border">
              <div className="text-sm text-ink-muted font-medium">
                Page {cursors.length + 1}
                {pagination?.total > 0 && (
                  <>
                    <span className="mx-2 text-border">|</span>
                    Total: {pagination.total} reviews
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium"
                  onClick={handlePrev}
                  disabled={cursors.length === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium"
                  onClick={handleNext}
                  disabled={!pagination?.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <DeleteModal
        open={deleteModal !== null}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        loading={isDeleting}
        submitError={null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
      />

      {/* Reply Modal */}
      <Dialog
        open={replyModal !== null}
        onOpenChange={(o) => !o && setReplyModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pr-6">
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Write your response as the store. This reply will be visible
              publicly on the product page.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmitReply)}
            className="space-y-4 mt-2"
          >
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
              <p className="text-ink-muted text-xs italic">
                "{replyModal?.comment || "No comment"}"
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="replyText"
                className="text-sm font-semibold text-ink"
              >
                Reply Content <span className="text-danger">*</span>
              </label>
              <Controller
                control={control}
                name="replyText"
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="replyText"
                    rows={4}
                    placeholder="Enter your reply here (E.g. Thank you for your support...)"
                    className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                )}
              />
              {errors.replyText && (
                <p className="text-xs text-danger">
                  {errors.replyText.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyModal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isReplying}>
                {isReplying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
