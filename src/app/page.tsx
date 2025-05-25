'use client';

import { useEffect, useState } from 'react';
import Header from "@/components/common/Header";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/home/CategoryNav";
import ShopsGrid from "@/components/home/ShopsGrid";
import Footer from "@/components/common/Footer";
import { db } from '@/lib/database';

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesData = await db.getCategories();
        setCategories(categoriesData.map((cat: any) => cat.name));

        // Fetch approved shops
        const shopsData = await db.getShops({ 
          status: 'approved',
          limit: 8 
        });
        
        // Transform shops data to match the expected format
        const transformedShops = shopsData.shops?.map((shop: any) => ({
          id: shop.id,
          name: shop.name,
          location: shop.city,
          mall: shop.mall,
          shopNumber: shop.shop_number,
          phone: shop.whatsapp_number,
          logo: shop.logo || "https://via.placeholder.com/150",
          category: shop.industry,
        })) || [];

        setShops(transformedShops);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20"> {/* Padding for fixed header */}
        <CategoryNav categories={categories} />
        <HeroSection />
        <ShopsGrid shops={shops} title="Featured Shops" emptyMessage="No shops found." />
      </div>
      <Footer />
    </main>
  );
}
