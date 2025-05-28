// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on 401, 403, 404
          if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
            return false
          }
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        onError: (error: any) => {
          console.error('Mutation error:', error)
        },
      },
    },
  })

// Global query client instance
export const queryClient = createQueryClient()

// Query keys factory
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  
  // Shops
  shops: ['shops'] as const,
  shop: (id: string) => ['shops', id] as const,
  userShops: (userId: string) => ['shops', 'user', userId] as const,
  
  // Admin
  adminShops: (filters?: Record<string, any>) => ['admin', 'shops', filters] as const,
  adminAnalytics: (timeFrame?: string) => ['admin', 'analytics', timeFrame] as const,
  
  // Payments
  payments: ['payments'] as const,
  payment: (id: string) => ['payments', id] as const,
  userPayments: (userId: string) => ['payments', 'user', userId] as const,
  paymentSettings: ['payment-settings'] as const,
  
  // Lookup data
  industries: ['lookup', 'industries'] as const,
  cities: ['lookup', 'cities'] as const,
  malls: (cityId?: string) => cityId 
    ? ['lookup', 'malls', 'city', cityId] as const
    : ['lookup', 'malls'] as const,
} as const