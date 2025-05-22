// src/app/api/shops/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET all shops (public endpoint with filtering)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const mall = searchParams.get('mall');
    const industry = searchParams.get('industry');
    const status = searchParams.get('status') || 'approved'; // Default to approved shops
    
    // Start building the query
    let query = supabase
      .from('shops')
      .select(`
        *,
        profiles(username, full_name)
      `)
      .eq('status', status);
    
    // Apply filters if provided
    if (city) query = query.eq('city', city);
    if (mall) query = query.eq('mall', mall);
    if (industry) query = query.eq('industry', industry);
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ shops: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST new shop
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { name, logo, industry, shopNumber, city, mall, whatsappNumber } = await request.json();
    
    // Validate required fields
    if (!name || !industry || !shopNumber || !city || !mall || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create shop
    const { data, error } = await supabase
      .from('shops')
      .insert({
        owner_id: userId,
        name,
        logo,
        industry,
        shop_number: shopNumber,
        city,
        mall,
        whatsapp_number: whatsappNumber,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, shop: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/shops/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET shop by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        profiles(username, full_name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ shop: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH update shop
export async function PATCH(request: NextRequest, { params }: Params) {
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
    
    // Check if user owns the shop or is an admin
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', id)
      .single();
    
    if (shopError) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    const isAdmin = session.user.role === 'admin';
    const isOwner = shopData.owner_id === userId;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    
    // Admin-only fields
    if (!isAdmin) {
      delete updates.status;
    }
    
    const { data, error } = await supabase
      .from('shops')
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
    
    return NextResponse.json({ success: true, shop: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE shop
export async function DELETE(request: NextRequest, { params }: Params) {
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
    
    // Check if user owns the shop or is an admin
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', id)
      .single();
    
    if (shopError) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    const isAdmin = session.user.role === 'admin';
    const isOwner = shopData.owner_id === userId;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/shops/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// POST approve shop (admin only)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { data, error } = await supabase
      .from('shops')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, shop: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/shops/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// POST reject shop (admin only)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { data, error } = await supabase
      .from('shops')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, shop: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/user/shops/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET current user's shops
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
      .from('shops')
      .select('*')
      .eq('owner_id', userId);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ shops: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}