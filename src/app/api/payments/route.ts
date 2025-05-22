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