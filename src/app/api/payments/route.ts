<<<<<<< HEAD
// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET all payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    let query = supabase
      .from('shop_payments')
      .select(`
        *,
        shops!inner(
          id,
          name,
          owner_id,
          profiles!inner(full_name, username, email)
        )
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ payments: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST new payment (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { shopId, amount, currency, status, dueDate, notes } = await request.json();
    
    if (!shopId || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Shop ID, amount, and due date are required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('shop_payments')
      .insert({
        shop_id: shopId,
        amount,
        currency: currency || 'KES',
        status: status || 'pending',
        due_date: dueDate,
        notes
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, payment: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/payments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET payment by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    let query = supabase
      .from('shop_payments')
      .select(`
        *,
        shops!inner(
          id,
          name,
          owner_id,
          profiles!inner(full_name, username, email)
        )
      `)
      .eq('id', id)
      .single();
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    // Check if user owns the shop or is an admin
    if (!isAdmin && data.shops.owner_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ payment: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH update payment (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    
    const { data, error } = await supabase
      .from('shop_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, payment: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/payments/[id]/mark-paid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// POST mark payment as paid
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    // If not admin, check if user owns the shop
    if (!isAdmin) {
      const { data: paymentData, error: paymentError } = await supabase
        .from('shop_payments')
        .select(`
          shops!inner(owner_id)
        `)
        .eq('id', id)
        .single();
      
      if (paymentError) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }
      
      if (paymentData.shops.owner_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
    
    const { paymentMethod, transactionId } = await request.json();
    
    const { data, error } = await supabase
      .from('shop_payments')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod,
        transaction_id: transactionId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, payment: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/user/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET current user's shop payments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    const { data, error } = await supabase
      .from('shop_payments')
      .select(`
        *,
        shops!inner(
          id,
          name,
          owner_id
        )
      `)
      .eq('shops.owner_id', userId);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ payments: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/payment-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET payment settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ settings: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH update payment settings (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { monthlyFee, paymentDuration } = await request.json();
    
    // Get the current settings
    const { data: currentSettings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (settingsError) {
      return NextResponse.json(
        { error: settingsError.message },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('payment_settings')
      .update({
        monthly_fee: monthlyFee,
        payment_duration: paymentDuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSettings.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
=======
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const shopId = searchParams.get('shop_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    // Build query
    let query = supabase
      .from('payments')
      .select(`
        *,
        shops (
          id,
          name,
          owner_id,
          profiles:owner_id (
            full_name,
            email
          )
        )
      `);

    // If not admin, only show payments for user's shops
    if (!isAdmin) {
      query = query.eq('shops.owner_id', user.id);
    }

    // Apply filters
    if (search) {
      query = query.or(`shops.name.ilike.%${search}%,shops.profiles.full_name.ilike.%${search}%`);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: payments, error, count } = await query;

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (only admins can create payments)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { shop_id, amount, currency = 'KES', due_date, payment_method, notes } = body;

    // Validate required fields
    if (!shop_id || !amount || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify shop exists
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Insert new payment
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        shop_id,
        amount,
        currency,
        due_date,
        payment_method,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    return NextResponse.json({ payment }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
>>>>>>> to-auth
