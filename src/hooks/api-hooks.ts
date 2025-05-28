// src/hooks/api-hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { useAuth } from '@/stores/auth-store'
import { toast } from 'sonner'

// Types
interface Shop {
  id: string
  name: string
  logo: string | null
  industry: string
  shop_number: string
  city: string
  mall: string
  whatsapp_number: string
  status: 'pending' | 'approved' | 'rejected'
  owner_id: string
  created_at: string
  updated_at: string
}

interface Payment {
  id: string
  shop_id: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'overdue'
  payment_date: string | null
  due_date: string
  payment_method: string | null
  transaction_id: string | null
  notes: string | null
}

interface LookupData {
  industries: Array<{ id: string; name: string }>
  cities: Array<{ id: string; name: string }>
  malls: Array<{ id: string; name: string; city_id: string }>
}

// API functions
const api = {
  // Shops
  async getShops(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/shops?${params}`)
    if (!response.ok) throw new Error('Failed to fetch shops')
    return response.json()
  },

  async getShop(id: string) {
    const response = await fetch(`/api/shops/${id}`)
    if (!response.ok) throw new Error('Failed to fetch shop')
    return response.json()
  },

  async createShop(data: Partial<Shop>) {
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create shop')
    return response.json()
  },

  async updateShop(id: string, data: Partial<Shop>) {
    const response = await fetch(`/api/shops/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update shop')
    return response.json()
  },

  async approveShop(id: string) {
    const response = await fetch(`/api/shops/${id}/approve`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to approve shop')
    return response.json()
  },

  async rejectShop(id: string) {
    const response = await fetch(`/api/shops/${id}/reject`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to reject shop')
    return response.json()
  },

  // Payments
  async getPayments(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/payments?${params}`)
    if (!response.ok) throw new Error('Failed to fetch payments')
    return response.json()
  },

  async markPaymentAsPaid(id: string, data: { paymentMethod: string; transactionId: string }) {
    const response = await fetch(`/api/payments/${id}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to mark payment as paid')
    return response.json()
  },

  // Lookup data
  async getIndustries() {
    const response = await fetch('/api/lookup/industries')
    if (!response.ok) throw new Error('Failed to fetch industries')
    return response.json()
  },

  async getCities() {
    const response = await fetch('/api/lookup/cities')
    if (!response.ok) throw new Error('Failed to fetch cities')
    return response.json()
  },

  async getMalls(cityId?: string) {
    const url = cityId ? `/api/lookup/malls?cityId=${cityId}` : '/api/lookup/malls'
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch malls')
    return response.json()
  },

  // Analytics
  async getAnalytics(timeFrame?: string) {
    const url = timeFrame ? `/api/admin/analytics?timeFrame=${timeFrame}` : '/api/admin/analytics'
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  },
}

// Shop hooks
export const useShops = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.shops,
    queryFn: () => api.getShops(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useShop = (id: string) => {
  return useQuery({
    queryKey: queryKeys.shop(id),
    queryFn: () => api.getShop(id),
    enabled: !!id,
  })
}

export const useUserShops = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.userShops(user?.id || ''),
    queryFn: () => api.getShops({ owner_id: user?.id }),
    enabled: !!user?.id,
  })
}

export const useCreateShop = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops })
      queryClient.invalidateQueries({ queryKey: queryKeys.userShops })
      toast.success('Shop created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create shop')
    },
  })
}

export const useUpdateShop = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shop> }) =>
      api.updateShop(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shop(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops })
      toast.success('Shop updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shop')
    },
  })
}

export const useApproveShop = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.approveShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminShops() })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops })
      toast.success('Shop approved successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve shop')
    },
  })
}

export const useRejectShop = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.rejectShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminShops() })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops })
      toast.success('Shop rejected successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject shop')
    },
  })
}

// Payment hooks
export const usePayments = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: () => api.getPayments(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useUserPayments = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.userPayments(user?.id || ''),
    queryFn: () => api.getPayments({ user_id: user?.id }),
    enabled: !!user?.id,
  })
}

export const useMarkPaymentAsPaid = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { paymentMethod: string; transactionId: string } }) =>
      api.markPaymentAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments })
      queryClient.invalidateQueries({ queryKey: queryKeys.userPayments })
      toast.success('Payment marked as paid!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark payment as paid')
    },
  })
}

// Lookup data hooks
export const useIndustries = () => {
  return useQuery({
    queryKey: queryKeys.industries,
    queryFn: api.getIndustries,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useCities = () => {
  return useQuery({
    queryKey: queryKeys.cities,
    queryFn: api.getCities,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useMalls = (cityId?: string) => {
  return useQuery({
    queryKey: queryKeys.malls(cityId),
    queryFn: () => api.getMalls(cityId),
    enabled: !!cityId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Analytics hooks (admin only)
export const useAnalytics = (timeFrame?: string) => {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.adminAnalytics(timeFrame),
    queryFn: () => api.getAnalytics(timeFrame),
    enabled: profile?.user_role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Admin hooks
export const useAdminShops = (filters?: Record<string, any>) => {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.adminShops(filters),
    queryFn: () => api.getShops(filters),
    enabled: profile?.user_role === 'admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}