'use client';
import React, { ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
  backgroundHeight?: "full" | "auto";
}

export default function AuthLayout({ children, backgroundHeight = "full" }: AuthLayoutProps) {
  const pathname = usePathname(); // ✅ Use Next.js hook instead
  
  // Show overlay/text only for sign-in and sign-up
  const isSignInOrSignUp = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <div className="flex h-screen bg-white">
      {/* Left column with image */}
      <div className={`hidden md:block md:w-2/5 relative bg-white ${backgroundHeight === "full" ? "h-full" : "h-auto"}`}>
        <Image 
          src="/images/auth-background.png"
          alt="City skyline view"
          fill
          className="object-cover rounded-xl border-2 border-indigo-200"
          priority
        />
        {isSignInOrSignUp && (
          <>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 rounded-xl border-2 border-indigo-400 pointer-events-none" />
           
          </>
        )}
      </div>
      {/* Right column with form */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}