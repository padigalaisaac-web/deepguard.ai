import { supabase } from '../lib/supabase';

const rawApiUrl = import.meta.env.VITE_API_URL || '';

const API_BASE_URL = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}/api`
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
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  const cleanEndpoint = endpoint.startsWith('/api/')
    ? endpoint.substring(4)
    : endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  console.log('API Request:', url);

  const headers = new Headers(options.headers);

  if (session?.access_token) {
    headers.set(
      'Authorization',
      `Bearer ${session.access_token}`
    );
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const result = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      typeof result === 'object' && result !== null && 'detail' in result
        ? String((result as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`,
      response.status,
      result
    );
  }

  return result as T;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: 'GET',
    }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData
        ? body
        : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: 'DELETE',
    }),
};
