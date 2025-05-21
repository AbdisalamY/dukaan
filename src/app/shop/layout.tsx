// File path: src/app/shop/layout.tsx
// Replace the entire file with this code

'use client';

import { ShopLayout } from '@/components/layouts/ShopLayout';

export default function ShopRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShopLayout>{children}</ShopLayout>;
}