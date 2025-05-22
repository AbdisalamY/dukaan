// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';

// Extend the JWT type to include Supabase specific fields
interface ExtendedJWT extends JWT {
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/sign-in',
    signOut: '/',
    error: '/sign-in',
    verifyRequest: '/sign-in',
    newUser: '/sign-up'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          });

          if (error || !data.user) {
            console.error('Supabase sign in error:', error);
            return null;
          }

          // Get user profile to determine role
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: profileData.full_name,
            role: profileData.user_role,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const extendedToken = token as ExtendedJWT;
      
      // First sign in
      if (user) {
        return {
          ...extendedToken,
          supabaseAccessToken: user.accessToken,
          supabaseRefreshToken: user.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          }
        };
      }

      // Token refresh if needed
      if (Date.now() < extendedToken.exp * 1000) {
        return extendedToken;
      }

      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: extendedToken.supabaseRefreshToken as string
        });

        if (error || !data.session) {
          console.error('Token refresh error:', error);
          return {
            ...extendedToken,
            error: 'RefreshTokenError'
          };
        }

        return {
          ...extendedToken,
          supabaseAccessToken: data.session.access_token,
          supabaseRefreshToken: data.session.refresh_token,
          exp: Math.floor(Date.now() / 1000 + (30 * 24 * 60 * 60))
        };
      } catch (error) {
        console.error('Token refresh error:', error);
        return {
          ...extendedToken,
          error: 'RefreshTokenError'
        };
      }
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      
      return {
        ...session,
        supabaseAccessToken: extendedToken.supabaseAccessToken,
        user: {
          ...session.user,
          id: extendedToken.user.id,
          role: extendedToken.user.role
        },
        error: extendedToken.error
      };
    }
  }
};