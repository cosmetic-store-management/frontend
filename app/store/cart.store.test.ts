import { describe, it, expect, beforeEach } from "vitest";
import {
  useCartStore,
  selectCartSubtotal,
  selectCartTotal,
  selectCartItemCount,
  type CartItem,
} from "./cart.store";

describe("Cart Store (Zustand)", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  const testItem1: CartItem = {
    productId: "p1",
    variantId: "v1",
    name: "Product 1",
    variantName: "Variant 1",
    price: 100000,
    quantity: 2,
    imageUrl: "img1.jpg",
    stock: 5,
  };

  const testItem2: CartItem = {
    productId: "p2",
    variantId: "v2",
    name: "Product 2",
    variantName: "Variant 2",
    price: 150000,
    quantity: 1,
    imageUrl: "img2.jpg",
    stock: 3,
  };

  it("should initialize with an empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.voucherCode).toBeNull();
    expect(state.discountAmount).toBe(0);
  });

  it("should add a new item to the cart", () => {
    useCartStore.getState().addItem(testItem1);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe("p1");
    expect(state.items[0].quantity).toBe(2);
  });

  it("should stack quantities when adding an existing item, clamped by stock", () => {
    useCartStore.getState().addItem(testItem1);
    // Add same item with qty 2 (total would be 4, stock is 5)
    useCartStore.getState().addItem(testItem1);
    let state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(4);

    // Add again with qty 2 (total would be 6, clamped to stock 5)
    useCartStore.getState().addItem(testItem1);
    state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
  });

  it("should remove items from the cart", () => {
    useCartStore.getState().addItem(testItem1);
    useCartStore.getState().addItem(testItem2);
    expect(useCartStore.getState().items).toHaveLength(2);

    useCartStore.getState().removeItem("p1", "v1");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe("p2");
  });

  it("should update item quantities, clamped between 1 and stock", () => {
    useCartStore.getState().addItem(testItem1);

    // Update to 4 (within stock 5)
    useCartStore.getState().updateQuantity("p1", "v1", 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);

    // Update to 10 (exceeds stock 5, clamped to 5)
    useCartStore.getState().updateQuantity("p1", "v1", 10);
    expect(useCartStore.getState().items[0].quantity).toBe(5);

    // Update to -2 (clamped to 1)
    useCartStore.getState().updateQuantity("p1", "v1", -2);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("should calculate subtotal and total correctly", () => {
    useCartStore.getState().addItem(testItem1); // 2 * 100,000 = 200,000
    useCartStore.getState().addItem(testItem2); // 1 * 150,000 = 150,000

    expect(useCartStore.getState().getSubtotal()).toBe(350000);
    expect(useCartStore.getState().getTotal()).toBe(350000);

    // Apply voucher
    useCartStore.getState().applyVoucher("SALE50", 50000);
    expect(useCartStore.getState().voucherCode).toBe("SALE50");
    expect(useCartStore.getState().discountAmount).toBe(50000);
    expect(useCartStore.getState().getTotal()).toBe(300000);
  });

  it("should support selectors for state computations", () => {
    useCartStore.getState().addItem(testItem1);
    useCartStore.getState().addItem(testItem2);
    useCartStore.getState().applyVoucher("SALE50", 50000);

    const state = useCartStore.getState();
    expect(selectCartSubtotal(state)).toBe(350000);
    expect(selectCartTotal(state)).toBe(300000);
    expect(selectCartItemCount(state)).toBe(3); // 2 + 1
  });

  it("should replace all items via setItems", () => {
    useCartStore.getState().addItem(testItem1);
    expect(useCartStore.getState().items).toHaveLength(1);

    useCartStore.getState().setItems([testItem2]);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe("p2");
    expect(state.items[0].quantity).toBe(1);
  });
});
