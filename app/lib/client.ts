/**
 * apiClient — HTTP client trung tâm cho toàn bộ frontend.
 *
 * Automatically:
 *  - Uses the base URL from VITE_API_URL
 *  - Reads the access token from the auth store (Zustand) — never from localStorage directly
 *  - Unwraps `response.data` from the BE envelope { success, message, data }
 *  - Throws an error with the server message if the response is not OK
 *  - If 401 → tries refresh token → retries the original request → if it still fails → clears auth + redirects
 */

import { useAuthStore } from "@/auth/store/auth.store";
import { useCartStore } from "@/public/store/cart.store";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).trim();

/** Default timeout for every request (30 seconds) */
const REQUEST_TIMEOUT_MS = 30_000;

/** Create an AbortSignal with timeout to avoid hanging requests */
function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

// Prevent infinite loops when token refresh also fails
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

function getActiveStore() {
  return useAuthStore.getState();
}

function buildHeaders(isJson = true, isFormData = false): HeadersInit {
  const token = getActiveStore().token;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (isJson && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/**
 * Try to refresh the access token using the refresh token in the store.
 * Returns a new access token or null on failure.
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
      // Update the access token in the store (no need to log in again)
      store.setAccessToken(data.accessToken);
      // Update the refresh token if the server issued a new one (token rotation)
      if (data.refreshToken) {
        // Keep the current user and swap in the new tokens
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
    // Try refreshing once, sharing the promise to avoid race conditions
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Retry the original request with the new token
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

    // Refresh failed -> clear auth + redirect
    const store = getActiveStore();
    const hadToken = !!store.token;
    store.clearAuth();
    useCartStore.getState().clearCart();

    if (hadToken && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login")
        window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
    }
    throw new Error("Your session has expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Error ${res.status}`);
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
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
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
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
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
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
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
