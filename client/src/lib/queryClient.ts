import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Extended RequestInit with our custom options
interface ExtendedRequestInit extends RequestInit {
  on401?: "returnNull" | "throw";
}

export async function apiRequest<T = any>(
  url: string,
  options?: ExtendedRequestInit,
): Promise<T> {
  console.log(`API Request to ${url}, method: ${options?.method || 'GET'}, body:`, options?.body);
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    
    console.log(`API Response from ${url}, status: ${res.status}`);
    
    // Handle 401 based on the custom option
    if (options?.on401 === "returnNull" && res.status === 401) {
      console.log("Returning null for 401 unauthorized");
      return null as T;
    }
    
    // Clone the response to log it without consuming it
    const clonedRes = res.clone();
    
    try {
      const textResponse = await clonedRes.text();
      console.log(`Response text from ${url}:`, textResponse);
    } catch (err) {
      console.error("Error reading response text:", err);
    }

    await throwIfResNotOk(res);
    const data = await res.json() as T;
    console.log(`Parsed JSON data from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`API Request error for ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute instead of Infinity to refresh occasionally
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
