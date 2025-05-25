"use client";
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'shop_owner';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profileData;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, [supabase]);

  const initializeAuth = useCallback(async () => {
    try {
      // First check if there's a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!session) {
        // No session, user is not logged in
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // If we have a session, get the user
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(authUser);

      if (authUser) {
        const profileData = await fetchProfile(authUser.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              setUser(session.user);
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
            }
            setLoading(false);
            break;

          case 'SIGNED_OUT':
            setUser(null);
            setProfile(null);
            setLoading(false);
            break;

          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setUser(session.user);
              // Profile should remain the same, but refresh if needed
              if (!profile) {
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
              }
            }
            setLoading(false);
            break;

          case 'USER_UPDATED':
            if (session?.user) {
              setUser(session.user);
              // Refresh profile in case user metadata changed
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
            }
            break;

          default:
            setLoading(false);
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initializeAuth, fetchProfile, profile]);

  const isAuthenticated = !loading && !!user && !!profile;

  return {
    user,
    profile,
    loading,
    isAuthenticated,
  };
}
