import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching cities:', error);
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }

    return NextResponse.json(cities);

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
    const { name } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'City name is required' }, { status: 400 });
    }

    // Insert new city
    const { data: city, error } = await supabase
      .from('cities')
      .insert({
        name: name.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating city:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'City already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
    }

    return NextResponse.json(city, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
