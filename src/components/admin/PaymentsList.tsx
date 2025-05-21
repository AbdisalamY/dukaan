// src/components/admin/PaymentsList.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, MoreVertical, DollarSign } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface ShopPayment {
  id: number;
  shopName: string;
  ownerName: string;
  status: 'Paid' | 'Overdue';
  lastPayment: string;
  nextPayment: string;
  amount: string;
}

export function PaymentsList() {
  // Mock data based on the screenshot
  const payments: ShopPayment[] = [
    {
      id: 1,
      shopName: 'Fashion Hub',
      ownerName: 'Jane Smith',
      status: 'Paid',
      lastPayment: 'Apr 15, 2025',
      nextPayment: 'May 15, 2025',
      amount: 'KES 5,000'
    },
    {
      id: 2,
      shopName: 'Tech World',
      ownerName: 'John Doe',
      status: 'Overdue',
      lastPayment: 'Mar 20, 2025',
      nextPayment: 'Apr 20, 2025',
      amount: 'KES 5,000'
    },
    {
      id: 3,
      shopName: 'Beauty Palace',
      ownerName: 'Mary Wanjiku',
      status: 'Overdue',
      lastPayment: 'Feb 10, 2025',
      nextPayment: 'Mar 10, 2025',
      amount: 'KES 5,000'
    },
    {
      id: 4,
      shopName: 'Shoe Haven',
      ownerName: 'David Kamau',
      status: 'Paid',
      lastPayment: 'Apr 5, 2025',
      nextPayment: 'May 5, 2025',
      amount: 'KES 5,000'
    },
    {
      id: 5,
      shopName: 'Kitchen Plus',
      ownerName: 'Sarah Ouma',
      status: 'Overdue',
      lastPayment: 'Mar 25, 2025',
      nextPayment: 'Apr 25, 2025',
      amount: 'KES 5,000'
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('5000');
  const [paymentDuration, setPaymentDuration] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'all' || 
      payment.status.toLowerCase() === statusFilter.toLowerCase();
      
    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = (id: number) => {
    // In a real app, this would update the payment status in the backend
    console.log(`Marking payment ${id} as paid`);
  };

  return (
    <>
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <label htmlFor="monthly-fee" className="block text-sm font-medium mb-2">Monthly Fee (KES)</label>
            <Input
              id="monthly-fee"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="block w-full"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <label htmlFor="payment-duration" className="block text-sm font-medium mb-2">Payment Duration (days)</label>
            <Input
              id="payment-duration"
              value={paymentDuration}
              onChange={(e) => setPaymentDuration(e.target.value)}
              className="block w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by shop or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium text-gray-500">Shop</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Last Payment</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Next Payment</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Amount</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Payment History</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-medium">{payment.shopName}</p>
                        <p className="text-sm text-gray-500">{payment.ownerName}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge 
                        className={payment.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-gray-600">{payment.lastPayment}</td>
                    <td className="py-4 text-gray-600">{payment.nextPayment}</td>
                    <td className="py-4 text-gray-600">{payment.amount}</td>
                    <td className="py-4">
                      <Button variant="outline" size="sm">
                        Payment History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filteredPayments.length} of {payments.length} payments</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1}>
                Previous
              </Button>
              <Button variant="default" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}