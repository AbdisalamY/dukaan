// src/components/layouts/ShopLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Store, CreditCard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/common/Header';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export function ShopLayout({ children }: ShopLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  function handleLogout() {
    // Here you would also clear auth/session if implemented
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Layout with Sidebar */}
      <div className="flex pt-20"> {/* Add padding-top for fixed header */}
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-5rem)]">
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                <li>
                  <Link href="/shop/dashboard">
                    <span className={`flex items-center p-3 rounded-md text-base font-semibold transition-colors ${
                      pathname === '/shop/dashboard'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <Store className={`h-5 w-5 mr-3 ${pathname === '/shop/dashboard' ? 'text-indigo-700' : 'text-gray-400'}`} />
                      Dashboard
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop/payments">
                    <span className={`flex items-center p-3 rounded-md text-base font-semibold transition-colors ${
                      pathname === '/shop/payments'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <CreditCard className={`h-5 w-5 mr-3 ${pathname === '/shop/payments' ? 'text-indigo-700' : 'text-gray-400'}`} />
                      Payments
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
