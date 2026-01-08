/**
 * TanStack Query Hooks for ePerolehan Scraper
 * 
 * Provides:
 * - useTenders: Fetch and cache tenders with auto-refresh
 * - useStats: Fetch statistics
 * - useCategories: Fetch categories for filtering
 * - useScrapeStatus: Poll scrape progress
 * - useUpdateTender: Optimistic mutation for status updates
 * - useTriggerScrape: Start a new scrape
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Tender, TenderStatus } from '../data/mockTenders';

// ==================== DATA TRANSFORMER ====================

/**
 * Transform API response to frontend Tender format
 * API uses snake_case, frontend uses camelCase with nested objects
 */
export const transformApiTender = (apiTender: any): Tender => {
    return {
        id: apiTender.id,
        quotationNumber: apiTender.quotation_number || '',
        category: {
            code: apiTender.category_code || '',
            name: apiTender.category_name || 'Unknown Category',
        },
        summary: apiTender.summary || '',
        description: apiTender.description || apiTender.summary || '',
        amount: parseFloat(apiTender.amount) || 0,
        ministry: {
            name: apiTender.ministry_name || 'Unknown Ministry',
            department: apiTender.ministry_department || '',
            contact: apiTender.ministry_contact || '',
            phone: apiTender.ministry_phone || '',
            location: apiTender.ministry_location || '',
        },
        dates: {
            published: apiTender.date_published ? new Date(apiTender.date_published) : new Date(),
            closing: apiTender.date_closing ? new Date(apiTender.date_closing) : new Date(),
            briefing: apiTender.date_briefing ? new Date(apiTender.date_briefing) : undefined,
        },
        tags: Array.isArray(apiTender.tags) ? apiTender.tags : [],
        status: apiTender.status || 'available',
        isUrgent: apiTender.is_urgent || false,
        documents: Array.isArray(apiTender.documents) ? apiTender.documents.map((doc: any) => ({
            name: doc.name || '',
            size: doc.size || '',
            url: doc.url || '',
        })) : [],
        budgetCode: apiTender.budget_code,
        paymentTerms: apiTender.payment_terms,
        notes: apiTender.notes,
        activityHistory: [],
    };
};

// ==================== QUERY HOOKS ====================

export interface TenderFilters {
    status?: TenderStatus;
    categories?: string[];
    search?: string;
    limit?: number;
}

/**
 * Fetch tenders with optional filtering
 * Auto-refreshes every 5 minutes
 */
export const useTenders = (filters?: TenderFilters) => {
    return useQuery({
        queryKey: ['tenders', filters],
        queryFn: async () => {
            const response = await api.getTenders(undefined, filters?.limit || 100);
            if (!response.success) {
                throw new Error('Failed to fetch tenders');
            }
            return response.tenders.map(transformApiTender);
        },
        staleTime: 1000 * 60, // 1 minute
        refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
        refetchOnWindowFocus: false,
    });
};

/**
 * Fetch tender statistics
 */
export const useStats = () => {
    return useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const response = await api.getStats();
            if (!response.success) {
                throw new Error('Failed to fetch stats');
            }
            return response.stats;
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

/**
 * Fetch categories for filtering
 */
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.getCategories();
            if (!response.success) {
                throw new Error('Failed to fetch categories');
            }
            return response.categories;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes (categories rarely change)
    });
};

/**
 * Poll scrape status while scraping is in progress
 */
export const useScrapeStatus = (isPolling: boolean = false) => {
    return useQuery({
        queryKey: ['scrapeStatus'],
        queryFn: async () => {
            const response = await api.getScrapeStatus();
            return response;
        },
        enabled: isPolling,
        refetchInterval: isPolling ? 3000 : false, // Poll every 3 seconds while scraping
    });
};

// ==================== MUTATION HOOKS ====================

/**
 * Update tender status with optimistic update
 * UI updates instantly, rolls back on error
 */
export const useUpdateTenderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ quotationNumber, status, notes }: {
            quotationNumber: string;
            status: TenderStatus;
            notes?: string;
        }) => {
            const response = await api.updateTender(quotationNumber, { status, notes });
            if (!response.success) {
                throw new Error('Failed to update tender');
            }
            return response;
        },

        // Optimistic update - UI changes immediately
        onMutate: async ({ quotationNumber, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tenders'] });

            // Snapshot the previous value
            const previousTenders = queryClient.getQueryData<Tender[]>(['tenders']);

            // Optimistically update to the new value
            queryClient.setQueryData<Tender[]>(['tenders'], (old) =>
                old?.map(t =>
                    t.quotationNumber === quotationNumber
                        ? { ...t, status }
                        : t
                ) || []
            );

            // Return context with the previous value
            return { previousTenders };
        },

        // If mutation fails, rollback to previous value
        onError: (err, variables, context) => {
            if (context?.previousTenders) {
                queryClient.setQueryData(['tenders'], context.previousTenders);
            }
        },

        // After success or failure, refetch to ensure sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tenders'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

/**
 * Trigger a new scrape
 */
export const useTriggerScrape = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await api.triggerScrape();
            if (!response.success) {
                throw new Error('Failed to start scrape');
            }
            return response;
        },

        onSuccess: () => {
            // Invalidate queries after a delay to allow scrape to complete
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['tenders'] });
                queryClient.invalidateQueries({ queryKey: ['stats'] });
            }, 30000); // 30 seconds
        },
    });
};

/**
 * Toggle category enabled/disabled
 */
export const useToggleCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ code, enabled }: { code: string; enabled: boolean }) => {
            const response = await api.toggleCategory(code, enabled);
            if (!response.success) {
                throw new Error('Failed to toggle category');
            }
            return response;
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
