import { QueryClient } from '@tanstack/react-query';

// Configure the React Query client with optimal settings for trading applications
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus as this can disrupt trading operations
      refetchOnWindowFocus: false,
      // Retry failed queries only once
      retry: 1,
      // Keep data fresh for 30 seconds
      staleTime: 30 * 1000,
      // Cache successful query results for 5 minutes
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Custom hook factory for creating query hooks with default options
export const createQueryHook = (queryFn: any, options = {}) => {
  return (queryKey: any[], queryOptions = {}) => {
    return {
      queryKey,
      queryFn,
      ...options,
      ...queryOptions,
    };
  };
};
