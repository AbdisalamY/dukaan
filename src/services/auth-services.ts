// src/services/auth-service.ts
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/stores/auth-store'

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  fullName: string
  username: string
}

export interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

class AuthService {
  // Sign in with email and password
  async signIn({ email, password }: SignInCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'No user returned from sign in' }
      }

      return { success: true, data: data.user }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  // Sign up with email and password
  async signUp({ email, password, fullName, username }: SignUpCredentials): Promise<AuthResult> {
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Failed to create user' }
      }

      // Create profile record in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          username,
          email,
          user_role: 'shop_owner', // Default role
        })

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id)
        return { success: false, error: profileError.message }
      }

      return { success: true, data: data.user }
    } catch (error) {
      console.error('Sign up error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  }

  // Sign out
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      }
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return { profile: null, error: error.message }
      }

      return { profile: data }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { 
        profile: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch profile' 
      }
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Get session error:', error)
        return { session: null, error: error.message }
      }

      return { session, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { 
        session: null, 
        error: error instanceof Error ? error.message : 'Failed to get session' 
      }
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()