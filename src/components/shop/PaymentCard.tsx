// src/components/shop/PaymentCard.tsx
'use client';

import { useState } from 'react';
import { formatCurrency, getDaysUntilDue, isPaymentOverdue } from '@/lib/utils';
// ... other imports

export function PaymentCard({ payment, onPayClick }: PaymentCardProps) {
  // Calculate days until due or overdue
  const daysUntilDue = getDaysUntilDue(payment.dueDate);
  const isOverdue = isPaymentOverdue(payment.dueDate);
  
  // Payment status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    // ... status badge code
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Subscription</CardTitle>
        <CardDescription>
          Your shop subscription details and payment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Amount Due</p>
            <p className="text-2xl font-bold">{formatCurrency(parseFloat(payment.amount), 'KES')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="text-lg">{new Date(payment.dueDate).toLocaleDateString()}</p>
            {isOverdue ? (
              <p className="text-xs text-red-600">{Math.abs(daysUntilDue)} days overdue</p>
            ) : (
              <p className="text-xs text-gray-500">Due in {daysUntilDue} days</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div><StatusBadge status={payment.status} /></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          className="w-full sm:w-auto"
          onClick={onPayClick}
          disabled={payment.status === 'paid'}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Make Payment
        </Button>
      </CardFooter>
    </Card>
  );
}