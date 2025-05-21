// src/app/shop/payments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from '@/components/ui/card';
import { PaymentCard } from '@/components/shop/PaymentCard';
import { PaymentDialog } from '@/components/shop/PaymentDialog';
import { PaymentHistoryTable } from '@/components/shop/PaymentHistoryTable';
import { Payment, ShopWithPayment } from '@/types/payment';
import { generateTransactionId } from '@/lib/utils';

export default function PaymentsPage() {
  // State
  const [shop, setShop] = useState<ShopWithPayment | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState<{open: boolean, success: boolean}>({
    open: false,
    success: false
  });
  const [paymentHistoryDialog, setPaymentHistoryDialog] = useState(false);

  // Simulate loading data
  useEffect(() => {
    // Mock shop data
    setShop({
      id: 1,
      name: 'Fashion Hub',
      location: 'Nairobi',
      mall: 'Central Mall',
      shopNumber: 'A12',
      phone: '+254 799374937',
      logo: '/logos/fashion-hub.png',
      category: 'Apparel',
      status: 'active',
      owner: 'John Doe',
      email: 'john@example.com',
      lastPaymentDate: '2025-04-15',
      nextPaymentDue: '2025-05-15',
      paymentStatus: 'pending',
      paymentAmount: 5000
    });

    // Mock current payment
    setCurrentPayment({
      id: 1,
      shopId: 1,
      amount: 5000,
      currency: 'KES',
      status: 'pending',
      paymentDate: '',
      dueDate: '2025-05-15',
      notes: 'Monthly subscription fee'
    });

    // Mock payment history
    setPaymentHistory([
      {
        id: 1,
        shopId: 1,
        amount: 5000,
        currency: 'KES',
        status: 'paid',
        paymentDate: '2025-04-15',
        dueDate: '2025-04-15',
        paymentMethod: 'Credit Card',
        transactionId: 'TX1234567890'
      },
      {
        id: 2,
        shopId: 1,
        amount: 5000,
        currency: 'KES',
        status: 'paid',
        paymentDate: '2025-03-15',
        dueDate: '2025-03-15',
        paymentMethod: 'Bank Transfer',
        transactionId: 'TX0987654321'
      }
    ]);
  }, []);

  // Handle successful payment
  const handleSuccessfulPayment = () => {
    setPaymentDialogOpen(false);
    
    // Show confirmation dialog
    setPaymentConfirmation({
      open: true,
      success: true
    });
    
    if (currentPayment && shop) {
      const paymentDate = new Date().toISOString();
      
      // Update current payment status
      const updated: Payment = {
        ...currentPayment,
        status: 'paid',
        paymentDate,
        transactionId: generateTransactionId(),
        paymentMethod: 'Credit Card'
      };
      
      // Add to payment history
      setPaymentHistory([updated, ...paymentHistory]);
      
      // Set next payment
      const nextDueDate = new Date(currentPayment.dueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      setCurrentPayment({
        id: currentPayment.id + 1,
        shopId: shop.id,
        amount: currentPayment.amount,
        currency: currentPayment.currency,
        status: 'pending',
        paymentDate: '',
        dueDate: nextDueDate.toISOString(),
        notes: 'Monthly subscription fee'
      });
    }
  };

  // If shop is not active, show message
  if (shop && shop.status !== 'active') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center py-10">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Shop Not Active</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Your shop needs to be approved before you can make payments. Please wait for admin approval.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payments</h1>
        {paymentHistory.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setPaymentHistoryDialog(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Payment History
          </Button>
        )}
      </div>

      {/* Current Payment Card */}
      {currentPayment && (
        <PaymentCard
          payment={{
            id: currentPayment.id,
            date: currentPayment.paymentDate,
            amount: currentPayment.amount.toString(),
            dueDate: currentPayment.dueDate,
            status: currentPayment.status as "pending" | "paid" | "overdue"
          }}
          onPayClick={() => setPaymentDialogOpen(true)}
        />
      )}

      {/* Payment Dialog */}
      {shop && currentPayment && (
        <PaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          onPayment={handleSuccessfulPayment}
          shopName={shop.name}
          amount={`${currentPayment.currency} ${currentPayment.amount.toLocaleString()}`}
          phoneNumber={shop.phone}
        />
      )}
      
      {/* Payment Confirmation Dialog */}
      <Dialog 
        open={paymentConfirmation.open} 
        onOpenChange={(open) => !open && setPaymentConfirmation({ ...paymentConfirmation, open: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {paymentConfirmation.success ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                  Payment Successful
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                  Payment Failed
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {paymentConfirmation.success && currentPayment ? (
              <div className="space-y-4">
                <p>
                  Your payment of <span className="font-medium">
                    {currentPayment.currency} {currentPayment.amount.toLocaleString()}
                  </span> has been successfully processed.
                </p>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                    <span className="font-mono">{generateTransactionId()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                    <span>Credit Card</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p>
                  Your payment could not be processed.
                </p>
                <p className="text-gray-500">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPaymentConfirmation({ open: false, success: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment History Dialog */}
      <Dialog 
        open={paymentHistoryDialog} 
        onOpenChange={setPaymentHistoryDialog}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              A record of all your previous payments
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <PaymentHistoryTable payments={paymentHistory} />
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPaymentHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}