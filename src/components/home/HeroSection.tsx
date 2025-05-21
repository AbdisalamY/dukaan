import { Search, Building, Filter } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4 bg-white">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Discover the Right<br />Shops and Prices
      </h1>
      
      <p className="text-sm text-gray-600 mb-10">
        Explore products from the best shops Day and Night<br />
        click <span className="font-medium italic text-green-700">Whatsapp Business</span>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full bg-white px-8">
        <div className="min-w-[300px]">
          <label className="block text-sm font-bold text-gray-800 mb-2 text-left">City</label>
          <div className="relative">
            <div className="w-full border border-gray-200 rounded-lg flex items-center p-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
              <Search size={20} className="text-gray-400 mr-2" />
              <input
                type="text"
                className="w-full outline-none text-gray-700 bg-white"
                placeholder="Enter city"
              />
            </div>
          </div>
        </div>
        
        <div className="min-w-[300px]">
          <label className="block text-sm font-bold text-gray-800 mb-2 text-left">Mall</label>
          <div className="relative">
            <div className="w-full border border-gray-200 rounded-lg flex items-center justify-between p-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
              <div className="flex items-center">
                <Building size={20} className="text-blue-500 mr-2" />
                <span className="text-gray-500">Select a Mall</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="min-w-[300px]">
          <label className="block text-sm font-bold text-gray-800 mb-2 text-left">Industry</label>
          <div className="relative">
            <div className="w-full border border-gray-200 rounded-lg flex items-center justify-between p-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
              <div className="flex items-center">
                <Filter size={20} className="text-blue-500 mr-2" />
                <span className="text-gray-500">Select industry</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}