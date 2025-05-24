export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      malls: {
        Row: {
          city_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "malls_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          id: string
          message: string | null
          sent_at: string | null
          shop_id: string | null
          status: Database["public"]["Enums"]["reminder_status"] | null
        }
        Insert: {
          id?: string
          message?: string | null
          sent_at?: string | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["reminder_status"] | null
        }
        Update: {
          id?: string
          message?: string | null
          sent_at?: string | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["reminder_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          created_at: string | null
          id: string
          monthly_fee: number | null
          payment_duration: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_fee?: number | null
          payment_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_fee?: number | null
          payment_duration?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Relationships: []
      }
      shop_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          shop_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_payments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          city_id: string | null
          created_at: string | null
          id: string
          industry_id: string | null
          logo: string | null
          mall_id: string | null
          name: string
          owner_id: string | null
          shop_number: string
          status: Database["public"]["Enums"]["shop_status"] | null
          updated_at: string | null
          whatsapp_number: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          logo?: string | null
          mall_id?: string | null
          name: string
          owner_id?: string | null
          shop_number: string
          status?: Database["public"]["Enums"]["shop_status"] | null
          updated_at?: string | null
          whatsapp_number: string
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          logo?: string | null
          mall_id?: string | null
          name?: string
          owner_id?: string | null
          shop_number?: string
          status?: Database["public"]["Enums"]["shop_status"] | null
          updated_at?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_mall_id_fkey"
            columns: ["mall_id"]
            isOneToOne: false
            referencedRelation: "malls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_monthly_payments: {
        Args: { start_date: string; end_date: string }
        Returns: {
          month: string
          total_payments: number
          paid_payments: number
        }[]
      }
      get_monthly_revenue: {
        Args: { start_date: string; end_date: string }
        Returns: {
          month: string
          revenue: number
        }[]
      }
      get_monthly_shop_growth: {
        Args: { start_date: string; end_date: string }
        Returns: {
          month: string
          new_shops: number
        }[]
      }
      get_monthly_user_growth: {
        Args: { start_date: string; end_date: string }
        Returns: {
          month: string
          new_users: number
        }[]
      }
      get_shops_by_industry: {
        Args: Record<PropertyKey, never>
        Returns: {
          industry_name: string
          shop_count: number
        }[]
      }
      mark_overdue_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      payment_status: "pending" | "paid" | "failed" | "overdue"
      reminder_status: "sent" | "failed"
      shop_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "shop_owner" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 