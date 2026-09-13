import { supabase } from '../lib/supabase';

const rawApiUrl = import.meta.env.VITE_API_URL || '';

const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : '/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  /*
   * Get the current Supabase login session.
   * Do not use localStorage deepguard_token here.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.set(
      'Authorization',
      `Bearer ${session.access_token}`
    );
  }

  if (
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${
    endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await supabase.auth.signOut();

      localStorage.removeItem('deepguard_token');
      localStorage.removeItem('deepguard_user');

      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    if (!response.ok) {
      let errorDetail = 'An unexpected error occurred';
      let errorData: unknown = null;

      try {
        errorData = await response.json();

        if (
          typeof errorData === 'object' &&
          errorData !== null
        ) {
          const data = errorData as {
            detail?: string;
            message?: string;
          };

          errorDetail =
            data.detail ||
            data.message ||
            errorDetail;
        }
      } catch {
        errorDetail =
          response.statusText || errorDetail;
      }

      throw new ApiError(
        errorDetail,
        response.status,
        errorData
      );
    }

    const contentType =
      response.headers.get('content-type') || '';

    if (
      contentType.includes('application/pdf') ||
      contentType.includes('application/octet-stream')
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
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Network connection error';

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
  ) =>
    request<T>(endpoint, {
      ...options,
      method: 'GET',
    }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ) => {
    const isFormData = body instanceof FormData;

    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData
        ? body
        : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    });
  },

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }),

  delete: <T>(
    endpoint: string,
    options?: RequestInit
  ) =>
    request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    }),
};
