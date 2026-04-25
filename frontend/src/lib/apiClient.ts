// apiClient.ts — Core HTTP wrapper; handles base URL, auth headers, and standardized error normalization.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// ─── Custom Error ─────────────────────────────────────────────────────────────

/**
 * Custom error class for API failures.
 */
export class ApiError extends Error {
  public readonly message: string;
  public readonly status: number;
  public readonly errors?: string[];

  constructor(
    message: string,
    status: number,
    errors?: string[]
  ) {
    super(message);
    this.message = message;
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  data?: unknown;
}

// The shape our backend always returns
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

// ─── Implementation ───────────────────────────────────────────────────────────

/**
 * Standard fetch wrapper for making authenticated API requests.
 * @param endpoint - API path (e.g., '/auth/login')
 * @param options - Fetch options plus optional JSON data body
 * @returns Parsed JSON response data
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, ...customConfig } = options;
  const token = localStorage.getItem('token');

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const result = (await response.json()) as ApiResponse<T> & { message?: string }; 

  if (!response.ok) {
    if (result.success === false) {
      throw new ApiError(
        result.message || 'An error occurred',
        response.status,
        result.errors
      );
    }
    throw new ApiError(result.message || response.statusText, response.status);
  }

  if ('success' in result && result.success === true && 'data' in result) {
    return result.data;
  }
  
  return result as unknown as T;
}
