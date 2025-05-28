// src/components/shop/MpesaPaymentDialog.tsx
'use client';

import { useState } from 'react';
import { Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MpesaPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
  shopName: string;
  amount: string;
  defaultPhoneNumber?: string;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export function MpesaPaymentDialog({
  isOpen,
  onClose,
  onPayment,
  shopName,
  amount,
  defaultPhoneNumber = ''
}: MpesaPaymentDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    }
    
    // If starts with +254, remove the +
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    
    // If it's just the number without country code, add 254
    if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };
  
  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    // Kenyan phone numbers should be 12 digits (254 + 9 digits)
    return formatted.length === 12 && formatted.startsWith('254');
  };
  
  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }
    
    setPaymentStatus('processing');
    setErrorMessage('');
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Call M-Pesa STK Push API
      const response = await fetch('/api/payments/mpesa-stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: parseFloat(amount.replace(/[^\d.]/g, '')), // Remove currency symbols
          shopName,
          accountReference: `SHOP_${shopName.replace(/\s+/g, '_').toUpperCase()}`,
          transactionDesc: `Monthly subscription for ${shopName}`
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setPaymentStatus('success');
        // Wait a moment to show success, then call onPayment
        setTimeout(() => {
          onPayment();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        setErrorMessage(result.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };
  
  const handleClose = () => {
    if (paymentStatus !== 'processing') {
      setPaymentStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };
  
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <div className="text-center py-6">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600 mb-2">
              Please check your phone for the M-Pesa prompt
            </p>
            <p className="text-xs text-gray-500">
              Enter your M-Pesa PIN to complete the payment
            </p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-sm text-gray-600">
              Your payment has been processed successfully
            </p>
          </div>
        );
      
      case 'failed':
        return (
          <div className="text-center py-6">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
            <Button onClick={() => setPaymentStatus('idle')} variant="outline">
              Try Again
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">M-Pesa Payment</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shop:</span>
                  <span className="font-medium">{shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">Monthly Subscription</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={errorMessage ? 'border-red-300' : ''}
              />
              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter your M-Pesa registered phone number
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong>
              </p>
              <ol className="text-xs text-blue-700 mt-1 space-y-1">
                <li>1. Click "Pay with M-Pesa" below</li>
                <li>2. You'll receive an M-Pesa prompt on your phone</li>
                <li>3. Enter your M-Pesa PIN to complete payment</li>
              </ol>
            </div>
          </div>
        );
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <span>M-Pesa Payment</span>
          </DialogTitle>
          <DialogDescription>
            Complete your monthly subscription payment via M-Pesa
          </DialogDescription>
        </DialogHeader>
        
        {renderPaymentStatus()}
        
        {paymentStatus === 'idle' && (
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!phoneNumber.trim()}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Pay with M-Pesa
            </Button>
          </DialogFooter>
        )}
        
        {paymentStatus === 'failed' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
