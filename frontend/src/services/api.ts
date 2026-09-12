import { supabase } from '../lib/supabase';

const rawApiUrl = (
  import.meta.env.VITE_API_URL || ''
).trim().replace(/\/+$/, '');

const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(
    message: string,
    status: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function getAccessToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  } catch {
    return localStorage.getItem(
      'deepguard_token'
    );
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(
    options.headers || {}
  );

  const token = await getAccessToken();

  if (
    token &&
    !headers.has('Authorization')
  ) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const isFormData =
    options.body instanceof FormData;

  if (
    !isFormData &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (
      response.status === 401 &&
      !endpoint.includes('/auth/login')
    ) {
      localStorage.removeItem(
        'deepguard_token'
      );

      localStorage.removeItem(
        'deepguard_user'
      );

      window.dispatchEvent(
        new Event('auth:unauthorized')
      );
    }

    if (!response.ok) {
      let errorData: any = null;
      let errorMessage =
        'An unexpected error occurred.';

      try {
        const responseText =
          await response.text();

        if (responseText.trim()) {
          try {
            errorData =
              JSON.parse(responseText);

            errorMessage =
              errorData?.detail ||
              errorData?.message ||
              errorMessage;
          } catch {
            errorMessage =
              responseText;
          }
        }
      } catch {
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

    const contentType =
      response.headers.get(
        'content-type'
      ) || '';

    if (
      contentType.includes(
        'application/pdf'
      ) ||
      contentType.includes(
        'application/octet-stream'
      )
    ) {
      return (await response.blob()) as T;
    }

    const responseText =
      await response.text();

    if (!responseText.trim()) {
      return {} as T;
    }

    try {
      return JSON.parse(
        responseText
      ) as T;
    } catch {
      throw new ApiError(
        `Server returned invalid JSON. Status: ${response.status}`,
        response.status,
        responseText
      );
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Network connection error.';

    throw new ApiError(
      `${message} Detection service may be offline.`,
      0
    );
  }
}

export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post: <T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> => {
    const isFormData =
      body instanceof FormData;

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
    body?: any,
    options?: RequestInit
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  },

  delete: <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};
