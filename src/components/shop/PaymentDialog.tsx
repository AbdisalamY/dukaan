// src/components/shop/PaymentDialog.tsx
'use client';

import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
  shopName: string;
  amount: string;
  phoneNumber: string;
}

export function PaymentDialog({
  isOpen,
  onClose,
  onPayment,
  shopName,
  amount,
  phoneNumber
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing with a delay
    setTimeout(() => {
      setIsProcessing(false);
      onPayment();
    }, 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Process your monthly subscription payment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Amount:</span>
                <span className="font-medium">{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Shop Name:</span>
                <span>{shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Payment Period:</span>
                <span>Monthly Subscription</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-500">
              Click the button below to process your payment.
            </p>
            <div className="py-2">
              <p className="text-sm font-medium">Your Phone Number</p>
              <p className="font-medium">{phoneNumber}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="relative"
          >
            {isProcessing ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-b-transparent rounded-full"></div>
                </div>
                <span className="opacity-0">Pay Now</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}