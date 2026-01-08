/**
 * TanStack Query Provider
 * Wraps the application with QueryClient for global state management
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // Create QueryClient instance with production-optimized defaults
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data is fresh for 1 minute
                        staleTime: 1000 * 60,
                        // Keep unused data in cache for 10 minutes
                        gcTime: 1000 * 60 * 10,
                        // Don't refetch just because window was focused
                        refetchOnWindowFocus: false,
                        // Retry failed requests once
                        retry: 1,
                        // Retry after 1 second
                        retryDelay: 1000,
                    },
                    mutations: {
                        // Don't retry mutations
                        retry: 0,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools only show in development */}
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        </QueryClientProvider>
    );
}
