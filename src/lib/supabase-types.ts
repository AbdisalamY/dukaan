// src/types/supabase-types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          email: string | null
          avatar_url: string | null
          user_role: 'admin' | 'shop_owner' | 'customer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          user_role?: 'admin' | 'shop_owner' | 'customer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          user_role?: 'admin' | 'shop_owner' | 'customer'
          created_at?: string
          updated_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          logo: string | null
          industry: string
          shop_number: string
          city: string
          mall: string
          whatsapp_number: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          logo?: string | null
          industry: string
          shop_number: string
          city: string
          mall: string
          whatsapp_number: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          logo?: string | null
          industry?: string
          shop_number?: string
          city?: string
          mall?: string
          whatsapp_number?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      payment_settings: {
        Row: {
          id: string
          monthly_fee: number
          payment_duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          monthly_fee?: number
          payment_duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          monthly_fee?: number
          payment_duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      shop_payments: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'overdue'
          payment_date?: string | null
          due_date: string
          payment_method?: string | null
          transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'overdue'
          payment_date?: string | null
          due_date?: string
          payment_method?: string | null
          transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_reminders: {
        Row: {
          id: string
          shop_id: string
          sent_at: string
          status: 'sent' | 'failed'
          message: string | null
        }
        Insert: {
          id?: string
          shop_id: string
          sent_at?: string
          status?: 'sent' | 'failed'
          message?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          sent_at?: string
          status?: 'sent' | 'failed'
          message?: string | null
        }
      }
      industries: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      malls: {
        Row: {
          id: string
          name: string
          city_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_shop_payment: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      calculate_next_payment_due: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      mark_overdue_payments: {
        Args: Record<PropertyKey, never>
        Returns: null
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}