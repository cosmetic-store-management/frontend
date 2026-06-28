import { test, expect } from "@playwright/test";

test.describe("End-to-End: Business Checkout Flow", () => {
  test("Khách hàng mua hàng, áp dụng voucher và thanh toán thành công", async ({
    page,
  }) => {
    // 1. Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test_customer@example.com");
    await page.fill('input[name="password"]', "Password123");
    await page.click('button[type="submit"]');

    // Chờ chuyển hướng về trang chủ
    await expect(page).toHaveURL("/");

    // 2. Tìm kiếm và thêm sản phẩm vào giỏ
    // Giả sử có một sản phẩm nổi bật trên trang chủ
    const firstProduct = page.locator(".product-card").first();
    await firstProduct.locator('button:has-text("Thêm vào giỏ")').click();

    // Kiểm tra toast thông báo
    await expect(page.locator(".sonner-toast")).toContainText(
      "đã được thêm vào giỏ",
    );

    // 3. Chuyển đến trang giỏ hàng
    await page.goto("/cart");

    // Kiểm tra có sản phẩm trong giỏ
    const cartItems = page.locator(".cart-item");
    await expect(cartItems).toHaveCount(1);

    // 4. Vào trang thanh toán
    await page.click('button:has-text("Thanh toán")');
    await expect(page).toHaveURL("/checkout");

    // 5. Áp dụng Voucher (nếu có form)
    // Giả sử voucher TEST10K giảm 10k
    await page.fill('input[name="voucherCode"]', "TEST10K");
    await page.click('button:has-text("Áp dụng")');
    await expect(page.locator("text=Áp dụng mã thành công")).toBeVisible();

    // 6. Điền thông tin giao hàng
    await page.fill('input[name="receiverName"]', "E2E Test User");
    await page.fill('input[name="phone"]', "0987654321");
    await page.fill('input[name="street"]', "123 Đường E2E");
    // Chọn dropdown Tỉnh/Thành ... (giả lập)

    // 7. Chọn phương thức thanh toán COD
    await page.click('label:has-text("Thanh toán khi nhận hàng")');

    // 8. Đặt hàng
    await page.click('button:has-text("Đặt hàng")');

    // 9. Xác nhận thành công
    await expect(page).toHaveURL(/\/order\/.*/);
    await expect(page.locator("h1")).toContainText("Cảm ơn bạn đã đặt hàng");
  });
});
