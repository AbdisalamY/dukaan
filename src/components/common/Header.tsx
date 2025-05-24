"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import LoginLogoutButton from '@/components/auth/LoginLogoutButton';
import { createClient } from '@/utils/supabase/client';

const Header: React.FC = () => {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/admin");

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  if (isAuthPage) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span className="text-3xl font-bold text-indigo-600 font-cursive" style={{ fontFamily: 'cursive' }}>
            TeKe TeKe
          </span>
        </div>
        {/* Search Bar */}
        <form className="flex-1 flex justify-center mx-6">
          <div className="flex items-center w-full max-w-xl bg-gray-100 rounded-full px-6 py-2 shadow-sm">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
            <button type="submit" className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </form>
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {!user && (
            <Link href="/sign-up" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">
              Become a Partner
            </Link>
          )}
          <LoginLogoutButton />
        </div>
      </div>
    </header>
  );
};

// Export both named and default
export { Header };
export default Header;