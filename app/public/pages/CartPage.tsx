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
import { useCartStore } from "@/store/cart.store";
import { useValidateVoucher } from "@/public/hooks/useVoucher";
import { VoucherWalletModal } from "../components/VoucherWalletModal";
import { toast } from "@/lib/toast";

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
  const validateVoucherMutation = useValidateVoucher();
  const subtotal = getSubtotal();
  const total = getTotal();

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    try {
      const res = await validateVoucherMutation.mutateAsync({
        code: voucherInput,
        subtotal,
      });
      applyVoucher(res.result?.voucherCode, res.result?.discountAmount);
      toast.success(res.message || "Áp dụng mã giảm giá thành công");
      setVoucherInput("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      removeVoucher();
    }
  };

  /* ── Empty state ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="max-w-300 w-full mx-auto px-4 py-6 animate-page-enter">
        <div className="premium-card p-16 text-center">
          <div className="w-20 h-20 bg-surface-soft rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-border" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Giỏ hàng trống</h2>
          <p className="text-sm text-ink-muted mb-8">
            Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Khám phá sản phẩm
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
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
                  <div className="w-16 h-16 bg-surface-soft border border-border rounded-sm overflow-hidden">
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
                  <span className="inline-block text-[11px] bg-surface-muted text-ink-muted px-2 py-0.5 rounded-sm mt-0.5">
                    {item.variantName}
                  </span>
                  {/* Mobile */}
                  <div className="flex items-center justify-between sm:hidden mt-2">
                    <div className="flex items-center border border-border rounded-sm h-7">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="w-7 h-full flex items-center justify-center text-ink-muted hover:text-brand disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-ink">
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
                        className="w-7 h-full flex items-center justify-center text-ink-muted hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
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
                <div className="hidden sm:flex flex-col items-center shrink-0">
                  <div className="flex items-center border border-border rounded-sm h-8">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-full flex items-center justify-center text-ink-muted hover:text-brand disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-ink select-none">
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
                      className="w-8 h-full flex items-center justify-center text-ink-muted hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {item.stock > 0 && item.stock <= 5 && (
                    <span className="text-[10px] text-warning font-medium mt-0.5">
                      Còn {item.stock}
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
                  className="shrink-0 p-1.5 text-ink-muted/40 hover:text-danger hover:bg-danger/5 rounded-sm transition-colors"
                  title="Xóa"
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
            <h2 className="text-sm font-black text-gradient uppercase tracking-wider">
              Tổng đơn hàng
            </h2>
          </div>

          <div className="px-6 py-5 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">
                Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
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
                <span className="text-xs font-bold text-ink uppercase tracking-wide">
                  Mã giảm giá
                </span>
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                >
                  <Ticket className="w-3 h-3" /> Kho Voucher
                </button>
              </div>

              {cartStoreVoucherCode ? (
                <div className="flex items-center justify-between bg-brand/5 border border-brand/20 px-3 py-2 rounded-sm">
                  <div className="flex items-center gap-2 text-brand text-sm font-semibold">
                    <Ticket className="w-3.5 h-3.5" /> {cartStoreVoucherCode}
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-xs text-danger hover:underline font-medium"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleApplyVoucher()
                      }
                      placeholder="Nhập mã (VD: GLOWUP)"
                      className="w-full bg-surface-soft border border-border rounded-sm py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand uppercase transition-all"
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    disabled={
                      validateVoucherMutation.isPending || !voucherInput.trim()
                    }
                    className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-sm text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {validateVoucherMutation.isPending ? "..." : "Áp dụng"}
                  </button>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-sm text-ink">
                  Tổng thanh toán
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold text-brand">
                    {total.toLocaleString("vi-VN")}₫
                  </div>
                  <div className="text-[10px] text-ink-muted">
                    Đã bao gồm VAT
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm transition-colors flex justify-center items-center gap-2"
            >
              Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
            </button>
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
                toast.success("Áp dụng mã giảm giá thành công");
                setVoucherInput("");
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || "Mã giảm giá không hợp lệ",
                );
              },
            },
          );
        }}
      />
    </div>
  );
}
