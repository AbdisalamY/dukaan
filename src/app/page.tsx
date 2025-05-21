import Header from "@/components/common/Header";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/home/CategoryNav";
import ShopsGrid from "@/components/home/ShopsGrid";
import Footer from "@/components/common/Footer";

const categories = [
  "Fashion", "Electronics", "Groceries", "Toys", "Books", "Beauty"
];

const shops = [
  {
    id: 1,
    name: "YVES ROCHER",
    location: "Nairobi",
    mall: "BBS",
    shopNumber: "112",
    phone: "+254 799 374937",
    logo: "https://via.placeholder.com/150",
    category: "Beauty",
  },
  {
    id: 2,
    name: "Shoe Haven",
    location: "Nairobi",
    mall: "Westgate Mall",
    shopNumber: "334",
    phone: "254 799 374937",
    logo: "https://via.placeholder.com/150",
    category: "Shoes",
  },
  {
    id: 3,
    name: "Apparel Hub",
    location: "Nairobi",
    mall: "The Hub Karen",
    shopNumber: "78A",
    phone: "+254 701 234567",
    logo: "https://via.placeholder.com/150",
    category: "Apparel",
  },
  {
    id: 4,
    name: "Perfume Palace",
    location: "Nairobi",
    mall: "Village Market",
    shopNumber: "19C",
    phone: "+254 799 876543",
    logo: "https://via.placeholder.com/150",
    category: "Perfumes",
  }
];

export default function Home() {
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
