"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { db } from '@/lib/database';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/forgot-password";

  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchUserData = async () => {
      try {
        // Get both the auth user and profile data
        const [authUser, userProfile] = await Promise.all([
          db.getCurrentUser(),
          db.getUserProfile()
        ]);
        
        if (mounted) {
          setUser(authUser);
          setProfile(userProfile);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    return () => { mounted = false; };
  }, []);

  if (isAuthPage) return null;

  // Check if we're in protected areas (shop or admin)
  const isProtectedArea = pathname.startsWith("/shop") || pathname.startsWith("/admin");
  const isAdminArea = pathname.startsWith("/admin");

  // Get user display name with priority for Google account name - FIRST NAME ONLY
  const getUserDisplayName = () => {
    let fullName = '';
    
    // First priority: Google account name from user metadata
    if (user?.user_metadata?.full_name) {
      fullName = user.user_metadata.full_name;
    }
    // Second priority: Name from user metadata (alternative field)
    else if (user?.user_metadata?.name) {
      fullName = user.user_metadata.name;
    }
    // Third priority: Profile full_name
    else if (profile?.full_name) {
      fullName = profile.full_name;
    }
    // Fourth priority: Email username part
    else if (user?.email) {
      return user.email.split('@')[0];
    }
    else if (profile?.email) {
      return profile.email.split('@')[0];
    }
    // Final fallback
    else {
      return 'User';
    }
    
    // Extract first name only
    return fullName.split(' ')[0];
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {isProtectedArea ? (
            <span className="text-3xl font-bold text-indigo-600 font-cursive" style={{ fontFamily: 'cursive' }}>
              TeKe TeKe
            </span>
          ) : (
            <Link href="/" className="text-3xl font-bold text-indigo-600 font-cursive hover:text-indigo-700 transition-colors" style={{ fontFamily: 'cursive' }}>
              TeKe TeKe
            </Link>
          )}
        </div>
        
        {/* Search Bar - Only show on home page */}
        {!isProtectedArea && (
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
        )}
        
        {/* Spacer for protected areas */}
        {isProtectedArea && <div className="flex-1"></div>}
        
        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Show login/signup buttons only on home page when not authenticated */}
          {!loading && !user && !isProtectedArea && (
            <>
              <button
                onClick={() => router.push("/sign-up")}
                className="text-indigo-700 font-semibold text-base bg-transparent border-none shadow-none hover:underline focus:outline-none transition-colors cursor-pointer"
                style={{ minWidth: 0, padding: 0 }}
              >
                Become a Partner
              </button>
              <Button
                onClick={() => router.push("/sign-in")}
                className="rounded-full bg-indigo-700 hover:bg-[#4C1D95] text-white font-semibold px-6 py-2 text-base border-none shadow-none cursor-pointer"
                style={{ minWidth: 0 }}
              >
                Log in
              </Button>
            </>
          )}
          
          {/* Show user info and logout when authenticated OR in protected areas */}
          {!loading && (user || isProtectedArea) && (
            <>
              <span className="text-gray-700 text-sm font-medium">
                {isAdminArea ? `Admin, ${getUserDisplayName()}` : `Hello, ${getUserDisplayName()}`}
              </span>
              <Button
                onClick={async () => {
                  await import("@/lib/auth-actions").then(mod => mod.signout());
                  setProfile(null);
                  setUser(null);
                  router.push('/');
                }}
                className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// Export both named and default
export { Header };
export default Header;
