// src/hooks/auth-hooks.ts
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth-service'
import { useAuthActions, useAuth } from '@/stores/auth-store'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner'

// Sign in mutation
export const useSignIn = () => {
  const router = useRouter()
  const { setUser, setProfile, setError } = useAuthActions()
  
  return useMutation({
    mutationFn: authService.signIn,
    onSuccess: async (result) => {
      if (result.success && result.data) {
        setUser(result.data)
        
        // Fetch user profile
        const { profile } = await authService.getUserProfile(result.data.id)
        setProfile(profile)
        
        toast.success('Signed in successfully!')
        
        // Redirect based on user role
        const targetPath = profile?.user_role === 'admin' 
          ? '/admin/dashboard' 
          : '/shop/dashboard'
        router.push(targetPath)
      } else {
        setError(result.error || 'Sign in failed')
        toast.error(result.error || 'Sign in failed')
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Sign in failed'
      setError(errorMessage)
      toast.error(errorMessage)
    },
  })
}

// Sign up mutation  
export const useSignUp = () => {
  const router = useRouter()
  const { setError } = useAuthActions()
  
  return useMutation({
    mutationFn: authService.signUp,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        router.push('/sign-in')
      } else {
        setError(result.error || 'Sign up failed')
        toast.error(result.error || 'Sign up failed')
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Sign up failed'
      setError(errorMessage)
      toast.error(errorMessage)
    },
  })
}

// Sign out mutation
export const useSignOut = () => {
  const router = useRouter()
  const { signOut: signOutStore } = useAuthActions()
  
  return useMutation({
    mutationFn: authService.signOut,
    onSuccess: (result) => {
      if (result.success) {
        signOutStore()
        toast.success('Signed out successfully!')
        router.push('/')
      } else {
        toast.error(result.error || 'Sign out failed')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Sign out failed')
    },
  })
}

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.')
      } else {
        toast.error(result.error || 'Failed to send reset email')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email')
    },
  })
}

// Custom hook to get auth state and actions
export const useAuthState = () => {
  const auth = useAuth()
  const signInMutation = useSignIn()
  const signUpMutation = useSignUp()
  const signOutMutation = useSignOut()
  const resetPasswordMutation = useResetPassword()
  
  return {
    // State
    ...auth,
    
    // Actions
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    
    // Loading states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  }
}