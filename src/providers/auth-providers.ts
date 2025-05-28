// src/providers/auth-provider.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useAuthActions } from '@/stores/auth-store'
import { authService } from '@/services/auth-service'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, isAuthenticated, user, profile } = useAuthStore()
  const { setUser, setProfile, setLoading, setError, signOut } = useAuthActions()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const { session, error } = await authService.getSession()
        
        if (error) {
          setError(error)
          return
        }

        if (session?.user) {
          setUser(session.user)
          
          // Fetch user profile
          const { profile, error: profileError } = await authService.getUserProfile(session.user.id)
          
          if (profileError) {
            console.error('Failed to fetch profile:', profileError)
          } else {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [setUser, setProfile, setLoading, setError])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        
        // Fetch user profile
        const { profile } = await authService.getUserProfile(session.user.id)
        setProfile(profile)
        
        // Redirect after sign in
        if (pathname === '/sign-in' || pathname === '/sign-up') {
          const targetPath = profile?.user_role === 'admin' 
            ? '/admin/dashboard' 
            : '/shop/dashboard'
          router.push(targetPath)
        }
      } else if (event === 'SIGNED_OUT') {
        signOut()
        
        // Redirect to home after sign out
        if (pathname.startsWith('/admin') || pathname.startsWith('/shop')) {
          router.push('/')
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading, signOut, router, pathname])

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/', '/sign-in', '/sign-up', '/forgot-password']
      const isPublicPath = publicPaths.includes(pathname)
      const requiresAuth = pathname.startsWith('/admin') || pathname.startsWith('/shop')
      
      if (requiresAuth && !isAuthenticated) {
        router.push('/sign-in')
      } else if (isAuthenticated && (pathname === '/sign-in' || pathname === '/sign-up')) {
        const targetPath = profile?.user_role === 'admin' 
          ? '/admin/dashboard' 
          : '/shop/dashboard'
        router.push(targetPath)
      } else if (isAuthenticated && pathname.startsWith('/admin') && profile?.user_role !== 'admin') {
        router.push('/shop/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, pathname, profile?.user_role, router])

  // Show loading spinner during initialization
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}