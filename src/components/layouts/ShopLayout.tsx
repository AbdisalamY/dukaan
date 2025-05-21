// src/components/layouts/ShopLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Store, CreditCard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-indigo-600" style={{ fontFamily: 'cursive' }}>Teke Teke</h1>
            <p className="text-xs text-gray-500 mt-1">Shop Owner Panel</p>
          </div>
          
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
          
          {/* User/Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                JD
              </div>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8 bg-white">
        {children}
      </main>
    </div>
  );
}