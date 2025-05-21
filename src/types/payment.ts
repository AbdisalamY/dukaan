// File path: src/types/payment.ts
// This file defines the TypeScript interfaces for shop payment data
export interface Payment {
    id: number;
    shopId: number;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentDate: string;
    dueDate: string;
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
  }
  
  export interface PaymentSummary {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageMonthlyPayment: number;
  }
  
  export interface ShopWithPayment {
    id: number;
    name: string;
    location: string;
    mall: string;
    shopNumber: string;
    phone: string;
    logo: string;
    category: string;
    status: 'active' | 'inactive' | 'pending';
    owner: string;
    email: string;
    lastPaymentDate: string;
    nextPaymentDue: string;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    paymentAmount: number;
  }