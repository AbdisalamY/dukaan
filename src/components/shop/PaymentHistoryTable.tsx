// src/components/shop/PaymentHistoryTable.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment } from '@/types/payment';
import { formatCurrency } from '@/lib/utils';

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  // Payment status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Refunded</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Format amount with currency
  const formatAmount = (amount: number, currency: string) => {
    return currency === 'KES' 
      ? `KES ${amount.toLocaleString()}`
      : formatCurrency(amount, currency);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Transaction ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                No payment history found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>{formatAmount(payment.amount, payment.currency)}</TableCell>
                <TableCell>
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell>{payment.paymentMethod || '-'}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {payment.transactionId || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}