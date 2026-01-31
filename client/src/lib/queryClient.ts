import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData: any = {
      message: res.statusText,
      error: res.status,
    };
    try {
      const json = await res.json();
      errorData = json;
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorData.message || errorData.error || res.statusText);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  // Build full URL with base
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}/api/v1${url}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  // Handle empty responses
  const text = await res.text();
  if (!text) {
    return {} as T;
  }

  try {
    const json = JSON.parse(text);
    // Return data from response structure or the whole response
    return (json.data || json) as T;
  } catch {
    return text as T;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fullUrl = `${API_BASE_URL}/api/v1${queryKey.join("")}`;

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const json = await res.json();
    return json.data || json;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
