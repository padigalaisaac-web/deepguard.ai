import { supabase } from "../lib/supabase";

const rawApiUrl = import.meta.env.VITE_API_URL || "";

const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "").endsWith("/api")
    ? rawApiUrl.replace(/\/+$/, "")
    : `${rawApiUrl.replace(/\/+$/, "")}/api`
  : "/api";


export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
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
  const headers = new Headers(
    options.headers || {}
  );

  /*
   * Get the currently logged-in Supabase user session.
   */
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(
      "Supabase session error:",
      sessionError.message
    );
  }

  /*
   * Attach the Supabase access token.
   */
  if (session?.access_token) {
    headers.set(
      "Authorization",
      `Bearer ${session.access_token}`
    );
  }

  /*
   * Do not set Content-Type for FormData.
   * The browser automatically sets the correct boundary.
   */
  if (
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    /*
     * Handle unauthorized requests.
     */
    if (response.status === 401) {
      window.dispatchEvent(
        new Event("auth:unauthorized")
      );
    }

    /*
     * Read the response only once.
     */
    const contentType =
      response.headers.get("content-type") || "";

    if (!response.ok) {
      let errorData: unknown = null;
      let errorMessage =
        "An unexpected error occurred.";

      const responseText =
        await response.text();

      if (responseText.trim()) {
        try {
          errorData = JSON.parse(responseText);

          if (
            typeof errorData === "object" &&
            errorData !== null
          ) {
            const data = errorData as {
              detail?: string;
              message?: string;
            };

            errorMessage =
              data.detail ||
              data.message ||
              errorMessage;
          } else {
            errorMessage = responseText;
          }
        } catch {
          errorMessage = responseText;
        }
      } else {
        errorMessage =
          response.statusText ||
          errorMessage;
      }

      throw new ApiError(
        errorMessage,
        response.status,
        errorData
      );
    }

    /*
     * PDF or other binary response.
     */
    if (
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream")
    ) {
      return (
        await response.blob()
      ) as unknown as T;
    }

    /*
     * Handle empty responses such as HTTP 204.
     */
    const text = await response.text();

    if (!text.trim()) {
      return {} as T;
    }

    /*
     * Parse JSON response.
     */
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(
        `Server returned invalid JSON. Status: ${response.status}`,
        response.status,
        text
      );
    }

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to connect to the backend service.";

    throw new ApiError(
      `${message}. Detection service may be offline.`,
      0
    );
  }
}


export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "GET",
      }
    );
  },

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const isFormData =
      body instanceof FormData;

    return request<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body: isFormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  },

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  },

  delete: <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "DELETE",
      }
    );
  },
};
