import { useState } from "react";
import { X, Trash2, History, ChevronLeft, ChevronRight } from "lucide-react";
import DeleteModal from "@/components/ui/delete-modal";
import {
  useRecentlyViewed,
  useClearViewed,
  useRemoveViewed,
} from "@/public/hooks/useUser";
import { ProductCard } from "@/public/components/products/ProductCard";

export function ViewedPage() {
  const [page, setPage] = useState(1);
  const { data: viewedData, isLoading } = useRecentlyViewed(page);
  const products = viewedData?.products ?? [];
  const total = viewedData?.total ?? 0;
  const totalPages = viewedData?.totalPages ?? 1;

  const clearMutation = useClearViewed();
  const removeMutation = useRemoveViewed();

  const [modal, setModal] = useState<{
    open: boolean;
    productId: string | null;
    clearAll: boolean;
  }>({
    open: false,
    productId: null,
    clearAll: false,
  });

  return (
    <div className="animate-slide-up bg-surface rounded-sm px-6 py-6 flex-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-ink">Recently Viewed</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Your product browsing history
          </p>
        </div>
        {total > 0 && (
          <button
            onClick={() =>
              setModal({ open: true, productId: null, clearAll: true })
            }
            className="text-xs text-ink-muted hover:text-danger flex items-center gap-1.5 transition-colors px-2 py-1 rounded-sm hover:bg-danger/5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear history
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center">
            <History className="w-8 h-8 text-ink-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink mb-1">
              No products in history
            </p>
            <p className="text-xs text-ink-muted mb-4">
              Explore the store and view products you love
            </p>
            <a
              href="/products"
              className="inline-block bg-brand text-white text-sm font-bold px-5 py-2 rounded-sm btn-hover"
            >
              Explore Products
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() =>
                    setModal({
                      open: true,
                      productId: product.id,
                      clearAll: false,
                    })
                  }
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-surface/90 border border-border  text-ink-muted hover:text-danger hover:border-danger/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from history"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-sm border border-border text-ink-muted hover:text-brand hover:border-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-ink-muted px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-sm border border-border text-ink-muted hover:text-brand hover:border-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <DeleteModal
        open={modal.open}
        loading={clearMutation.isPending || removeMutation.isPending}
        title={modal.clearAll ? "Clear Browsing History?" : "Remove Product?"}
        description={
          modal.clearAll
            ? "Are you sure you want to clear your entire product browsing history? This action cannot be undone."
            : "Are you sure you want to remove this product from your browsing history?"
        }
        confirmText={modal.clearAll ? "Clear All" : "Remove"}
        onClose={() =>
          setModal({ open: false, productId: null, clearAll: false })
        }
        onConfirm={() => {
          if (modal.clearAll) {
            clearMutation.mutate(undefined, {
              onSuccess: () => {
                setModal({ open: false, productId: null, clearAll: false });
                setPage(1);
              },
            });
          } else if (modal.productId) {
            removeMutation.mutate(modal.productId, {
              onSuccess: () =>
                setModal({ open: false, productId: null, clearAll: false }),
            });
          }
        }}
      />
    </div>
  );
}
