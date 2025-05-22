
// src/lib/utils.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, addDays } from "date-fns";

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}

// Generate random transaction ID
export function generateTransactionId() {
  const prefix = 'TX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

// Format date with relative time
export function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  
  // If within the last 7 days
  const sevenDaysAgo = addDays(new Date(), -7);
  if (date > sevenDaysAgo) {
    return format(date, 'EEEE, h:mm a');
  }
  
  return format(date, 'MMM d, yyyy');
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get status badge color
export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'active':
    case 'paid':
    case 'sent':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'rejected':
    case 'overdue':
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
}

// Validate Kenyan phone number
export function validateKenyanPhone(phone: string): boolean {
  // Supports formats: +254xxxxxxxxx, 254xxxxxxxxx, 0xxxxxxxxx
  const regex = /^(?:\+254|254|0)([17]\d{8})$/;
  return regex.test(phone);
}

// Format Kenyan phone number to E.164 format
export function formatPhoneNumber(phone: string): string {
  if (!validateKenyanPhone(phone)) {
    throw new Error('Invalid Kenyan phone number');
  }
  
  // Extract the 9 digits after the prefix
  const match = phone.match(/^(?:\+254|254|0)([17]\d{8})$/);
  if (!match) return phone;
  
  const digits = match[1];
  return `+254${digits}`;
}

// Check if payment is overdue
export function isPaymentOverdue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
}

// Calculate days until due or days overdue
export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Create slug from text
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}