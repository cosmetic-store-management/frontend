import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  QrCode,
  ShoppingCart,
  CheckCircle,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePOSProducts, usePOSCheckout } from "../hooks/usePOS";
import { useCustomers } from "../hooks/useCustomer";
import { useOrderPreview } from "@/public/hooks/useOrder";
import type { Order } from "@/admin/types/order";

interface POSProduct {
  id: string; // variantId
  productId: string;
  name: string; // Product Name + Variant Name
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

interface CartItem {
  product: POSProduct;
  quantity: number;
}

export function POSPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "pos_card" | "transfer"
  >("cash");
  const [discount, setDiscount] = useState(0);
  const [receivedCash, setReceivedCash] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [usedPoints, setUsedPoints] = useState(0);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Fetch products
  const { data, isLoading } = usePOSProducts(search);
  const checkoutMutation = usePOSCheckout();
  const { data: customersData } = useCustomers();
  const customersList = customersData?.content ?? [];

  const matchedCustomer = customerPhone
    ? customersList.find((c: any) => c.phone === customerPhone.trim())
    : null;

  // Reset usedPoints if customer changes
  useEffect(() => {
    setUsedPoints(0);
  }, [matchedCustomer?.id]);

  const userPoints = matchedCustomer?.points || 0;

  // Preview data state
  const [previewData, setPreviewData] = useState<any>(null);
  const previewMutation = useOrderPreview();

  // Debounced Preview call
  useEffect(() => {
    if (cart.length === 0) {
      setPreviewData(null);
      return;
    }
    const timeoutId = setTimeout(() => {
      previewMutation.mutate(
        {
          items: cart.map((i) => ({
            productId: i.product.productId,
            variantId: i.product.id,
            quantity: i.quantity,
          })),
          discountAmount: discount || 0,
          usedPoints: usedPoints || 0,
          customerPhone: customerPhone || "",
          channel: "pos",
        },
        {
          onSuccess: (data) => setPreviewData(data),
        },
      );
    }, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [cart, discount, usedPoints, customerPhone]);

  const products: POSProduct[] = [];
  (data?.products ?? []).forEach((p: any) => {
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v: any) => {
        products.push({
          id: v.id,
          productId: p.id,
          name: `${p.name} - ${v.name}`,
          price:
            v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price,
          imageUrl: v.imageUrl || p.imageUrl,
          stock: v.stock,
          category: p.category?.name || "Cosmetics",
        });
      });
    }
  });

  const addToCart = (product: POSProduct) => {
    if (product.stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.warning(`Only ${product.stock} items left in stock`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === id) {
            const nextQty = item.quantity + amount;
            if (nextQty > item.product.stock) {
              toast.warning(`Only ${item.product.stock} items left in stock`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.product.id !== id));
  };

  const maxCanUse = previewData?.maxPointsAllowed || 0;

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    if (val < 0) val = 0;
    setUsedPoints(val);
  };

  const total = previewData?.finalTotalAmount || 0;
  const changeDue = receivedCash ? Number(receivedCash) - total : 0;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    if (
      paymentMethod === "cash" &&
      (!receivedCash || Number(receivedCash) < total)
    ) {
      toast.error("Please enter correct received amount!");
      return;
    }

    const payload = {
      paymentMethod,
      items: cart.map((item) => ({
        productId: item.product.productId,
        variantId: item.product.id,
        quantity: item.quantity,
      })),
      discountAmount: discount > 0 ? discount : 0,
      usedPoints: usedPoints > 0 ? usedPoints : 0,
      note:
        discount > 0
          ? `Discount: ${discount.toLocaleString("vi-VN")}₫`
          : undefined,
      customerPhone: customerPhone || undefined,
      customerName: !matchedCustomer && customerName ? customerName : undefined,
    };

    toast.promise(
      checkoutMutation.mutateAsync(payload).then((order) => {
        setLastOrder(order);
        setIsSuccessOpen(true);
      }),
      {
        loading: "Processing order...",
        success: "Order processed successfully!",
        error: (err: any) => err.message || "Failed to process order",
      },
    );
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setCart([]);
    setReceivedCash("");
    setDiscount(0);
    setUsedPoints(0);
    setCustomerPhone("");
    setCustomerName("");
    setLastOrder(null);
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 animate-page-enter">
      {/* Left panel: Products */}
      <div className="flex-1 flex flex-col min-h-125 bg-surface border border-border rounded-sm p-5 shadow-ui-soft">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-10 flex items-center justify-center text-gray-500">
              <span className="animate-pulse">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-10 flex items-center justify-center text-gray-500">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex flex-col text-left bg-white border border-gray-200 rounded shadow-sm overflow-hidden p-2 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-32 w-full bg-gray-50 flex items-center justify-center mb-2 overflow-hidden rounded">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-10 leading-tight">
                    {p.name || "Unnamed product"}
                  </h4>
                  <div className="mt-auto w-full pt-2 flex justify-between items-end">
                    <span className="text-red-600 font-bold">
                      {p.price ? p.price.toLocaleString("vi-VN") : 0}₫
                    </span>
                    <span className="text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                      Kho: {p.stock ?? 0}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart details & checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-surface border border-border rounded-sm shadow-ui-soft min-h-0">
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-brand" />
            <h3 className="font-semibold text-ink">Current Order</h3>
          </div>
          <span className="text-xs font-semibold bg-brand-light text-brand px-2 py-0.5 rounded-full">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0 divide-y divide-border/60">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="pt-3 first:pt-0 flex justify-between gap-3"
            >
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-ink line-clamp-2">
                  {item.product.name}
                </h4>
                <span className="text-[10px] text-brand font-medium mt-1 inline-block">
                  {item.product.price.toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border border-border rounded-sm bg-surface overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 hover:bg-surface-muted transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 text-ink-muted" />
                  </button>
                  <span className="w-8 text-center text-xs font-medium text-ink">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="p-1 hover:bg-surface-muted transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-ink-muted" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-ink-muted hover:text-danger p-0.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-ink-muted gap-3">
              <ShoppingCart className="w-8 h-8 text-border" />
              <p className="text-xs">Select products to checkout</p>
            </div>
          )}
        </div>

        {/* Checkout panel */}
        <div className="p-5 border-t border-border bg-surface-soft/50 space-y-4">
          {/* Customer Phone Search */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
              Member Customer
            </span>
            <Input
              placeholder="Phone number (e.g. 0901234567)..."
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-8 text-xs"
            />
            {customerPhone && customerPhone.length >= 10 && (
              <>
                {matchedCustomer ? (
                  <div className="text-success text-[11px] font-medium mt-1 flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded border border-success animate-scale-in">
                    <span>
                      ✓ Customer: {matchedCustomer.name} - Points:{" "}
                      {userPoints.toLocaleString("vi-VN")}
                    </span>
                  </div>
                ) : (
                  <Input
                    placeholder="New customer name (*)..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-xs mt-2 animate-scale-in"
                  />
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Subtotal</span>
              <span>
                {previewData?.subtotal?.toLocaleString("vi-VN") || 0}₫
              </span>
            </div>

            {previewData?.tierDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-brand font-medium">
                <span>Membership Discount</span>
                <span>
                  -{previewData.tierDiscountAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-ink-muted">
              <span>Discount (Manual)</span>
              <Input
                type="number"
                min="0"
                value={discount || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDiscount(val < 0 ? 0 : val);
                }}
                placeholder="0"
                className="w-24 h-7 text-right text-xs"
              />
            </div>

            {/* Dùng điểm */}
            {matchedCustomer && userPoints > 0 && (
              <div className="bg-brand/5 p-2 rounded border border-brand/20 mt-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-brand">
                    Use points
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={usedPoints || ""}
                    onChange={handlePointsChange}
                    placeholder="0"
                    className="flex-1 bg-white border border-brand/30 rounded py-1 px-2 text-xs focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setUsedPoints(maxCanUse)}
                    className="bg-brand text-white text-[10px] font-bold px-2 rounded hover:bg-brand-dark"
                  >
                    Max
                  </button>
                </div>
                {previewData?.actualUsedPoints > 0 && (
                  <div className="flex justify-between text-xs mt-1 text-success font-medium">
                    <span>Convert:</span>
                    <span>
                      -{previewData.actualUsedPoints.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-ink pt-2 border-t border-border/80">
              <span>Total</span>
              <span className="text-brand text-base">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`relative py-2.5 rounded-sm border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === "cash"
                    ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/20 shadow-[0_0_12px_rgba(251,207,232,0.5)]"
                    : "border-border text-ink-muted bg-surface hover:bg-surface-muted/50 hover:border-border/80"
                }`}
              >
                <DollarSign className="w-4 h-4" /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod("pos_card")}
                className={`relative py-2.5 rounded-sm border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === "pos_card"
                    ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/20 shadow-[0_0_12px_rgba(251,207,232,0.5)]"
                    : "border-border text-ink-muted bg-surface hover:bg-surface-muted/50 hover:border-border/80"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                onClick={() => setPaymentMethod("transfer")}
                className={`relative py-2.5 rounded-sm border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === "transfer"
                    ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/20 shadow-[0_0_12px_rgba(251,207,232,0.5)]"
                    : "border-border text-ink-muted bg-surface hover:bg-surface-muted/50 hover:border-border/80"
                }`}
              >
                <QrCode className="w-4 h-4" /> QR Code
              </button>
            </div>
          </div>

          {/* Cash details */}
          {paymentMethod === "cash" && (
            <div className="space-y-2 animate-scale-in">
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-ink-muted">Cash Received</span>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={receivedCash}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val < 0) return;
                    setReceivedCash(e.target.value);
                  }}
                  className="w-36 h-8 text-right text-xs"
                />
              </div>
              {Number(receivedCash) >= total && (
                <div className="flex justify-between text-xs font-medium text-success">
                  <span>Change</span>
                  <span>{changeDue.toLocaleString("vi-VN")}₫</span>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full h-11 text-sm font-semibold"
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        open={isSuccessOpen}
        onOpenChange={(o) => !o && handleSuccessClose()}
      >
        <DialogContent className="max-w-md animate-scale-in text-center p-8">
          <DialogHeader className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-success mb-4 animate-bounce" />
            <DialogTitle className="text-lg font-bold text-ink">
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-sm text-ink-muted mt-2">
              Your order has been recorded and the receipt is printed
              successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-surface-soft rounded-sm border border-border p-4 my-4 space-y-2.5 text-left text-xs">
            <div className="flex justify-between text-ink-muted">
              <span>Method:</span>
              <span className="font-semibold text-ink">
                {paymentMethod === "cash"
                  ? "Cash"
                  : paymentMethod === "pos_card"
                    ? "Card"
                    : "QR Transfer"}
              </span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Order Total:</span>
              <span className="font-bold text-brand">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>
            {paymentMethod === "cash" && (
              <>
                <div className="flex justify-between text-ink-muted">
                  <span>Cash Received:</span>
                  <span className="font-semibold text-ink">
                    {Number(receivedCash).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between text-success font-semibold">
                  <span>Change:</span>
                  <span>{changeDue.toLocaleString("vi-VN")}₫</span>
                </div>
              </>
            )}

            {(lastOrder?.earnedPoints || 0) > 0 && (
              <div className="flex justify-between text-brand font-semibold pt-2 border-t border-border mt-2">
                <span>Points earned from this order:</span>
                <span>+{lastOrder!.earnedPoints} points</span>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              className="gap-2 border-dashed"
            >
              <Printer className="w-4 h-4 text-ink-muted" /> Print Receipt
            </Button>
            <Button onClick={handleSuccessClose} className="px-8 font-medium">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden printable receipt */}
      {lastOrder && (
        <div
          id="pos-receipt-print"
          className="hidden print:block font-mono text-xs w-[80mm] mx-auto p-4 bg-surface text-black leading-relaxed"
        >
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #pos-receipt-print, #pos-receipt-print * {
                visibility: visible !important;
              }
              #pos-receipt-print {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 80mm !important;
                margin: 0 !important;
                padding: 10px !important;
                box-shadow: none !important;
              }
            }
          `}</style>

          <div className="text-center space-y-1 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">
              GLOWUP COSMETICS
            </h2>
            <p className="text-[10px] text-ink-muted">{"ĐC: 123 Đường 3 Tháng 2, Quận 10, TP.HCM"}</p>
            <p className="text-[10px] text-ink-muted">Hotline: 0901 234 567</p>
            <p className="text-[10px] text-ink-muted">
              ----------------------------------------
            </p>
            <h3 className="text-xs font-bold mt-1">{"HÓA ĐƠN BÁN LẺ"}</h3>
            <p className="text-[10px] font-semibold">{lastOrder.code}</p>
          </div>

          <div className="space-y-1 text-[10px] mb-3">
            <div className="flex justify-between">
              <span>{"Thời gian:"}</span>
              <span>
                {lastOrder.createdAt
                  ? new Date(lastOrder.createdAt).toLocaleString("vi-VN")
                  : new Date().toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{"Thu ngân:"}</span>
              <span>{"Quản trị viên (GlowUp)"}</span>
            </div>
            <div className="flex justify-between">
              <span>{"Khách hàng:"}</span>
              <span>{lastOrder.receiverName || "Khách lẻ tại quầy"}</span>
            </div>
            {lastOrder.phone && lastOrder.phone !== "0000000000" && (
              <div className="flex justify-between">
                <span>{"Số điện thoại:"}</span>
                <span>{lastOrder.phone}</span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-center">
            ========================================
          </p>

          {/* Table items */}
          <table className="w-full text-left text-[10px] my-2 border-collapse">
            <thead>
              <tr className="bg-surface-muted text-ink-muted border-b border-border text-left">
                <th className="pb-1 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{"Tên sản phẩm"}</th>
                <th className="pb-1 text-center w-8 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                  SL
                </th>
                <th className="pb-1 text-right w-20 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{"Đơn giá"}</th>
                <th className="pb-1 text-right w-20 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{"T.Tiền"}</th>
              </tr>
            </thead>
            <tbody>
              {lastOrder.items?.map((item) => (
                <tr key={item.productId} className="border-b border-border/50">
                  <td className="py-1">
                    <p className="font-medium text-ink">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-ink-muted">
                        Loại: {item.variantName}
                      </p>
                    )}
                  </td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">
                    {item.price.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-1 text-right">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[10px] text-center">
            ========================================
          </p>

          <div className="space-y-1 text-[10px] text-right mt-2">
            <div className="flex justify-between">
              <span>{"Tạm tính:"}</span>
              <span>{lastOrder.subtotal.toLocaleString("vi-VN")}₫</span>
            </div>
            {lastOrder.note && lastOrder.note.includes("Giảm giá:") && (
              <div className="flex justify-between">
                <span>{"Giảm giá:"}</span>
                <span>
                  {lastOrder.note
                    .substring(lastOrder.note.indexOf("Giảm giá:") + 9)
                    .trim()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold">
              <span>{"Tổng tiền:"}</span>
              <span>{lastOrder.totalAmount.toLocaleString("vi-VN")}₫</span>
            </div>
            {(lastOrder?.earnedPoints || 0) > 0 && (
              <div className="flex justify-between text-[10px] font-medium mt-1">
                <span>{"Điểm tích lũy:"}</span>
                <span>+{lastOrder.earnedPoints} điểm</span>
              </div>
            )}
            {lastOrder.paymentMethod === "transfer" && (
              <div className="flex justify-between">
                <span>{"Thanh toán:"}</span>
                <span className="font-semibold">{"Chuyển khoản QR"}</span>
              </div>
            )}
            {lastOrder.paymentMethod === "pos_card" && (
              <div className="flex justify-between">
                <span>{"Thanh toán:"}</span>
                <span className="font-semibold">{"Quẹt thẻ"}</span>
              </div>
            )}
            {lastOrder.paymentMethod === "cash" && (
              <>
                <div className="flex justify-between">
                  <span>{"Khách đưa:"}</span>
                  <span>{Number(receivedCash).toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{"Tiền thừa trả khách:"}</span>
                  <span>{changeDue.toLocaleString("vi-VN")}₫</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center space-y-1 mt-6 text-[10px]">
            <p className="italic">{"Cảm ơn quý khách đã mua sắm tại GlowUp!"}</p>
            <p className="text-[8px] text-ink-muted">{"Hẹn gặp lại quý khách lần sau"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
