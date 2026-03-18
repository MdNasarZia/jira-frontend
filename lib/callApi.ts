const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Shape of errors thrown by FastAPI backend
export interface ApiErrorBody {
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  detail?: string | { msg: string; type: string }[];
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const message =
      (typeof body.error?.message === "string" ? body.error.message : null) ??
      (typeof body.detail === "string" ? body.detail : null) ??
      `HTTP ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function getToken(key: "access_token" | "refresh_token"): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function setTokens(access_token: string, refresh_token: string) {
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string> {
  const refresh_token = getToken("refresh_token");
  if (!refresh_token) {
    clearTokens();
    throw new ApiError(401, { detail: "No refresh token available" });
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    clearTokens();
    const body: ApiErrorBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }

  const { access_token, refresh_token: new_refresh } = await res.json();
  setTokens(access_token, new_refresh ?? refresh_token);
  return access_token;
}

/**
 * Core fetch wrapper for the FastAPI backend.
 * - Attaches Bearer token automatically
 * - On 401, attempts one token refresh then retries
 * - Throws ApiError with the backend error shape on failure
 */
export async function callApi<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getToken("access_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    return callApi<T>(
      path,
      {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      },
      false
    );
  }

  if (!res.ok) {
    const body: ApiErrorBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export const auth = {
  login: async (email: string, password: string) => {
    const data = await callApi<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  logout: () => clearTokens(),

  isLoggedIn: () => Boolean(getToken("access_token")),
};
