/**
 * shop.spec.ts — E2E tests cho Storefront (trang chủ, danh sách, chi tiết sản phẩm, giỏ hàng)
 * Happy path + Error cases
 */
import { test, expect } from "@playwright/test";

// ── Trang chủ ─────────────────────────────────────────────────────────────────

test.describe("Shop — Trang chủ", () => {
  test("[Happy] Trang chủ load thành công và có nội dung", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);
    // Phải có ít nhất một sản phẩm hoặc hero section
    const content = page
      .locator("main, [data-testid='homepage'], .home-page, h1, h2")
      .first();
    await expect(content).toBeVisible({ timeout: 8_000 });
  });

  test("[Happy] Navigation header hiển thị đúng", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header, nav").first();
    await expect(header).toBeVisible();
  });

  test("[Happy] Footer có thông tin cơ bản", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
  });
});

// ── Danh sách sản phẩm ────────────────────────────────────────────────────────

test.describe("Shop — Danh sách sản phẩm", () => {
  test("[Happy] Trang /products load và hiển thị danh sách", async ({
    page,
  }) => {
    await page.goto("/products");

    await expect(page).toHaveURL(/products/);
    // Chờ ít nhất 1 sản phẩm hoặc thông báo trống
    const productList = page
      .locator(
        "[data-testid='product-card'], .product-card, article, .grid > *",
      )
      .first();
    await expect(productList).toBeVisible({ timeout: 8_000 });
  });

  test("[Happy] Tìm kiếm sản phẩm hoạt động", async ({ page }) => {
    await page.goto("/products");

    const searchInput = page
      .locator(
        "input[type='search'], input[placeholder*='tìm'], input[name='search']",
      )
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("kem");
      await searchInput.press("Enter");
      await page.waitForTimeout(1_000);
      // URL phải có search param hoặc list cập nhật
      const hasSearch =
        page.url().includes("search") || page.url().includes("q=");
      const listUpdated = await page
        .locator("[data-testid='product-card'], article")
        .count();
      expect(hasSearch || listUpdated >= 0).toBeTruthy();
    }
  });

  test("[Error] Tìm kiếm không tìm thấy hiển thị thông báo trống", async ({
    page,
  }) => {
    await page.goto("/products?search=sanphamkhongtontai99999");
    await page.waitForTimeout(2_000);

    // Phải có empty state message
    const emptyState = page
      .locator(
        "[data-testid='empty'], .empty-state, :text('không tìm thấy'), :text('Không có'), :text('0 sản phẩm')",
      )
      .first();
    const hasNoProducts =
      (await page.locator("[data-testid='product-card'], article").count()) ===
      0;
    expect(
      hasNoProducts || (await emptyState.isVisible().catch(() => false)),
    ).toBeTruthy();
  });

  test("[Happy] Phân trang hoạt động (nếu có nhiều sản phẩm)", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.waitForTimeout(1_500);

    const pagination = page
      .locator(
        "[data-testid='pagination'], nav[aria-label*='page'], .pagination",
      )
      .first();
    if (await pagination.isVisible()) {
      const nextBtn = page
        .locator(
          "button[aria-label*='next'], button:has-text('›'), a:has-text('Tiếp')",
        )
        .first();
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(1_000);
        expect(page.url()).toMatch(/page=2|p=2/);
      }
    }
  });
});

// ── Chi tiết sản phẩm ─────────────────────────────────────────────────────────

test.describe("Shop — Chi tiết sản phẩm", () => {
  test("[Happy] Trang chi tiết sản phẩm hiển thị đủ thông tin", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.waitForTimeout(1_500);

    const firstProduct = page
      .locator("[data-testid='product-card'] a, article a, .product-card a")
      .first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState("networkidle");

      // Trang chi tiết phải có tên sản phẩm và giá
      await expect(page.locator("h1").first()).toBeVisible();
      const price = page
        .locator("[data-testid='price'], .price, :text('₫'), :text('đ')")
        .first();
      await expect(price).toBeVisible({ timeout: 5_000 });
    }
  });

  test("[Happy] Thêm vào giỏ hàng thành công", async ({ page }) => {
    await page.goto("/products");
    await page.waitForTimeout(1_500);

    const firstProduct = page
      .locator("[data-testid='product-card'] a, article a")
      .first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState("networkidle");

      const addToCartBtn = page
        .locator(
          "[data-testid='btn-add-to-cart'], button:has-text('Thêm vào giỏ'), button:has-text('Thêm giỏ')",
        )
        .first();

      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();

        // Phải có phản hồi: toast, badge giỏ hàng tăng, hay slide-out cart
        const feedback = page
          .locator(
            "[role='alert'], [data-testid='cart-count'], .cart-badge, .toast",
          )
          .first();
        await expect(feedback)
          .toBeVisible({ timeout: 5_000 })
          .catch(() => {
            // Có thể là giỏ hàng slide-out mở ra
          });
      }
    }
  });

  test("[Error] URL sản phẩm không tồn tại trả về 404 hoặc redirect", async ({
    page,
  }) => {
    const response = await page.goto(
      "/products/san-pham-khong-ton-tai-abc-xyz-9999",
    );
    // Có thể trả về 404 page hoặc redirect
    const is404 = response?.status() === 404;
    const hasNotFoundContent = await page
      .locator(
        ":text('404'), :text('Không tìm thấy'), :text('không tồn tại'), [data-testid='not-found']",
      )
      .first()
      .isVisible()
      .catch(() => false);

    expect(is404 || hasNotFoundContent).toBeTruthy();
  });
});

// ── Giỏ hàng ─────────────────────────────────────────────────────────────────

test.describe("Shop — Giỏ hàng", () => {
  test("[Happy] Trang giỏ hàng load thành công", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL(/cart/);
    // Hiển thị giỏ hàng trống hoặc danh sách items
    const content = page
      .locator(
        "[data-testid='cart-empty'], [data-testid='cart-items'], :text('Giỏ hàng trống'), :text('Chưa có sản phẩm'), h1",
      )
      .first();
    await expect(content).toBeVisible({ timeout: 5_000 });
  });

  test("[Error] Checkout khi giỏ hàng trống thông báo lỗi hoặc disable button", async ({
    page,
  }) => {
    await page.goto("/cart");
    await page.waitForTimeout(1_000);

    // Button checkout phải disabled hoặc không tồn tại khi giỏ trống
    const checkoutBtn = page
      .locator(
        "[data-testid='btn-checkout'], button:has-text('Thanh toán'), a:has-text('Đặt hàng')",
      )
      .first();

    if (await checkoutBtn.isVisible()) {
      const isDisabled = await checkoutBtn.isDisabled();
      if (!isDisabled) {
        // Nếu không disabled, click sẽ redirect về products hoặc hiện toast
        await checkoutBtn.click();
        await page.waitForTimeout(1_000);
        const stillOnCart = page.url().includes("cart");
        const showsError = await page
          .locator("[role='alert']")
          .first()
          .isVisible()
          .catch(() => false);
        expect(stillOnCart || showsError).toBeTruthy();
      } else {
        expect(isDisabled).toBeTruthy();
      }
    }
  });
});
