// src/components/admin/ShopAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
<<<<<<< HEAD
// ... other imports

export default function ShopAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
=======
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, CreditCard, Users, Store } from 'lucide-react';
import { db, DatabaseShop, DatabasePayment } from '@/lib/database';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: { month: string; amount: number }[];
  };
  shops: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byIndustry: { industry: string; count: number }[];
    growth: { month: string; count: number }[];
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    monthly: { month: string; amount: number }[];
  };
  users: {
    total: number;
    shopOwners: number;
    admins: number;
    growth: { month: string; count: number }[];
  };
}

export default function ShopAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
>>>>>>> to-auth
  const [timeFrame, setTimeFrame] = useState<string>('yearly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics?timeFrame=${timeFrame}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const result = await response.json();
        setData(result.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeFrame]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  if (error || !data) {
    return <div className="text-red-500 p-4">{error || 'Failed to load data'}</div>;
  }

  // ... render analytics components with the data
}
=======
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch shops data
        const shopsResponse = await db.getShops({ limit: 1000 });
        const shops = shopsResponse.shops || [];
        
        // Fetch payments data
        const paymentsResponse = await db.getPayments({ limit: 1000 });
        const payments = paymentsResponse.payments || [];
        
        // Calculate shop statistics
        const totalShops = shops.length;
        const activeShops = shops.filter((shop: DatabaseShop) => shop.status === 'approved' || shop.status === 'active').length;
        const inactiveShops = shops.filter((shop: DatabaseShop) => shop.status === 'inactive').length;
        const pendingShops = shops.filter((shop: DatabaseShop) => shop.status === 'pending').length;
        
        // Calculate shops by industry
        const industryCount: Record<string, number> = {};
        shops.forEach((shop: DatabaseShop) => {
          industryCount[shop.industry] = (industryCount[shop.industry] || 0) + 1;
        });
        const byIndustry = Object.entries(industryCount).map(([industry, count]) => ({
          industry,
          count
        }));
        
        // Calculate payment statistics
        const totalPayments = payments.length;
        const paidPayments = payments.filter((payment: DatabasePayment) => payment.status === 'paid').length;
        const pendingPayments = payments.filter((payment: DatabasePayment) => payment.status === 'pending').length;
        const failedPayments = payments.filter((payment: DatabasePayment) => payment.status === 'failed').length;
        
        // Calculate total revenue
        const totalRevenue = payments
          .filter((payment: DatabasePayment) => payment.status === 'paid')
          .reduce((sum: number, payment: DatabasePayment) => sum + payment.amount, 0);
        
        // Generate monthly data (simplified - in real app, you'd group by actual months)
        const monthlyRevenue = [
          { month: 'Jan', amount: totalRevenue * 0.1 },
          { month: 'Feb', amount: totalRevenue * 0.12 },
          { month: 'Mar', amount: totalRevenue * 0.15 },
          { month: 'Apr', amount: totalRevenue * 0.18 },
          { month: 'May', amount: totalRevenue * 0.20 },
          { month: 'Jun', amount: totalRevenue * 0.25 },
        ];
        
        const monthlyShopGrowth = [
          { month: 'Jan', count: Math.floor(totalShops * 0.6) },
          { month: 'Feb', count: Math.floor(totalShops * 0.7) },
          { month: 'Mar', count: Math.floor(totalShops * 0.8) },
          { month: 'Apr', count: Math.floor(totalShops * 0.9) },
          { month: 'May', count: Math.floor(totalShops * 0.95) },
          { month: 'Jun', count: totalShops },
        ];
        
        const monthlyPayments = [
          { month: 'Jan', amount: Math.floor(totalPayments * 0.1) },
          { month: 'Feb', amount: Math.floor(totalPayments * 0.15) },
          { month: 'Mar', amount: Math.floor(totalPayments * 0.20) },
          { month: 'Apr', amount: Math.floor(totalPayments * 0.25) },
          { month: 'May', amount: Math.floor(totalPayments * 0.15) },
          { month: 'Jun', amount: Math.floor(totalPayments * 0.15) },
        ];
        
        const analyticsData: AnalyticsData = {
          revenue: {
            total: totalRevenue,
            monthly: monthlyRevenue
          },
          shops: {
            total: totalShops,
            active: activeShops,
            inactive: inactiveShops,
            pending: pendingShops,
            byIndustry,
            growth: monthlyShopGrowth
          },
          payments: {
            total: totalPayments,
            paid: paidPayments,
            pending: pendingPayments,
            failed: failedPayments,
            monthly: monthlyPayments
          },
          users: {
            total: totalShops + 1, // Assuming 1 admin + shop owners
            shopOwners: totalShops,
            admins: 1,
            growth: monthlyShopGrowth.map(item => ({ ...item, count: item.count + 1 }))
          }
        };
        
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthPercentage = (data: { month: string; count: number }[] | { month: string; amount: number }[]) => {
    if (data.length < 2) return 0;
    
    // Filter out future months with zero values
    const filteredData = data.filter(item => 'amount' in item ? item.amount > 0 : item.count > 0);
    if (filteredData.length < 2) return 0;
    
    const latest = filteredData[filteredData.length - 1];
    const previous = filteredData[filteredData.length - 2];
    
    const latestValue = 'amount' in latest ? latest.amount : latest.count;
    const previousValue = 'amount' in previous ? previous.amount : previous.count;
    
    if (previousValue === 0) return 100;
    
    return ((latestValue - previousValue) / previousValue) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Frame Selector */}
      <div className="flex justify-end">
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</div>
            <div className="flex items-center space-x-2 mt-1">
              <TrendingUp className={`h-4 w-4 ${getGrowthPercentage(data.revenue.monthly) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ${getGrowthPercentage(data.revenue.monthly) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getGrowthPercentage(data.revenue.monthly).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Shops Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.shops.total}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">
                  {data.shops.active} Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-500">
                  {data.shops.pending} Pending
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">
                  {data.shops.inactive} Inactive
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.payments.total}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">
                  {data.payments.paid} Paid
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-500">
                  {data.payments.pending} Pending
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">
                  {data.payments.failed} Failed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.total}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-500">
                  {data.users.shopOwners} Shop Owners
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-500">
                  {data.users.admins} Admin{data.users.admins !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Revenue chart visualization would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Total Revenue: {formatCurrency(data.revenue.total)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Shops Tab */}
        <TabsContent value="shops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shops by Industry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.shops.byIndustry.map((item) => (
                  <div key={item.industry} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.industry}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / data.shops.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shop Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Shop growth chart would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Current Total: {data.shops.total} shops
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Paid</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(data.payments.paid / data.payments.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{data.payments.paid}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(data.payments.pending / data.payments.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{data.payments.pending}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Failed</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(data.payments.failed / data.payments.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{data.payments.failed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payment Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Monthly payment trends chart would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Total Payments: {data.payments.total}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shop Owners</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(data.users.shopOwners / data.users.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{data.users.shopOwners}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admins</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(data.users.admins / data.users.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{data.users.admins}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  User growth chart would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Total Users: {data.users.total}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
>>>>>>> to-auth
