import { ApiError, type ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const credentials = options.credentials || 'include';

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials,
    });

    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register' && endpoint !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({ resolve: () => resolve(fetchApi<T>(endpoint, options)), reject });
        });
      }

      const originalRequest = options;
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials,
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh failed');
        }

        // The cookie is now automatically updated by the backend via Set-Cookie
        processQueue(null);

        // Retry original request
        return fetchApi<T>(endpoint, originalRequest);
      } catch (err) {
        processQueue(err as Error);
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new ApiError('Session expired', 401);
      } finally {
        isRefreshing = false;
      }
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const typedData = data as Partial<ApiResponse>;
      const message = typedData.message || response.statusText;
      const errors = typedData.errors;
      throw new ApiError(message, response.status, errors, typedData.data);
    }

    return (data as ApiResponse<T>).data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Unknown network error', 500);
  }
}
