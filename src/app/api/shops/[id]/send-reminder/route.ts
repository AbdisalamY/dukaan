// src/app/api/shops/[id]/send-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendPaymentReminder } from '@/lib/email';

interface Params {
  params: {
    id: string;
  };
}

// POST send payment reminder (admin only)
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
    
    // Get shop and owner details
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id(full_name, email)
      `)
      .eq('id', id)
      .single();
    
    if (shopError) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }
    
    // Get latest overdue payment for the shop
    const { data: payment, error: paymentError } = await supabase
      .from('shop_payments')
      .select('*')
      .eq('shop_id', id)
      .eq('status', 'overdue')
      .order('due_date', { ascending: false })
      .limit(1)
      .single();
    
    if (paymentError) {
      return NextResponse.json(
        { error: 'No overdue payment found' },
        { status: 404 }
      );
    }
    
    // Custom message from request body (optional)
    const { customMessage } = await request.json();
    
    // Default message
    const defaultMessage = `Dear ${shop.profiles.full_name},\n\nThis is a reminder that your payment of KES ${payment.amount} for ${shop.name} is overdue. Please make your payment as soon as possible to keep your shop active on our platform.\n\nBest regards,\nTeke Teke Admin Team`;
    
    const message = customMessage || defaultMessage;
    
    // In a real implementation, send the email here
    // const emailSent = await sendPaymentReminder(shop.profiles.email, message);
    
    // For this example, we'll assume the email was sent successfully
    const emailSent = true;
    
    // Record the reminder in the database
    const { data: reminder, error: reminderError } = await supabase
      .from('payment_reminders')
      .insert({
        shop_id: id,
        status: emailSent ? 'sent' : 'failed',
        message
      })
      .select()
      .single();
    
    if (reminderError) {
      return NextResponse.json(
        { error: reminderError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: emailSent,
      reminder,
      message: emailSent ? 'Payment reminder sent successfully' : 'Failed to send payment reminder'
    });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/shops/[id]/reminder-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET payment reminder history for a shop
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
    
    // If not admin, check if user owns the shop
    if (!isAdmin) {
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
      
      if (shopData.owner_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
    
    const { data, error } = await supabase
      .from('payment_reminders')
      .select('*')
      .eq('shop_id', id)
      .order('sent_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ reminders: data });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}