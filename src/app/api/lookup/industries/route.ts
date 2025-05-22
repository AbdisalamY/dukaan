// src/app/api/lookup/industries/route.ts
import { NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET all industries
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('name');
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ industries: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/lookup/cities/route.ts
import { NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET all cities
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ cities: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/lookup/malls/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET malls (with optional city filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityId = searchParams.get('cityId');
    
    let query = supabase
      .from('malls')
      .select(`
        *,
        cities(id, name)
      `)
      .order('name');
    
    if (cityId) {
      query = query.eq('city_id', cityId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ malls: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/lookup/malls/by-city/route.ts
import { NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';

// GET malls grouped by city
export async function GET() {
  try {
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (citiesError) {
      return NextResponse.json(
        { error: citiesError.message },
        { status: 400 }
      );
    }
    
    const result: Record<string, any[]> = {};
    
    for (const city of cities) {
      const { data: malls, error: mallsError } = await supabase
        .from('malls')
        .select('*')
        .eq('city_id', city.id)
        .order('name');
      
      if (mallsError) {
        return NextResponse.json(
          { error: mallsError.message },
          { status: 400 }
        );
      }
      
      result[city.name] = malls;
    }
    
    return NextResponse.json({ mallsByCity: result });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}