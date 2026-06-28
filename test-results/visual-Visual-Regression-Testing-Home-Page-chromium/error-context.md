# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Visual Regression Testing >> Home Page
- Location: tests\visual.spec.ts:7:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: screencast.showOverlays: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - generic [ref=e2]:
        - banner [ref=e3]:
            - generic [ref=e4]:
                - button [ref=e5]:
                    - img [ref=e6]
                - link "GLOWUPCOSMETICS" [ref=e7] [cursor=pointer]:
                    - /url: /
                    - generic [ref=e8]: GLOWUPCOSMETICS
                - generic [ref=e10]:
                    - textbox "Tìm sản phẩm, danh mục hay thương hiệu mong muốn" [ref=e11]
                    - button [ref=e12]:
                        - img [ref=e13]
                - generic [ref=e16]:
                    - text: "Hotline: 1900 1234|"
                    - button [ref=e17]:
                        - img [ref=e18]
                    - link [ref=e21] [cursor=pointer]:
                        - /url: /login?returnUrl=/account
                        - img [ref=e22]
                    - link "0" [ref=e25] [cursor=pointer]:
                        - /url: /cart
                        - img [ref=e26]
                        - text: "0"
            - navigation [ref=e29]:
                - generic [ref=e30]:
                    - button "DANH MỤC SẢN PHẨM" [ref=e32]:
                        - img [ref=e33]
                        - text: DANH MỤC SẢN PHẨM
                    - generic [ref=e34]:
                        - link "HÀNG MỚI" [ref=e36] [cursor=pointer]:
                            - /url: /products?sort=newest
                        - generic [ref=e37]:
                            - link "THƯƠNG HIỆU" [ref=e38] [cursor=pointer]:
                                - /url: /brands
                                - text: THƯƠNG HIỆU
                                - img [ref=e39]
                            - generic [ref=e41]:
                                - heading "Thương hiệu nổi bật" [level=4] [ref=e42]
                                - link "Xem tất cả thương hiệu →" [ref=e44] [cursor=pointer]:
                                    - /url: /brands
        - main [ref=e45]:
            - generic [ref=e46]:
                - generic [ref=e47]:
                    - generic [ref=e50]:
                        - text: Bộ sưu tập Mùa Hè 2026
                        - heading "Đánh thức vẻ đẹp tự nhiên của bạn" [level=1] [ref=e51]
                        - paragraph [ref=e52]: Khám phá các dòng mỹ phẩm chăm sóc da và làm đẹp chính hãng tại GlowUp, giúp bạn luôn rạng rỡ và tự tin mỗi ngày.
                        - generic [ref=e53]:
                            - link "Mua sắm ngay" [ref=e54] [cursor=pointer]:
                                - /url: /products
                                - text: Mua sắm ngay
                                - img [ref=e55]
                            - link "Xem danh mục" [ref=e57] [cursor=pointer]:
                                - /url: /products
                    - generic [ref=e60]:
                        - text: Sale Sinh Nhật GlowUp
                        - heading "Khuyến mãi lên tới 50%" [level=1] [ref=e61]
                        - paragraph [ref=e62]: Hàng ngàn deal sốc dành riêng cho bạn. Nhanh tay chốt đơn trước khi hết hạn!
                        - generic [ref=e63]:
                            - link "Săn Deal Khủng" [ref=e64] [cursor=pointer]:
                                - /url: /products?sort=discount_desc
                                - text: Săn Deal Khủng
                                - img [ref=e65]
                            - link "Xem danh mục" [ref=e67] [cursor=pointer]:
                                - /url: /products
                    - generic [ref=e70]:
                        - text: Sản phẩm Mới
                        - heading "Bí quyết cho làn da không tuổi" [level=1] [ref=e71]
                        - paragraph [ref=e72]: Bộ serum cao cấp chống lão hóa mới nhất. Được kiểm nghiệm bởi chuyên gia da liễu.
                        - generic [ref=e73]:
                            - link "Khám phá ngay" [ref=e74] [cursor=pointer]:
                                - /url: /products
                                - text: Khám phá ngay
                                - img [ref=e75]
                            - link "Xem danh mục" [ref=e77] [cursor=pointer]:
                                - /url: /products
                    - button [ref=e78]:
                        - img [ref=e79]
                    - button [ref=e81]:
                        - img [ref=e82]
                    - generic [ref=e84]:
                        - button [ref=e85]
                        - button [ref=e86]
                        - button [ref=e87]
                - generic [ref=e88]:
                    - heading "Mã Giảm Giá" [level=2] [ref=e91]
                    - heading "Gợi Ý Hôm Nay" [level=2] [ref=e94]
        - contentinfo [ref=e95]:
            - generic [ref=e97]:
                - generic [ref=e98]:
                    - link "G GlowUp" [ref=e99] [cursor=pointer]:
                        - /url: /
                        - generic [ref=e100]: G
                        - generic [ref=e101]: GlowUp
                    - paragraph [ref=e102]: Tiên phong trong việc mang đến những sản phẩm làm đẹp chính hãng, an toàn và hiệu quả nhất. Đánh thức vẻ đẹp tự nhiên của phụ nữ Á Đông bằng sự thấu hiểu và tận tâm.
                    - generic [ref=e103]:
                        - generic [ref=e104]:
                            - img [ref=e105]
                            - text: Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh
                        - generic [ref=e108]:
                            - img [ref=e109]
                            - generic [ref=e111]: 1900 6868 (8:00 - 22:00)
                        - generic [ref=e112]:
                            - img [ref=e113]
                            - text: contact@glowup.vn
                - generic [ref=e116]:
                    - heading "Về GlowUp Cosmetics" [level=4] [ref=e117]
                    - list [ref=e118]:
                        - listitem [ref=e119]:
                            - link "Câu chuyện thương hiệu" [ref=e120] [cursor=pointer]:
                                - /url: /about
                        - listitem [ref=e121]:
                            - link "Hệ thống cửa hàng" [ref=e122] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e123]:
                            - link "Tuyển dụng" [ref=e124] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e125]:
                            - link "Blog làm đẹp" [ref=e126] [cursor=pointer]:
                                - /url: /blog
                        - listitem [ref=e127]:
                            - link "Chính sách bảo mật" [ref=e128] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e129]:
                            - link "Điều khoản sử dụng" [ref=e130] [cursor=pointer]:
                                - /url: /
                - generic [ref=e131]:
                    - heading "Hỗ trợ khách hàng" [level=4] [ref=e132]
                    - list [ref=e133]:
                        - listitem [ref=e134]:
                            - link "Trung tâm trợ giúp (FAQ)" [ref=e135] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e136]:
                            - link "Hướng dẫn mua hàng" [ref=e137] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e138]:
                            - link "Phương thức thanh toán" [ref=e139] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e140]:
                            - link "Chính sách giao hàng" [ref=e141] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e142]:
                            - link "Chính sách đổi trả" [ref=e143] [cursor=pointer]:
                                - /url: /
                        - listitem [ref=e144]:
                            - link "Tra cứu đơn hàng" [ref=e145] [cursor=pointer]:
                                - /url: /
                - generic [ref=e146]:
                    - heading "Đăng ký nhận tin" [level=4] [ref=e147]
                    - paragraph [ref=e148]: Đừng bỏ lỡ các chương trình khuyến mãi siêu hấp dẫn và bí quyết làm đẹp từ chuyên gia.
                    - generic [ref=e149]:
                        - textbox "Nhập email của bạn" [ref=e150]
                        - button "Đăng ký" [ref=e151]
                    - heading "Kết nối với chúng tôi" [level=4] [ref=e152]
                    - generic [ref=e153]:
                        - link [ref=e154] [cursor=pointer]:
                            - /url: "#"
                            - img [ref=e155]
                        - link [ref=e157] [cursor=pointer]:
                            - /url: "#"
                            - img [ref=e158]
            - paragraph [ref=e164]: © 2026 GlowUp Cosmetics. All rights reserved.
    - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  |
  3  | test.describe("Visual Regression Testing", () => {
  4  |   // Use a fixed viewport for consistent screenshots
  5  |   test.use({ viewport: { width: 1280, height: 720 } });
  6  |
  7  |   test("Home Page", async ({ page }) => {
  8  |     await page.goto("/");
  9  |     // Wait for network idle and images to load
  10 |     await page.waitForLoadState("domcontentloaded");
  11 |     await page.waitForTimeout(2000);
  12 |     // Mask images or dynamic elements if they are flaky, but for now we capture the full page
> 13 |     await expect(page).toHaveScreenshot("home-page.png", { fullPage: true });
     |     ^ Error: screencast.showOverlays: Target page, context or browser has been closed
  14 |   });
  15 |
  16 |   test("Shop Page", async ({ page }) => {
  17 |     await page.goto("/shop");
  18 |     await page.waitForLoadState("domcontentloaded");
  19 |     await page.waitForTimeout(2000);
  20 |     await expect(page).toHaveScreenshot("shop-page.png", { fullPage: true });
  21 |   });
  22 |
  23 |   test("Product Detail Page", async ({ page }) => {
  24 |     // Navigate to a likely existing product or just the shop page and click the first product
  25 |     await page.goto("/shop");
  26 |     await page.waitForLoadState("domcontentloaded");
  27 |     await page.waitForTimeout(2000);
  28 |     const firstProduct = page.locator("a[href^='/shop/']").first();
  29 |     if (await firstProduct.count() > 0) {
  30 |       await firstProduct.click();
  31 |       await page.waitForLoadState("domcontentloaded");
  32 |     await page.waitForTimeout(2000);
  33 |       await expect(page).toHaveScreenshot("product-detail.png", { fullPage: true });
  34 |     }
  35 |   });
  36 |
  37 |   test("Login Page", async ({ page }) => {
  38 |     await page.goto("/login");
  39 |     await page.waitForLoadState("domcontentloaded");
  40 |     await page.waitForTimeout(2000);
  41 |     await expect(page).toHaveScreenshot("login-page.png", { fullPage: true });
  42 |   });
  43 |
  44 |   test("Admin Dashboard", async ({ page }) => {
  45 |     await page.goto("/admin/login");
  46 |     await page.waitForLoadState("domcontentloaded");
  47 |
  48 |     // Check if we are already redirected or need to login
  49 |     if (page.url().includes("/admin/login")) {
  50 |       await page.fill('input[type="email"], input[name="email"], input[type="tel"]', "owner@example.com");
  51 |       await page.fill('input[type="password"]', "Password123!");
  52 |       await page.click('button[type="submit"]');
  53 |     }
  54 |
  55 |     try {
  56 |       await page.waitForURL(/\/admin/, { waitUntil: "domcontentloaded", timeout: 10000 });
  57 |       await page.waitForTimeout(2000);
  58 |       await expect(page).toHaveScreenshot("admin-dashboard.png", { fullPage: true });
  59 |     } catch (e) {
  60 |       console.log("Could not login to admin, snapshotting the login failure instead.");
  61 |       await expect(page).toHaveScreenshot("admin-login-failed.png", { fullPage: true });
  62 |     }
  63 |   });
  64 | });
  65 |
```
