import { supabase } from '../lib/supabase';

const rawApiUrl = import.meta.env.VITE_API_URL || '';

const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : '';

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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const headers = new Headers(
    options.headers || {}
  );

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
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  console.log('API Request:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      window.dispatchEvent(
        new Event('auth:unauthorized')
      );
    }

    if (!response.ok) {
      let errorDetail =
        'An unexpected error occurred';

      let errorData = null;

      try {
        errorData = await response.json();

        errorDetail =
          errorData.detail ||
          errorData.message ||
          errorDetail;

      } catch {
        errorDetail =
          response.statusText ||
          errorDetail;
      }

      throw new ApiError(
        errorDetail,
        response.status,
        errorData
      );
    }

    const contentType =
      response.headers.get('content-type');

    if (
      contentType &&
      contentType.includes('application/pdf')
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
        'Server returned invalid JSON.',
        response.status
      );
    }

  } catch (error: any) {

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message ||
        'Failed to connect to the detection service.',
      0
    );
  }
}

export const api = {

  get: <T>(
    endpoint: string,
    options?: RequestInit
  ) =>
    request<T>(
      endpoint,
      {
        ...options,
        method: 'GET',
      }
    ),

  post: <T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ) => {

    const isFormData =
      body instanceof FormData;

    return request<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: isFormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
      }
    );
  },

  patch: <T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ) =>
    request<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body
          ? JSON.stringify(body)
          : undefined,
      }
    ),

  delete: <T>(
    endpoint: string,
    options?: RequestInit
  ) =>
    request<T>(
      endpoint,
      {
        ...options,
        method: 'DELETE',
      }
    ),
};
