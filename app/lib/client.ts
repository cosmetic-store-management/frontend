/**
 * apiClient — HTTP client trung tâm cho toàn bộ frontend.
 *
 * Tự động:
 *  - Gắn base URL từ VITE_API_URL
 *  - Đọc accessToken từ auth store (Zustand) — không đọc localStorage trực tiếp
 *  - Unwrap `response.data` từ BE envelope { success, message, data }
 *  - Throw lỗi với message từ server nếu response không OK
 *  - Nếu 401 → thử refresh token → retry request gốc → nếu vẫn lỗi → clear auth + redirect
 */

import { useAdminAuthStore, usePublicAuthStore } from "@/store";
import { useCartStore } from "@/store/cart.store";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).trim();

/** Timeout mặc định cho mọi request (30 giây) */
const REQUEST_TIMEOUT_MS = 30_000;

/** Tạo AbortSignal có timeout để tránh request treo vô hạn */
function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

// Flag chống lặp vô hạn khi refresh token cũng thất bại
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

function getActiveStore() {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
  ) {
    return useAdminAuthStore.getState();
  }
  return usePublicAuthStore.getState();
}

function buildHeaders(isJson = true, isFormData = false): HeadersInit {
  const token = getActiveStore().token;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (isJson && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/**
 * Thử refresh access token bằng refresh token hiện có trong store.
 * Trả về access token mới hoặc null nếu thất bại.
 */
async function tryRefreshToken(): Promise<string | null> {
  const store = getActiveStore();
  const refreshToken = store.refreshToken;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data ?? json;

    if (data?.accessToken) {
      // Cập nhật access token trong store (không cần login lại)
      store.setAccessToken(data.accessToken);
      // Cập nhật refresh token mới nếu có (token rotation)
      if (data.refreshToken) {
        // setAuth giữ user cũ + tokens mới
        const currentUser = store.user!;
        store.setAuth(currentUser, data.accessToken, data.refreshToken);
      }
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function handleResponse<T>(
  res: Response,
  retryFn: () => Promise<Response>,
): Promise<T> {
  const isAuthRoute =
    res.url.includes("/login") ||
    res.url.includes("/register") ||
    res.url.includes("/forgot-password") ||
    res.url.includes("/reset-password") ||
    res.url.includes("/logout") ||
    res.url.includes("/refresh");

  if (res.status === 401 && !isAuthRoute) {
    // Thử refresh token — chỉ 1 lần, dùng promise chung để tránh race condition
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Retry request gốc với token mới
      const retryRes = await retryFn();
      if (retryRes.ok) {
        const json = await retryRes.json();
        if (
          json &&
          json.success !== undefined &&
          json.message &&
          json.data &&
          typeof json.data === "object" &&
          !Array.isArray(json.data)
        ) {
          json.data.message = json.message;
        }
        return (json?.data ?? json) as T;
      }
    }

    // Refresh thất bại → clear auth + redirect
    const store = getActiveStore();
    const hadToken = !!store.token;
    store.clearAuth();
    useCartStore.getState().clearCart();

    if (hadToken && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) {
        if (currentPath !== "/admin/login")
          window.location.href = "/admin/login";
      } else {
        if (currentPath !== "/login") window.location.href = "/login";
      }
    }
    throw new Error("Phiên đăng nhập hết hạn");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Lỗi ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  // Inject message into data if it exists so consumers can access res.message
  if (
    json &&
    json.success !== undefined &&
    json.message &&
    json.data &&
    typeof json.data === "object" &&
    !Array.isArray(json.data)
  ) {
    json.data.message = json.message;
  }

  return (json?.data ?? json) as T;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:5173";
  const url = new URL(`${BASE_URL}${path}`, base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export const apiClient = {
  get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = buildUrl(path, params);
    const doRequest = () =>
      fetch(url, { headers: buildHeaders(false), signal: timeoutSignal() });
    return doRequest().then((res) => handleResponse<T>(res, doRequest));
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    const url = buildUrl(path);
    const isFormData = body instanceof FormData;
    const doRequest = () =>
      fetch(url, {
        method: "POST",
        headers: buildHeaders(!isFormData, isFormData),
        body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
        signal: timeoutSignal(),
      });
    return doRequest().then((res) => handleResponse<T>(res, doRequest));
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    const url = buildUrl(path);
    const isFormData = body instanceof FormData;
    const doRequest = () =>
      fetch(url, {
        method: "PATCH",
        headers: buildHeaders(!isFormData, isFormData),
        body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
        signal: timeoutSignal(),
      });
    return doRequest().then((res) => handleResponse<T>(res, doRequest));
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    const url = buildUrl(path);
    const isFormData = body instanceof FormData;
    const doRequest = () =>
      fetch(url, {
        method: "PUT",
        headers: buildHeaders(!isFormData, isFormData),
        body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
        signal: timeoutSignal(),
      });
    return doRequest().then((res) => handleResponse<T>(res, doRequest));
  },

  delete<T = void>(path: string): Promise<T> {
    const url = buildUrl(path);
    const doRequest = () =>
      fetch(url, {
        method: "DELETE",
        headers: buildHeaders(false),
        signal: timeoutSignal(),
      });
    return doRequest().then((res) => handleResponse<T>(res, doRequest));
  },
};
