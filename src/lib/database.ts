import { createClient } from '@/utils/supabase/client';

// Database types ehee
export interface DatabaseShop {
  id: string;
  owner_id: string;
  name: string;
  logo: string | null;
  industry: string;
  shop_number: string;
  city: string;
  mall: string;
  whatsapp_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export interface DatabasePayment {
  id: string;
  shop_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_date: string | null;
  due_date: string;
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shops?: {
    id: string;
    name: string;
    owner_id: string;
    profiles?: {
      full_name: string;
      email: string;
    };
  };
}

export interface DatabaseCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DatabaseProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'shop_owner';
  created_at: string;
  updated_at: string;
}

// Client-side database operations
export class DatabaseClient {
  private supabase = createClient();

  // Shops
  async getShops(filters?: {
    search?: string;
    industry?: string;
    status?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`/api/shops?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shops');
    }
    return response.json();
  }

  async getShop(id: string) {
    const response = await fetch(`/api/shops/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop');
    }
    return response.json();
  }

  async createShop(shopData: {
    name: string;
    logo?: string;
    industry: string;
    shop_number: string;
    city: string;
    mall: string;
    whatsapp_number: string;
  }) {
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create shop');
    }
    return response.json();
  }

  async updateShop(id: string, shopData: Partial<{
    name: string;
    logo: string;
    industry: string;
    shop_number: string;
    city: string;
    mall: string;
    whatsapp_number: string;
    status: string;
  }>) {
    const response = await fetch(`/api/shops/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update shop');
    }
    return response.json();
  }

  async deleteShop(id: string) {
    const response = await fetch(`/api/shops/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete shop');
    }
    return response.json();
  }

  // Payments
  async getPayments(filters?: {
    search?: string;
    status?: string;
    shop_id?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.shop_id) params.append('shop_id', filters.shop_id);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`/api/payments?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    return response.json();
  }

  async updatePayment(id: string, paymentData: Partial<{
    amount: number;
    currency: string;
    status: string;
    payment_date: string;
    due_date: string;
    payment_method: string;
    transaction_id: string;
    notes: string;
  }>) {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update payment');
    }
    return response.json();
  }

  // Categories
  async getCategories() {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }

  // User profile
  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getUserProfile() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  }
}

// Export a singleton instance
export const db = new DatabaseClient();
