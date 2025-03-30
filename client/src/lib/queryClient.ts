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
    // Log payload if available
    if (options?.body) {
      try {
        console.log('Request payload:', JSON.parse(options.body as string));
      } catch (e) {
        console.log('Could not parse request body as JSON');
      }
    }
    
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    
    console.log(`API Response from ${url}, status: ${res.status}, statusText: ${res.statusText}`);
    
    // Handle 401 based on the custom option
    if (options?.on401 === "returnNull" && res.status === 401) {
      console.log("Returning null for 401 unauthorized");
      return null as T;
    }
    
    // Clone the response to log it without consuming it
    const clonedRes = res.clone();
    
    let responseText = '';
    try {
      responseText = await clonedRes.text();
      console.log(`Response text from ${url}:`, responseText);
    } catch (err) {
      console.error("Error reading response text:", err);
    }

    // Handle non-OK responses
    if (!res.ok) {
      console.error(`Error response from ${url}. Status: ${res.status}, Text: ${responseText || res.statusText}`);
      throw new Error(`API error ${res.status}: ${responseText || res.statusText}`);
    }
    
    // If response is empty or not JSON, handle it
    if (!responseText) {
      console.warn(`Empty response from ${url}`);
      return {} as T;
    }
    
    try {
      const data = JSON.parse(responseText) as T;
      console.log(`Parsed JSON data from ${url}:`, data);
      return data;
    } catch (jsonError) {
      console.error(`Failed to parse JSON from ${url}:`, jsonError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
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
    console.log(`QueryFn fetch for key: ${JSON.stringify(queryKey)}`);
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      console.log(`QueryFn response for ${queryKey[0]}, status: ${res.status}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Returning null for 401 unauthorized on ${queryKey[0]}`);
        return null;
      }

      // Clone the response to log it without consuming it
      const clonedRes = res.clone();
      
      let responseText = '';
      try {
        responseText = await clonedRes.text();
        console.log(`QueryFn response text from ${queryKey[0]}:`, responseText);
      } catch (err) {
        console.error(`Error reading queryFn response text for ${queryKey[0]}:`, err);
      }

      // Handle non-OK responses
      if (!res.ok) {
        console.error(`Error response in queryFn from ${queryKey[0]}. Status: ${res.status}, Text: ${responseText || res.statusText}`);
        throw new Error(`API error ${res.status}: ${responseText || res.statusText}`);
      }
      
      // If response is empty or not JSON, handle it
      if (!responseText) {
        console.warn(`Empty response in queryFn from ${queryKey[0]}`);
        return {} as any;
      }
      
      try {
        const data = JSON.parse(responseText) as any;
        console.log(`Parsed JSON data in queryFn from ${queryKey[0]}:`, data);
        return data;
      } catch (jsonError) {
        console.error(`Failed to parse JSON in queryFn from ${queryKey[0]}:`, jsonError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      console.error(`QueryFn error for ${queryKey[0]}:`, error);
      throw error;
    }
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
