// File path: src/app/shop/page.tsx
// This page redirects to the dashboard page when accessing /shop
// The redirection ensures users always start at the dashboard

import { redirect } from 'next/navigation';

export default function ShopPage() {
  // Redirect to dashboard by default
  redirect('/shop/dashboard');
}