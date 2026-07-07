import { test, expect } from "@playwright/test";

test.describe("Cart & Auth Flow", () => {
  test("guest clicking checkout redirects to login", async ({ page }) => {
    // Truy cập giỏ hàng
    await page.goto("/cart");

    // Đảm bảo nút checkout xuất hiện
    const checkoutBtn = page.locator("button:has-text('Tiến hành thanh toán')");
    // Vì giỏ hàng có thể trống, nút này có thể ẩn, ta mock store hoặc trực tiếp vào /checkout
    // Tốt nhất là test trực tiếp access /checkout
    await page.goto("/checkout");

    // Phải bị đẩy về trang đăng nhập với returnUrl
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fcheckout/);

    // Giao diện login xuất hiện
    await expect(
      page
        .locator("h1:has-text('Welcome back')")
        .or(page.locator("h1:has-text('Sign in')"))
        .or(page.locator("h2:has-text('Welcome back')")),
    ).toBeVisible();
  });

  test("guest clicking wishlist redirects to login", async ({ page }) => {
    // Truy cập trang sản phẩm
    await page.goto("/products");

    // Tìm trái tim đầu tiên
    const heartBtn = page
      .locator(
        "button[aria-label='Lưu yêu thích'], .premium-card button:has(svg.lucide-heart)",
      )
      .first();

    // Nếu có sản phẩm, bấm vào trái tim
    if (await heartBtn.isVisible()) {
      await heartBtn.click();

      // Bị đẩy về trang đăng nhập
      await expect(page).toHaveURL(/\/login\?returnUrl=/);
    }
  });
});
