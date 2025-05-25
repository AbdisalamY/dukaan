import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    
    let query = supabase
      .from('malls')
      .select('*')
      .order('name');

    // Filter by city if provided
    if (cityId) {
      query = query.eq('city_id', cityId);
    }

    const { data: malls, error } = await query;

    if (error) {
      console.error('Error fetching malls:', error);
      return NextResponse.json({ error: 'Failed to fetch malls' }, { status: 500 });
    }

    return NextResponse.json(malls);

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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, city_id } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Mall name is required' }, { status: 400 });
    }

    if (!city_id) {
      return NextResponse.json({ error: 'City ID is required' }, { status: 400 });
    }

    // Insert new mall
    const { data: mall, error } = await supabase
      .from('malls')
      .insert({
        name: name.trim(),
        city_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mall:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Mall already exists in this city' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create mall' }, { status: 500 });
    }

    return NextResponse.json(mall, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
