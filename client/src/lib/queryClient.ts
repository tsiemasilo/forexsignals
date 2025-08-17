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
  console.log('Making API request to:', url, 'with credentials:', options.credentials || 'include');
  console.log('Document cookies:', document.cookie);
  
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
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      console.log('API Error Data:', errorData); // Debug log
      // Create a custom error that preserves all properties
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      // Attach all properties from the error response
      Object.assign(error, errorData);
      console.log('Throwing error with properties:', error); // Debug log
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