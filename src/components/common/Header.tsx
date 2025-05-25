"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, LogOut, User } from 'lucide-react';
import { signout } from '@/lib/auth-actions';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/forgot-password" ||
    pathname === "/confirm-email";

  const isPublicPage = pathname === '/';
  const isProtectedArea = pathname.startsWith("/shop") || pathname.startsWith("/admin");

  // Get user display name with priority for Google account name - FIRST NAME ONLY
  const getUserDisplayName = useCallback(() => {
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
    return fullName.split(' ')[0] || 'User';
  }, [user, profile]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      // Call server action to sign out
      await signout();
    } catch (error) {
      console.error('Error signing out:', error);
      // Refresh the page as fallback
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut]);

  // Don't render header on auth pages
  if (isAuthPage) return null;

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
          {isPublicPage ? (
            // Public page - always show sign up and login
            <>
              <button
                onClick={() => router.push("/sign-up")}
                className="text-indigo-700 font-semibold text-base bg-transparent border-none shadow-none focus:outline-none transition-colors cursor-pointer hover:text-indigo-900"
                style={{ minWidth: 0, padding: 0 }}
              >
                Become a Partner
              </button>
              <Button
                onClick={() => router.push("/sign-in")}
                className="rounded-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-semibold px-6 py-2 text-base border-none shadow-none cursor-pointer"
                style={{ minWidth: 0 }}
              >
                Log in
              </Button>
            </>
          ) : isProtectedArea ? (
            // Protected area - show user info if authenticated, login button if not
            loading ? (
              // Loading state
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : isAuthenticated ? (
              // Authenticated user
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-600" />
                  <span className="text-gray-700 text-sm font-medium">
                    Hello, {getUserDisplayName()}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 text-sm font-medium"
                >
                  {isSigningOut ? (
                    <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LogOut size={14} />
                  )}
                  <span>{isSigningOut ? 'Signing out...' : 'Logout'}</span>
                </Button>
              </div>
            ) : (
              // Not authenticated in protected area
              <Button
                onClick={() => router.push("/sign-in")}
                className="rounded-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-semibold px-6 py-2 text-base border-none shadow-none cursor-pointer"
                style={{ minWidth: 0 }}
              >
                Log in
              </Button>
            )
          ) : (
            // Other pages - show public header
            <>
              <button
                onClick={() => router.push("/sign-up")}
                className="text-indigo-700 font-semibold text-base bg-transparent border-none shadow-none focus:outline-none transition-colors cursor-pointer hover:text-indigo-900"
                style={{ minWidth: 0, padding: 0 }}
              >
                Become a Partner
              </button>
              <Button
                onClick={() => router.push("/sign-in")}
                className="rounded-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-semibold px-6 py-2 text-base border-none shadow-none cursor-pointer"
                style={{ minWidth: 0 }}
              >
                Log in
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
