import { Link, useNavigate } from "react-router";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Ticket,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/public/store/cart.store";
import { useValidateVoucher } from "@/public/hooks/useVoucher";
import { VoucherWalletModal } from "../components/vouchers/VoucherWalletModal";
import { toast } from "@/lib/toast";
import { useAuth } from "@/auth/hooks/useAuth";

export function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotal,
    applyVoucher,
    removeVoucher,
    voucherCode: cartStoreVoucherCode,
    discountAmount,
  } = useCartStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const validateVoucherMutation = useValidateVoucher();
  const subtotal = getSubtotal();
  const total = getTotal();
  const hasInactiveItems = items.some((item) => item.isActive === false);

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    try {
      const res = await validateVoucherMutation.mutateAsync({
        code: voucherInput,
        subtotal,
      });
      applyVoucher(res.result?.voucherCode, res.result?.discountAmount);
      toast.success(res.message || "Voucher applied!");
      setVoucherInput("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid voucher code");
      removeVoucher();
    }
  };

  /* ── Empty state ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="max-w-300 w-full mx-auto px-4 py-6 animate-page-enter">
        <div className="premium-card p-16 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "hsl(352, 72%, 52%, 0.08)" }}
          >
            <ShoppingBag
              className="w-10 h-10"
              style={{ color: "hsl(352, 72%, 52%)" }}
            />
          </div>
          <h2
            className="text-2xl font-bold text-foreground mb-2"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
            }}
          >
            Your cart is empty
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Discover and add your favorite products.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-white font-bold py-3 px-8 rounded-sm transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.99]"
            style={{ background: "hsl(352, 72%, 52%)" }}
          >
            <ShoppingBag className="w-4 h-4" /> Shop now
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main layout ─────────────────────────────────────────── */
  return (
    <div className="max-w-300 w-full mx-auto px-4 py-6 animate-page-enter">
      {/* Back link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-5 px-3 py-1.5 rounded-sm bg-muted hover:bg-muted/80 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Continue shopping
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 items-start">
        {/* ── Card trái: Danh sách sản phẩm ─────────────── */}
        <div className="premium-card">
          <div className="divide-y divide-border/50 overflow-y-auto max-h-[calc(100vh-240px)]">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center gap-4 px-6 py-4"
              >
                {/* Ảnh */}
                <Link
                  to={`/product/${item.slug || item.productId}`}
                  className="shrink-0"
                >
                  <div className="w-16 h-16 bg-muted border border-border rounded-sm overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Tên + variant */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.slug || item.productId}`}
                    className="font-semibold text-sm text-ink hover:text-brand transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && item.variantName !== "Default Title" && (
                    <span className="inline-block text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-sm mt-0.5 font-medium">
                      {item.variantName}
                    </span>
                  )}
                  {item.isActive === false && (
                    <div className="mt-1 text-xs font-semibold text-destructive">
                      Sản phẩm đã ngừng kinh doanh
                    </div>
                  )}
                  {/* Mobile */}
                  <div className="flex items-center justify-between sm:hidden mt-2">
                    <div className="flex items-center border border-border rounded-sm h-7 overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-brand disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-foreground">
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
                        disabled={item.stock > 0 && item.quantity >= item.stock}
                        className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm text-ink">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                {/* Đơn giá — desktop */}
                <div className="hidden sm:block w-24 text-center text-sm text-ink-muted shrink-0">
                  {item.price.toLocaleString("vi-VN")}₫
                </div>

                {/* Qty — desktop */}
                <div className="hidden sm:flex flex-col items-center shrink-0 gap-1">
                  <div className="flex items-center border border-border rounded-sm h-8 overflow-hidden bg-white">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-brand disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-foreground select-none">
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
                      disabled={item.stock > 0 && item.quantity >= item.stock}
                      className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {item.stock > 0 && item.stock <= 5 && (
                    <span className="text-[10px] text-warning font-medium mt-0.5">
                      Only {item.stock} left
                    </span>
                  )}
                </div>

                {/* Thành tiền — desktop */}
                <div className="hidden sm:block w-24 text-right font-bold text-sm text-ink shrink-0">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </div>

                {/* Xóa */}
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="shrink-0 p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-sm transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card phải: Tổng đơn hàng ─────────────────── */}
        <div className="premium-card sticky top-24">
          <div className="px-6 py-5 border-b border-border/50">
            <h2
              className="text-sm font-bold text-foreground uppercase tracking-wider"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              Order Summary
            </h2>
          </div>

          <div className="px-6 py-5 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">
                Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                {items.reduce((s, i) => s + i.quantity, 0) === 1
                  ? "item"
                  : "items"}
                )
              </span>
              <span className="font-semibold text-ink">
                {subtotal.toLocaleString("vi-VN")}₫
              </span>
            </div>

            {/* Discount */}
            {cartStoreVoucherCode && (
              <div className="flex justify-between text-sm">
                <span className="text-brand font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> {cartStoreVoucherCode}
                </span>
                <span className="font-semibold text-brand">
                  -{discountAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}

            {/* Voucher */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Voucher
                </span>
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="text-xs font-semibold hover:underline flex items-center gap-1"
                  style={{ color: "hsl(352, 72%, 48%)" }}
                >
                  <Ticket className="w-3 h-3" /> My Wallet
                </button>
              </div>

              {cartStoreVoucherCode ? (
                <div className="flex items-center justify-between bg-brand/5 border border-brand/20 px-3 py-2 rounded-sm">
                  <div
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "hsl(352, 72%, 48%)" }}
                  >
                    <Ticket className="w-3.5 h-3.5" /> {cartStoreVoucherCode}
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-xs text-destructive hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleApplyVoucher()
                      }
                      placeholder="Enter your code"
                      className="w-full bg-muted border border-border rounded-sm py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand uppercase transition-all"
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    disabled={
                      validateVoucherMutation.isPending || !voucherInput.trim()
                    }
                    className="text-white px-4 py-2 rounded-sm text-sm font-bold transition-all disabled:opacity-50"
                    style={{ background: "hsl(352, 72%, 52%)" }}
                  >
                    {validateVoucherMutation.isPending ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-sm text-ink">Total</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-brand">
                    {total.toLocaleString("vi-VN")}₫
                  </div>
                  <div className="text-[10px] text-ink-muted">VAT included</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-2">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  navigate("/login?returnUrl=/checkout");
                } else {
                  navigate("/checkout");
                }
              }}
              disabled={hasInactiveItems}
              className="w-full text-white font-bold py-3.5 rounded-sm transition-all duration-150 flex justify-center items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
            {hasInactiveItems && (
              <p className="text-xs text-destructive text-center font-medium">
                Vui lòng xóa các sản phẩm ngừng kinh doanh khỏi giỏ hàng
              </p>
            )}
          </div>
        </div>
      </div>

      <VoucherWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        subtotal={subtotal}
        onApply={(code) => {
          setVoucherInput(code);
          validateVoucherMutation.mutate(
            { code, subtotal },
            {
              onSuccess: (res) => {
                applyVoucher(
                  res.result?.voucherCode,
                  res.result?.discountAmount,
                );
                toast.success("Voucher applied!");
                setVoucherInput("");
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || "Invalid voucher code",
                );
              },
            },
          );
        }}
      />
    </div>
  );
}
