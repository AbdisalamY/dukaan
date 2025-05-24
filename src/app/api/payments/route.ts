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
