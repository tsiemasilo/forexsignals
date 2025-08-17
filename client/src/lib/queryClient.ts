import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export { queryClient };

export async function apiRequest(url: string, options: RequestInit = {}) {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session handling
    ...options,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body) {
    config.body = options.body;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      // Throw the parsed error data to preserve structure
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      // Attach additional error properties
      Object.assign(error, errorData);
      throw error;
    } else {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response;
}