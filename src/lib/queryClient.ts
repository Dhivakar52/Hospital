import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * Shared central QueryClient instance.
 * Configured with sensible stale times, cache times, window focus refetching,
 * and robust retry logic tailored to the backend.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute before refetching in background
      staleTime: 1000 * 60,
      // Inactive queries are cached in memory for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Refetch when window regains focus to keep data synchronized without manual refresh
      refetchOnWindowFocus: true,
      // Refetch when internet reconnects
      refetchOnReconnect: true,
      // Smart retry policy: do not retry on 4xx client errors (400, 401, 403, 404)
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
