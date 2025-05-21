// src/app/admin/payments/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, DollarSign } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

// Types
interface PaymentHistoryItem {
  id: number;
  date: string;
  amount: string;
  method: string;
  status: string;
  reference: string;
}

interface ShopPayment {
  id: number;
  shopName: string;
  owner: string;
  status: 'Paid' | 'Overdue';
  lastPayment: string;
  nextPayment: string;
  amount: string;
}

// Mock data
const mockPayments: ShopPayment[] = [
  {
    id: 1,
    shopName: 'Fashion Hub',
    owner: 'Jane Smith',
    status: 'Paid',
    lastPayment: 'Apr 15, 2025',
    nextPayment: 'May 15, 2025',
    amount: 'KES 5,000'
  },
  {
    id: 2,
    shopName: 'Tech World',
    owner: 'John Doe',
    status: 'Overdue',
    lastPayment: 'Mar 20, 2025',
    nextPayment: 'Apr 20, 2025',
    amount: 'KES 5,000'
  },
  {
    id: 3,
    shopName: 'Beauty Palace',
    owner: 'Mary Wanjiku',
    status: 'Overdue',
    lastPayment: 'Feb 10, 2025',
    nextPayment: 'Mar 10, 2025',
    amount: 'KES 5,000'
  },
  {
    id: 4,
    shopName: 'Shoe Haven',
    owner: 'David Kamau',
    status: 'Paid',
    lastPayment: 'Apr 5, 2025',
    nextPayment: 'May 5, 2025',
    amount: 'KES 5,000'
  },
  {
    id: 5,
    shopName: 'Kitchen Plus',
    owner: 'Sarah Ouma',
    status: 'Overdue',
    lastPayment: 'Mar 25, 2025',
    nextPayment: 'Apr 25, 2025',
    amount: 'KES 5,000'
  }
];

const paymentStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' }
];

// Mock payment history data per shop ID
const getPaymentHistoryByShopId = (shopId: number): PaymentHistoryItem[] => {
  switch(shopId) {
    case 1: // Fashion Hub
      return [
        { id: 1, date: 'Apr 15, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP12345678' },
        { id: 2, date: 'Mar 15, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP12345123' },
        { id: 3, date: 'Feb 15, 2025', amount: 'KES 5,000', method: 'Bank Transfer', status: 'Completed', reference: 'BT98765432' }
      ];
    case 2: // Tech World
      return [
        { id: 1, date: 'Mar 20, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP87654321' },
        { id: 2, date: 'Feb 20, 2025', amount: 'KES 5,000', method: 'Bank Transfer', status: 'Completed', reference: 'BT23456789' }
      ];
    case 3: // Beauty Palace
      return [
        { id: 1, date: 'Feb 10, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP11223344' },
        { id: 2, date: 'Jan 10, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP55667788' }
      ];
    case 4: // Shoe Haven
      return [
        { id: 1, date: 'Apr 5, 2025', amount: 'KES 5,000', method: 'Bank Transfer', status: 'Completed', reference: 'BT99887766' },
        { id: 2, date: 'Mar 5, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP33445566' }
      ];
    case 5: // Kitchen Plus
      return [
        { id: 1, date: 'Mar 25, 2025', amount: 'KES 5,000', method: 'M-Pesa', status: 'Completed', reference: 'MP00112233' },
        { id: 2, date: 'Feb 25, 2025', amount: 'KES 5,000', method: 'Bank Transfer', status: 'Completed', reference: 'BT44556677' }
      ];
    default:
      return [];
  }
};

export default function PaymentManagementPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payments, setPayments] = useState<ShopPayment[]>(mockPayments);
  const [paymentSettings, setPaymentSettings] = useState({
    monthlyFee: '5000',
    paymentDuration: '30'
  });
  const [markPaidDialog, setMarkPaidDialog] = useState<{open: boolean, shopId: number | null, shopName: string}>({
    open: false,
    shopId: null,
    shopName: ''
  });
  const [paymentHistoryDialog, setPaymentHistoryDialog] = useState<{open: boolean, shopId: number | null, shopName: string}>({
    open: false,
    shopId: null,
    shopName: ''
  });

  // Filter payments based on search term and selected filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      payment.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  // Handlers
  const handleSaveSettings = () => {
    // In a real app, this would call an API to save payment settings
    console.log('Saving payment settings:', paymentSettings);
  };

  const handleMarkAsPaid = () => {
    if (markPaidDialog.shopId) {
      // In a real app, this would call an API to mark a payment as paid
      setPayments(payments.map(payment => 
        payment.id === markPaidDialog.shopId 
          ? { ...payment, status: 'Paid' as const } 
          : payment
      ));
      setMarkPaidDialog({ open: false, shopId: null, shopName: '' });
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: ShopPayment['status']) => {
    switch(status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Management</h1>
      </div>

      {/* Payment Settings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Settings</CardTitle>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Fee (KES)</label>
              <Input 
                type="number" 
                value={paymentSettings.monthlyFee}
                onChange={(e) => setPaymentSettings({...paymentSettings, monthlyFee: e.target.value})}
                className="max-w-60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Duration (days)</label>
              <Input 
                type="number" 
                value={paymentSettings.paymentDuration}
                onChange={(e) => setPaymentSettings({...paymentSettings, paymentDuration: e.target.value})}
                className="max-w-60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by shop or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Shop</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Last Payment</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Next Payment</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Amount</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Payment History</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No payments found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{payment.shopName}</div>
                        <div className="text-xs text-gray-500">{payment.owner}</div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4 text-gray-600">{payment.lastPayment}</td>
                      <td className="py-3 px-4 text-gray-600">{payment.nextPayment}</td>
                      <td className="py-3 px-4 text-gray-600">{payment.amount}</td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPaymentHistoryDialog({
                            open: true,
                            shopId: payment.id,
                            shopName: payment.shopName
                          })}
                        >
                          Payment History
                        </Button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {payment.status === 'Overdue' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600"
                              onClick={() => setMarkPaidDialog({
                                open: true,
                                shopId: payment.id,
                                shopName: payment.shopName
                              })}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>Mark Paid</span>
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {payment.status === 'Overdue' && (
                                <DropdownMenuItem onClick={() => setMarkPaidDialog({
                                  open: true,
                                  shopId: payment.id,
                                  shopName: payment.shopName
                                })}>
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filteredPayments.length} of {payments.length} payments</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="default" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialog.open} onOpenChange={(open) => !open && setMarkPaidDialog({ ...markPaidDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark the payment for "{markPaidDialog.shopName}" as paid? This will reactivate the shop.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setMarkPaidDialog({ open: false, shopId: null, shopName: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleMarkAsPaid}
            >
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={paymentHistoryDialog.open} onOpenChange={(open) => !open && setPaymentHistoryDialog({ ...paymentHistoryDialog, open: false })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment History - {paymentHistoryDialog.shopName}</DialogTitle>
            <DialogDescription>
              View the history of payments made by this shop.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Method</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistoryDialog.shopId && getPaymentHistoryByShopId(paymentHistoryDialog.shopId).map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 px-4 text-xs">{item.date}</td>
                      <td className="py-2 px-4 text-xs">{item.amount}</td>
                      <td className="py-2 px-4 text-xs">{item.method}</td>
                      <td className="py-2 px-4 text-xs">
                        <Badge 
                          className={item.status === 'Completed' 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-xs font-mono">{item.reference}</td>
                    </tr>
                  ))}
                  {(!paymentHistoryDialog.shopId || getPaymentHistoryByShopId(paymentHistoryDialog.shopId).length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-xs text-gray-500">
                        No payment history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setPaymentHistoryDialog({ open: false, shopId: null, shopName: '' })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}