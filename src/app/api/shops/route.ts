import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const status = searchParams.get('status') || '';
    const city = searchParams.get('city') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    let query = supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id (
          full_name,
          email
        )
      `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
    }
    
    if (industry && industry !== 'all') {
      query = query.eq('industry', industry);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (city && city !== 'all') {
      query = query.eq('city', city);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: shops, error, count } = await query;

    if (error) {
      console.error('Error fetching shops:', error);
      return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
    }

    return NextResponse.json({
      shops,
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

    const body = await request.json();
    const { name, logo, industry, shop_number, city, mall, whatsapp_number } = body;

    // Validate required fields
    if (!name || !industry || !shop_number || !city || !mall || !whatsapp_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert new shop
    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        owner_id: user.id,
        name,
        logo,
        industry,
        shop_number,
        city,
        mall,
        whatsapp_number,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shop:', error);
      return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
    }

    return NextResponse.json({ shop }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
