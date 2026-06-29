import { Link } from "react-router";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useEffect } from "react";

export function SlideOutCart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal } =
    useCartStore();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex justify-end">
      {/* Backdrop */}
      {/* eslint-disable-next-line  */}
      {/* eslint-disable-next-line  */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Drawer */}
      <div className="relative w-full max-w-md bg-surface h-full  flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-surface-soft/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Your Cart</h2>
              <p className="text-xs text-ink-muted">{cartCount} {cartCount === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-ink-muted hover:text-ink hover:bg-surface-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-surface-soft rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-border" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Your cart is empty</h3>
                <p className="text-sm text-ink-muted mt-1">
                  Start adding products you love.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-hover mt-4 px-6 py-2.5 bg-brand text-white font-bold rounded-sm hover:bg-brand-dark transition-colors"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 group"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm border border-border bg-surface-soft overflow-hidden shrink-0">
                    <img
                      src={
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-ink line-clamp-2 leading-tight group-hover:text-brand transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-ink-muted mt-1">
                          Variant: {item.variantName}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="p-1.5 text-ink-muted hover:text-danger hover:bg-danger/10 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex items-center border border-border rounded-sm h-8 bg-surface">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                          className="w-8 h-full flex items-center justify-center text-ink-muted hover:text-brand transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                          className="w-8 h-full flex items-center justify-center text-ink-muted hover:text-brand transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-brand">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-surface-soft/30 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold text-ink">Subtotal:</span>
              <span className="font-bold text-xl text-brand">
                {getTotal().toLocaleString("vi-VN")}₫
              </span>
            </div>
            <p className="text-[11px] text-ink-muted text-center">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="btn-hover flex items-center justify-center py-3 px-4 border-2 border-brand text-brand font-bold rounded-sm hover:bg-brand hover:text-white transition-all"
              >
                View cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="btn-hover flex items-center justify-center py-3 px-4 bg-brand text-white font-bold rounded-sm hover:bg-brand-dark transition-all  shadow-brand/20"
              >
                Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
