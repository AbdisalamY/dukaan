import React from 'react';
import { Phone, Building2 } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";

// Define the Shop type
interface Shop {
  id: number;
  name: string;
  location: string;
  mall: string;
  shopNumber: string;
  phone: string;
  logo: string;
  category?: string;
  status?: string;
}

interface ShopsGridProps {
  shops: Shop[];
  title: string;
  emptyMessage: string;
}

const ShopsGrid: React.FC<ShopsGridProps> = ({ shops, title, emptyMessage }) => {
  return (
    <div className="w-full bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-left">{title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shops.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">{emptyMessage}</div>
          ) : (
            shops.map((shop) => (
            <div key={shop.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 bg-white">
              <div className="p-6 pb-3">
                <div className="space-y-1">
                  {/* Top Section with Logo and Contact */}
                  <div className="flex items-center gap-4">
                    {/* Left Section: Rectangular Logo */}
                    <div className="flex-shrink-0 ml-6">
                      <div className="w-36 h-18 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img
                          src={shop.logo}
                          alt={`${shop.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Right Section: Phone and WhatsApp */}
                    <div className="flex flex-col items-center justify-center w-full mt-2 mb-2">
                      <div className="flex items-center gap-8 justify-end w-full">
                        <span className="text-base font-bold text-gray-900">{shop.phone}</span>
                        <FaWhatsapp className="w-16 h-16" color="#25D366" />
                      </div>
                    </div>
                  </div>
                  {/* Footer Section: Location Details and WhatsApp Text */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600 gap-3">
                        <Building2 className="h-6 w-6 text-gray-900 ml-2" />
                        <span>{shop.location}</span>
                        <span>{shop.mall}</span>
                        <span>Shop: <span className="font-bold">{shop.shopNumber}</span></span>
                      </div>
                      <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium whitespace-nowrap italic">
                        click to see our products now!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopsGrid;