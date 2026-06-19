/**
 * toast — centralized notification service.
 *
 * Bọc sonner để:
 *  - Cung cấp API nhất quán với icon + styling theo brand
 *  - Không cần import sonner trực tiếp trong từng component
 *  - Dễ swap sang lib khác sau này mà không sửa toàn bộ code
 *
 * Dùng:
 *   import { toast } from "@/lib/toast";
 *   toast.success("Thêm vào giỏ hàng thành công");
 *   toast.error("Email đã tồn tại");
 *   toast.promise(apiCall(), { loading: "...", success: "...", error: "..." });
 */

import { toast as sonner } from "sonner";

// ── Shorthand helpers ──────────────────────────────────────────────────────────

function success(message: string, description?: string) {
  return sonner.success(message, { description });
}

function error(message: string, description?: string) {
  return sonner.error(message, { description });
}

function info(message: string, description?: string) {
  return sonner.info(message, { description });
}

function warning(message: string, description?: string) {
  return sonner.warning(message, { description });
}

function loading(message: string) {
  return sonner.loading(message);
}

function dismiss(id?: string | number) {
  return sonner.dismiss(id);
}

/**
 * Tự động hiển thị loading → success/error theo kết quả promise.
 *
 * @example
 * toast.promise(createProduct(data), {
 *   loading: "Đang thêm sản phẩm...",
 *   success: "Sản phẩm đã được thêm",
 *   error: (err) => err.message ?? "Có lỗi xảy ra",
 * });
 */
function promise<T>(
  p: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: unknown) => string);
    description?: string;
  }
) {
  return sonner.promise(p, options);
}

// ── Named export ───────────────────────────────────────────────────────────────

export const toast = {
  success,
  error,
  info,
  warning,
  loading,
  dismiss,
  promise,
  /** Truy cập sonner gốc nếu cần feature nâng cao */
  raw: sonner,
};
