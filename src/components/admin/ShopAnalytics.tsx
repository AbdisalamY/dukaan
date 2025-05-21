// components/admin/ShopAnalytics.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, CreditCard, Users, Store } from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: { month: string; amount: number }[];
  };
  shops: {
    total: number;
    active: number;
    inactive: number;
    byIndustry: { industry: string; count: number }[];
    growth: { month: string; count: number }[];
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    monthly: { month: string; amount: number }[];
  };
  users: {
    total: number;
    shopOwners: number;
    admins: number;
    growth: { month: string; count: number }[];
  };
}

// Mock data - replace with actual data fetching
const analyticsMockData: AnalyticsData = {
  revenue: {
    total: 5250000,
    monthly: [
      { month: 'Jan', amount: 350000 },
      { month: 'Feb', amount: 400000 },
      { month: 'Mar', amount: 450000 },
      { month: 'Apr', amount: 500000 },
      { month: 'May', amount: 550000 },
      { month: 'Jun', amount: 600000 },
      { month: 'Jul', amount: 650000 },
      { month: 'Aug', amount: 700000 },
      { month: 'Sep', amount: 0 },
      { month: 'Oct', amount: 0 },
      { month: 'Nov', amount: 0 },
      { month: 'Dec', amount: 0 }
    ]
  },
  shops: {
    total: 158,
    active: 120,
    inactive: 38,
    byIndustry: [
      { industry: 'Fashion', count: 45 },
      { industry: 'Electronics', count: 25 },
      { industry: 'Beauty', count: 30 },
      { industry: 'Food', count: 20 },
      { industry: 'Home', count: 15 },
      { industry: 'Other', count: 23 }
    ],
    growth: [
      { month: 'Jan', count: 120 },
      { month: 'Feb', count: 125 },
      { month: 'Mar', count: 130 },
      { month: 'Apr', count: 138 },
      { month: 'May', count: 145 },
      { month: 'Jun', count: 150 },
      { month: 'Jul', count: 155 },
      { month: 'Aug', count: 158 },
      { month: 'Sep', count: 0 },
      { month: 'Oct', count: 0 },
      { month: 'Nov', count: 0 },
      { month: 'Dec', count: 0 }
    ]
  },
  payments: {
    total: 820,
    paid: 700,
    pending: 80,
    overdue: 40,
    monthly: [
      { month: 'Jan', amount: 90 },
      { month: 'Feb', amount: 95 },
      { month: 'Mar', amount: 100 },
      { month: 'Apr', amount: 105 },
      { month: 'May', amount: 110 },
      { month: 'Jun', amount: 115 },
      { month: 'Jul', amount: 120 },
      { month: 'Aug', amount: 85 },
      { month: 'Sep', amount: 0 },
      { month: 'Oct', amount: 0 },
      { month: 'Nov', amount: 0 },
      { month: 'Dec', amount: 0 }
    ]
  },
  users: {
    total: 200,
    shopOwners: 158,
    admins: 42,
    growth: [
      { month: 'Jan', count: 150 },
      { month: 'Feb', count: 160 },
      { month: 'Mar', count: 165 },
      { month: 'Apr', count: 175 },
      { month: 'May', count: 185 },
      { month: 'Jun', count: 190 },
      { month: 'Jul', count: 195 },
      { month: 'Aug', count: 200 },
      { month: 'Sep', count: 0 },
      { month: 'Oct', count: 0 },
      { month: 'Nov', count: 0 },
      { month: 'Dec', count: 0 }
    ]
  }
};

export default function ShopAnalytics() {
  const [data] = useState<AnalyticsData>(analyticsMockData);
  const [timeFrame, setTimeFrame] = useState<string>('yearly');

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
                  {data.payments.overdue} Overdue
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
                  {data.users.admins} Admins
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
                  Using monthly revenue data to generate bar chart.
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
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Shops by industry chart would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Using industry data to generate pie chart.
                </p>
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
                  Using monthly shop data to generate line chart.
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
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Payment status pie chart would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Showing distribution of paid, pending, and overdue payments.
                </p>
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
                  Using monthly payment data to generate line chart.
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
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  User types pie chart would appear here.
                </p>
                <p className="text-sm text-gray-400">
                  Showing distribution of shop owners and admins.
                </p>
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
                  Using monthly user data to generate line chart.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}