// Location: components/common/Footer.tsx
// This component belongs in the common directory as it's used across multiple sections
// Path: components/common/Footer.tsx
"use client";

import Link from "next/link";
import { FaTwitter, FaFacebookF, FaInstagram, FaPinterestP } from "react-icons/fa";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/admin");

  if (isAuthPage) return null;

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Box 1: Logo */}
          <div className="md:w-1/4 flex justify-start">
            <span className="text-2xl font-bold text-indigo-600" style={{ fontFamily: 'cursive' }}>
              TeKe TeKe
            </span>
          </div>
          
          {/* Box 2: Copyright and Links */}
          <div className="md:w-1/4 flex items-center justify-center text-center text-gray-400 text-sm">
            <div className="flex items-center space-x-3">
              <span>@ 2025 Sokoo</span>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Cookies</Link>
            </div>
          </div>
          
          {/* Box 3: Support Email */}
          <div className="md:w-1/4 flex justify-center text-center">
            <div>
              <div className="text-sm font-bold text-gray-800">Support email:</div>
              <a 
                href="mailto:tekesupport@gmail.com" 
                className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
              >
                tekesupport@gmail.com
              </a>
            </div>
          </div>
          
          {/* Box 4: Social Icons */}
          <div className="md:w-1/4 flex justify-end">
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors" aria-label="Twitter">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors" aria-label="Facebook">
                <FaFacebookF size={18} />
              </a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors" aria-label="Pinterest">
                <FaPinterestP size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;