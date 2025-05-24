import Header from "@/components/common/Header";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/home/CategoryNav";
import ShopsGrid from "@/components/home/ShopsGrid";
import Footer from "@/components/common/Footer";
import { supabase } from "@/lib/supabase";

// Fetch data from Supabase (server-side)
async function getHomeData() {
  // Fetch shops WITHOUT any joins to avoid recursion
  const { data: shopsData, error: shopsError } = await supabase
    .from("shops")
    .select(`
      id,
      name,
      logo,
      shop_number,
      whatsapp_number,
      status
    `)
    .eq("status", "approved")
    .limit(12);

  // Fetch all industries (categories)
  const { data: industriesData, error: industriesError } = await supabase
    .from("industries")
    .select("name");

  // Handle errors (optional: you can use your handleSupabaseError helper)
  if (shopsError) throw new Error(shopsError.message);
  if (industriesError) throw new Error(industriesError.message);

  // Adapt data for ShopsGrid
  const shops = (shopsData || []).map((shop: any) => ({
    id: shop.id,
    name: shop.name,
    location: "", // No city join
    mall: "",     // No mall join
    shopNumber: shop.shop_number,
    phone: shop.whatsapp_number,
    logo: shop.logo || "https://via.placeholder.com/150",
    category: "", // No industry join
    status: shop.status,
  }));

  // Adapt data for CategoryNav
  const categories = (industriesData || []).map((ind: any) => ind.name);

  return { shops, categories };
}

export default async function Home() {
  const { shops, categories } = await getHomeData();

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
