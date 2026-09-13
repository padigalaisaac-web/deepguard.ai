import { supabase } from "../lib/supabase";

const rawApiUrl = import.meta.env.VITE_API_URL || "";

const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : "/api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  // Get the current Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Add Supabase access token
  if (session?.access_token && !headers.has("Authorization")) {
    headers.set(
      "Authorization",
      `Bearer ${session.access_token}`
    );
  }

  // Do not add JSON content type to FormData
  if (
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = null;
      let errorMessage = "An unexpected error occurred.";

      try {
        errorData = await response.json();

        errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorMessage;
      } catch {
        errorMessage =
          response.statusText || errorMessage;
      }

      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream")
    ) {
      return (await response.blob()) as unknown as T;
    }

    const text = await response.text();

    if (!text.trim()) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(
        `Server returned invalid JSON. Status: ${response.status}`,
        response.status
      );
    }
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error?.message ||
        "Network connection error. Detection service may be offline.",
      0
    );
  }
}

export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestInit
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "GET",
    }),

  post: <T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ) => {
    const isFormData = body instanceof FormData;

    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData
        ? body
        : body
        ? JSON.stringify(body)
        : undefined,
    });
  },

  patch: <T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(
    endpoint: string,
    options?: RequestInit
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "DELETE",
    }),
};
