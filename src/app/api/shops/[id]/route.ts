import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { data: shop, error } = await supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id (
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching shop:', error);
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ shop });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, logo, industry, shop_number, city, mall, whatsapp_number, status } = body;

    // Check if user owns this shop or is admin
    const { data: existingShop, error: fetchError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwner = existingShop.owner_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    if (industry !== undefined) updateData.industry = industry;
    if (shop_number !== undefined) updateData.shop_number = shop_number;
    if (city !== undefined) updateData.city = city;
    if (mall !== undefined) updateData.mall = mall;
    if (whatsapp_number !== undefined) updateData.whatsapp_number = whatsapp_number;
    
    // Only admins can update status
    if (status !== undefined && isAdmin) {
      updateData.status = status;
    }

    // Update shop
    const { data: shop, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating shop:', error);
      return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
    }

    return NextResponse.json({ shop });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns this shop or is admin
    const { data: existingShop, error: fetchError } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwner = existingShop.owner_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete shop
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shop:', error);
      return NextResponse.json({ error: 'Failed to delete shop' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Shop deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
