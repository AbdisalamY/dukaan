// src/components/shop/PaymentCard.tsx
'use client';

import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentCardProps {
  payment: {
    id: number;
    date: string;
    amount: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
  };
  onPayClick: () => void;
}

export function PaymentCard({ payment, onPayClick }: PaymentCardProps) {
  // Payment status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
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
            <p className="text-2xl font-bold">{payment.amount}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="text-lg">{payment.dueDate}</p>
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