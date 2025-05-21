// File path: src/app/shop/dashboard/page.tsx
// Replace the entire file with this code

'use client';

import { useState, useEffect } from 'react';
import { StoreIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShopForm, ShopFormData } from '@/components/shop/ShopForm';
import { ShopCard } from '@/components/shop/ShopCard';

// Types
interface ShopData {
  id: number;
  logo: string;
  name: string;
  industry: string;
  shopNumber: string;
  city: string;
  mall: string;
  whatsappNumber: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function DashboardPage() {
  // State
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulating loading shop data from API
  useEffect(() => {
    // For demo purposes, you can uncomment different scenarios
    
    // First-time user, no shop registered
    setShopData(null);
    
    // Shop registered but pending approval
    // setShopData({
    //   id: 1,
    //   logo: '/logos/sample-logo.png',
    //   name: 'Fashion Hub',
    //   industry: 'Apparel',
    //   shopNumber: '123',
    //   city: 'Nairobi',
    //   mall: 'The Hub',
    //   whatsappNumber: '+254 799374937',
    //   status: 'pending'
    // });

    // Shop approved
    // setShopData({
    //   id: 1,
    //   logo: '/logos/sample-logo.png',
    //   name: 'Fashion Hub',
    //   industry: 'Apparel',
    //   shopNumber: '123',
    //   city: 'Nairobi',
    //   mall: 'The Hub',
    //   whatsappNumber: '+254 799374937',
    //   status: 'approved'
    // });
  }, []);

  // Handle form submission
  const handleSubmit = (formData: ShopFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // If editing existing shop
      if (shopData) {
        setShopData({
          ...shopData,
          ...formData,
        });
      } 
      // If creating new shop
      else {
        setShopData({
          id: 1,
          ...formData,
          status: 'pending'
        });
      }
      
      setIsSubmitting(false);
      setIsFormOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shop Dashboard</h1>
      </div>

      {!shopData ? (
        // No shop registered yet
        <Card className="border-dashed border-2 hover:border-blue-400 transition-colors">
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <StoreIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Shop Registered</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Register your shop to start selling on TekeTeke. Add your shop information to get started.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>Register Shop</Button>
          </CardContent>
        </Card>
      ) : (
        // Shop already registered (pending or approved)
        <ShopCard 
          shop={shopData} 
          onEdit={() => setIsFormOpen(true)} 
        />
      )}

      {/* Shop Form Dialog */}
      <ShopForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={shopData || {}}
        isLoading={isSubmitting}
        isEditing={!!shopData}
      />
    </div>
  );
}