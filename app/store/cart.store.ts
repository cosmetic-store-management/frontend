import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
  /** Slug dùng để điều hướng đến trang chi tiết sản phẩm */
  slug?: string;
}

interface CartState {
  items: CartItem[];
  voucherCode: string | null;
  discountAmount: number;
  isOpen: boolean;
  
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  
  applyVoucher: (code: string, discountAmount: number) => void;
  removeVoucher: () => void;
  
  getSubtotal: () => number;
  getTotal: () => number;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      voucherCode: null,
      discountAmount: 0,
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          );
          if (existing) {
            const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock);
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId && i.variantId === newItem.variantId
                  ? { ...i, quantity: newQty, stock: newItem.stock }
                  : i
              ),
              isOpen: true,
            };
          }
          const clampedQty = Math.min(newItem.quantity, newItem.stock);
          return { items: [...state.items, { ...newItem, quantity: clampedQty }], isOpen: true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId || i.variantId !== variantId) return i;
            const clamped = Math.max(1, Math.min(quantity, i.stock || 999));
            return { ...i, quantity: clamped };
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], voucherCode: null, discountAmount: 0 });
      },

      applyVoucher: (code, discountAmount) => {
        set({ voucherCode: code, discountAmount });
      },

      removeVoucher: () => {
        set({ voucherCode: null, discountAmount: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotal: () => {
        const sub = get().getSubtotal();
        const disc = get().discountAmount;
        return Math.max(0, sub - disc);
      },

      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "glowup-cart-storage",
    }
  )
);

// ── Selectors (pure functions — dùng thay vì gọi methods trong component) ────
// Dùng: useCartStore(selectCartSubtotal)

export const selectCartSubtotal = (s: CartState) =>
  s.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartTotal = (s: CartState) =>
  Math.max(0, selectCartSubtotal(s) - s.discountAmount);

export const selectCartItemCount = (s: CartState) =>
  s.items.reduce((sum, item) => sum + item.quantity, 0);
