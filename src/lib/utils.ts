// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Additional utility functions for your project
export function formatCurrency(amount: number, currency: string = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

export function generateTransactionId() {
  const prefix = 'TX'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${timestamp}${random}`
}

export function validateKenyanPhone(phone: string): boolean {
  const regex = /^(?:\+254|254|0)([17]\d{8})$/
  return regex.test(phone)
}

export function formatPhoneNumber(phone: string): string {
  if (!validateKenyanPhone(phone)) {
    throw new Error('Invalid Kenyan phone number')
  }
  
  const match = phone.match(/^(?:\+254|254|0)([17]\d{8})$/)
  if (!match) return phone
  
  const digits = match[1]
  return `+254${digits}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}