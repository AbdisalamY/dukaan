// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

// Types
export interface UserProfile {
  id: string
  full_name: string | null
  username: string | null
  email: string | null
  avatar_url: string | null
  user_role: 'admin' | 'shop_owner' | 'customer'
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signOut: () => void
  reset: () => void
}

export type AuthStore = AuthState & AuthActions

// Initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Create auth store with persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => 
        set((state) => ({
          user,
          isAuthenticated: !!user,
          error: null,
        })),
      
      setProfile: (profile) =>
        set({ profile }),
      
      setLoading: (isLoading) =>
        set({ isLoading }),
      
      setError: (error) =>
        set({ error, isLoading: false }),
      
      signOut: () =>
        set(initialState),
      
      reset: () =>
        set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selectors for better performance
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  profile: state.profile,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}))

export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setProfile: state.setProfile, 
  setLoading: state.setLoading,
  setError: state.setError,
  signOut: state.signOut,
  reset: state.reset,
}))