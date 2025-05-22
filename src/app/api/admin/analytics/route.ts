// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET admin analytics data
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
    const timeFrame = searchParams.get('timeFrame') || 'yearly';
    
    // Define the time range based on timeFrame
    let startDate: Date;
    const endDate = new Date();
    
    switch (timeFrame) {
      case 'monthly':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'yearly':
      default:
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Convert to ISO strings for Supabase
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Get total shops count
    const { count: totalShopsCount, error: shopsCountError } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true });
    
    if (shopsCountError) {
      return NextResponse.json(
        { error: shopsCountError.message },
        { status: 400 }
      );
    }
    
    // Get active shops count
    const { count: activeShopsCount, error: activeShopsError } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    if (activeShopsError) {
      return NextResponse.json(
        { error: activeShopsError.message },
        { status: 400 }
      );
    }
    
    // Get inactive shops count
    const { count: inactiveShopsCount, error: inactiveShopsError } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .or('status.eq.pending');
    
    if (inactiveShopsError) {
      return NextResponse.json(
        { error: inactiveShopsError.message },
        { status: 400 }
      );
    }
    
    // Get revenue data (sum of paid payments)
    const { data: revenueData, error: revenueError } = await supabase
      .from('shop_payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('payment_date', startDateStr)
      .lte('payment_date', endDateStr);
    
    if (revenueError) {
      return NextResponse.json(
        { error: revenueError.message },
        { status: 400 }
      );
    }
    
    const totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get monthly revenue data
    const { data: monthlyRevenueData, error: monthlyRevenueError } = await supabase
      .rpc('get_monthly_revenue', {
        start_date: startDateStr,
        end_date: endDateStr
      });
    
    if (monthlyRevenueError) {
      return NextResponse.json(
        { error: monthlyRevenueError.message },
        { status: 400 }
      );
    }
    
    // Get shops by industry
    const { data: shopsByIndustry, error: shopsByIndustryError } = await supabase
      .rpc('get_shops_by_industry');
    
    if (shopsByIndustryError) {
      return NextResponse.json(
        { error: shopsByIndustryError.message },
        { status: 400 }
      );
    }
    
    // Get monthly shop growth
    const { data: monthlyShopGrowth, error: monthlyShopGrowthError } = await supabase
      .rpc('get_monthly_shop_growth', {
        start_date: startDateStr,
        end_date: endDateStr
      });
    
    if (monthlyShopGrowthError) {
      return NextResponse.json(
        { error: monthlyShopGrowthError.message },
        { status: 400 }
      );
    }
    
    // Get payments data
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('shop_payments')
      .select('status')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
    
    if (paymentsError) {
      return NextResponse.json(
        { error: paymentsError.message },
        { status: 400 }
      );
    }
    
    const paymentsCount = paymentsData.length;
    const paidPaymentsCount = paymentsData.filter(p => p.status === 'paid').length;
    const pendingPaymentsCount = paymentsData.filter(p => p.status === 'pending').length;
    const overduePaymentsCount = paymentsData.filter(p => p.status === 'overdue').length;
    
    // Get monthly payments data
    const { data: monthlyPaymentsData, error: monthlyPaymentsError } = await supabase
      .rpc('get_monthly_payments', {
        start_date: startDateStr,
        end_date: endDateStr
      });
    
    if (monthlyPaymentsError) {
      return NextResponse.json(
        { error: monthlyPaymentsError.message },
        { status: 400 }
      );
    }
    
    // Get users data
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('user_role, created_at')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
    
    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 400 }
      );
    }
    
    const totalUsers = usersData.length;
    const shopOwners = usersData.filter(u => u.user_role === 'shop_owner').length;
    const admins = usersData.filter(u => u.user_role === 'admin').length;
    
    // Get monthly user growth
    const { data: monthlyUserGrowth, error: monthlyUserGrowthError } = await supabase
      .rpc('get_monthly_user_growth', {
        start_date: startDateStr,
        end_date: endDateStr
      });
    
    if (monthlyUserGrowthError) {
      return NextResponse.json(
        { error: monthlyUserGrowthError.message },
        { status: 400 }
      );
    }
    
    const analyticsData = {
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenueData || [],
      },
      shops: {
        total: totalShopsCount || 0,
        active: activeShopsCount || 0,
        inactive: inactiveShopsCount || 0,
        byIndustry: shopsByIndustry || [],
        growth: monthlyShopGrowth || [],
      },
      payments: {
        total: paymentsCount,
        paid: paidPaymentsCount,
        pending: pendingPaymentsCount,
        overdue: overduePaymentsCount,
        monthly: monthlyPaymentsData || [],
      },
      users: {
        total: totalUsers,
        shopOwners: shopOwners,
        admins: admins,
        growth: monthlyUserGrowth || [],
      }
    };
    
    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// src/app/api/admin/shops/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET all shops for admin (with filtering)
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
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Start building the query
    let query = supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id(username, full_name, email)
      `);
    
    // Apply filters if provided
    if (status) query = query.eq('status', status);
    if (industry) query = query.eq('industry', industry);
    if (search) {
      query = query.or(`name.ilike.%${search}%,profiles.full_name.ilike.%${search}%,profiles.email.ilike.%${search}%`);
    }
    
    // Get total count before pagination
    const { count, error: countError } = await query.count();
    
    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 400 }
      );
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      shops: data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    const errorMessage = handleSupabaseError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}