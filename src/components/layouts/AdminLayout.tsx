// src/components/layouts/AdminLayout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  DollarSign, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../components/ui/sheet";
import Header from '@/components/common/Header';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Shops',
    href: '/admin/shops',
    icon: Store
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: DollarSign
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart2
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // User information - In a real app, this would come from your auth context or API
  const userInfo = {
    name: 'Admin User',
    role: 'System Admin',
    avatar: '/api/placeholder/40/40'
  };

  function handleLogout() {
    // Here you would also clear auth/session if implemented
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Layout */}
      <div className="flex pt-20"> {/* Add padding-top for fixed header */}
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto min-h-[calc(100vh-5rem)]">
            {/* Navigation */}
            <div className="flex-1 flex flex-col p-4 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-base font-semibold transition-colors",
                        isActive && "bg-indigo-100 text-indigo-700",
                        !isActive && "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
            
          </div>
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden w-full fixed top-20 z-30 flex items-center justify-between bg-white border-b h-16 px-4">
          <div className="flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[80%] sm:w-64">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Admin Panel</p>
                  </div>
                  <div className="flex-1 flex flex-col p-4 space-y-1">
                    {navigationItems.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      
                      return (
                        <Link 
                          key={item.name} 
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3",
                              isActive && "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                          >
                            <IconComponent className={`h-5 w-5 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={userInfo.avatar} />
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {userInfo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {userInfo.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {userInfo.role}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-xl font-semibold text-indigo-600">Admin Panel</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col md:ml-0 flex-1 bg-white">
          <main className="flex-1 pb-8 pt-16 md:pt-0"> {/* Add pt-16 for mobile header */}
            <div className="mx-auto px-4 sm:px-6 md:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
