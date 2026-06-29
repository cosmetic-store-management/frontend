/**
 * auth.spec.ts — E2E tests cho Auth flows (Public + Admin)
 * Happy path + Error cases
 *
 * Routes thực tế (từ app/routes.ts):
 *   /login               → LoginPage
 *   /register            → RegisterPage
 *   /forgot-password     → ForgotPasswordPage
 *   /reset-password      → ResetPasswordPage
 *
 * Toast library: Sonner → selector: [data-sonner-toast]
 * Register inputs không có name attr, dùng placeholder selector
 */
import { test, expect } from "@playwright/test";

// ── Public Auth ───────────────────────────────────────────────────────────────

test.describe("Public Auth — Đăng nhập khách hàng", () => {
  test("[Happy] Trang đăng nhập render đầy đủ fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(
      page
        .locator("input[type='tel'], input[placeholder*='điện thoại']")
        .first(),
    ).toBeVisible();
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    await expect(page.locator("button[type='submit']").first()).toBeVisible();
  });

  test("[Error] Thông báo lỗi khi nhập sai mật khẩu", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.fill(
      "input[type='tel'], input[placeholder*='điện thoại']",
      "0901234567",
    );
    await page.fill("input[type='password']", "wrong_password_xyz_999");
    await page.click("button[type='submit']");

    // Sonner toast selector
    const toast = page
      .locator("[data-sonner-toast], [data-type='error']")
      .first();
    await expect(toast).toBeVisible({ timeout: 8_000 });
  });

  test("[Error] Validation khi để trống trường bắt buộc", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.click("button[type='submit']");

    // HTML5 required validation hoặc sonner toast
    const hasValidation = (await page.locator("input:invalid").count()) > 0;
    const hasToast = await page
      .locator("[data-sonner-toast]")
      .isVisible()
      .catch(() => false);
    expect(hasValidation || hasToast).toBeTruthy();
  });
});

// ── Public Register ───────────────────────────────────────────────────────────

test.describe("Public Auth — Đăng ký tài khoản", () => {
  test("[Happy] Form đăng ký render đầy đủ các trường", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});

    // Inputs không có name attr, dùng placeholder
    await expect(
      page.locator("input[placeholder='Nhập họ và tên']").first(),
    ).toBeVisible();
    await expect(page.locator("input[type='tel']").first()).toBeVisible();
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    await expect(page.locator("button[type='submit']").first()).toBeVisible();
  });

  test("[Error] Validation khi mật khẩu không khớp", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});

    await page.fill("input[placeholder='Nhập họ và tên']", "Test User");
    await page.fill("input[type='tel']", "0912345678");
    // Fill 2 password fields khác nhau
    const passwordInputs = page.locator("input[type='password']");
    await passwordInputs.nth(0).fill("pass12345");
    await passwordInputs.nth(1).fill("different_pass");
    await page.click("button[type='submit']");

    // Phải hiển thị lỗi mật khẩu không khớp qua sonner
    const toast = page.locator("[data-sonner-toast]").first();
    await expect(toast).toBeVisible({ timeout: 5_000 });
  });
});

// ── Admin Auth ────────────────────────────────────────────────────────────────

test.describe("Admin Auth — Đăng nhập quản trị", () => {
  test("[Happy] Admin login page render đúng các thành phần", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle").catch(() => {});

    // Không check title (trang không có <title> tag)
    // Chỉ kiểm tra UI elements
    await expect(page.locator("input[type='password']").first()).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator("button[type='submit']").first()).toBeVisible();
  });

  test("[Error] Thông báo lỗi khi đăng nhập admin với credentials sai", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle").catch(() => {});

    const emailOrPhone = page
      .locator(
        "input[type='email'], input[name='email'], input[type='tel'], input[placeholder*='phone'], input[placeholder*='email']",
      )
      .first();
    await emailOrPhone.fill("wrong@test.com");
    await page.fill("input[type='password']", "wrongpass123");
    await page.click("button[type='submit']");

    // Sonner toast error
    const toast = page
      .locator("[data-sonner-toast], [data-type='error']")
      .first();
    await expect(toast).toBeVisible({ timeout: 8_000 });
  });

  test("[Error] Không redirect về admin khi chưa login", async ({ page }) => {
    // Admin index (/admin) phải redirect về login khi chưa auth
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/i, { timeout: 8_000 });
  });
});

// ── Forgot Password ───────────────────────────────────────────────────────────

test.describe("Auth — Quên mật khẩu", () => {
  test("[Happy] Trang quên mật khẩu render và có thể submit", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle").catch(() => {});

    const phoneInput = page
      .locator(
        "input[type='tel'], input[type='email'], input[placeholder*='điện thoại'], input[placeholder*='phone']",
      )
      .first();
    await expect(phoneInput).toBeVisible({ timeout: 5_000 });

    await phoneInput.fill("0901234567");
    await page.click("button[type='submit']");

    // Phải hiển thị toast (success hoặc error đều OK — form đã được submit)
    const toast = page.locator("[data-sonner-toast]").first();
    await expect(toast).toBeVisible({ timeout: 8_000 });
  });
});
